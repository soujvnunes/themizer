# Contributing to Themizer

Thank you for your interest in contributing to Themizer! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please be respectful and professional in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/themizer.git
   cd themizer
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/soujvnunes/themizer.git
   ```

## Development Setup

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

1. Install pnpm (if not already installed):
   ```bash
   npm install -g pnpm
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the project:
   ```bash
   pnpm run build
   ```

4. Run tests:
   ```bash
   pnpm test
   ```

## Development Workflow

### Creating a Branch

Create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications

### Making Changes

1. Make your changes in your branch
2. Follow the [Coding Standards](#coding-standards)
3. Add tests for new functionality
4. Ensure all tests pass
5. Update documentation as needed

### Keeping Your Fork Updated

Regularly sync your fork with the upstream repository:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode and follow type safety best practices
- Avoid using `any` type when possible (use `unknown` instead)
- Export types that users might need

### Code Style

- Follow the Prettier configuration (`.prettierrc`)
- Run `pnpm run format` to auto-format code
- Follow ESLint rules (`.eslintrc.json`)
- Maximum line length: 104 characters
- Use single quotes for strings
- No semicolons
- Trailing commas in multi-line structures

### Code Quality

- Keep functions small and focused (single responsibility)
- Maximum complexity: 15 (enforced by ESLint)
- Maximum function parameters: 5
- Maximum file length: 300 lines (excluding tests)
- Add JSDoc comments for public APIs
- Use meaningful variable and function names

### File Organization

```
src/
├── cli/          # CLI commands
├── core/         # Core library functions
├── lib/          # Internal utilities
├── helpers/      # File system and I/O helpers
├── consts/       # Constants
└── test-utils/   # Testing utilities
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test -- validators.test.ts

# Run tests with coverage
pnpm test -- --coverage

# Run tests in watch mode
pnpm test -- --watch
```

### Writing Tests

- Write tests for all new features
- Update existing tests when modifying features
- Test both happy paths and error cases
- Use descriptive test names: `it('should do something when condition')`
- Place test files next to the source files: `foo.ts` → `foo.test.ts`

### Coverage Requirements

- Minimum coverage thresholds:
  - Branches: 80%
  - Functions: 85%
  - Lines: 85%
  - Statements: 85%

## Submitting Changes

### Before Submitting

1. **Run the full test suite**:
   ```bash
   pnpm test
   ```

2. **Run the linter**:
   ```bash
   pnpm run lint
   ```

3. **Build the project**:
   ```bash
   pnpm run build
   ```

4. **Check for TypeScript errors**:
   ```bash
   pnpm run typecheck
   ```

### Creating a Changeset

This project uses [Changesets](https://github.com/changesets/changesets) for versioning:

1. Create a changeset describing your changes:
   ```bash
   pnpm changeset
   ```

2. Follow the prompts to:
   - Select the type of change (major, minor, patch)
   - Write a description of the changes

3. Commit the generated changeset file with your changes

### Pull Request Process

1. **Push your changes** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request** on GitHub:
   - Use a clear, descriptive title
   - Reference any related issues (e.g., "Fixes #123")
   - Provide a detailed description of your changes
   - Include any breaking changes in the description
   - Add screenshots for UI changes (if applicable)

3. **PR Checklist**:
   - [ ] Tests pass locally
   - [ ] Code follows style guidelines
   - [ ] Documentation updated (if needed)
   - [ ] Changeset created (for version bump)
   - [ ] No merge conflicts
   - [ ] PR description is clear and complete

4. **Address review feedback**:
   - Respond to comments
   - Make requested changes
   - Push updates to your branch

5. **After approval**:
   - Maintainers will merge your PR
   - Your changes will be included in the next release

## Release Process

Releases are automated using GitHub Actions and Changesets:

1. Changes are merged to the `main` branch
2. Changesets creates a PR with version bumps
3. When the version PR is merged, the package is automatically published to npm

## Questions or Need Help?

- Open an [issue](https://github.com/soujvnunes/themizer/issues) for bugs or feature requests
- Check existing issues before creating a new one
- Provide as much detail as possible in issue descriptions

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes (for significant contributions)

Thank you for contributing to Themizer! 🎨
