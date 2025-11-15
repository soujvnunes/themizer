---
applyTo: "src/cli/detectFramework.ts,src/cli/init.ts,src/cli/*.test.ts"
---

# Framework Detection Guidelines

## Critical Rule

**Framework detection must be reliable and suggest appropriate output directories based on the detected framework's conventions.**

## Detection Priority

Frameworks are detected in this specific order (first match wins):

1. **Next.js** - Check dependencies and version
2. **Remix** - Check for Remix in dependencies
3. **Vite** - Check for Vite in dependencies
4. **Create React App** - Check for react-scripts
5. **Unknown** - Default when no framework detected

## Framework Detection Patterns

### Next.js Detection

```typescript
function detectNextJs(packageJson: PackageJson): FrameworkInfo | null {
  const hasNext = packageJson.dependencies?.next || packageJson.devDependencies?.next

  if (!hasNext) return null

  // Parse version to determine App Router vs Pages Router
  const version = parseVersion(hasNext)
  const majorVersion = getMajorVersion(version)

  if (majorVersion >= 13) {
    // Check for app directory (App Router)
    if (fs.existsSync(path.join(process.cwd(), 'app'))) {
      return {
        name: 'Next.js (App Router)',
        suggestedPath: 'app/styles'
      }
    }
  }

  // Default to Pages Router
  return {
    name: 'Next.js (Pages Router)',
    suggestedPath: 'styles'
  }
}
```

### Key Requirements

1. **Check both dependencies and devDependencies**
2. **Parse version strings robustly** (handle ^, ~, exact versions)
3. **Verify directory structure** when relevant
4. **Return human-readable names** for user display

### Remix Detection

```typescript
function detectRemix(packageJson: PackageJson): FrameworkInfo | null {
  const hasRemix = packageJson.dependencies?.['@remix-run/react']
                || packageJson.devDependencies?.['@remix-run/react']

  if (hasRemix) {
    return {
      name: 'Remix',
      suggestedPath: 'app/styles'
    }
  }
  return null
}
```

### Vite Detection

```typescript
function detectVite(packageJson: PackageJson): FrameworkInfo | null {
  const hasVite = packageJson.dependencies?.vite
               || packageJson.devDependencies?.vite

  if (hasVite) {
    return {
      name: 'Vite',
      suggestedPath: 'src/styles'
    }
  }
  return null
}
```

### Create React App Detection

```typescript
function detectCRA(packageJson: PackageJson): FrameworkInfo | null {
  const hasReactScripts = packageJson.dependencies?.['react-scripts']
                       || packageJson.devDependencies?.['react-scripts']

  if (hasReactScripts) {
    return {
      name: 'Create React App',
      suggestedPath: 'public/styles'
    }
  }
  return null
}
```

## Version Parsing

### Handling Version Strings

Version strings in package.json can have various formats:

```typescript
function parseVersion(versionString: string): string {
  // Remove prefixes: ^, ~, >=, etc.
  const cleaned = versionString.replace(/^[\^~>=<]/, '')

  // Handle workspace protocol
  if (versionString.startsWith('workspace:')) {
    return '0.0.0' // Or handle specially
  }

  // Handle npm tags
  if (!cleaned.match(/^\d/)) {
    return '0.0.0' // 'latest', 'next', etc.
  }

  return cleaned
}
```

### Extracting Major Version

```typescript
function getMajorVersion(version: string): number {
  const parts = version.split('.')
  return parseInt(parts[0], 10) || 0
}
```

## Suggested Path Conventions

### Path Suggestions by Framework

| Framework | Suggested Path | Rationale |
|-----------|---------------|-----------|
| Next.js (App Router) | `app/styles` | App Router convention |
| Next.js (Pages Router) | `styles` | Pages Router convention |
| Remix | `app/styles` | Remix app directory |
| Vite | `src/styles` | Vite src convention |
| Create React App | `public/styles` | CRA public directory |
| Unknown | `styles` | Generic default |

### Path Validation

Always validate suggested paths:

```typescript
function validateOutputPath(suggestedPath: string): string {
  const resolved = path.resolve(process.cwd(), suggestedPath)

  // Ensure path is within project
  if (!resolved.startsWith(process.cwd())) {
    throw new Error('Output path must be within project directory')
  }

  // Create directory if it doesn't exist
  if (!fs.existsSync(resolved)) {
    fs.mkdirSync(resolved, { recursive: true })
  }

  return resolved
}
```

