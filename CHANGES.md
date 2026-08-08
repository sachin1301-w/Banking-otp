# Changes in this enhanced build

## Frontend
- Rebuilt common sign-in page with a modern split-screen banking design.
- Kept a single login for both ADMIN and USER roles.
- Added a prominent Create Account path and redesigned registration.
- Added responsive desktop/mobile sidebar navigation.
- Redesigned customer dashboard with balance card, quick actions and recent activity.
- Redesigned deposit, withdraw and transfer screens with account selection and live balance context.
- Redesigned transaction history with account filtering, references, counterparty, debit/credit styling and balance-after.
- Redesigned admin overview, customer management, account management and transaction ledger.
- Added admin form to open additional customer accounts and action to close zero-balance accounts.
- Switched displayed money formatting to INR.

## Backend/API
- Added `/users/me` and `/accounts/me` for safer customer-specific data access.
- Added account ownership checks for money operations and account transaction history.
- Added row locking for balance-changing operations.
- Made deposit, withdrawal and transfer operations transactional.
- Transfer now writes linked `TRANSFER_OUT` + `TRANSFER_IN` ledger rows so both parties see the transfer.
- Added `referenceId`, `counterpartyAccountNumber` and `balanceAfter` to transactions.
- Transaction queries return newest entries first.
- New customer registration automatically opens a zero-balance SAVINGS account.
- Added extra account/user response data to login/session handling.
- Prevented closing an account while it still has a non-zero balance.
- Deactivated users can no longer continue using an old JWT.
- Added `backend/api-tests.http` for quick IntelliJ API smoke testing.
