# EstateSync - Property Management System

## Overview
A full-stack Property Management System built with Node.js, Express, React, and a relational database (MySQL) via Prisma ORM. It features separate dashboards for Admins, Owners, and Tenants to manage properties, listings, leases, payments, and maintenance requests.

## Project Structure
- `/backend`: Node.js, Express, Prisma ORM
- `/frontend`: React, Vite, Tailwind CSS

## Prerequisites
- Node.js (v18+)
- MySQL Server (e.g., via XAMPP, WAMP, or standalone)
- phpMyAdmin (optional, for DB management)

## Setup Instructions

### 1. Database Setup
1. Open your MySQL client or phpMyAdmin.
2. Create a new database named `propmanage`.
   ```sql
   CREATE DATABASE propmanage;
   ```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Open `backend/.env` and ensure `DATABASE_URL` matches your local MySQL setup. The default is `mysql://root:@localhost:3306/propmanage` (assuming username `root` and no password).
4. Run Prisma Migrations (this generates the tables in your database):
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the backend server:
   ```bash
   npm start
   ```
   *The server will run on port 5000.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on a local port (usually http://localhost:5173).*

## Features Implemented
- **Authentication**: JWT-based login and registration. Role-based access control (Admin, Owner, Tenant).
- **Properties**: Owners can add, update, and delete properties. Admins have global access.
- **Leases & Listings**: Lease agreements and active property listings can be managed based on roles.
- **Payments**: Tenant payment tracking, and Owner/Admin financial dashboards.
- **Maintenance**: Tenants can raise requests, Owners/Admins can manage statuses via a Kanban-style interface.
- **Dashboards**: High-fidelity UI using Tailwind CSS with glassmorphism and modern aesthetics based on provided designs.

## Default Roles
When registering a new user, you can specify the role in the API payload or simply use the interface (currently hardcoded paths in the UI for demonstration purposes, but fully supported by the backend).
