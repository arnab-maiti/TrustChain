# TrustChain — Project Progress

_Last updated: Day 24_

## Completion Estimate

| Area            | % |
|------------------|---|
| Overall          | 25% |
| Frontend         | 30% |
| Backend          | 30% |
| Database         | 35% |
| Blockchain       | 20% |
| Security         | 15% |
| Testing          | 10% |
| DevOps           | 0%  |
| AWS              | 0%  |
| System Design    | 20% |

(Baseline set today after the first full audit — Day 1–23 work covered auth,
product custody flow, OTP delivery, trust score v1, blockchain anchoring,
and the React frontend shell.)

## Completed
- Auth (register/login/JWT), bcrypt password hashing
- Product creation → distributor accept → out-for-delivery → OTP delivery flow
- Trust score: flat +10 on delivery (see Technical Debt — double-counting bug)
- Blockchain: delivery hash anchored to Sepolia on successful OTP verification
- Frontend: Login/Register/Dashboard/Timeline/Verify/CheckTrust pages
- **Day 24: Requirements table + create/list/get API (customer-only creation)**
  — Phase 1 entry point of the target workflow

## In Progress
- Phase 1 approval flow (retailer + manufacturer review/approve/reject) — not started
- Requirement → LOCKED transition — not started

## Blocked
- Nothing currently blocked

## Technical Debt
1. **`.env` with real secrets is committed to git** — needs rotation + history scrub (flagged Day 24, not yet actioned)
2. **Trust score double-counted on delivery**: DB trigger `trg_update_trust` adds +5 on a `delivered` event AND `otp.service.js` separately adds +10 manually — same delivery currently grants +15, and writes two `trust_logs` rows. Needs a decision: keep the trigger and remove the manual update, or vice versa — not both.
3. `db/schema.sql` is a chronological session log (DDL mixed with debug queries), not a clean re-runnable schema. Migrations from now on go in `db/migrations/`. Old file should eventually be reconciled into a clean baseline.
4. `roleMiddleware` only accepts one role at a time — will need an allow-list once multiple roles share routes (e.g. requirement view by 3 different roles is currently handled by skipping role-middleware entirely and checking in the service layer instead — works, but inconsistent with how other routes do it)
5. Login response returns full user row including password hash to the client
6. JWT secret falls back to a hardcoded `"secretkey"` if `JWT_SECRET` is unset
7. OTP generate/verify routes have no auth middleware at all
8. No pagination anywhere (`getAllProducts`, `getMyShipments`, `listRequirementsForUser`)
9. `test-email` route is public and hits a hardcoded personal email address — should be removed or gated

## Future Improvements
- Phase 1 approval endpoints (retailer approve/reject, manufacturer approve/reject, auto-lock when all 3 approved)
- Manufacturing/QC/batch phase (Phase 2)
- Explicit dispatch handover (Phase 3) and retail receipt (Phase 4) as their own state transitions, not folded into the generic product-status field
- Deterministic multi-factor trust score formula (currently a single flat rule)
- EIP-712 structured signing for approvals instead of raw hash storage

## Architecture Decisions
- **Day 24**: Requirements modeled with 3 boolean approval flags (`customer_approved`, `retailer_approved`, `manufacturer_approved`) rather than a separate approvals table, since the party set is fixed at exactly 3 roles. Would switch to a join table only if the approver set became variable.
- **Day 24**: New migrations go in `db/migrations/`, numbered, standalone — not appended to `schema.sql`.

## Day 24 — Completed
**What we built:** `requirements` table + `POST /api/requirements` (customer creates), `GET /api/requirements` (list mine), `GET /api/requirements/:id` (view one, ownership-checked)

**Files changed:**
- `db/migrations/002_requirements.sql` (new)
- `services/requirement.service.js` (new)
- `controllers/requirementController.js` (new)
- `routes/requirementRoutes.js` (new)
- `app.js` (wired new route)

**Tests:** `node --check` passed on all new/modified files; server boot verified; unauthenticated request to `/api/requirements` correctly returned 401 (auth middleware chain confirmed working). No live-DB round-trip test run — no DB reachable from this environment; **run the migration and do a manual create/list test against your real DB before merging.**

**Security notes:** create restricted to `customer` role; view/list ownership-checked per record; no SQL injection surface added.

**Architecture decision:** boolean approval flags over a join table (see above).

## Day 25 — Completed
**What we built:** Email notifications on product status change (created, accepted, out-for-delivery, delivered) — sent to manufacturer + customer. New `notification.service.js`, wired into 3 call sites in `productController.js` and 1 in `otp.service.js`.

