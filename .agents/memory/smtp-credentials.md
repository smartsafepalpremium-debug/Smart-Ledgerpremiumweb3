---
name: SMTP credential precedence
description: How this project resolves server-level SMTP credentials versus saved admin settings
---

When a server-level SMTP password is configured, it must take precedence over SMTP credentials saved in the database. Database SMTP settings remain the fallback for installations without server-level mail secrets.

**Why:** A rotated Gmail app password was ignored while an older database password remained populated, causing repeated SMTP 535 authentication failures even after the secret was replaced.

**How to apply:** Keep `SMTP_PASS` plus its sender/host settings as the primary runtime configuration, and only consult the admin settings row when the server-level password is absent.