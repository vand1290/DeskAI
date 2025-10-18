# Contributing to DeskAI

Thank you for your interest in contributing to DeskAI! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/DeskAI.git`
3. Install dependencies: `npm install`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Workflow

### Building the Project

```bash
# Development build
npm run build:dev

# Production build
npm run build
```

### Running the Application

```bash
npm start
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## Project Structure

```
DeskAI/
├── src/
│   ├── main/              # Electron main process (backend)
│   │   ├── main.ts        # Application entry point
│   │   ├── toolRegistry.ts       # Tool registration system
│   │   ├── taskChainManager.ts  # Task execution engine
│   │   ├── workflowStorage.ts   # Workflow persistence
│   │   ├── tools.ts              # Built-in tool implementations
│   │   └── preload.ts            # Preload script for IPC
│   ├── renderer/          # Electron renderer process (UI)
│   │   ├── App.tsx        # Main React component
│   │   ├── components/    # React UI components
│   │   └── index.tsx      # Renderer entry point
│   └── shared/            # Shared types and utilities
│       └── types.ts       # TypeScript interfaces
├── tests/                 # Unit tests
└── workflows/             # Saved workflows (runtime)
```

## Adding a New Tool

1. Define your tool in `src/main/tools.ts`:

```typescript
export const myNewTool: Tool = {
  type: 'myNewTool',
  name: 'My New Tool',
  description: 'Description of what the tool does',
  parameters: {
    param1: {
      type: 'string',
      required: true,
      description: 'Parameter description',
    },
  },
  execute: async (input: any, parameters: Record<string, any>) => {
    // Implementation
    return { result: 'output' };
  },
};
```

2. Register the tool in `src/main/main.ts`:

```typescript
function registerTools() {
  // ... existing tools
  toolRegistry.registerTool(myNewTool);
}
```

3. Add unit tests in `tests/`:

```typescript
describe('myNewTool', () => {
  it('should process input correctly', async () => {
    const result = await myNewTool.execute(input, params);
    expect(result).toBeDefined();
  });
});
```

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Testing Guidelines

- Write unit tests for all new features
- Maintain test coverage above 80%
- Test both success and error cases
- Use descriptive test names
- Mock external dependencies

## Commit Guidelines

- Use clear, descriptive commit messages
- Start with a verb: "Add", "Fix", "Update", "Remove"
- Keep commits focused on a single change
- Reference issues when applicable

Example:
```
Add support for multi-language OCR

- Add language parameter to OCR tool
- Update UI to show language selector
- Add tests for new functionality

Fixes #123
```

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Update documentation if needed
3. Add entry to CHANGELOG.md
4. Submit PR with clear description
5. Address review feedback

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
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] No security vulnerabilities

## Screenshots (if applicable)
Add screenshots for UI changes
```

## Security

- Never commit secrets or credentials
- Validate all user inputs
- Keep dependencies up to date
- Report security issues privately
- All processing must be offline-capable

## Questions?

- Open an issue for bugs
- Start a discussion for feature ideas
- Check existing issues before creating new ones

## License

By contributing, you agree that your contributions will be licensed under the ISC License.

Thank you for contributing to DeskAI! 🎉
