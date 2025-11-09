---
'themizer': patch
---

fix: update npm publish workflow configuration

- Replace --provenance with --no-git-checks to avoid OIDC configuration issues
- Ensure NPM_TOKEN automation token is used to bypass 2FA/OTP requirements
