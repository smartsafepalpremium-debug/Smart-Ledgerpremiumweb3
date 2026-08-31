---
name: User support messaging
description: Product decision for messages sent from the authenticated user dashboard
---

Dashboard support messages are delivered by email to the configured admin address, with the authenticated user's email set as the reply-to address. They are not stored as a separate application inbox.

**Why:** This gives the admin an immediate notification while keeping the user-facing flow small and avoiding another message store.

**How to apply:** Keep the message action authenticated, validate subject and body lengths, use the existing SMTP precedence rules, and never ask users for passwords, recovery phrases, or private keys.