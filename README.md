# TrustChain

**A blockchain-backed multi-party requirement assurance & traceability platform for high-value, regulated products.**

TrustChain lets a customer, retailer, and manufacturer agree on a product requirement, lock it once all three parties approve, track it through manufacturing/QC, and follow it through a verifiable custody chain (manufacturer → distributor → retailer → customer) with a cryptographic proof anchored on Ethereum at final delivery.

Built for domains where provenance actually matters — pharmaceuticals, luxury goods, and other high-value supply chains where "trust me" isn't good enough.

---

## Why this exists

Most supply-chain demos put everything on-chain and call it a day. TrustChain is built on a different principle: **PostgreSQL is the source of truth; the blockchain is a proof layer.** Every business decision about what goes where is made deliberately — a hash goes on-chain only when its integrity needs to be independently verifiable later; everything else (users, orders, requirements, documents, audit trail) lives in a relational database where it belongs.

---

## Core Workflow

```
Phase 1 — Requirement Agreement
  Customer creates requirement → assigns retailer + manufacturer
  → all three approve → requirement LOCKED

Phase 2 — Manufacturing
  Manufacturer builds product against the locked requirement
  → QC + certificate → production marked complete

Phase 3 — Dispatch
  Manufacturer dispatches to a specific distributor
  → distributor confirms custody

Phase 4 — Retail Handover
  Distributor sends to a specific retailer
  → retailer confirms receipt

Phase 5 — Customer Delivery
  Retailer delivers to customer, confirmed via OTP
  → delivery hash anchored on-chain (Sepolia)
  → trust score updated
```

Each transition is explicitly assigned and confirmed by the receiving party — no step can be skipped or claimed by the wrong actor.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | PostgreSQL (raw `pg` — no ORM, hand-written SQL) |
| Blockchain | Solidity, Hardhat, ethers.js v6, Ethereum Sepolia testnet |
| Auth | JWT, bcrypt |
| Frontend | React, Vite |
| Email | Nodemailer |

---

## Architecture Highlights

- **Requirement-as-root design.** A requirement is the anchor entity; products, approvals, and custody events all trace back to it.
- **Concurrency-safe approval locking.** The "all 3 parties approved" check uses `SELECT ... FOR UPDATE` row-level locking to prevent a race condition where two near-simultaneous approvals could both read stale state and neither triggers the lock.
- **RBAC enforced at two levels.** Route-level role gates (`roleMiddleware`) restrict *who can call an endpoint*; service-level ownership checks restrict *which specific record* they can act on (e.g. a retailer can only approve requirements assigned to them, not any requirement).
- **Blockchain writes never block business logic.** On-chain anchoring happens *after* the database commit, wrapped so a failed transaction is logged, not fatal — the delivery is already recorded as truth in Postgres regardless of chain availability.
- **Migrations are isolated and numbered** (`db/migrations/00X_*.sql`), not appended to a single growing schema file — each migration is a standalone, re-runnable unit.

---

## Project Structure

```
TrustChain/
├── app.js                      # Express app setup + route mounting
├── server.js                   # (legacy alt entry point)
├── config/
│   └── db.js                   # PostgreSQL connection pool
├── controllers/                # Request handlers (business logic)
├── services/                   # Reusable logic: events, notifications, OTP, trust score, blockchain
├── routes/                     # Express route definitions
├── src/
│   ├── middleware/              # auth, role-based access control, error handling
│   └── utils/                   # AppError, asyncHandler, email, token generation
├── db/
│   ├── schema.sql               # Original schema (historical — see note below)
│   └── migrations/              # Numbered, standalone migrations (current source of truth going forward)
├── contracts/                  # Solidity smart contracts
├── test/                       # Hardhat contract tests
└── frontend/                   # React + Vite client
```

> **Note on `db/schema.sql`:** this file is a historical session log rather than a clean re-runnable schema (it mixes DDL with ad-hoc test queries). All new database changes are made through `db/migrations/`, which are clean, standalone, and safe to re-run on a fresh database.

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm

### Installation

```bash
git clone https://github.com/arnab-maiti/TrustChain.git
cd TrustChain
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
ALCHEMY_RPC_URL=your_sepolia_rpc_url
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=your_deployed_contract_address
PORT=3000
```

