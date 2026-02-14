
# Technical Specification

**Multi-Tenant SaaS Platform – Project & Task Management**

---

## 1. Purpose

This document provides a **technical specification** for the Multi-Tenant SaaS Platform. It describes the system structure, module responsibilities, environment configuration, development workflow, and operational behavior. The goal is to ensure that the system can be easily understood, deployed, extended, and maintained by developers.

---

## 2. System Overview

The platform is a **REST-based multi-tenant SaaS backend** designed to support multiple organizations with strict data isolation. Each tenant manages its own users, projects, and tasks while sharing a common infrastructure.

Key technical characteristics:

* Stateless backend API
* JWT-based authentication
* Role-based access control
* Tenant-aware data access
* Containerized deployment

---

## 3. Project Structure

### 3.1 Repository Structure

```
saas-platform/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── tenantController.js
│   │   │   ├── userController.js
│   │   │   ├── projectController.js
│   │   │   └── taskController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── tenantMiddleware.js
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── tenantRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── projectRoutes.js
│   │   │   └── taskRoutes.js
│   │   │
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── password.js
│   │   │   └── auditLogger.js
│   │   │
│   │   └── server.js
│   │
│   ├── migrations/
│   │   ├── 001_create_tenants.sql
│   │   ├── 002_create_users.sql
│   │   ├── 003_create_projects.sql
│   │   ├── 004_create_tasks.sql
│   │   └── 005_create_audit_logs.sql
│   │
│   ├── seeds/
│   │   └── seed_data.sql
│   │
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   
│
├── docs/
│   ├── research.md
│   ├── architecture.md
│   ├── API.md
│   ├── PRD.md
│   └── technical-spec.md
│
├── docker-compose.yml
├── submission.json
└── README.md
```

---

## 4. Backend Architecture

### 4.1 Controller Layer

**Responsibility**

* Handles HTTP requests
* Validates inputs
* Applies business logic
* Returns standardized responses

Controllers do not directly handle authentication or authorization logic; these concerns are delegated to middleware.

---

### 4.2 Middleware Layer

Middleware executes before controller logic and enforces system rules.

**Key Middleware Components**

* **Authentication Middleware**

  * Verifies JWT signature and expiry
  * Extracts `userId`, `tenantId`, and `role`

* **Tenant Isolation Middleware**

  * Injects tenant context into request
  * Prevents cross-tenant access

* **Role Authorization Middleware**

  * Validates user permissions per endpoint
  * Enforces role-based access control

* **Error Handling Middleware**

  * Centralized error formatting
  * Consistent HTTP status codes

---

### 4.3 Route Layer

Routes define:

* Endpoint paths
* HTTP methods
* Required middleware
* Associated controllers

Each module has its own route file to maintain separation of concerns.

---

## 5. Database Design

### 5.1 Database Type

* PostgreSQL 15
* Relational schema
* UUID primary keys

---

### 5.2 Core Tables

| Table Name | Purpose                                         |
| ---------- | ----------------------------------------------- |
| tenants    | Stores tenant metadata and subscription details |
| users      | Stores user accounts and roles                  |
| projects   | Stores tenant-specific projects                 |
| tasks      | Stores tasks associated with projects           |
| audit_logs | Records critical system actions                 |

---

### 5.3 Tenant Isolation Rules

* All tenant-bound tables include `tenant_id`
* Queries are always filtered using tenant context
* `tenant_id` is derived from JWT, never from request body
* Super Admin users are handled as a special case

---

## 6. Authentication & Authorization

### 6.1 JWT Authentication

* Stateless JWT tokens
* Token expiry: 24 hours
* Signed using a secret key

**JWT Payload Structure**

```json
{
  "userId": "uuid",
  "tenantId": "uuid | null",
  "role": "super_admin | tenant_admin | user"
}
```

---

### 6.2 Role-Based Access Control

| Role         | Permissions                                 |
| ------------ | ------------------------------------------- |
| super_admin  | Full system access                          |
| tenant_admin | Manage users, projects, tasks within tenant |
| user         | Limited access to assigned resources        |

Authorization rules are enforced before controller execution.

---

## 7. Subscription Enforcement

Subscription limits are enforced at the API layer.

**Enforcement Flow**

1. Fetch tenant subscription limits
2. Count existing resources
3. Compare with allowed maximum
4. Reject creation if limit exceeded

This ensures business constraints are consistently applied.

---

## 8. Audit Logging

Audit logging captures all critical actions.

**Logged Fields**

* tenant_id
* user_id
* action
* entity_type
* entity_id
* timestamp

Logs are immutable and used for security auditing and debugging.

---

## 9. API Response Standards

All API responses follow a consistent format.

**Success Response**

```json
{
  "success": true,
  "message": "optional",
  "data": {}
}
```

**Error Response**

```json
{
  "success": false,
  "message": "Error description"
}
```

This consistency simplifies frontend integration.

---

## 10. Environment Configuration

### 10.1 Required Environment Variables

```
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD

JWT_SECRET
JWT_EXPIRES_IN

PORT
NODE_ENV

FRONTEND_URL
```

All configuration values are injected via environment variables.

---

## 11. Docker & Deployment

### 11.1 Services

| Service  | Description          |
| -------- | -------------------- |
| database | PostgreSQL database  |
| backend  | Express.js API       |
| frontend | UI service (planned) |

---

### 11.2 Startup Behavior

On `docker-compose up -d`:

1. Database container starts
2. Backend waits for database readiness
3. Migrations execute automatically
4. Seed data is loaded
5. Backend API becomes available

---

## 12. Health Check

**Endpoint**

```
GET /api/health
```

**Purpose**

* Confirms API availability
* Confirms database connectivity
* Signals readiness to Docker and external systems

---

## 13. Development Workflow

1. Clone repository
2. Configure environment variables
3. Run `docker-compose up -d`
4. Access backend at `http://localhost:5000`
5. Use API documentation for testing

---

## 14. Extensibility

The system is designed for future growth:

* Stateless backend allows horizontal scaling
* Additional services can be introduced without refactoring
* Frontend integration is decoupled
* Database schema supports expansion

---

## 15. Conclusion

This technical specification defines a **clear, modular, and scalable architecture** for a multi-tenant SaaS platform. The system enforces strong security guarantees, supports real-world SaaS constraints, and provides a stable foundation for future development and deployment.

---

