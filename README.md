# Banking System — Full Stack

A Spring Boot + PostgreSQL + React/Vite banking demo with one secure sign-in page and separate customer/admin dashboards.

## What is included

### Customer portal
- Create account from the login screen
- Automatic zero-balance SAVINGS account for every newly registered customer
- View profile, account number, account type and live balance
- Deposit money
- Withdraw money with insufficient-balance checks
- Transfer money to another account
- Transfer history appears for **both sender and receiver**
- Search/filter/export transaction history
- Transfer reference, counterparty and balance-after values in the ledger

### Administrator portal
- Same sign-in page as customers; role decides the dashboard
- Dashboard with users, accounts, balances and recent bank activity
- Customer activation/deactivation and role management
- Search accounts and customers
- Open additional accounts for customers
- Close zero-balance accounts
- View/filter/export the bank-wide transaction ledger
- Analytics and reports

## Important API behavior

The backend now enforces account ownership for normal customers. A customer cannot deposit, withdraw, view history for, or transfer **from** another customer's account. Administrators can operate across accounts.

Transfers are atomic (`@Transactional`) and account rows are locked while balances are updated. Every successful transfer creates two linked ledger entries:

- `TRANSFER_OUT` on the sender account
- `TRANSFER_IN` on the recipient account

Both entries share the same `referenceId`.

## Requirements

- Java 21
- PostgreSQL 18 (or compatible PostgreSQL version)
- Node.js 20+
- npm

## Database

Create the database once:

```sql
CREATE DATABASE bankdb;
```

Default backend settings are in:

```text
backend/src/main/resources/application.properties
```

The project supports environment overrides:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
SERVER_PORT
JWT_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
CORS_ALLOWED_ORIGINS
```

Default local database settings:

```text
Database: bankdb
Username: postgres
Password: Sachin1301#
Port: 5432
```

If your PostgreSQL password is different, either edit `application.properties` or set `DB_PASSWORD` in IntelliJ's Run Configuration.

## Admin login

```text
Email:    sk.39648215@gmail.com
Password: Sachin1301#
```

`AdminBootstrapConfig` keeps this development admin active and synchronizes its BCrypt password with the configured admin password on startup.

## Run the backend in IntelliJ

1. Open the `backend` folder as a Maven project.
2. Make sure PostgreSQL is running and `bankdb` exists.
3. Wait for Maven dependencies to load.
4. Run:

```text
com.example.demo.DemoApplication
```

Backend URL:

```text
http://localhost:8080
```

If port 8080 is already occupied, stop the old Java process or set `SERVER_PORT` to another port. If you change the backend port, also set `VITE_API_BASE_URL` in the frontend.

## Run the frontend in VS Code

Open the `frontend` folder and run:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

Optional frontend environment file:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## First customer test

1. Open `http://localhost:5173`.
2. Click **Create an account**.
3. Register a customer.
4. Sign in with that customer.
5. The customer already has a new SAVINGS account with balance ₹0.
6. Deposit money.
7. Create/sign in with another customer and copy the second account number.
8. From the first customer, transfer money to the second account.
9. Check Transaction History on both customers: sender shows `Transfer sent`; receiver shows `Transfer received`, sharing the same reference.

## Security note

The credentials in this project are development defaults. Change PostgreSQL, admin and JWT secrets before deploying or pushing the project to a public repository.

## Email OTP for money movement

Deposit, withdrawal and transfer are protected with a 6-digit email OTP. No balance is changed until the customer verifies the OTP. See `OTP_EMAIL_SETUP.md` for Gmail App Password and IntelliJ configuration
