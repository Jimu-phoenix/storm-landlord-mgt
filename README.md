
# SmartLord – Hostel Management System (MVP)

A modern, web-based hostel management platform built by **Prince Jimu, Precious Namondwe & Mwiza Sichinga** to help landlords manage hostels, tenants, and rent payments digitally, while enabling students to make hostel payments and have digital proof of payments.  
Built with **React, Vite, and Supabase** for fast development with PostgreSQL real-time database.

---

## Team

- **3 Developers**  
- **1 Non-Developer**

---

## MVP Features

### **Landlord Dashboard** 
- Add/Edit hostel details 
- View all tenants per hostel with room numbers
- Record rent payments → mark as **Paid / Pending**
- Log expenses (electricity, water, repairs)
- **Financial Snapshot:** Monthly income vs expenses, net profit/loss
- Search tenants by name or room

### **Tenant Portal**
- Tenant login (email + room number)
- View rent due date and amount and next payment
- Pay rent with Proof of Payments
- Students browse hostels 
- Contact landlord 

---

##  Tech Stack

| Layer          | Technology               |
|----------------|--------------------------|
| Frontend       | React 18 + Vite          |
| Styling        | Pure CSS (No frameworks) |
| Backend/DB     | Supabase (PostgreSQL)    |
| Auth           | Supabase Authentication  |
| Hosting        | Vercel                   |
| Version Control| Git + GitHub             |

---

## Setup Instructions

### 1. Clone & Install
```bash
git clone https://github.com/your-username/smartlord.git
cd smartlord
npm install
```

### 2. Supabase Setup
1. Create an Account at [Supabase.com](https://supabase.com/)
2. Create new project → note Project URL and anon public key
3. Run the SQL schema (above) in the SQL Editor
4. Enable Email authentication in Authentication settings

### 3. Environment Variables
Create `.env.local` file and add:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Dev Server
```bash
npm run dev
```
Open: [http://localhost:5173](http://localhost:5173)

---

## Developers
- [Prince Jimu](https://github.com/Jimu-phoenix)
- [Mwiza Sichinga](https://github.com/Munyuam)
- [Precious Namondwe](https://github.com/PreciousNamondwe)


