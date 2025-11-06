---
applyTo: "src/cli/init.ts,src/lib/shellEscape.ts"
---

# Shell Escaping for npm/pnpm/yarn Scripts

## Critical Rule

**Always use shell escaping when generating commands that will be stored in package.json scripts.**

## Why Shell Escaping is Necessary

When npm, pnpm, or yarn execute scripts from package.json, they pass the command string to a shell (sh/bash on Unix, cmd.exe on Windows). The shell interprets the command string, including splitting on whitespace.

## The Problem Without Escaping

If a path contains spaces and is not quoted:

```json
{
  "scripts": {
    "themizer:theme": "themizer theme --out-dir ./my folder/styles"
  }
}
```

The shell will split this into:
- Argument 1: `themizer`
- Argument 2: `theme`
- Argument 3: `--out-dir`
- Argument 4: `./my`
- Argument 5: `folder/styles`

This causes the command to fail because `./my` is not a valid path.

## The Solution: Single Quotes

Using `escapeSingleQuotes()` from `src/lib/shellEscape.ts`:

```json
{
  "scripts": {
    "themizer:theme": "themizer theme --out-dir './my folder/styles'"
  }
}
```

The shell interprets single quotes as a single argument:
- Argument 1: `themizer`
- Argument 2: `theme`
- Argument 3: `--out-dir`
- Argument 4: `./my folder/styles`

## Common Misconception

**INCORRECT**: "Quotes are stored literally in JSON and will cause issues"

**CORRECT**: The quotes ARE stored literally in JSON, and that's exactly what we want. When npm executes the script, it passes the entire string (including quotes) to the shell, which then correctly interprets the quotes to group the path as a single argument.

## Implementation

Always use `escapeSingleQuotes()` when:
- Generating npm/pnpm/yarn scripts
- Building shell commands that include user-provided paths
- Paths might contain spaces or special characters

```typescript
import { escapeSingleQuotes } from '../lib/shellEscape'

const outDir = './my folder'
const command = `themizer theme --out-dir ${escapeSingleQuotes(outDir)}`
// Result: themizer theme --out-dir './my folder'
```

## Related Files

- Implementation: `src/lib/shellEscape.ts`
- Usage: `src/cli/init.ts` (line 306)
- Documentation: See commit 6ddfb31 for rationale

## Do Not Remove

If you encounter a suggestion to remove shell escaping, reject it. Paths with spaces are valid and require proper escaping to function correctly in package.json scripts.
