
# Research Document

**Multi-Tenant SaaS Platform – Project & Task Management System**

---

## 1. Introduction

Software-as-a-Service (SaaS) platforms commonly serve multiple organizations from a single application instance. These organizations, referred to as *tenants*, require strong guarantees around **data isolation, access control, and scalability**. Poorly designed multi-tenant systems risk data leakage, security vulnerabilities, and operational complexity.

This project researches and implements a **multi-tenant SaaS architecture** that enables organizations to independently manage users, projects, and tasks while sharing the same infrastructure. The research focuses on evaluating common multi-tenancy strategies, selecting an appropriate architecture, and applying security best practices to produce a production-ready system.

---

## 2. Multi-Tenancy Architecture Analysis

Multi-tenancy can be implemented using several architectural patterns. This section evaluates the most commonly used approaches and their trade-offs.

---

### 2.1 Shared Database, Shared Schema

**Description**
All tenants share a single database and schema. Tenant data is differentiated using a `tenant_id` column in all tenant-scoped tables.

**Advantages**

* Cost-efficient infrastructure
* Simplified database management
* Easy tenant onboarding
* Suitable for rapid development

**Disadvantages**

* Requires strict application-level enforcement
* Higher risk if tenant filtering is incorrectly implemented
* Schema changes impact all tenants

**Use Cases**

* Early-stage SaaS platforms
* Applications with many small to medium tenants
* Systems with strong backend governance

---

### 2.2 Shared Database, Separate Schema (Per Tenant)

**Description**
All tenants share the same database instance, but each tenant has its own schema.

**Advantages**

* Improved logical data separation
* Reduced risk of accidental cross-tenant access
* Easier tenant-specific customization

**Disadvantages**

* Increased schema management complexity
* More difficult cross-tenant reporting
* Complex migration workflows

**Use Cases**

* Medium-scale SaaS platforms
* Applications requiring limited tenant customization

---

### 2.3 Separate Database Per Tenant

**Description**
Each tenant operates on its own dedicated database instance.

**Advantages**

* Strongest data isolation
* Independent scaling per tenant
* Easier regulatory compliance

**Disadvantages**

* High operational and infrastructure cost
* Complex tenant provisioning
* Difficult to manage at scale

**Use Cases**

* Enterprise SaaS platforms
* Highly regulated domains such as finance or healthcare

---

### 2.4 Selected Architecture

This project adopts the **Shared Database, Shared Schema** approach with **strict tenant isolation enforced at the application layer**.

**Justification**

* Balances simplicity and scalability
* Cost-effective for multi-tenant growth
* Suitable for evaluation and real-world SaaS usage
* Tenant context enforced using JWT-based authentication

---

## 3. Technology Stack Justification

---

### 3.1 Backend – Node.js and Express.js

**Rationale**

* Non-blocking I/O model suitable for API-driven systems
* Mature ecosystem and widespread adoption
* Middleware-based architecture simplifies authentication and authorization
* Fine-grained control over request lifecycle

**Alternatives Considered**

* Spring Boot (Java)
* FastAPI (Python)
* NestJS (Node.js)

Express.js was chosen for its flexibility, simplicity, and minimal abstraction.

---

### 3.2 Database – PostgreSQL

**Rationale**

* Strong relational guarantees
* ACID-compliant transactions
* Advanced indexing and query capabilities
* Native support for UUIDs and ENUM types

**Alternatives Considered**

* MySQL
* MongoDB

PostgreSQL was selected to ensure consistency, integrity, and transactional reliability.

---

### 3.3 Authentication – JSON Web Tokens (JWT)

**Rationale**

* Stateless authentication mechanism
* Supports horizontal scaling without session storage
* Simple integration with frontend clients
* Suitable for microservice-oriented architectures

**Token Payload Design**

* userId
* tenantId
* role

Sensitive information is intentionally excluded from the token payload.

---

### 3.4 Containerization – Docker

**Rationale**

* Environment consistency across development and deployment
* Simplified service orchestration using Docker Compose
* One-command system startup
* Production-like evaluation environment

---

## 4. Security Considerations

Security is a fundamental requirement for any multi-tenant platform. This system incorporates several protective mechanisms.

---

### 4.1 Data Isolation

* All tenant-bound tables include a `tenant_id` column
* Tenant context is derived exclusively from JWT
* Client-provided tenant identifiers are ignored
* Super Admin access is explicitly handled as an exception

This strategy prevents accidental and malicious cross-tenant data access.

---

### 4.2 Authentication and Authorization

* JWT tokens are signed and validated on every request
* Token expiration is enforced
* Role-based access control is applied at API level
* Unauthorized access results in appropriate HTTP status codes

---

### 4.3 Password Security

* Passwords are hashed using bcrypt
* Plain-text passwords are never stored
* Secure hash comparison is used during authentication
* Minimum password requirements are enforced

---

### 4.4 API-Level Protections

* Input validation for all request payloads
* Authorization checks before sensitive operations
* Subscription limit enforcement
* Audit logging for critical actions

---

### 4.5 Audit Logging

All critical operations are recorded, including:

* User lifecycle events
* Project and task lifecycle events
* Tenant updates

Audit logs provide traceability, debugging support, and security auditing capabilities.

---

## 5. Subscription and Resource Control

To model real-world SaaS constraints:

* Each tenant is associated with a subscription plan
* Plans define maximum users and projects
* Limits are enforced before resource creation
* Violations return explicit HTTP 403 responses

This prevents abuse and ensures fair resource usage.

---

## 6. Scalability Considerations

The system is designed for scalability through:

* Stateless backend architecture
* Horizontal scaling via containers
* Indexed tenant-specific fields
* Pagination for large datasets

Future improvements may include caching layers, database read replicas, and background processing.

---

## 7. Conclusion

This research establishes a **secure, scalable, and maintainable foundation** for a multi-tenant SaaS platform. The selected architecture and technology stack balance simplicity, cost-efficiency, and security while aligning with industry best practices. The system is well-positioned for future expansion without requiring architectural redesign.

---

