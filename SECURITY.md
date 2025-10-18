# Security Policy

## Overview

DeskAI is designed with security and privacy as core principles. All data is stored and processed locally on your device, with no external network calls for conversation data. This document outlines our security approach and the controls available to users.

## Core Security Principles

### 1. Local-Only Data Storage

- **All conversations are stored locally** in the `out/` directory on your device
- **No cloud sync** - your data never leaves your machine
- **No network calls** - all processing happens offline
- Data is stored in human-readable JSON format for transparency

### 2. Data Isolation

- Conversations are sandboxed to the `out/` directory
- File access is restricted to allowlisted directories
- No access to system files or other user data
- Deterministic behavior - operations are predictable and traceable

### 3. User Control

Users have complete control over their conversation data:

- **View**: Browse all stored conversations through the History UI
- **Search**: Find specific conversations or messages
- **Export**: Download all conversation data as JSON
- **Delete**: Remove individual conversations or clear all data

## Memory System Security

### Data Storage Format

Conversations are stored in `/out/conversations.json` with the following structure:

```json
[
  {
    "id": "unique-conversation-id",
    "title": "Conversation title",
    "messages": [
      {
        "id": "message-id",
        "role": "user|agent",
        "content": "message content",
        "timestamp": 1234567890
      }
    ],
    "createdAt": 1234567890,
    "updatedAt": 1234567890,
    "tags": ["optional", "tags"],
    "metadata": {}
  }
]
```

### Access Controls

1. **Read Access**: Anyone with access to your device and the `out/` directory can read conversation data
2. **Write Access**: Only DeskAI can write to the conversation file
3. **File Permissions**: Standard OS file permissions apply

### Privacy Features

#### Data Deletion

Users can delete conversations in several ways:

1. **Individual Deletion**: Delete specific conversations from the History UI
2. **Bulk Export and Clear**: Export data then clear all conversations
3. **Manual Deletion**: Delete the `out/conversations.json` file directly

#### Data Export

Users can export their conversation data:

1. Click "Export" in the History UI to download all conversations as JSON
2. Or manually copy the `out/conversations.json` file

## Threat Model

### What DeskAI Protects Against

✅ **Unauthorized network data exfiltration** - No network calls for conversation data  
✅ **Cloud data breaches** - No cloud storage used  
✅ **Third-party access** - All processing is local  
✅ **Unintended data retention** - Users can delete data at any time

### What Users Must Protect Against

⚠️ **Physical device access** - Anyone with access to your device can access stored conversations  
⚠️ **Malware** - System-level malware could access local files  
⚠️ **Backups** - Conversations may be included in system backups  
⚠️ **File sharing** - Be careful not to share the `out/` directory

## Best Practices

### For Users

1. **Protect your device** with a strong password and encryption
2. **Review conversation history** regularly and delete sensitive discussions
3. **Be aware of backups** - your conversations may be backed up with your system
4. **Don't store highly sensitive information** - while secure, local storage isn't encrypted by default

### For Developers

1. **Never add network calls** that transmit conversation data
2. **Validate all file paths** to prevent directory traversal
3. **Sanitize user input** before storage
4. **Log security-relevant operations** for audit purposes
5. **Follow principle of least privilege** for file system access

## Analytics and Tracking

DeskAI includes **local-only analytics**:

- Conversation count and message statistics
- Frequent topics from tags
- Usage patterns over time

These analytics are:
- Computed on-demand from local data
- Never sent to external servers
- Available only to the user

## Updates and Patches

Security updates are distributed through:
- GitHub releases with security advisories
- In-app update notifications (optional)
- Version changelog with security fixes highlighted

## Reporting Security Issues

If you discover a security vulnerability in DeskAI, please report it by:

1. **Do not** open a public GitHub issue
2. Email the maintainers privately
3. Include details about the vulnerability and steps to reproduce
4. Allow time for a fix before public disclosure

## Future Security Enhancements

Planned security improvements:

- [ ] Optional encryption at rest for conversation data
- [ ] Configurable data retention policies
- [ ] Automatic old conversation archival
- [ ] Enhanced access logging
- [ ] Optional password protection for the application

## Compliance

DeskAI is designed for:
- **GDPR Compliance** - Users have full control over their data
- **Privacy-first operations** - No data collection or sharing
- **Transparent data handling** - Open source for audit

## Questions and Support

For security-related questions:
- Review this document and README.md
- Check the GitHub discussions
- Contact maintainers for sensitive inquiries

---

**Last Updated**: October 2025  
**Version**: 1.0.0
