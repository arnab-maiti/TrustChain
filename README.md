# 🚀 TrustChain — Blockchain-Backed Trust-Aware Supply Chain System

TrustChain is a backend-first, blockchain-integrated system designed to bring **trust, transparency, and tamper-proof verification** into supply chain workflows.

Instead of relying on manual ratings, the system builds **dynamic trust scores based on verified actions**, ensuring fair and data-driven reputation.

---

## 🧠 Problem Statement

Traditional supply chain systems suffer from:
- ❌ Lack of trust between participants  
- ❌ Easy data manipulation (no verification layer)  
- ❌ Manual rating systems (biased & unreliable)  
- ❌ No auditability of actions  

---

## 💡 Solution

TrustChain introduces:

- ✅ Event-driven architecture to track every action  
- ✅ OTP-based delivery verification for security  
- ✅ Dynamic trust scoring based on real behavior  
- ✅ Blockchain-based hash storage for tamper-proof validation  

---

## 🏗️ System Architecture
User Action → Event Logged → Trust Updated → Hash Generated → Stored On-Chain



- **Database (PostgreSQL)** → Stores actual data  
- **Blockchain (Ethereum/Polygon Testnet)** → Stores proof (hash)  
- **Verification API** → Compares DB data with blockchain  

---

## ⚙️ Core Features

### 🔐 1. Authentication & Authorization
- JWT-based authentication  
- Role-Based Access Control (RBAC):
  - Manufacturer
  - Distributor
  - Courier
  - Customer  

---

### 📦 2. Product Lifecycle Management

Tracks complete flow:
created → accepted → out_for_delivery → delivered



- Event logging at each stage  
- Full lifecycle visibility  

---

### 🔁 3. Event-Driven System

- `product_events` table = system backbone  
- Every action = event  
- Enables:
  - auditability  
  - debugging  
  - trust calculation  

---

### 🔐 4. OTP-Based Delivery Verification

- Secure delivery confirmation  
- Features:
  - OTP expiry (2 minutes)  
  - Attempt limits  
  - One active OTP per product  
  - Prevent OTP reuse  

---

### 🧠 5. Dynamic Trust Score Engine

- Based on **verified actions (not ratings)**  
- Stored in `trust_logs`  

Example:
- Successful delivery → +10  
- Fraud attempt → penalty  

API:
GET /api/users/trust/:id



---

### 🛡️ 6. Trust-Based Decision Making

- Low-trust couriers → blocked  
- High-trust users → allowed  

👉 System makes **intelligent decisions**

---

### ⛓️ 7. Blockchain Integration

- Hash generated from:
product_id + courier_id + status + timestamp



- Stored on-chain via smart contract:
```solidity
storeHash(bytes32)
🔍 8. Tamper Detection (CORE USP 💥)
Verification API:


GET /api/blockchain/verify/:productId
Process:

Fetch DB data

Recreate hash

Compare with blockchain

Result:

✅ Match → Verified

❌ Mismatch → Tampered

🎨 9. Frontend (React)
Dashboard with product list

Trust Score UI integration

Status color indicators

Timeline-based UX (event visualization)

Trust Check page:

Input courier_id

Fetch trust score

🧱 Tech Stack
Backend
Node.js

Express.js

PostgreSQL

Frontend
React.js

Axios

React Router

Blockchain
Solidity

Ethers.js

Hardhat

Sepolia Testnet

🧩 Database Design
Core Tables:

users

products

product_events

trust_logs

delivery_otps

Features:

UUIDs (pgcrypto)

Indexing (performance)

Constraints (data integrity)

Triggers (updated_at)

🔌 API Overview
Auth

POST /api/auth/register
POST /api/auth/login
Products

POST /api/products
PATCH /api/products/:id/accept
PATCH /api/products/:id/out-for-delivery
PATCH /api/products/:id/deliver
OTP

POST /api/otp/generate
POST /api/otp/verify
Trust

GET /api/users/trust/:id
Blockchain

GET /api/blockchain/verify/:productId
🧪 Testing
✔ Happy flow tested
✔ Invalid OTP handling
✔ Expired OTP handling
✔ Tamper detection verified
✔ Full pipeline tested end-to-end

🚀 Key Learnings
Backend = logic + rules + flow

Event-driven systems improve auditability

Trust should be based on actions, not opinions

Blockchain works best as a verification layer

Debugging requires:

DB check

API check

UI mapping

📈 Current Status
✔ Backend — Complete
✔ Blockchain Integration — Complete
✔ Verification System — Complete
✔ Frontend — In Progress (actively improving UX)

🔮 Future Improvements
Real-time updates (WebSockets)

Trust score visualization (charts)

Multi-chain support

Advanced fraud detection

Admin analytics dashboard

👨‍💻 Author
Arnab Maiti
Backend & Blockchain Developer