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

### 3. Secretary Tools (`secretary-tools.ts`) _(NEW)_

Demonstrates the new secretary assistant features:
- **Writing Tool**: Creating and managing text documents
- **Document Tool**: Summarizing and extracting structured data
- **Photo Tool**: Image metadata and OCR (stub)
- **File Sorting**: Organizing files by name, date, size, and type
- **Handwriting Recognition**: HTR stub for future integration
- All operations are 100% offline and secure

**Run it:**
```bash
npm run example:secretary
```

**What it demonstrates:**
- Document creation with real content
- Data extraction (emails, dates, phone numbers)
- Document summarization
- File sorting and organization
- Stub implementations ready for ML model integration

## Data Storage

All example data is stored in subdirectories under `examples/data/`:
- `conversations.json` - Conversation history
- `documents/` - Text documents created by secretary tools
- `photos/` - Images processed by photo tools

These files are automatically created when you run the examples and contain data in human-readable formats.

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
- Building document processing pipelines
- Creating automation workflows

## Next Steps

- Review the main documentation in [README.md](../README.md)
- Check out the security documentation in [SECURITY.md](../SECURITY.md)
- Explore the source code in the `src/` directory
- Run the test suite with `npm test`
