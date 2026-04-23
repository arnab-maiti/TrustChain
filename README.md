# 🚀 TrustChain

A trust-aware, verifiable supply chain system combining backend intelligence, behavior-based trust scoring, and blockchain-based proof for tamper detection.

---

## 💡 Overview

TrustChain solves trust issues in logistics by ensuring all decisions are based on **verified system actions**.

It integrates:
- Backend system (data + logic)
- Trust engine (decision-making)
- Blockchain layer (proof)
- Verification system (tamper detection)

---

## 🧠 Core Philosophy

> Don’t trust users. Trust their actions.

- No manual ratings  
- No fake reviews  
- All actions are verifiable  
- Trust is computed from behavior  

---

## 🏗 System Architecture
User Action
↓
Backend (Event Created)
↓
Hash Generated
↓
Stored on Blockchain
↓
Verification API compares both



### Layers

- Controller → API handling  
- Service → business logic  
- Database → PostgreSQL (source of truth)  
- Blockchain → proof layer  
- Verification → integrity check  

---

## 🗄️ Database Design

### Tables

- users  
- products  
- product_events  
- trust_logs  
- delivery_otps  

### Features

- UUID IDs  
- Triggers (`updated_at`)  
- Constraints for safety  
- Indexing  
- Event sequencing  

---

## 🔐 Authentication & Authorization

- JWT authentication  
- RBAC  
- Protected routes  

---

## 📦 Product Lifecycle
created → accepted → out_for_delivery → delivered



---

## 🔐 OTP Verification

- One OTP per product  
- Expiry + attempt limit  
- Required for delivery  

---

## 🧠 Trust Engine

### Formula
trust_score = SUM(change_value)



### Rule

- Delivery success → +10  

---

## 🔗 Decision System

- Low trust → blocked  
- High trust → allowed  

---

## ⛓ Blockchain Layer

### Hash Generation
product_id + courier_id + status + timestamp



### Smart Contract

- storeHash(bytes32)
- verifyHash(bytes32)

### Events

- DeliveryStored(...)

---

## 🔍 Verification API (CORE)
GET /api/blockchain/verify/:productId



### Flow

- Fetch DB data  
- Recreate hash  
- Compare with blockchain  

### Result

- `verified: true` → valid  
- `verified: false` → tampered  

---

## 💥 Tamper Detection

- DB change → hash mismatch  
- System detects manipulation  

👉 Ensures real data integrity  

---

## 🧠 System Behavior

- DB = actual data  
- Blockchain = proof  
- Verification = trust enforcement  

---

## 🚀 Features

- Lifecycle tracking  
- OTP verification  
- Trust engine  
- Event-driven architecture  
- Blockchain integration  
- Verification API  
- Tamper detection  
- RBAC  
- Clean architecture  

---

## 🛠 Tech Stack

- Node.js, Express  
- PostgreSQL  
- Solidity  
- Ethers.js  
- JWT  

---

## 📊 Progress

- Day 1–10 → backend + trust  
- Day 11 → consistency  
- Day 12 → blockchain  
- Day 13 → verification 
- Day 14 → verify page 
- Day 15 → Dashboard page
---

## 🧠 Key Learnings

- Systems need verification, not just storage  
- Blockchain is for proof  
- Consistency is critical  
- Trust must be measurable  
- Security must be testable  

---

## 🔄 Future Scope

- Multi-factor trust  
- Fraud detection  
- Payment system  
- Scaling (Redis, queues)  
- UI dashboard  

---

## 🌍 Vision

To build a fully verifiable, trust-driven logistics system with real-world applicability.

---

## 👨‍💻 Author

Arnab Maiti
Full Stack BlockChain Developer