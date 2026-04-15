# 🚀 TrustChain

A dynamic trust score based supply chain system designed for real-world scalability, transparency, and reliability.

---

## 💡 Idea

TrustChain solves trust issues in supply chains using **dynamic trust scores** based on participant behavior and history.

Participants:
Manufacturer → Distributor → Courier → Retailer → Customer

---

## 🧠 Core Concepts

- Event-driven system  
- Dynamic trust scoring  
- Role-based access control (RBAC)  
- OTP-based delivery verification  
- Audit trail for every action  
- Backend-first architecture  
- Blockchain-ready verification  

---

## ⚙️ Backend Architecture

Controller → Service → Database  

- Controllers → request/response  
- Services → business logic  
- Database → data layer  

---

## 🗄️ Database Design

Tables:

- users → actors  
- products → items  
- product_events → system core  
- trust_logs → reputation history  
- delivery_otps → delivery verification  

### Features:
- UUID (pgcrypto)  
- triggers (`updated_at`)  
- constraints + indexing  
- event integrity logic  

---

## 🔐 Authentication & Security

- JWT authentication  
- RBAC (role-based access control)  
- Protected routes  
- OTP-based delivery verification  

---

## 📦 Product Flow

created → accepted → out_for_delivery → delivered  

### Roles:
- Manufacturer → create  
- Distributor → accept  
- Courier → deliver  

---

## 🔐 OTP Delivery System

- 1 active OTP per product  
- Expiry: 2 minutes  
- Attempt count tracking  
- Prevent reuse  
- Required for delivery completion  

---

## 🚀 Features

- User system  
- Product lifecycle  
- Shipment flow  
- OTP delivery verification  
- Event-driven architecture  
- Trust history tracking  
- Authentication + RBAC  
- Error handling system  

---

## 🛠 Tech Stack

Node.js, Express.js  
PostgreSQL  
JWT  

---

## 📊 Progress

Day 1–8 complete:
- DB → Event system → Auth → RBAC → Product flow → OTP system  

---

## 🔄 Next

- Trust score engine  
- Blockchain integration  
- Payment system  
- Dashboard  

---

## 🌍 Vision

Build a scalable, transparent supply chain system with real-world trust and blockchain verification.

---

## 👨‍💻 Author

Arnab Maiti  
Backend Developer 🚀
- ✅ Day 9: Trust log integration with delivery verification (core trust system)

---

## 🧠 Trust Score Integration (Core USP)

- Trust logs now updated on successful delivery  
- OTP verification → delivery confirmed → trust score impact  

### Example:
- Successful delivery → +10 trust points  

This connects:
real-world action → system event → trust reputation  

---

## 🔗 Event → Trust Mapping

- Each verified action affects user trust  
- Trust logs maintain history of score changes  
- Foundation for dynamic trust score engine  