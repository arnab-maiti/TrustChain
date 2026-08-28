# TrustChain — AWS Production Deployment Design

_Builds on `SYSTEM_DESIGN.md` (service selection + justification). This document covers the concrete infrastructure layout: networking, security, CI/CD, and the actual deployment steps._

---

## 1. Networking (VPC)

```
VPC (10.0.0.0/16)
├── Public Subnet A  (10.0.1.0/24, AZ-a)  → ALB, NAT Gateway
├── Public Subnet B  (10.0.2.0/24, AZ-b)  → ALB (multi-AZ)
├── Private Subnet A (10.0.11.0/24, AZ-a) → EC2 backend, RDS
└── Private Subnet B (10.0.12.0/24, AZ-b) → EC2 backend, RDS (standby)
```

**Why private subnets for EC2/RDS:** the backend and database should never be directly reachable from the internet — only the ALB (in the public subnet) can be. This is the single most important networking decision here: it means even a misconfigured security group on the backend can't accidentally expose the database to the world, because there's no route from the internet to that subnet at all.

**NAT Gateway — deliberately deferred initially.** EC2 in a private subnet still needs outbound internet (npm installs during deploy, calling Alchemy's Sepolia RPC, sending email via Gmail). A NAT Gateway costs ~$32/month + data transfer just sitting there. At MVP scale, a cheaper option is acceptable: run EC2 in the *public* subnet initially with a tight security group (only ALB can reach it on the app port, nothing else inbound), and add the NAT Gateway + move to fully private only once there's real traffic/budget to justify it. Documenting this as a conscious cost/security trade-off, not an oversight.

---

## 2. Security Groups (who can talk to whom)

| Security Group | Inbound | Outbound | Attached to |
|---|---|---|---|
| `sg-alb` | 443 (HTTPS) from `0.0.0.0/0`, 80 (redirect to 443) | to `sg-backend` on app port | ALB |
| `sg-backend` | app port (3000) from `sg-alb` **only** | to `sg-rds` on 5432, HTTPS out (Alchemy, Gmail) | EC2 instances |
| `sg-rds` | 5432 from `sg-backend` **only** | none needed | RDS instance |

**Key principle:** no security group allows inbound from `0.0.0.0/0` except the ALB on 443. Every other hop is locked to a specific security group, not an IP range — so if an EC2 instance's IP changes (auto-scaling), the rule still holds.

---

## 3. Compute — EC2 + Auto Scaling

- **Instance type:** `t3.small` to start (2 vCPU, 2GB RAM) — Node.js + Express is not CPU-heavy at low traffic; right-size upward only after real CloudWatch metrics justify it, not preemptively.
- **AMI:** Amazon Linux 2023, Docker pre-installed via user-data script (ties into Day 31 containerization).
- **Auto Scaling Group:** min 1, desired 1, max 3 initially. Scaling policy: target CPU utilization 60%. Starting at min=1 (not 2) because paying for redundant capacity before there's traffic to justify it is premature — this scales up automatically the moment it's needed.
- **Health checks:** ALB target group health check hits `GET /` (already returns 200 with no auth) every 30s; 2 consecutive failures → instance marked unhealthy → ASG replaces it.
- **Graceful shutdown:** before an instance is terminated (scale-in or deploy), it should stop accepting new connections but finish in-flight requests — Express's `server.close()` on `SIGTERM`, with the ALB deregistration delay set to 30s so no request is dropped mid-flight. *(Not yet implemented in code — flagging as a Day-32-or-later task, since the current `app.js` doesn't handle `SIGTERM`.)*

---

## 4. Database — RDS PostgreSQL

- **Instance:** `db.t3.micro` to start — matches current low-write-volume usage.
- **Multi-AZ: deferred initially.** Multi-AZ roughly doubles RDS cost for automatic failover. At MVP stage with no SLA commitments yet, a single-AZ instance with automated daily snapshots (7-day retention) is the pragmatic starting point — revisit once this has real users depending on uptime.
- **Public accessibility: OFF.** Only reachable from `sg-backend` inside the VPC — matches the "database never internet-facing" principle above.
- **Migrations run from a CI/CD step** (not manually via psql on a jump box) — `db/migrations/*.sql` applied in order as part of the deploy pipeline, so schema state is tracked in git and reproducible.

---

## 5. Secrets Management

Replace `.env` file entirely in production — **AWS Secrets Manager** stores `DB_PASSWORD`, `JWT_SECRET`, `PRIVATE_KEY`, `EMAIL_PASS`; the EC2 instance's IAM role grants read access to only that specific secret, and the app fetches them at startup (or they're injected as environment variables via the deployment tooling). This directly closes the exact class of problem that already happened in this repo (`.env` committed to git) — secrets never touch disk or version control again.

---

## 6. CI/CD Pipeline

```
GitHub push (main branch)
  → GitHub Actions:
      1. npm ci
      2. Lint
      3. npm run test:api (once Jest suite exists)
      4. hardhat test (contract tests)
      5. Build Docker image
      6. Push image to ECR
      7. Deploy: update EC2 Auto Scaling Group's Launch Template
         with new image tag → trigger instance refresh (rolling,
         one AZ at a time, respecting ALB health checks)
```

**Why instance refresh over "just SSH in and restart":** rolling replacement means the old version keeps serving traffic until the new version passes its health check — zero-downtime deploys, and an automatic rollback path if the new version fails health checks immediately.

---

## 7. IAM (least privilege)

| Role | Permissions |
|---|---|
| EC2 instance role | `secretsmanager:GetSecretValue` (only the TrustChain secret ARN), CloudWatch Logs write |
| GitHub Actions deploy role (OIDC, no long-lived keys) | ECR push, ASG update Launch Template + start Instance Refresh |
| RDS | no IAM role needed (network-isolated instead) |

**No long-lived AWS access keys stored anywhere** — GitHub Actions uses OIDC federation to assume a deploy role, which is the current best practice over storing `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` as repo secrets.

---

## 8. Monitoring (CloudWatch)

- **Logs:** app writes to stdout/stderr → CloudWatch Logs agent ships them (no code change needed beyond current `console.log`/`console.error` usage).
- **Alarms (minimum viable set):**
  - ALB 5xx rate > 5% over 5 min → alert
  - RDS CPU > 80% for 10 min → alert
  - ASG unhealthy host count > 0 → alert
- **Explicitly not doing yet:** distributed tracing (X-Ray), custom metrics dashboards, log aggregation beyond CloudWatch's default search — these solve problems this app doesn't have yet at this scale.

---

## 9. Deployment Checklist (first-time setup, in order)

1. Rotate `PRIVATE_KEY`, `DB_PASSWORD`, `EMAIL_PASS` (currently leaked in git history) — do this **before** anything below
2. Create VPC + subnets + security groups (Section 1-2)
3. Create RDS instance in private subnet, run `schema.sql` + all `db/migrations/*.sql`
4. Store secrets in Secrets Manager
5. Dockerize backend (Day 31)
6. Push initial image to ECR
7. Create Launch Template + Auto Scaling Group + ALB + target group
8. Point Route 53 domain at the ALB
9. Set up GitHub Actions pipeline (Section 6)
10. Set up CloudWatch alarms (Section 8)
11. Smoke-test the full Phase 1-5 flow against the deployed environment before calling it done

---

## 10. What's still deliberately excluded

Same as `SYSTEM_DESIGN.md`: Kubernetes/EKS, microservices, multi-region, ElastiCache, CloudFront — none are justified by current scale. Revisit each only when a specific, measured problem (not a resume line item) calls for it.