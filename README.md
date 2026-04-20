# 🚀 TrustChain

A trust-aware supply chain backend where decisions are driven by verified user actions, not assumptions.

---

## 💡 Overview

TrustChain addresses trust issues in logistics by assigning a **dynamic trust score** to participants based on system-verified events.

Participants:
Manufacturer → Distributor → Courier → Retailer → Customer

---

## 🧠 Core Principles

- Event-driven architecture  
- Behavior-based trust scoring  
- Role-based access control (RBAC)  
- OTP-based delivery verification  
- Auditability and consistency  
- Backend-first, blockchain-ready design  

---

## ⚙️ Architecture

Controller → Service → Database  

- Controllers: handle HTTP requests  
- Services: business logic  
- Database: PostgreSQL  

---

## 🗄️ Database Schema

### Tables

- users → system actors  
- products → tracked items  
- product_events → event history (source of truth)  
- trust_logs → trust score changes  
- delivery_otps → OTP verification  

### Features

- UUID IDs using pgcrypto  
- Trigger-based updated_at  
- Constraints for integrity  
- Indexing for performance  
- Event sequencing  

---

## 🔐 Authentication & Authorization

- JWT authentication  
- Role-Based Access Control (RBAC)  
- Protected routes via middleware  

---

## 📦 Product Lifecycle

created → accepted → out_for_delivery → delivered  

### Role Flow

- Manufacturer → create product  
- Distributor → accept shipment  
- Courier → deliver  

---

## 🔐 OTP Verification System

- One active OTP per product  
- Expiry: 2 minutes  
- Attempt limit tracking  
- Prevent OTP reuse  
- Required for delivery completion  

---

## 🧠 Trust Engine

Trust is calculated from verified events.

### Formula

trust_score = SUM(change_value)

### Current Rule

- Successful delivery → +10  

---

## 🔗 Event → Trust → Decision

- OTP verified → delivery success → trust +10  
- Low trust courier → blocked  
- High trust courier → allowed  

👉 System behavior depends on trust.

---

## ⚙️ API

### Get Trust Score

GET /users/:id/trust-score  

- Returns calculated trust score  
- Returns 0 if no logs exist  

---

### 📡 On-Chain Storage

- Smart contract: `storeHash(bytes32 hash)`  
- Stores delivery proof  
- Generates transaction hash  

👉 Ensures immutability and tamper detection  

---

## 📡 Smart Contract Events

- `event DeliveryStored(...)`  
- Indexed for efficient querying  
- Acts as public verification log  

---

## 🔗 Data Strategy

- **PostgreSQL** → full system data  
- **Blockchain** → proof (hash)  

👉 Efficient, scalable, and secure  

---

## 🚀 Features

- User role system  
- Product lifecycle tracking  
- Shipment flow management  
- OTP-based delivery verification  
- Event-driven architecture  
- Trust score engine  
- Trust-based access control  
- Blockchain-based verification  
- Authentication + RBAC  
- Clean architecture (Controller → Service → DB)  
- Production-level error handling  
- Data consistency enforcement  

---

## 🛠 Tech Stack

- Backend: Node.js, Express.js  
- Database: PostgreSQL  
- Blockchain: Solidity, Ethers.js  
- Authentication: JWT  
- Tools: GitHub  

---

## 📊 Development Timeline

- Day 1–4 → Database + event system + optimization  
- Day 5–6 → Backend + auth + RBAC  
- Day 7–8 → Product flow + OTP verification  
- Day 9–10 → Trust engine + decision system  
- Day 11 → Consistency + lifecycle alignment  
- Day 12 → Blockchain integration + on-chain verification  

---

## 🧠 Key Learnings

- Backend = logic + rules + flow  
- Event systems must be reliable  
- Trust should be behavior-based  
- Blockchain is best for verification  
- Consistency > features  
- Debugging is core engineering  

---

## 🔄 Future Improvements

- Multi-factor trust scoring (delay, disputes, fraud)  
- Blockchain-based trust score verification  
- Payment system based on trust  
- Real-time dashboard  
- Redis caching & queues  
- Microservices architecture  

---

## 🌍 Vision

To build a scalable, transparent, and trust-driven logistics system where every action is verifiable and every decision is data-driven.

---

## 👨‍💻 Author

Arnab Maiti  
Full Stack BlockChain Developer | Building in Public 🚀