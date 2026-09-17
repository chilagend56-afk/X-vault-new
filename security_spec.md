# Security Spec

## Data Invariants
- A Profile must match its uid.
- Accounts belong to a user_id matching auth.uid.
- Transactions, Cards, CryptoWallets, and Notifications all map to user_id.
- Admin role can modify KYC.

## Dirty Dozen Payloads
- Updating `user_id` to another user.
- Updating `balance` without correct transaction atomicity (Wait, the app is a bank simulator, balance updates rely on transactions).
- Updating `is_frozen` on someone else's card.
- Mocking a `kyc_status` during profile creation.

## The Test Runner
To be generated in firestore.rules.test.ts
