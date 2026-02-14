
# System Architecture Document

**Multi-Tenant SaaS Platform – Project & Task Management**

---

## 1. Overview

This document describes the **system architecture, component responsibilities, and data flow** of the Multi-Tenant SaaS Platform.
The architecture is designed to ensure **strict tenant isolation, role-based access control, scalability, security, and maintainability**, while remaining simple to deploy and operate using containerization.

---

## 2. High-Level Architecture

The system follows a **three-tier architecture**:

1. **Client Layer (Frontend)**
2. **Application Layer (Backend API)**
3. **Data Layer (PostgreSQL Database)**

Each layer is independently deployable and communicates through well-defined interfaces.

---

## 3. Architecture Components

### 3.1 Client Layer (Frontend)

**Responsibilities**

* User authentication (login, logout)
* Role-based UI rendering
* Project and task management interfaces
* API consumption via HTTP
* Token storage and session handling

**Key Characteristics**

* Stateless client
* Communicates with backend using REST APIs
* JWT stored client-side
* Authorization header attached to every request

The frontend is intentionally **decoupled** from backend implementation details and communicates only through documented APIs.

---

### 3.2 Application Layer (Backend API)

**Technology Stack**

* Node.js
* Express.js

**Responsibilities**

* Authentication and authorization
* Tenant isolation enforcement
* Business logic execution
* Subscription limit validation
* Audit logging
* Database access

#### Core Modules

* Authentication Module
* Tenant Management Module
* User Management Module
* Project Management Module
* Task Management Module

Each module is structured using:

* Controllers (business logic)
* Routes (API definitions)
* Middleware (authentication, authorization, tenant isolation)

---

### 3.3 Data Layer (PostgreSQL)

**Responsibilities**

* Persistent data storage
* Transaction management
* Referential integrity
* Schema-level constraints

**Key Characteristics**

* Shared database, shared schema
* Tenant data isolated using `tenant_id`
* Foreign key constraints with cascade rules
* Indexed tenant-related columns for performance

---

## 4. Multi-Tenancy Design

### 4.1 Tenant Identification

* Each tenant is uniquely identified by:

  * `tenant_id` (UUID)
  * `subdomain` (human-readable identifier)
* Tenant context is derived exclusively from the JWT
* Client requests never provide or control tenant identifiers

---

### 4.2 Tenant Isolation Strategy

| Entity     | Isolation Mechanism                    |
| ---------- | -------------------------------------- |
| Users      | users.tenant_id                        |
| Projects   | projects.tenant_id                     |
| Tasks      | tasks.tenant_id (derived from project) |
| Audit Logs | audit_logs.tenant_id                   |

All tenant-scoped database queries automatically apply tenant filtering unless the requester is a super admin.

---

### 4.3 Super Admin Access Model

* Super Admin users have `tenant_id = NULL`
* They are allowed cross-tenant visibility
* Authorization middleware explicitly checks this role
* Tenant filtering is bypassed only for approved super admin operations

---

## 5. Authentication & Authorization Flow

### 5.1 Login Flow

1. User submits credentials with tenant subdomain
2. Backend verifies tenant existence and status
3. Password is validated using bcrypt
4. JWT is issued containing:

   * userId
   * tenantId
   * role
5. Token is returned to the client

---

### 5.2 Request Authorization Flow

1. Client sends request with `Authorization: Bearer <JWT>`
2. Authentication middleware verifies token validity
3. Tenant middleware extracts tenant context
4. Role-based middleware validates permissions
5. Controller executes business logic

---

## 6. API Communication Flow

```
Client
  ↓ HTTP Request (JWT)
Backend API
  ↓ Authentication Middleware
  ↓ Tenant Isolation Middleware
  ↓ Role Authorization Middleware
Controller
  ↓ SQL Query
PostgreSQL
  ↑ Result
Controller
  ↑ JSON Response
Client
```

---

## 7. Database Architecture

### 7.1 Schema Design Principles

* Normalized relational schema
* UUIDs as primary keys
* ENUMs for controlled values
* Foreign keys for data integrity
* Cascade deletes where appropriate

---

### 7.2 Core Tables

* tenants
* users
* projects
* tasks
* audit_logs

Each table enforces ownership and relationship constraints to guarantee tenant isolation.

---

## 8. Subscription Enforcement Architecture

Subscription limits are enforced at the **application layer**:

1. Tenant subscription limits are retrieved
2. Existing resource counts are calculated
3. Creation is rejected if limits are exceeded
4. HTTP 403 response is returned with a clear message

This ensures consistent business rule enforcement.

---

## 9. Audit Logging Architecture

Audit logging is centralized and automatic:

* Triggered for all critical actions
* Stored attributes include:

  * tenant_id
  * user_id
  * action
  * entity_type
  * entity_id
  * timestamp
* Logs are immutable and not modifiable via APIs

---

## 10. Error Handling Architecture

* Centralized error handling strategy
* Consistent JSON error responses
* Appropriate HTTP status codes
* Authorization and validation failures handled early in request lifecycle

---

## 11. Docker & Deployment Architecture

### 11.1 Containerized Services

| Service  | Responsibility     |
| -------- | ------------------ |
| database | PostgreSQL storage |
| backend  | REST API server    |
| frontend | Client application |

---

### 11.2 Inter-Service Communication

* Services communicate using Docker networking
* Backend connects to database via `database:5432`
* Frontend communicates with backend via exposed API port

---

### 11.3 Health Check Strategy

* Backend exposes `/api/health`
* Health check validates:

  * API availability
  * Database connectivity
* Docker Compose waits for healthy services before dependency startup

---

## 12. Scalability & Extensibility

The architecture supports future growth:

* Horizontal scaling of backend services
* Stateless API design
* Database read replicas (future enhancement)
* Microservice extraction if required
* Caching and background workers can be introduced without redesign

---

## 13. Security Architecture Summary

* JWT-based authentication
* Strict tenant isolation
* Role-based authorization
* Secure password hashing
* Audit trail for all sensitive operations

---

## 14. Conclusion

This architecture provides a **robust and scalable foundation for a production-ready multi-tenant SaaS platform**.
It balances simplicity with extensibility while enforcing strong security and data isolation guarantees.

---
