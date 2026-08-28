# TrustChain — System Design (Stage 2)

_Day 29 — production architecture planning, before cloud deployment_

## Request path (core, must-have)

```
Client → Route 53 + CloudFront (DNS + CDN)
       → Application Load Balancer
       → EC2 auto-scaling group (Node.js backend)
       → RDS (PostgreSQL)
```

**Prerequisite confirmed:** backend is stateless (JWT auth, no server-side session, no in-memory state) — ready for horizontal scaling behind a load balancer without code changes.

## Service-by-service justification

| Service | Why needed | Alternative considered | Cost/complexity note |
|---|---|---|---|
| EC2 (auto-scaling group) | Hosts the backend; multiple instances give high availability | Fargate / Lambda (serverless) | More manual patching than serverless, but more control; start at 1 instance, add ASG later |
| RDS (PostgreSQL) | Managed backups, automatic failover, patching | Self-managed Postgres on EC2 | ~2x cost of self-managed, worth it in production for reduced data-loss risk |
| Application Load Balancer | Distributes traffic across EC2 instances, health checks | Self-managed Nginx reverse proxy | Managed = less maintenance |
| CloudFront + Route 53 | Fast global static asset delivery + DNS | Vercel/Netlify for frontend only | Possibly overkill at single-region, early-stage traffic — candidate to skip initially |

## Deferred (not yet justified)

- **ElastiCache (Redis)** — no measurable caching/rate-limit need yet; premature optimization at current query load
- **S3** — needed once document/certificate upload (roadmap item) is built
- **CloudWatch** — needed once actually deployed; blind without it in production
- **Secrets Manager** — should replace `.env` before public deploy, especially given a real secret leak already happened in this repo's history
- **IAM** — least-privilege roles for EC2/RDS/S3, set up at deploy time

## Explicitly skipped

Kubernetes, microservices, multi-region — a modular monolith scales far enough for current needs; this complexity isn't justified yet.

## Next steps (Day 30+)

1. Dockerize backend + Postgres (docker-compose for local dev)
2. Rotate leaked secrets (`.env` — PRIVATE_KEY, DB_PASSWORD, EMAIL_PASS) before any public deployment
3. Push image to ECR, deploy to EC2
4. Set up RDS, migrate schema + migrations
5. CloudWatch basic monitoring