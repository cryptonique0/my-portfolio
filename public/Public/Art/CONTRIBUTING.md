# BitArt Market - Contributing Guide

Thank you for considering contributing to BitArt Market! This document outlines the process for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

We expect all contributors to adhere to our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/bitart-market.git`
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Backend Development

```bash
cd backend
npm run dev
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow the existing ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use TypeScript interfaces for props
- Implement proper error boundaries

### Code Formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `ci`: CI/CD changes

### Examples

```bash
feat(marketplace): Add NFT filtering by price range
fix(wallet): Resolve connection timeout issue
docs(api): Update API endpoint documentation
```

## Pull Request Process

1. **Update Documentation**: Ensure any new features are documented
2. **Add Tests**: Include tests for new functionality
3. **Run Linter**: `npm run lint` should pass
4. **Run Tests**: All tests should pass
5. **Update CHANGELOG**: Add entry for your changes
6. **Create PR**: Write a clear description of your changes

### PR Title Format

```
<type>(<scope>): <description>
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] Added new tests
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added where needed
- [ ] Documentation updated
- [ ] No new warnings
```

## Testing

### Unit Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

Aim for >80% code coverage on new features.

## Architecture Guidelines

### Backend

- Use service layer for business logic
- Keep controllers thin
- Use middleware for cross-cutting concerns
- Implement proper error handling

### Frontend

- Use custom hooks for reusable logic
- Implement proper state management
- Follow component composition patterns
- Use React Query for server state

## Questions?

Feel free to:
- Open an issue for bugs
- Start a discussion for feature ideas
- Ask questions in PR comments

Thank you for contributing! 🎉