> **Never commit `.env`.** Rotate any credential that has ever been pushed to a public repository.

### Database Setup

```bash
psql -U postgres -d TrustChain -f db/schema.sql
psql -U postgres -d TrustChain -f db/migrations/002_requirements.sql
psql -U postgres -d TrustChain -f db/migrations/003_manufacturing.sql
psql -U postgres -d TrustChain -f db/migrations/004_dispatch_retail.sql
```

### Run

```bash
npm run dev      # nodemon, auto-restart on change
npm start         # production start
```

Server runs on `http://localhost:3000` by default.

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user (customer/retailer/manufacturer/distributor) |
| POST | `/login` | Login, returns JWT |
| GET | `/me` | Get current authenticated user |

### Requirements — `/api/requirements`
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/` | customer | Create a requirement |
| GET | `/` | any | List requirements relevant to you |
| GET | `/:id` | participant | View one requirement |
| PATCH | `/:id/assign` | customer | Assign retailer + manufacturer, submit for review |
| PATCH | `/:id/approve` | retailer/manufacturer | Approve (auto-locks when all 3 approved) |
| PATCH | `/:id/reject` | retailer/manufacturer | Reject |

### Products — `/api/products`
| Method | Endpoint | Role | Description |
|---|---|---|---|
| POST | `/from-requirement/:requirementId` | manufacturer | Start manufacturing against a locked requirement |
| PATCH | `/:id/complete-production` | manufacturer | Confirm QC pass + certificate |
| POST | `/:id/dispatch` | manufacturer | Dispatch to a specific distributor |
| POST | `/:id/accept` | distributor | Confirm receipt (must be the assigned distributor) |
| POST | `/:id/dispatch-to-retailer` | distributor | Send to a specific retailer |
| POST | `/:id/confirm-retailer-receipt` | retailer | Confirm receipt |
| POST | `/:id/out-of-delivery` | distributor/retailer | Mark out for final delivery |
| GET | `/` | public | List all products |
| GET | `/:id` | public | Get one product |
| GET | `/:id/events` | public | Full event/audit trail for a product |

### OTP Delivery — `/api/otp`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/:productId/generate-otp` | Generate delivery OTP |
| POST | `/:productId/verify-otp` | Verify OTP, complete delivery, anchor hash on-chain |

### Trust & Blockchain
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/:id/trust-score` | Get a user's trust score |
| GET | `/api/blockchain/verify/:productId` | Verify a product's on-chain integrity |

---

## Security

- Passwords hashed with bcrypt; JWT-based auth on all protected routes.
- RBAC enforced at both route level (role) and service level (record ownership/assignment).
- Row-level locking on concurrent approval writes.
- Dispatch/receipt endpoints validate the actor is the *specific* assigned party, not just "any user with the right role."

**Known gaps (actively being worked on):**
- OTP endpoints currently lack route-level auth — tracked for a fix.
- Trust score currently uses a single flat-rate rule; a deterministic, multi-factor formula is planned.

---

## Roadmap

- [x] Requirement creation, assignment, 3-party approval, locking
- [x] Manufacturing / QC confirmation
- [x] Dispatch (manufacturer → distributor)
- [x] Retail handover (distributor → retailer)
- [x] OTP-based customer delivery
- [x] On-chain delivery hash anchoring
- [x] Status-change email notifications
- [ ] Deterministic multi-factor trust score
- [ ] EIP-712 structured approval signatures
- [ ] QR-code verification page (public, non-sensitive view)
- [ ] Automated test suite (Jest + Supertest)
- [ ] Docker + CI/CD
- [ ] AWS deployment (EC2, RDS, S3, CloudWatch)
- [ ] Redis caching / rate limiting
- [ ] Async job queue (BullMQ) where genuinely justified

---

## Development Philosophy

This project is built incrementally, one deliberate feature at a time — no big-bang rewrites, every architectural decision documented and justified, every feature manually tested before being considered done. Progress is tracked day-by-day in `TRUSTCHAIN_PROGRESS.md`.

---

## Author

**Arnab Maiti** — Final-year B.Tech IT student, backend & blockchain developer.

## License

MIT