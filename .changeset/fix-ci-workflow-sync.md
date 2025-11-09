---
'themizer': patch
---

fix(ci): improve release workflow reliability

- Replace `--provenance` flag with `--no-git-checks` to avoid OIDC configuration issues during npm publish
- Add `git pull --rebase` before pushing version bump to prevent non-fast-forward errors when concurrent commits exist
- These changes ensure the automated release workflow runs successfully without manual intervention
