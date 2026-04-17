# 🚀 TrustChain

A trust-aware supply chain system where decisions are made based on verified user behavior, not assumptions.

---

## 💡 Idea

TrustChain solves trust issues in logistics and supply chains by assigning a **dynamic trust score** to participants based on their verified actions.

Participants:
Manufacturer → Distributor → Courier → Retailer → Customer

---

## 🧠 Core Philosophy

> “Don’t trust users. Trust their actions.”

- Trust is derived from **system-verified events**  
- No fake ratings or manual reviews  
- Every action is recorded and auditable  

---

## ⚙️ Backend Architecture

Clean layered architecture:

Controller → Service → Database  

- Controllers → handle HTTP requests  
- Services → business logic  
- Database → PostgreSQL  

---

## 🗄️ Database Design

### Tables:

- users → system actors  
- products → tracked items  
- product_events → system core  
- trust_logs → trust history  
- delivery_otps → delivery verification  

### Features:

- UUID-based IDs (pgcrypto)  
- Trigger-based `updated_at`  
- Constraints for data integrity  
- Indexing for performance  
- Event sequencing for consistency  

---

## 🔐 Authentication & Security

- JWT-based authentication  
- Role-Based Access Control (RBAC)  
- Protected routes  
- OTP-based delivery verification  
- Attempt limits + expiry logic  

---

## 📦 Product Lifecycle

created → accepted → out_for_delivery → delivered  

### Role Responsibilities:

- Manufacturer → create product  
- Distributor → accept shipment  
- Courier → deliver  

---

## 🔐 OTP-Based Delivery Verification

- 1 active OTP per product  
- Expiry: 2 minutes  
- Attempt count tracking  
- Prevent OTP reuse  
- Required for delivery completion  

---

## 🧠 Trust Engine (CORE)

TrustChain uses **behavior-based trust scoring**.

### Formula:
trust_score = SUM(change_value)

### Current Mapping:
- Successful delivery → +10 trust  

---

## 🔗 Event → Trust → Decision System

System pipeline:

Event → Trust Update → Decision  

### Example:

- OTP verified → delivery success → +10 trust  
- Low trust courier → ❌ blocked  
- High trust courier → ✅ allowed  

👉 System actively uses trust to control actions.

---

## ⚙️ Trust API

GET /users/:id/trust-score  

- Returns dynamic trust score  
- Handles edge case (no logs → 0)  

---

## 🛡️ Fairness Logic

- Trust updated only on verified actions  
- No penalty for external/user errors  
- Prevents unfair trust degradation  

---

## 🧠 Event System & Consistency (Day 11)

- Strict lifecycle tracking enforced  
- Every product state change must match event logs  
- Event system acts as single source of truth  
- Database consistency ensured with constraints + validation  

👉 System designed as an **auditable backend**

---

## 🚀 Features

- User system with roles  
- Product lifecycle management  
- Shipment flow system  
- OTP delivery verification  
- Event-driven architecture  
- Trust history tracking  
- Trust score engine  
- Trust-based access control  
- Authentication + RBAC  
- Clean backend architecture  
- Production-level error handling  
- System consistency & auditability  

---

## 🛠 Tech Stack

- Backend: Node.js, Express.js  
- Database: PostgreSQL  
- Authentication: JWT  
- Tools: pg, GitHub  

---

## 📊 Progress Timeline

- Day 1: Database schema  
- Day 2: Event system  
- Day 3: Trust logs  
- Day 4: Optimization  
- Day 5: Backend foundation  
- Day 6: Auth + RBAC  
- Day 7: Product flow  
- Day 8: OTP verification  
- Day 9: Trust integration  
- Day 10: Trust engine  
- Day 11: System consistency & lifecycle tracking  

---

## 🧠 Key Learnings

- Backend = logic + rules + flow  
- Systems must enforce real-world constraints  
- Trust should be data-driven  
- Debugging is critical  
- Consistency is more important than features  
- Event systems must be reliable  

---

## 🔄 Upcoming

- Multi-factor trust scoring (delays, disputes, failures)  
- Blockchain-based verification layer  
- Payment system based on trust  
- Real-time dashboard  
- Scalability (Redis, queues, caching)  

---

## 🌍 Vision

To build a scalable, transparent, and trust-driven logistics system that can integrate with blockchain for verifiable trust.

---

## 👨‍💻 Author

Arnab Maiti  
Backend Developer | Building in Public 🚀  

---

## ⭐ Note

This project is being built step-by-step as a real-world backend system focusing on scalability, security, and intelligent decision-making.