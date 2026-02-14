
# Multi-Tenant SaaS Platform – Project & Task Management System

A **production-ready multi-tenant SaaS application** that allows multiple organizations to manage users, projects, and tasks securely within a shared infrastructure. The platform enforces **strict tenant isolation**, **role-based access control**, and **subscription limits**, following real-world SaaS design principles.

This project is designed with **scalability, security, and maintainability** as first-class concerns.

---

## Overview

This system enables:

* Multiple tenants (organizations) on a single platform
* Each tenant to manage its own users, projects, and tasks
* Complete data isolation between tenants
* Centralized control for a Super Admin
* Subscription-based resource limits

The backend is fully implemented and production-ready. The frontend is actively being integrated.

---

## Key Features

### Authentication & Authorization

* JWT-based authentication with 24-hour expiry
* Role-based access control:

  * `super_admin`
  * `tenant_admin`
  * `user`
* Secure password hashing using bcrypt
* Stateless authentication (no server-side sessions)

### Multi-Tenancy

* Shared database, shared schema architecture
* Tenant isolation enforced using `tenant_id`
* Tenant context derived only from JWT (never from client input)
* Super Admin operates without tenant scope

### User Management

* Tenant Admin can create and manage users
* Role assignment per user
* Active/inactive user control

### Project Management

* Create, update, delete projects
* Tenant-level project isolation
* Subscription-based project limits enforced

### Task Management

* Create and manage tasks within projects
* Assign tasks to users
* Task status tracking (todo, in_progress, completed)
* Priority and due-date support

### Subscription Enforcement

* Plans with configurable limits
* Limits enforced before resource creation
* Prevents abuse and ensures fairness

### Audit Logging

* Logs critical actions:

  * User lifecycle events
  * Project lifecycle events
  * Task lifecycle events
  * Tenant updates
* Stored in a dedicated audit table

### Infrastructure

* Fully Dockerized backend and database
* Health check endpoint
* Automatic migrations and seed data

---

## Technology Stack

### Backend

* Node.js (18+)
* Express.js
* PostgreSQL 15
* JWT for authentication
* bcrypt for password hashing

### Frontend

* React 
* Protected routes
* Role-based UI rendering
* Responsive layout

### DevOps

* Docker
* Docker Compose

---

## Architecture

### Multi-Tenant Model

* Single PostgreSQL database
* Shared schema
* `tenant_id` column on all tenant-bound tables
* Super Admin users have `tenant_id = NULL`

### Security Principles

* Never trust client-provided tenant identifiers
* Always derive tenant context from JWT
* Enforce tenant filtering at the API layer
* Centralized authorization middleware

---

## Project Structure

```
saas-platform/
│
├── backend/
│   ├── src/
│   │   ├── controllers/      
│   │   ├── middleware/        
│   │   ├── routes/           
│   │   ├── utils/            
│   │   └── config/            
│   │
│   ├── migrations/           
│   ├── seeds/                 
│   ├── Dockerfile
│   └── server.js
│
├── frontend/
│   └── (React application)
│
├── docs/
│   ├── API.md                 
│   ├── architecture.md
│   ├── research.md
│   └── PRD.md
│
├── docker-compose.yml
├── submission.json
└── README.md
```

---

## Docker Setup

### Start the Entire System

```bash
docker-compose up -d --build
```

This will:

* Start PostgreSQL
* Apply database migrations
* Insert seed data
* Start the backend API server

---

## Service Endpoints

| Service     | URL                                            |
| ----------- | ---------------------------------------------- |
| Backend API | [http://localhost:5000](http://localhost:5000) |
| Database    | localhost:5432                                 |
| Frontend    | [http://localhost:3000](http://localhost:3000)                                 |

---

## Health Check

### Endpoint

```
GET /api/health
```

### Response

```json
{
  "status": "ok",
  "database": "connected"
}
```

Used to verify:

* API availability
* Database connectivity
* Migration and seed success

---

## Authentication

### Authorization Header

```
Authorization: Bearer <JWT_TOKEN>
```

### JWT Payload

```json
{
  "userId": "uuid",
  "tenantId": "uuid | null",
  "role": "super_admin | tenant_admin | user"
}
```

Sensitive data is never stored in the token.

---

## Seed Data (Development)

Automatically loaded at startup.

### Super Admin

```
Email: superadmin@system.com
Password: Admin@123
Role: super_admin
```

### Demo Tenant

```
Subdomain: demo
Plan: pro
```

### Tenant Admin

```
Email: admin@demo.com
Password: Demo@123
```

### Users

```
user1@demo.com / User@123
user2@demo.com / User@123
```

---

## Subscription Plans

| Plan       | Max Users | Max Projects |
| ---------- | --------- | ------------ |
| Free       | 5         | 3            |
| Pro        | 25        | 15           |
| Enterprise | 100       | 50           |

Limits are enforced before creating users or projects.

---

## API Documentation

Complete API documentation is available at:

```
docs/API.md
```

Includes:

* Authentication endpoints
* Tenant management
* User management
* Project management
* Task management
* Request and response examples
* Error formats

---

## Security Highlights

* bcrypt password hashing
* JWT signature and expiry validation
* Role-based authorization middleware
* Strict tenant isolation
* Audit trail for sensitive actions
* No cross-tenant data leakage

---

## Frontend Status

The frontend is being actively integrated and will include:

* Login and registration
* Dashboard
* Projects and tasks UI
* User management
* Role-based navigation
* Responsive design

---

## Screenshots

[view database-erd](docs/images/database-erd.png)
[view system-architecture](docs/images/system-architecture.png)

---

## Youtube vide link

[click here](https://youtu.be/mv7SGoIT8lk)

---

## Conclusion

This project demonstrates a **real-world, production-grade multi-tenant SaaS architecture** with a strong focus on security, scalability, and maintainability. The backend is fully operational and designed to support enterprise-level SaaS requirements, while the frontend integration completes the full-stack experience.

---
