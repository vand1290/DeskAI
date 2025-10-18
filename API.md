# API Documentation

## Task Chaining API

### Core Interfaces

#### Task
Represents a single action in the workflow chain.

```typescript
interface Task {
  id: string;           // Unique identifier for the task
  name: string;         // Human-readable task name
  type: string;         // Tool type identifier
  parameters: Record<string, any>;  // Tool-specific parameters
}
```

#### TaskChain
Represents a complete workflow with multiple tasks.

```typescript
interface TaskChain {
  id: string;           // Unique workflow identifier
  name: string;         // Workflow name
  description: string;  // Workflow description
  tasks: Task[];        // Ordered list of tasks
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last modification timestamp
}
```

#### Tool
Defines a tool that can be used in workflows.

```typescript
interface Tool {
  type: string;         // Unique tool type identifier
  name: string;         // Display name
  description: string;  // Tool description
  execute: (input: any, parameters: Record<string, any>) => Promise<any>;
  parameters?: Record<string, ParameterDefinition>;
}
```

### Main Classes

#### ToolRegistry

Manages all available tools/actions.

```typescript
class ToolRegistry {
  // Register a new tool
  registerTool(tool: Tool): void
  
  // Get a tool by type
  getTool(type: string): Tool | undefined
  
  // Get all registered tools
  getAllTools(): Tool[]
  
  // Check if a tool exists
  hasTool(type: string): boolean
  
  // Unregister a tool
  unregisterTool(type: string): boolean
}
```

#### TaskChainManager

Handles execution of task chains.

```typescript
class TaskChainManager {
  // Execute a complete task chain
  executeChain(chain: TaskChain): Promise<ChainExecutionResult>
  
  // Validate a task chain before execution
  validateChain(chain: TaskChain): { valid: boolean; errors: string[] }
}
```

#### WorkflowStorage

Handles persistence of workflows to disk.

```typescript
class WorkflowStorage {
  constructor(storageDir?: string)
  
  // Save a workflow to disk
  saveWorkflow(chain: TaskChain): Promise<void>
  
  // Load a workflow from disk
  loadWorkflow(id: string): Promise<TaskChain | null>
  
  // List all saved workflows
  listWorkflows(): Promise<TaskChain[]>
  
  // Delete a workflow
  deleteWorkflow(id: string): Promise<boolean>
  
  // Check if a workflow exists
  workflowExists(id: string): Promise<boolean>
}
```

### Built-in Tools

#### Document Scanner
```typescript
Type: 'scan'
Parameters:
  - resolution: number (default: 300) - Scan resolution in DPI
  - colorMode: 'color' | 'grayscale' | 'bw' (default: 'color')
Output: { type: 'image', format: 'png', data: string, metadata: object }
```

#### OCR
```typescript
Type: 'ocr'
Parameters:
  - language: string (default: 'eng') - OCR language
Input Required: Image data from previous task
Output: { type: 'text', text: string, confidence: number, metadata: object }
```

#### Text Summarizer
```typescript
Type: 'summarize'
Parameters:
  - length: 'short' | 'medium' | 'long' (default: 'medium')
Input Required: Text data from previous task
Output: { type: 'text', text: string, metadata: object }
```

#### Save as PDF
```typescript
Type: 'savePdf'
Parameters:
  - filename: string (required) - Output filename
  - pageSize: string (default: 'A4') - Page size
Input Required: Content from previous task
Output: { type: 'file', path: string, format: 'pdf', metadata: object }
```

#### File Management
```typescript
Type: 'fileManagement'
Parameters:
  - action: 'copy' | 'move' | 'delete' (required)
  - destination: string (required for copy/move)
Input Required: File data from previous task
Output: { type: 'file', path: string, action: string, metadata: object }
```

## IPC API (Electron)

The renderer process communicates with the main process through these IPC handlers:

### get-tools
Get all available tools.
```typescript
Response: Tool[]
```

### save-workflow
Save a workflow to disk.
```typescript
Request: TaskChain
Response: { success: boolean; error?: string }
```

### load-workflow
Load a workflow by ID.
```typescript
Request: string (workflow ID)
Response: { success: boolean; workflow?: TaskChain; error?: string }
```

### list-workflows
List all saved workflows.
```typescript
Response: { success: boolean; workflows?: TaskChain[]; error?: string }
```

### delete-workflow
Delete a workflow by ID.
```typescript
Request: string (workflow ID)
Response: { success: boolean; error?: string }
```

### execute-workflow
Execute a workflow.
```typescript
Request: TaskChain
Response: { success: boolean; result?: ChainExecutionResult; error?: string }
```

### validate-workflow
Validate a workflow before execution.
```typescript
Request: TaskChain
Response: { success: boolean; validation?: ValidationResult; error?: string }
```

## Usage Examples

### Creating a Custom Tool

```typescript
import { toolRegistry } from './main/toolRegistry';

const myCustomTool: Tool = {
  type: 'myTool',
  name: 'My Custom Tool',
  description: 'Does something awesome',
  parameters: {
    param1: {
      type: 'string',
      required: true,
      description: 'First parameter',
    },
  },
  execute: async (input: any, parameters: Record<string, any>) => {
    // Process input with parameters
    return { result: 'processed data' };
  },
};

toolRegistry.registerTool(myCustomTool);
```

### Creating a Workflow Programmatically

```typescript
import { TaskChain } from './shared/types';
import { workflowStorage } from './main/workflowStorage';

const workflow: TaskChain = {
  id: 'my-workflow-1',
  name: 'Document Processing',
  description: 'Process documents end-to-end',
  tasks: [
    {
      id: 'task-1',
      name: 'Scan',
      type: 'scan',
      parameters: { resolution: 300 },
    },
    {
      id: 'task-2',
      name: 'OCR',
      type: 'ocr',
      parameters: { language: 'eng' },
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

await workflowStorage.saveWorkflow(workflow);
```

### Executing a Workflow

```typescript
import { taskChainManager } from './main/taskChainManager';
import { workflowStorage } from './main/workflowStorage';

// Load and execute
const workflow = await workflowStorage.loadWorkflow('my-workflow-1');
if (workflow) {
  const result = await taskChainManager.executeChain(workflow);
  
  if (result.success) {
    console.log('Workflow completed successfully');
    result.results.forEach((taskResult, index) => {
      console.log(`Task ${index + 1}:`, taskResult.data);
    });
  } else {
    console.error('Workflow failed');
  }
}
```

## Security Considerations

- All processing happens locally, no external network calls
- Workflows are stored as JSON files on local disk
- File operations are sandboxed within the application directory
- Input validation is performed before task execution
- No eval() or dynamic code execution
- All user inputs are sanitized

## Error Handling

All async operations return standardized error responses:

```typescript
{
  success: boolean;
  error?: string;
  // ... other fields
}
```

Task execution errors are captured and returned in the result:

```typescript
interface TaskResult {
  taskId: string;
  success: boolean;
  data?: any;
  error?: string;
}
```

Chain execution stops on first task failure, returning partial results.