## User Interaction Flow

### Interactive Mode (Default)

```typescript
async function promptForOutputDir(detectedFramework: FrameworkInfo | null) {
  if (detectedFramework) {
    console.log(`Detected framework: ${detectedFramework.name}`)

    const useDefault = await confirm({
      message: `Use suggested path: ${detectedFramework.suggestedPath}?`,
      default: true
    })

    if (useDefault) {
      return detectedFramework.suggestedPath
    }
  }

  // Fall back to manual input
  return await input({
    message: 'Enter output directory:',
    default: detectedFramework?.suggestedPath || 'styles'
  })
}
```

### Non-Interactive Mode

```typescript
function getNonInteractiveOutputDir(
  cliOutDir: string | undefined,
  detectedFramework: FrameworkInfo | null
): string {
  // CLI flag takes precedence
  if (cliOutDir) {
    return cliOutDir
  }

  // Use framework suggestion
  if (detectedFramework) {
    return detectedFramework.suggestedPath
  }

  // Fall back to default
  return 'styles'
}
```

## Testing Requirements

### Mock package.json Scenarios

```typescript
describe('detectFramework', () => {
  it('should detect Next.js 14 App Router', () => {
    const packageJson = {
      dependencies: { next: '^14.0.0' }
    }
    mockFs({ app: {} }) // Mock app directory

    const result = detectFramework(packageJson)
    expect(result?.name).toBe('Next.js (App Router)')
    expect(result?.suggestedPath).toBe('app/styles')
  })

  it('should detect Next.js 12 Pages Router', () => {
    const packageJson = {
      dependencies: { next: '12.3.4' }
    }

    const result = detectFramework(packageJson)
    expect(result?.name).toBe('Next.js (Pages Router)')
    expect(result?.suggestedPath).toBe('styles')
  })

  it('should handle version ranges', () => {
    const versions = ['^13.0.0', '~13.5.0', '>=13.0.0', '13.x']

    versions.forEach(version => {
      const packageJson = { dependencies: { next: version } }
      const result = detectFramework(packageJson)
      expect(result).not.toBeNull()
    })
  })
})
```

### Edge Cases to Test

1. **Missing package.json** - Should handle gracefully
2. **Malformed versions** - Should not crash
3. **Multiple frameworks** - First match wins
4. **Workspace protocols** - Handle workspace:* versions
5. **npm tags** - Handle 'latest', 'next', 'canary'

## Error Handling

### Graceful Fallbacks

```typescript
function detectFramework(packageJson?: PackageJson): FrameworkInfo | null {
  try {
    if (!packageJson) {
      // Try to read package.json
      const pkgPath = path.join(process.cwd(), 'package.json')
      if (fs.existsSync(pkgPath)) {
        packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      } else {
        return null // No package.json, can't detect
      }
    }

    // Try each detection in order
    return detectNextJs(packageJson)
        || detectRemix(packageJson)
        || detectVite(packageJson)
        || detectCRA(packageJson)
        || null

  } catch (error) {
    // Log but don't crash
    console.warn('Framework detection failed:', error)
    return null
  }
}
```

## Integration with CLI

### init Command Integration

The framework detection is used in the init command to:

1. **Suggest output directory** based on framework conventions
2. **Display detected framework** to user for confirmation
3. **Create appropriate directory structure** if needed
4. **Update package.json scripts** with correct paths

### Shell Escaping

Remember to escape paths when adding to package.json:

```typescript
import { escapeSingleQuotes } from '../lib/shellEscape'

const script = `themizer theme --out-dir ${escapeSingleQuotes(outputDir)}`
```

## Performance Considerations

- Detection runs once during init
- Cache package.json reads if accessed multiple times
- Avoid unnecessary file system checks
- Return early when framework detected

## Common Pitfalls

### DON'T:
- Assume package.json exists
- Crash on malformed version strings
- Check file system before checking dependencies
- Ignore devDependencies

### DO:
- Check both dependencies and devDependencies
- Handle all version string formats
- Provide clear framework names
- Validate suggested paths

## Related Files

- Implementation: `src/cli/detectFramework.ts`
- Usage: `src/cli/init.ts`
- Shell escaping: `src/lib/shellEscape.ts`
- Tests: `src/cli/*.test.ts`