**Files changed:**
- `services/notification.service.js` (new)
- `controllers/productController.js` (3 call sites)
- `services/otp.service.js` (1 call site)

**Tests:** `node --check` passed on all changed files; server boot verified clean.

**Security notes:** no sensitive data in email body; parameterized query only.

**Architecture decision:** notification sent inline/awaited, not queued — justified at current scale; revisit with BullMQ only if email latency becomes a real bottleneck in the request path.

**Multi-day plan (user requested "add features like other supply chain sites — all of them"):**
- ✅ Day 25: Notifications
- ⬜ Day 26: Analytics dashboard (KPIs, charts)
- ⬜ Day 27: Search & filter (products/shipments)
- ⬜ Day 28: Document/certificate upload

## Day 26 — Completed
**What we built:** Phase 1 finished — requirement assignment (customer picks retailer + manufacturer, auto-approves as customer) and approve/reject endpoints with row-locked concurrency-safe auto-lock when all 3 approve.

**Files changed:**
- `services/requirement.service.js` (added `assignParticipants`, `approveRequirement`, `rejectRequirement`)
- `controllers/requirementController.js` (3 new controllers)
- `routes/requirementRoutes.js` (3 new routes: `PATCH /:id/assign`, `/:id/approve`, `/:id/reject`)

**Tests:** `node --check` passed on all changed files; server boot verified; both new routes confirmed wired (401 without token, as expected). Full DB round-trip (create → assign → approve x2 → confirm locked) still needs to be run against your real DB.

**Architecture decision:** customer's own approval is implicit at assignment time (not a separate action) — flagged as an assumption, easy to split out later if needed. Row-level lock (`SELECT ... FOR UPDATE`) used to make the "all 3 approved → lock" check race-safe.

**Phase 1 status: COMPLETE.** Requirement can now go draft → pending_approval → locked (or rejected).

## Day 26 — Completed (Phase 2: Manufacturing/QC)
**What we built:** Manufacturer creates a product from a locked requirement (`POST /api/products/from-requirement/:requirementId`), then confirms QC + certificate (`PATCH /api/products/:id/complete-production`). One product per requirement enforced via unique index.

**Files changed:**
- `db/migrations/003_manufacturing.sql` (new — products.requirement_id/qc_passed/qc_notes/certificate_url/production_completed_at, unique index, new event_type value)
- `controllers/productController.js` (2 new functions: `createProductFromRequirement`, `completeProduction`)
- `routes/productRoutes.js` (2 new routes)
- `services/notification.service.js` (recreated — was missing from VS Code copy, caused a runtime bug, now fixed)

**Bugs hit + fixed during manual testing (real debugging, good interview story material):**
1. `assignParticipants is not a function` — export/import name mismatch between service and controller (Day 25 carryover)
2. `notifyProductStatusChange is not defined` — missing import in `productController.js`
3. `notifyProductStatusChange` file itself was missing from the VS Code repo — recreated `notification.service.js`
4. Sent a raw user UUID as a Bearer token by mistake — clarified UUID (identifies a user) vs JWT (proves authentication) are different things

**Tests:** Full manual Postman flow — create locked requirement → create product from it → duplicate-product blocked (400) → complete production (QC pass) → confirmed field values in pgAdmin. All passed.

**Security notes:** manufacturing-start requires requirement status `locked` + requester is the assigned manufacturer; QC completion requires product ownership + explicit `qc_passed: true`; both enforced against re-run (duplicate product, double-complete).

**Phase 2 status: COMPLETE.**

