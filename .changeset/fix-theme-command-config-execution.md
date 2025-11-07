---
'themizer': patch
---

fix: theme command now automatically executes config file

The `themizer theme` command now dynamically imports and executes the `themizer.config.ts` file, so you don't need to import it in your application code to generate CSS. This fixes the issue where the command would fail with "ENOENT: no such file or directory" because the config hadn't been executed yet.
