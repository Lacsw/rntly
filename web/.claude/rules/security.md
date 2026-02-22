---
paths: []
---

# Security

Always-active security rules for all files.

## Pre-Commit Checklist

Before every commit, verify:

- [ ] No hardcoded secrets (API keys, tokens, passwords, connection strings).
- [ ] User inputs are validated before use.
- [ ] Outputs rendered in HTML are sanitized (no raw `dangerouslySetInnerHTML`).
- [ ] No `eval()` or `new Function()` usage.

## Secret Management

- **Never** hardcode secrets in source files — use environment variables.
- Use `VITE_` prefix for client-side env vars (Vite convention).
- Add secret files (`.env.local`, credentials) to `.gitignore`.
- If a secret is accidentally committed, rotate it immediately.

## Error Messages

- User-facing errors must not expose internal details (stack traces, DB queries, file paths).
- Log detailed errors server-side; show generic messages client-side.
- Never include sensitive data (tokens, passwords) in error messages or logs.

## General

- Prefer `textContent` over `innerHTML` when setting text in the DOM.
- Sanitize URL parameters before using them in API calls or rendering.
- Use HTTPS for all external requests.
