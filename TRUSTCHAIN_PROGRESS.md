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

## Next Recommended Task (Day 31)
Stage 3 — Dockerize (backend + Postgres via docker-compose), then rotate leaked secrets before any deployment, then push to ECR/EC2.