## Day 28 — Completed (Bug fixes: Trust score + OTP auth)
**What we fixed:**
1. Trust score double-counting — removed the manual `+10` update in `otp.service.js` (was stacking with the DB trigger's `+5`, giving `+15` per delivery + duplicate `trust_logs` rows). DB trigger is now the single source of truth.
2. OTP routes had zero authentication — added `protect` middleware to both routes, and `generate-otp` now verifies the requester is the actual custodian (`courier_id`) of the shipment.

**Files changed:**
- `services/otp.service.js`
- `controllers/otp.controller.js`
- `routes/otp.routes.js`

**Tests:** syntax check passed; server boot verified; both OTP routes confirmed now returning 401 without a token (previously would have executed with zero auth).

**Note:** this changes the actual point value awarded on delivery from +10 to +5 (trigger's value) — flagged as a decision, easily changed in the trigger definition if +10 is preferred.

## Session Summary (Days 24–28)
- Day 24: Requirement creation
- Day 25: Requirement approval + lock (Phase 1 complete)
- Day 26: Manufacturing/QC (Phase 2 complete)
- Day 27: Dispatch + Retail handover (Phase 3-4 complete) — also fixed a real "any distributor can grab any shipment" authorization gap
- Day 28: Fixed trust-score double-counting + OTP no-auth gap

**Stage 1 (main flow) status: functionally complete end-to-end** — Requirement → Approval → Lock → Manufacture/QC → Dispatch → Distributor receipt → Retailer receipt → OTP delivery → blockchain anchor → trust score.

Also produced: professional README.md, LinkedIn post summarizing the day's work.

## Day 29 — Completed (Stage 2: System Design)
**What we did:** Designed target production architecture (Client → CloudFront/Route53 → ALB → EC2 auto-scaling group → RDS PostgreSQL), justified each AWS service choice against actual need (not resume-driven), confirmed backend is already stateless (JWT, no server-side session) and scaling-ready. Documented in `SYSTEM_DESIGN.md`.

**Decisions:**
- Deferred: ElastiCache, S3, CloudWatch, Secrets Manager, IAM (each has a clear trigger condition for when to add)
- Explicitly skipped: Kubernetes, microservices, multi-region — not justified at current scale
- Priority flagged: Secrets Manager should replace `.env` before any public deploy, given the earlier real secret leak

## Day 30 — Completed (Security debt: password leak + JWT fallback)
**What we fixed:**
1. Login response was leaking the bcrypt password hash to the client (`LoginUser` did `SELECT *`, returned the full row). Now strips `password` before returning.
2. `JWT_SECRET` had a hardcoded fallback (`"secretkey"`) in both `generateToken.js` and `authMiddleware.js` — if the env var was ever missing, the app would silently run with a guessable, public secret, letting anyone forge valid tokens. Now fails loudly at startup instead.
3. Removed a duplicate `module.exports` line in `authMiddleware.js` (cosmetic, flagged since Day 1 audit).

**Files changed:**
- `services/authService.js`
- `src/utils/generateToken.js`
- `src/middleware/authMiddleware.js`

**Tests:** verified both failure mode (no `JWT_SECRET` → clear startup error, not silent) and success mode (`JWT_SECRET` set → normal boot, 200 on root). Syntax checks passed on all 3 files.

**Still open (not app-code, needs manual action):** `.env` with real secrets remains committed in git history — rotate `PRIVATE_KEY`, `DB_PASSWORD`, `EMAIL_PASS` and scrub history before any public deployment.

## Day 31 — Completed (AWS Production Deployment Design)
**What we built:** `AWS_DEPLOYMENT.md` — concrete infrastructure design extending `SYSTEM_DESIGN.md`: VPC/subnet layout (public ALB, private EC2+RDS), security group rules, EC2/ASG sizing with reasoning, RDS config (Multi-AZ deferred, reasoned), Secrets Manager plan, CI/CD pipeline via GitHub Actions + OIDC (no long-lived keys), least-privilege IAM roles, CloudWatch alarm set, and a first-time deployment checklist (secret rotation listed as step 1, before anything else).

**No code changed — pure design document.**

## Day 32 — Completed (Dockerize: backend + PostgreSQL)
**What we built:** `Dockerfile` (Node 18 alpine, production install), `.dockerignore`, `docker-compose.yml` (backend + Postgres, healthcheck-gated startup, named volume for data persistence, auto-seeds schema + migrations on first run via `docker-entrypoint-initdb.d`).

**Dependency fix required for Docker to work at all:** `config/db.js` had hardcoded `host: "localhost"` — inside a container this resolves to the container itself, not the DB service. Changed to env-driven (`DB_HOST`, `DB_USER`, `DB_NAME`, `DB_PORT`) with the old hardcoded values as defaults — fully backward-compatible with the existing local (non-Docker) setup.

**Files changed:**
- `Dockerfile` (new)
- `.dockerignore` (new)
- `docker-compose.yml` (new)
- `config/db.js` (env-driven DB connection)

**Tests:** YAML syntax validated; `node --check` passed on `db.js`. **Docker itself isn't available in this sandbox — full build/run test must be done on the user's machine with Docker Desktop.** Test steps provided; awaiting user confirmation.

**Architecture decision:** frontend containerization deferred — today's scope is backend + DB only, since that's what actually needs to reach EC2. Redis/Kafka still not introduced — no justified need yet.

## Next Recommended Task (Day 33)
Once Docker is confirmed working locally: rotate the leaked secrets (`PRIVATE_KEY`, `DB_PASSWORD`, `EMAIL_PASS` — still pending since Day 1 audit) before pushing any image to a registry or deploying, then move to Stage 3 actual cloud steps (ECR push, EC2 provisioning, RDS setup) per `AWS_DEPLOYMENT.md`.

## Day 33 — Completed (Secret rotation + git history scrub)
**What we did:** Closed the critical vulnerability flagged since the Day 1 audit — a real, publicly-committed `.env` with live credentials.

1. Added `.env`/`.env.local` to `.gitignore` (was missing entirely — this is why it got committed in the first place)
2. Rotated all 3 leaked credentials: Postgres password, Gmail app password, blockchain wallet private key (new wallet + fresh Sepolia faucet funds; contract address unchanged since ownership wasn't tied to the leaked key)
3. Removed `.env` from git tracking (`git rm --cached .env`)
4. Reset git history entirely (`.git` folder deleted, fresh `git init`) rather than using `git filter-repo`/BFG — reasonable trade-off for a solo learning project where commit history isn't the valuable artifact, the code and the ability to explain it is
5. Renamed local branch `master` → `main` to match GitHub's current default, force-pushed clean history

**Real debugging moment:** `git push -f origin main` initially failed (`src refspec main does not match any`) — local branch was still `master` from Windows Git's older default. Fixed with `git branch -M main` before pushing.

**Files changed:** `.gitignore` only — this was infrastructure/hygiene work, not application code.

**Status: secrets rotated, `.env` no longer in git history or tracked going forward.**


## Day 34 — Completed (AWS Networking: VPC, Subnets, Security Groups)
**What we did:** Hands-on AWS console setup of the network layer from `AWS_DEPLOYMENT.md`. No app code changes — infrastructure only.

1. First attempt created duplicate subnets (manual step-by-step guide run on top of an already-wizard-generated VPC) — caught and fixed by deleting the VPC entirely (cascade-deletes subnets/route tables/IGW) and recreating cleanly with AWS's "VPC and more" wizard in one pass.
2. Final setup: `TrustChain` VPC (10.0.0.0/16), 2 public + 2 private subnets across 2 AZs, Internet Gateway, public + private route tables — all auto-wired by the wizard.
3. NAT Gateway deliberately **not** created (cost-conscious deferral, matches `AWS_DEPLOYMENT.md`) — confirmed zero NAT Gateways exist.
4. Created 3 security groups implementing a least-privilege trust chain: `sg-alb` (open to internet on 80/443) → `sg-backend` (port 3000, source = `sg-alb` only) → `sg-rds` (port 5432, source = `sg-backend` only). RDS is not reachable from the internet or even directly from the ALB — only from the backend.

**Real debugging moment:** initial VPC setup used the manual step-by-step subnet-creation guide on a VPC that had *already* been created via the "VPC and more" wizard, which auto-generates its own subnets/route tables/IGW — resulting in duplicate, redundant subnets in the same VPC (no IP conflict since CIDR ranges didn't overlap, but messy). Resolved by deleting and redoing cleanly with the wizard only.

**No files changed** — this entry itself is the only diff (tracking infrastructure work that has no corresponding code commit).

## Next Recommended Task (Day 35)
RDS PostgreSQL instance creation (private subnet, `sg-rds`), then load `schema.sql` + migrations into it.

## Day 35 — Completed (RDS PostgreSQL Instance)
**What we did:** Created a private RDS PostgreSQL instance (`trustchain-db`) — Standard create (not Easy create, which would have ignored our custom VPC/security groups), in the `trustchain-db-subnet-group` (private subnets only), attached to `sg-rds`, public access disabled, Multi-AZ disabled (cost-conscious, per `AWS_DEPLOYMENT.md`).

**Endpoint:** `trustchain-db.c9g4wgugun1f.ap-south-1.rds.amazonaws.com` (port 5432) — needed for the backend's `DB_HOST` once EC2 is up.

**Real issue hit + resolved:** First attempt failed with "maximum number of instances available with free plan accounts" — AWS's newer Free Plan account-level cap, not classic Free Tier. Resolved by checking for and clearing a stray/failed instance from an earlier attempt.

**No data loaded yet** — deliberately deferred to Day 36, since RDS has no public access; schema/migrations will be run from inside the VPC (EC2) once it exists, consistent with how it would actually work in production (no temporary public-access window opened).

## Next Recommended Task (Day 36)
Launch EC2 instance in a public subnet with `sg-backend`, connect to RDS, run `schema.sql` + migrations from there, then get the Dockerized backend running on it.