# Paylorry MVP — Product & Engineering Guide

## Product Overview
Paylorry is a lightweight payment confirmation platform that enables sellers to receive bank transfers and get automatic, real-time confirmation without relying on payment screenshots.

Sellers create payment requests, buyers send bank transfers, and the system verifies payments automatically by matching transaction data from linked bank accounts. Once verified, sellers receive instant notifications.

This MVP is focused on validating the core system that powers automatic transfer confirmation.

Paylorry is not a payment gateway.  
It is a payment confirmation infrastructure layer.

---

## Core Product Flow

1. Seller registers and logs in
2. Seller links bank account via Mono
3. Seller creates a payment request
4. System generates a unique transfer amount
5. Buyer opens payment page
6. Buyer sends bank transfer
7. System monitors linked bank transactions
8. System matches payment using exact amount and timing rules
9. System marks payment as paid
10. Seller receives Telegram notification
11. Seller views updated status in dashboard

---

## Value Proposition

Paylorry solves three major seller problems:

- Eliminates fake payment screenshots
- Removes manual bank app checking
- Provides faster payment confirmation

If confirmation speed is near real-time, sellers can fulfill orders faster and operate more confidently.

---

## Target Users

Primary users include:

- Online vendors accepting bank transfers
- Social commerce sellers (Instagram, WhatsApp, Telegram)
- Small businesses without card payment infrastructure
- Service providers collecting transfer payments

---

## MVP Objectives

The MVP is designed to validate:

- Automatic bank transfer detection
- Reliable transaction matching
- Fast seller notification
- Usability of payment request flow

The focus is on proving the technical and operational feasibility of automated confirmation.

---

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + tailwind
- **Backend**: Next.js API Routes
- **Database & Auth**: Supabase (PostgreSQL)
- **Bank Integration**: Mono (account linking & transaction data)
- **Notifications**: Telegram Bot API
- **Hosting**: Vercel

---

## MVP Scope

### Included

- Seller authentication
- Bank account linking
- Payment request creation
- Unique amount generation
- Public payment page by reference
- Transaction monitoring
- Payment matching engine
- Payment status updates
- Expiry logic for unpaid requests
- Seller dashboard
- Telegram notifications

### Excluded (Future Phases)

- Escrow services
- Dispute management
- Refund processing
- Multi-currency handling
- Card payment processing
- Advanced fraud detection
- Accounting & bookkeeping tools
- Enterprise analytics
- Bulk payout tools
- Mobile native apps

---

## Product Rules

### Payment Requests
Each payment request must include:

- base_amount
- unique_amount
- reference
- note
- status
- expires_at
- created_at

### Status Values
Allowed statuses:

- pending
- paid
- expired

### Unique Amount Rule
The system must generate a unique amount by adding a small random value (10–99) to the base amount.

Example:
- Base amount: 10,000
- Unique amount: 10,042

### Reference Rule
Each request must have a short uppercase reference string.

Example:
- PLR8X2K
- PLR4M9P

### Expiry Rule
Payment requests expire after 15 minutes unless confirmed earlier.

### Transaction Matching Rules
A bank transaction matches a payment request only if:

- request status is pending
- request has not expired
- transaction amount equals unique_amount exactly
- transaction time is after request creation
- transaction has not already been processed
- duplicate processing is prevented using Mono transaction ID

### Confirmation Flow
When a match occurs:

1. Mark payment as paid
2. Store transaction record
3. Notify seller via Telegram
4. Update seller dashboard

---


### Design Principles

- Keep architecture simple
- Avoid unnecessary services
- Use modular logic
- Separate UI from business logic
- Prefer readability over cleverness

---

## Database Tables

### profiles
- id
- email
- telegram_chat_id
- created_at

### bank_connections
- id
- user_id
- mono_account_id
- account_name
- account_number
- bank_name
- is_active
- created_at

### payment_requests
- id
- user_id
- reference
- base_amount
- unique_amount
- note
- status
- expires_at
- paid_at
- created_at

### transactions
- id
- user_id
- payment_request_id
- mono_transaction_id
- amount
- description
- sender_name
- transaction_time
- created_at

---

## Engineering Guidelines

### General
- Use TypeScript
- Write clear, maintainable code
- Avoid over-engineering
- Keep functions small and focused
- Build iteratively

### API Routes
- Validate inputs
- Delegate logic to `lib/`
- Return structured JSON
- Avoid embedding business logic directly

### UI
- Prioritize usability
- Keep interfaces simple
- Avoid heavy design systems
- Build functional dashboards

### Security
- Use environment variables for secrets
- Never hardcode credentials
- Validate all inputs
- Prevent duplicate transaction processing

---

## Development Roadmap

Build features in this order:

1. App structure
2. Database schema
3. Authentication
4. Seller dashboard
5. Payment creation
6. Public payment page
7. Telegram bot integration
8. Bank linking via Mono
9. Transaction monitoring
10. Matching engine
11. Expiry logic
12. Notification system

---

## Definition of MVP Completion

The MVP is complete when the following flow works reliably:

1. Seller logs in
2. Seller links bank account
3. Seller creates payment request
4. Buyer sends bank transfer
5. System detects transaction
6. System matches payment
7. Payment status updates automatically
8. Seller receives instant notification
9. Seller sees confirmation on dashboard

---

## Codex Working Rules

When modifying the project:

- Follow existing structure
- Preserve MVP scope
- Avoid large redesigns
- Add dependencies only when necessary
- Keep implementations simple
- Prefer incremental improvements
- Do not introduce enterprise-scale complexity
- Document major logic clearly

---

## Strategic Note

This MVP validates the core infrastructure for automated bank transfer confirmation.

Future versions may expand into broader payment operations, merchant tooling, and financial workflows once the core confirmation engine proves reliable.


