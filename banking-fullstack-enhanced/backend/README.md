# Banking Backend (merged)

This backend merges two source projects into a single Spring Boot service:

- **User module** — taken from `demo-security` (JPA entities, register/login, accounts, transactions).
  This is the base of the merged project (package `com.example.demo`), because it was already using
  JPA (easy to point at Postgres) instead of MongoDB.
- **Admin module** — taken from `BankingSystem` (`AdminController`, `AdminService`,
  `AdminBootstrapConfig`) and re-implemented against the JPA `User` entity/repository
  (`iuserrepo`, `Integer` id) instead of the original Mongo `BankUser`/`String` id.

## What changed vs. the two source zips

- Database: MySQL → **PostgreSQL** (`org.postgresql:postgresql` driver, `PostgreSQLDialect`).
- Packaging: `war` → `jar` (removed `ServletInitializer`, Tomcat-provided dep, Asciidoctor/restdocs
  plugin — this was only needed for WAR deployment, not for running the app).
- Added `/admin/**` endpoints and a default-admin bootstrap on startup, backed by the same `users`
  table used by everything else.
- Added CORS configuration so the React dev server on port 5173 can call this API with credentials.
- `UserResponse` DTO gained `role`, `active`, `createdAt` fields (needed by the admin endpoints).

## 1. Database setup

Install/run PostgreSQL locally, then create the database once:

```sql
CREATE DATABASE bankdb;
```

`src/main/resources/application.properties` is set to:

```
spring.datasource.url=jdbc:postgresql://localhost:5432/bankdb
spring.datasource.username=postgres
spring.datasource.password=7027233255Prem@
```

Change the username/password there (or override via `spring.datasource.username` /
`spring.datasource.password` env vars) if your local Postgres user differs from `postgres`.
`spring.jpa.hibernate.ddl-auto=update` will create the tables automatically on first run.

## 2. Run the backend

```bash
cd banking-backend
./mvnw spring-boot:run
```

It starts on **http://localhost:8080**.

On first startup it seeds a default admin (only if no user with that email exists yet):

- email: `admin@bankingsystem.com`
- password: `ChangeMe123!`

Override with env vars `ADMIN_EMAIL` / `ADMIN_PASSWORD` — **change this password after first login.**

## 3. Connect the React frontend (port 5173)

CORS is already configured to allow `http://localhost:5173` with credentials
(`app.cors.allowed-origins` in `application.properties`, or env var `CORS_ALLOWED_ORIGINS`
for a comma-separated list if you deploy elsewhere).

In your React app, point requests at `http://localhost:8080` and send the JWT from `/auth/login`
as a `Authorization: Bearer <token>` header on subsequent requests, e.g.:

```js
// api.js
import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

If your Vite dev server runs on a different port, update `app.cors.allowed-origins` accordingly.

## 4. API overview

### Auth (public)
| Method | Path | Notes |
|---|---|---|
| POST | `/users` | Register a new user (role defaults to `USER`) |
| POST | `/auth/login` | Returns `{ token, email, role, message }` |

### Users
| Method | Path | Access |
|---|---|---|
| GET | `/users` | ADMIN only |
| GET | `/users/{id}` | any authenticated user |
| GET | `/users/email/{email}` | any authenticated user |
| PUT | `/users/{id}` | any authenticated user |
| DELETE | `/users/{id}` | any authenticated user |

### Accounts
| Method | Path | Access |
|---|---|---|
| POST | `/accounts` | ADMIN only |
| GET | `/accounts` | ADMIN only |
| GET | `/accounts/{id}`, `/accounts/number/{n}`, `/accounts/user/{userId}` | any authenticated user |
| PUT | `/accounts/{id}` | ADMIN only |
| DELETE | `/accounts/{id}` | ADMIN only (closes account) |

### Transactions (any authenticated user)
`POST /transactions/deposit`, `/withdraw`, `/transfer`, `GET /transactions`, `/transactions/{id}`,
`/transactions/account/{accountNumber}`, `/transactions/type/{type}`

### Admin (ADMIN only)
| Method | Path |
|---|---|
| GET | `/admin/users` |
| PATCH | `/admin/users/{id}/promote` |
| PATCH | `/admin/users/{id}/deactivate` |
| PATCH | `/admin/users/{id}/activate` |

## Notes / things worth knowing

- Role is stored as a plain `String` (`"USER"` / `"ADMIN"`) on the `User` entity, same as the
  original `demo-security` project — the Mongo project's `Role` enum wasn't reused, to avoid a
  second source of truth.
- No connector between "which user owns which account" is enforced beyond what the original two
  projects had (e.g. a regular user calling `/accounts/{id}` for someone else's account isn't
  blocked) — that wasn't present in either source project, so it wasn't added here. Worth
  hardening before production use.
