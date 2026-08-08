# Aldergate Trust — Frontend

React + Vite + Tailwind frontend for the `banking-backend` Spring Boot API, built against
`banking-requirements.txt`. Login, role-based routing/guards, both portals, transaction exports
(PDF/CSV/Excel/print), and the admin Analytics/Reports pages are all wired to live endpoints.

## Run it

```bash
npm install
cp .env.example .env   # point at your backend if it's not on localhost:8080
npm run dev
```

Make sure the backend's `app.cors.allowed-origins` includes the Vite dev server origin
(`http://localhost:5173` by default — already the default in `SecurityConfig.java`).

## What's wired to the real API

- **Login** (`POST /auth/login`) — stores the JWT and the role from the response, no manual
  decoding needed since the backend already returns `role`.
- **Route guards** — `<AdminRoute />` and `<UserRoute />` in `src/auth/RouteGuards.jsx` check the
  stored role and redirect to `/login` (no token) or `/403` (wrong role).
- **Admin**: User Management (`/admin/users` + promote/activate/deactivate), Account Management
  (`/accounts`), All Transactions (`/transactions`) with search, sort, pagination, date-range
  filter, and PDF/CSV/Excel/print export. Reports (daily/monthly/yearly transaction reports +
  full-dataset downloads of users/accounts/transactions). Analytics (revenue trend, transaction
  type breakdown, user growth — charted with Recharts from live data). Settings (session-scoped
  preferences form).
- **User**: Dashboard (with account statement export), My Profile, My Account, Deposit, Withdraw,
  Transfer, Transaction History (search, date-range filter, PDF/CSV/Excel export, mini statement
  print) — all backed by `/users/email/{email}`, `/accounts/user/{id}`, and `/transactions/*`.
- **401 handling** — any expired/invalid token clears storage and bounces to `/login`
  automatically (client interceptor in `src/api/client.js`).
- **Export buttons** — icon, hover glow, sweep-gradient animation, spinner while generating, and a
  toast on completion, per the UI spec. See `src/components/ActionButton.jsx`.

## What's still open

- Account creation/edit forms for admins (currently list-only; backend supports `POST/PUT
  /accounts`).
- Code-splitting: `jspdf`/`html2canvas`/`recharts` push the production bundle over Vite's 500kB
  warning threshold. Fine for a scaffold; worth lazy-loading the Reports/Analytics routes with
  `React.lazy` before shipping.
- Reports currently define "daily/monthly/yearly" as calendar-to-date windows (start of day/month/
  year → now). Swap for a real date-range picker if you want arbitrary periods.

## Note on the data model

The spec's transaction table asks for separate "Sender Account" / "Receiver Account" columns, but
`Transaction` on the backend only has a single `account` reference (see `Transaction.java`). The
UI currently shows the one account tied to each transaction record. If you want sender/receiver
breakdown in the exports later, that likely needs a backend change first (e.g. a `counterpartyAccountNumber`
field set on transfers).

## Structure

```
src/
  api/            axios client + typed service calls
  auth/           AuthContext, AdminRoute/UserRoute guards
  components/     PortalShell (sidebar), Ledger table/stat/status atoms
  hooks/          useMyAccount (resolves profile + account for the logged-in user)
  pages/admin/    Admin portal pages
  pages/user/     User portal pages
```
