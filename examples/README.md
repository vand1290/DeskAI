# DeskAI Examples

This directory contains example code demonstrating how to use the DeskAI persistent memory system.

## Available Examples

### 1. Basic Usage (`basic-usage.ts`)

Demonstrates the fundamental features of DeskAI:
- Initializing the system
- Creating and managing conversations
- Sending messages and getting responses
- Retrieving conversation history
- Searching through conversations
- Getting analytics
- Exporting data

**Run it:**
```bash
npm run example:basic
```

### 2. Router API (`router-api.ts`)

Shows how to interact with DeskAI using the Router API:
- Starting conversations via API
- Sending messages through the router
- Listing conversations
- Searching
- Getting analytics
- Error handling

**Run it:**
```bash
npm run example:router
```

## Data Storage

All example data is stored in `examples/data/conversations.json`. This file is automatically created when you run the examples and contains all conversation history in human-readable JSON format.

## Exploring the Examples

1. **Read the code** - Each example is well-commented and demonstrates specific features
2. **Run the examples** - See the system in action
3. **Inspect the data** - Look at `examples/data/conversations.json` to see how conversations are stored
4. **Modify and experiment** - Try changing the code to explore different features

## Building on the Examples

These examples can serve as a starting point for:
- Building a CLI interface for DeskAI
- Creating a web API server
- Integrating with other systems
- Testing and development

## Next Steps

- Review the main documentation in [README.md](../README.md)
- Check out the security documentation in [SECURITY.md](../SECURITY.md)
- Explore the source code in the `src/` directory
- Run the test suite with `npm test`
