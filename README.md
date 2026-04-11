# 🚀 TrustChain

A dynamic trust score based supply chain system designed for real-world scalability, transparency, and reliability.

---

## 💡 Idea

TrustChain aims to solve trust issues in supply chains by assigning a **dynamic trust score** to each participant based on their actions and history.

Participants:
Manufacturer → Distributor → Courier → Retailer → Customer

---

## 🧠 Core Concepts

- Event-driven system design  
- Dynamic trust scoring  
- Role-based access control (RBAC)  
- Audit trail for every action  
- Backend-first architecture  
- Blockchain-ready verification layer  

---

## ⚙️ Backend Architecture

Clean layered architecture:

Controller → Service → Database  

- Controllers handle request/response  
- Services handle business logic  
- Database handles data operations  

---

## 🗄️ Database Design

Main tables:

- **users** → system actors  
- **products** → tracked items  
- **product_events** → system core (event tracking)  
- **trust_logs** → reputation history  

### Key Features:
- UUID-based IDs using pgcrypto  
- Trigger-based auto `updated_at`  
- Constraints for data safety  
- Indexing for performance  
- Event sequencing with integrity logic  

---

## 🔐 Authentication & Security

- JWT-based authentication  
- Role-based access control (RBAC)  
- Protected routes using middleware  
- Secure business logic enforcement  

---

## 📦 Product Flow (Core Logic)

### Workflow:
created → accepted → out_for_delivery → delivered (in progress)

### Roles:

- Manufacturer → create product  
- Distributor → accept shipment  
- Courier → handle delivery  

### Features:
- Role-based validation at each step  
- Shipment acceptance API  
- Courier assignment  
- Event logging for every action  

---

## 🛡️ Business Logic Enforcement

- Strict RBAC rules  
- Invalid actions blocked (403 errors)  
- Data consistency ensured with constraints and validation  
- Real-world logistics flow simulation  

---

## 🧠 System Flow

1. Users register/login  
2. Products are created  
3. Products move across participants  
4. Each action is recorded as an event  
5. Events affect trust logs  
6. Trust score (upcoming) will be calculated dynamically  

---

## 🚀 Features (Current)

- 👤 User system with roles  
- 📦 Product management  
- 🔄 Product transfer system  
- 📦 Shipment acceptance system  
- 🚚 Delivery workflow (in progress)  
- ⚡ Event-driven architecture  
- 📊 Trust history tracking  
- 🔗 Event → impact mapping  
- 🔐 Authentication system (JWT)  
- 🛡️ Role-based access control (RBAC)  
- 🔒 Protected API routes  
- ⚙️ Backend architecture (Controller → Service → DB)  
- 🚨 Error handling (asyncHandler + AppError)  

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL  
- **Authentication:** JWT  
- **Tools:** pg, GitHub  

---

## 📊 Project Progress

- ✅ Day 1: Database schema (users, products)  
- ✅ Day 2: Transfer system + event engine  
- ✅ Day 3: Trust history + event-impact mapping  
- ✅ Day 4: System optimization (UUID, indexing, constraints)  
- ✅ Day 5: Backend foundation + error handling + DB concepts  
- ✅ Day 6: Authentication + RBAC + secure business logic  
- ✅ Day 7: Product flow + shipment APIs + debugging + system behavior  

---

## 🧠 Key Learning

- Backend = logic + rules + flow (not just APIs)  
- Real systems require strict validation and role enforcement  
- Debugging is a core engineering skill  
- Event-driven design improves traceability and scalability  

---

## 🔄 Upcoming

- Complete delivery flow (out_for_delivery → delivered)  
- Trust score calculation engine  
- Blockchain verification layer  
- Payment logic based on trust score  
- Dashboard for visualization  

---

## 🌍 Vision

To build a scalable, transparent, and trust-driven supply chain system that can handle real-world usage and integrate with blockchain for verification.

---

## 👨‍💻 Author

Arnab Maiti  
Backend Developer | Building in Public 🚀  

---

## ⭐ Note

This project is being built step-by-step as a real-world backend system, focusing on scalability, security, and production-level architecture.