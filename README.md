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

## 🛡️ Fairness Rules

- Trust updated only on verified actions  
- No penalties for external errors (e.g., wrong OTP)  

---

## 🧠 Event System & Consistency

- Product state must match event logs  
- Event history acts as source of truth  
- DB constraints enforce consistency  

👉 Designed as an auditable backend system

---

## 🚀 Features

- User system with roles  
- Product lifecycle management  
- Shipment flow  
- OTP-based delivery verification  
- Event-driven architecture  
- Trust score engine  
- Trust-based access control  
- Authentication + RBAC  
- Error handling system  
- Data consistency enforcement  

---

## 🛠 Tech Stack

- Backend: Node.js, Express.js  
- Database: PostgreSQL  
- Auth: JWT  
- Tools: pg, GitHub  

---

## 📊 Progress

- Day 1–4: DB + event system + optimization  
- Day 5–6: Backend + auth + RBAC  
- Day 7–8: Product flow + OTP  
- Day 9–10: Trust engine + decision system  
- Day 11: System consistency + lifecycle alignment  

---

## 🔄 Next Steps

- Multi-factor trust scoring  
- Blockchain verification layer  
- Payment logic  
- Dashboard  
- Scalability improvements  

---

## 🌍 Vision

To build a scalable, auditable, and trust-driven supply chain system with blockchain-based verification.

---

## 👨‍💻 Author

Arnab Maiti  
Backend Developer