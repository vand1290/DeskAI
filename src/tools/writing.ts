/**
 * Writing Tool for creating and editing documents
 * Supports document creation, editing, formatting, and templates
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Tool } from '../tools';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

export type DocumentFormat = 'txt' | 'md';
export type FormattingStyle = 'markdown' | 'plain';

export interface WritingParams {
  action: 'create' | 'edit' | 'format' | 'getTemplates' | 'useTemplate';
  title?: string;
  content?: string;
  format?: DocumentFormat;
  filePath?: string;
  style?: FormattingStyle;
  templateName?: string;
}

/**
 * Writing Tool - create and edit documents with templates
 */
export class WritingTool implements Tool {
  name = 'writing';
  description = 'Create and edit documents with templates and formatting';
  private readonly baseDir: string;
  private autoSaveInterval?: NodeJS.Timeout;
  private autoSaveCallbacks: Map<string, () => Promise<void>> = new Map();

  constructor(baseDir: string = path.join(process.cwd(), 'out', 'documents')) {
    this.baseDir = baseDir;
  }

  isAllowed(): boolean {
    return true;
  }

  async execute(params: WritingParams): Promise<any> {
    switch (params.action) {
      case 'create':
        return await this.createDocument(params.title!, params.content!, params.format!);
      case 'edit':
        return await this.editDocument(params.filePath!, params.content!);
      case 'format':
        return this.formatDocument(params.content!, params.style!);
      case 'getTemplates':
        return this.getTemplates();
      case 'useTemplate':
        return this.useTemplate(params.templateName!);
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  /**
   * Create a new document with content
   */
  private async createDocument(
    title: string,
    content: string,
    format: DocumentFormat = 'txt'
  ): Promise<{ path: string; success: boolean }> {
    if (!title) {
      throw new Error('title is required');
    }
    if (content === undefined) {
      throw new Error('content is required');
    }

    // Ensure base directory exists
    await mkdir(this.baseDir, { recursive: true });

    // Sanitize filename
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '_');
    const filename = `${sanitizedTitle}.${format}`;
    const filePath = path.join(this.baseDir, filename);

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      throw new Error(`Document already exists: ${filename}`);
    }

    // Write file
    await writeFile(filePath, content, 'utf-8');

    // Setup auto-save
    this.setupAutoSave(filePath, content);

    return { path: filePath, success: true };
  }

  /**
   * Edit an existing document
   */
  private async editDocument(filePath: string, content: string): Promise<{ success: boolean }> {
    if (!filePath) {
      throw new Error('filePath is required');
    }
    if (content === undefined) {
      throw new Error('content is required');
    }

    // Validate path is within base directory
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(this.baseDir) && !resolvedPath.startsWith(path.join(process.cwd(), 'out'))) {
      throw new Error('Access denied: Path must be within allowed directories');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Document not found: ${filePath}`);
    }

    // Write updated content
    await writeFile(filePath, content, 'utf-8');

    // Update auto-save
    this.setupAutoSave(filePath, content);

    return { success: true };
  }

  /**
   * Format document content according to style
   */
  private formatDocument(content: string, style: FormattingStyle): { formatted: string } {
    if (!content) {
      throw new Error('content is required');
    }
    if (!style) {
      throw new Error('style is required');
    }

    let formatted = content;

    if (style === 'markdown') {
      // Apply basic markdown formatting
      // This is a simple implementation - could be expanded
      formatted = content;
    } else if (style === 'plain') {
      // Strip markdown formatting
      formatted = content
        .replace(/^#{1,6}\s+/gm, '') // Remove headers
        .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
        .replace(/\*(.+?)\*/g, '$1') // Remove italic
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Remove links, keep text
        .replace(/^[\*\-]\s+/gm, '• '); // Convert list markers to bullets
    }

    return { formatted };
  }

  /**
   * Get available templates
   */
  private getTemplates(): { templates: Array<{ name: string; description: string }> } {
    return {
      templates: [
        {
          name: 'business_letter',
          description: 'Professional business letter template'
        },
        {
          name: 'memo',
          description: 'Internal memo template'
        },
        {
          name: 'meeting_notes',
          description: 'Meeting notes template with sections'
        },
        {
          name: 'blank',
          description: 'Blank document'
        }
      ]
    };
  }

  /**
   * Get template content by name
   */
  private useTemplate(templateName: string): { content: string; format: DocumentFormat } {
    if (!templateName) {
      throw new Error('templateName is required');
    }

    const templates: Record<string, { content: string; format: DocumentFormat }> = {
      business_letter: {
        content: `[Your Name]
[Your Address]
[City, State ZIP]
[Date]

[Recipient Name]
[Recipient Title]
[Company Name]
[Address]
[City, State ZIP]

Dear [Recipient Name],

[Opening paragraph - state the purpose of the letter]

[Body paragraphs - provide details and supporting information]

[Closing paragraph - summarize and indicate next steps]

Sincerely,

[Your Name]
[Your Title]`,
        format: 'txt'
      },
      memo: {
        content: `MEMORANDUM

TO: [Recipients]
FROM: [Your Name]
DATE: [Date]
RE: [Subject]

---

[Introduction - briefly state the purpose of the memo]

[Body - provide detailed information, facts, or instructions]

[Conclusion - summarize key points or action items]

[Optional: Attachments or references]`,
        format: 'txt'
      },
      meeting_notes: {
        content: `# Meeting Notes

**Date:** [Date]
**Time:** [Time]
**Location:** [Location]
**Attendees:** [Names]

## Agenda
1. [Agenda item 1]
2. [Agenda item 2]
3. [Agenda item 3]

## Discussion Points
- [Point 1]
- [Point 2]
- [Point 3]

## Action Items
- [ ] [Action 1] - Assigned to: [Name] - Due: [Date]
- [ ] [Action 2] - Assigned to: [Name] - Due: [Date]

## Next Meeting
**Date:** [Date]
**Time:** [Time]`,
        format: 'md'
      },
      blank: {
        content: '',
        format: 'txt'
      }
    };

    const template = templates[templateName];
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }

    return template;
  }

  /**
   * Setup auto-save for a document
   */
  private setupAutoSave(filePath: string, content: string): void {
    // Store the auto-save callback
    this.autoSaveCallbacks.set(filePath, async () => {
      try {
        await writeFile(filePath, content, 'utf-8');
      } catch (error) {
        console.error(`Auto-save failed for ${filePath}:`, error);
      }
    });

    // Setup interval if not already running
    if (!this.autoSaveInterval) {
      this.autoSaveInterval = setInterval(() => {
        this.autoSaveCallbacks.forEach(callback => callback());
      }, 30000); // Auto-save every 30 seconds
    }
  }

  /**
   * Stop auto-save
   */
  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = undefined;
    }
    this.autoSaveCallbacks.clear();
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopAutoSave();
  }
}
