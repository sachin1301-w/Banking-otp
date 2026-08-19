# Email OTP setup for banking transactions

Deposit, withdrawal and transfer now use a two-step flow:

1. The customer submits the transaction details.
2. The backend validates the request and sends a 6-digit OTP to the email on the signed-in customer account.
3. No balance changes at this point.
4. The customer enters the OTP in the frontend popup.
5. `POST /transactions/otp/verify` verifies the single-use challenge and only then executes the stored transaction.

## Gmail configuration

Use a Google **App Password**, not your normal Gmail account password.

1. Turn on 2-Step Verification for the Gmail account that will send OTP emails.
2. Create a Google App Password for the banking application.
3. In IntelliJ open **Run -> Edit Configurations -> DemoApplication**.
4. Add these environment variables:

```text
MAIL_USERNAME=your.sender@gmail.com
MAIL_APP_PASSWORD=your_16_character_app_password
```

Do not place the App Password in Git or commit it to `application.properties`.

The backend is already configured for Gmail SMTP on port 587 with STARTTLS.

## OTP security rules

- OTP length: 6 digits
- Expiry: 5 minutes
- Maximum wrong attempts: 5
- Resend cooldown: 30 seconds
- A resend invalidates the previous OTP challenge
- OTP values are stored as BCrypt hashes, not plaintext
- OTP challenges are bound to the authenticated user's email, source account, operation, amount and recipient (for transfers)
- Successful OTPs are single-use
- The backend rechecks account ownership, account status and available balance before executing

## Endpoints

```text
POST /transactions/deposit      -> sends deposit OTP
POST /transactions/withdraw     -> sends withdrawal OTP
POST /transactions/transfer     -> sends transfer OTP
POST /transactions/otp/verify   -> verifies OTP and executes transaction
```

The first three endpoints do **not** move money anymore.

## Frontend

The Deposit, Withdraw and Transfer pages now open an OTP modal after the email is sent. The modal shows the masked destination email, an expiry countdown and a resend option.

## If OTP email fails

Check these first:

- `MAIL_USERNAME` is the full Gmail address.
- `MAIL_APP_PASSWORD` is a Google App Password, not the normal Gmail password.
- 2-Step Verification is enabled on the sender Google account.
- The Spring Boot console does not show an SMTP authentication/network error.
