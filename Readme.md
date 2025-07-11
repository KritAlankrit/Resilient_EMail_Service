# Resilient Email Service

A robust, fault-tolerant email delivery system written in **TypeScript**, designed to simulate production-grade reliability using mock email providers.

## Features

### Core Functionality
- **Retry mechanism** with exponential backoff  
- **Provider fallback** on failure (Provider1 → Provider2)  
- **Idempotency** using unique `messageId` to avoid duplicate sends  
- **Rate limiting** (max 10 emails/min)  
- **Status tracking** (`pending`, `success`, `failed`, `duplicate`)  

### Bonus Additions
- **Circuit breaker pattern** per provider  
- **Simple logging** of events (enqueue, send attempts, failures)  
- **Basic queue system** with periodic background processing  

## Setup Instructions

### 1. Install Dependencies

npm install

### 2. Run Tests

npx jest

## Cloud deployed version of API

https://resilient-email-service-fkts.onrender.com/

### Note
This live deployed version of API endpoint is automatically spun down after 15 minutes of inactivity. This is a standard behavior for Render’s free web services to conserve resources.

## Assumptions

- Email sending is mocked, not connected to real SMTP providers.
- All email messages must have a unique messageId for idempotency.
- The service processes a queue at 500ms intervals and retries up to 3 times per provider.
- If a provider fails 3 times in a row, its circuit breaker trips for 10 seconds.