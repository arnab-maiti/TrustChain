# 🚀 TrustChain

A dynamic trust-aware supply chain system where decisions are made based on verified user behavior, not assumptions.

---

## 💡 Idea

TrustChain solves trust issues in logistics and supply chains by assigning a **dynamic trust score** to participants based on their verified actions.

Participants:
Manufacturer → Distributor → Courier → Retailer → Customer

---

## 🧠 Core Philosophy

> “Don’t trust users. Trust their actions.”

- Trust is **earned through system-verified events**  
- No manual ratings or fake reviews  
- Every action leaves an audit trail  

---

## ⚙️ Backend Architecture

Clean layered architecture:

Controller → Service → Database  

- Controllers → handle HTTP requests  
- Services → business logic  
- Database → PostgreSQL (data layer)  

---

## 🗄️ Database Design

### Tables:

- **users** → system actors  
- **products** → tracked items  
- **product_events** → system core (event tracking)  
- **trust_logs** → trust history  
- **delivery_otps** → delivery verification  

### Features:

- UUID-based IDs (pgcrypto)  
- Trigger-based `updated_at`  
- Constraints for data integrity  
- Indexing for performance  
- Event sequencing logic  

---

## 🔐 Authentication & Security

- JWT-based authentication  
- Role-Based Access Control (RBAC)  
- Protected routes  
- OTP-based delivery verification  
- Attempt limits + expiry handling  

---

## 📦 Product Lifecycle (Core Flow)

created → accepted → out_for_delivery → delivered  

### Role Responsibilities:

- Manufacturer → create product  
- Distributor → accept shipment  
- Courier → handle delivery  

---

## 🔐 OTP-Based Delivery Verification

- 1 active OTP per product  
- Expiry: 2 minutes  
- Attempt count tracking  
- Prevent OTP reuse  
- Required to mark delivery as completed  

---

## 🧠 Trust Engine (CORE USP 💥)

TrustChain uses **behavior-based trust scoring**.

### Formula:
trust_score = SUM(change_value)

### Current Mapping:

- Successful delivery → +10 trust  

---

## 🔗 Event → Trust → Decision

System pipeline:

Event → Trust Update → Decision  

### Example:

- OTP verified → delivery success → +10 trust  
- Low trust courier → ❌ blocked  
- High trust courier → ✅ allowed  

👉 The system actively uses trust to make decisions.

---

## ⚙️ Trust API

GET /users/:id/trust-score  

- Returns dynamic trust score  
- Handles edge case (no logs → 0)  

---

## 🛡️ Fairness Logic

- Trust updated only on verified actions  
- No penalty for external/user errors (e.g., wrong OTP by customer)  
- Prevents unfair trust manipulation  

---

## 🚀 Features

- 👤 User system with roles  
- 📦 Product lifecycle management  
- 🔄 Shipment flow system  
- 🔐 OTP delivery verification  
- ⚡ Event-driven architecture  
- 📊 Trust history tracking  
- 🧠 Trust score engine  
- 🛡️ Trust-based access control  
- 🔒 Authentication + RBAC  
- ⚙️ Clean backend architecture  
- 🚨 Production-level error handling  

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL  
- **Authentication:** JWT  
- **Tools:** pg, GitHub  

---

## 📊 Progress Timeline

- ✅ Day 1: Database schema (users, products)  
- ✅ Day 2: Transfer system + event engine  
- ✅ Day 3: Trust history + mapping  
- ✅ Day 4: Optimization (UUID, indexing, constraints)  
- ✅ Day 5: Backend foundation + error handling  
- ✅ Day 6: Authentication + RBAC  
- ✅ Day 7: Product flow + shipment APIs  
- ✅ Day 8: OTP delivery verification + full flow  
- ✅ Day 9: Trust log integration  
- ✅ Day 10: Trust score engine + decision system  

---

## 🧠 Key Learnings

- Backend = logic + rules + flow  
- Systems should enforce real-world behavior  
- Trust should be data-driven, not opinion-based  
- Debugging is core to engineering  
- Decision-making systems require fairness logic  

---

## 🔄 Upcoming

- Multi-factor trust scoring (delay, disputes, failures)  
- Blockchain-based trust verification  
- Payment system based on trust score  
- Real-time dashboard  
- Scaling for 1M+ users (Redis, queues, caching)  

---

## 🌍 Vision

To build a scalable, transparent, and trust-driven logistics system that can operate in real-world environments and integrate with blockchain for verifiable trust.

---

## 👨‍💻 Author

Arnab Maiti  
Backend Developer | Building in Public 🚀  

---

## ⭐ Note

This project is being built step-by-step as a real-world system focusing on scalability, security, and intelligent decision-making.