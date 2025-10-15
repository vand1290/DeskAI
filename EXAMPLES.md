# DeskAI Examples

This document provides practical examples for extending DeskAI with new models and tools.

## Adding a New Model

### Example: Adding a Math Specialist Model

**Step 1: Update Backend (`src-tauri/src/main.rs`)**

Add the model to the available models list:

```rust
#[tauri::command]
fn get_available_models() -> Result<Vec<AvailableModel>, String> {
    Ok(vec![
        // ... existing models ...
        AvailableModel {
            id: "math".to_string(),
            name: "Math Specialist".to_string(),
            description: "Specialized in mathematical problems and calculations".to_string(),
            capabilities: vec![
                "algebra".to_string(),
                "calculus".to_string(),
                "statistics".to_string(),
            ],
        },
    ])
}
```

Add routing logic:

```rust
#[tauri::command]
fn route_request(request: ModelRequest) -> Result<ModelResponse, String> {
    let model_name = &request.model;
    
    let response_text = match model_name.as_str() {
        // ... existing models ...
        "math" => {
            // Math-specific processing
            if request.prompt.contains("solve") || request.prompt.contains("calculate") {
                format!("Mathematical solution to: {}", request.prompt)
            } else {
                format!("Math concept explanation: {}", request.prompt)
            }
        }
        _ => format!("Default model response to: {}", request.prompt),
    };
    
    Ok(ModelResponse {
        response: response_text,
        model: model_name.clone(),
        tokens_used: request.prompt.len() as u32,
    })
}
```

**Step 2: Test the Model**

```bash
npm run tauri:dev
```

Select the "Math Specialist" model and try:
- "Solve x^2 + 5x + 6 = 0"
- "Explain calculus"

## Adding a New Tool

### Example: Adding a Text Counter Tool

**Step 1: Update Backend (`src-tauri/src/main.rs`)**

Add the tool to available tools:

```rust
#[tauri::command]
fn get_available_tools() -> Result<Vec<String>, String> {
    Ok(vec![
        "calculator".to_string(),
        "file_search".to_string(),
        "system_info".to_string(),
        "text_counter".to_string(),  // New tool
    ])
}
```

Add tool execution logic:

```rust
#[tauri::command]
fn execute_tool(request: ToolRequest) -> Result<ToolResponse, String> {
    let tool_name = &request.tool;
    
    let result = match tool_name.as_str() {
        // ... existing tools ...
        "text_counter" => {
            let text = request.parameters.get("text").unwrap_or(&"".to_string());
            let words = text.split_whitespace().count();
            let chars = text.len();
            let lines = text.lines().count();
            
            format!(
                "Text Statistics:\nWords: {}\nCharacters: {}\nLines: {}",
                words, chars, lines
            )
        }
        _ => format!("Unknown tool: {}", tool_name),
    };
    
    Ok(ToolResponse {
        result,
        tool: tool_name.clone(),
    })
}
```

**Step 2: Update Frontend (Optional - Add Custom UI)**

Edit `src/components/ToolPanel.tsx` to add a custom icon:

```typescript
const getToolIcon = (tool: string) => {
  switch (tool) {
    case 'calculator':
      return '🔢';
    case 'file_search':
      return '🔍';
    case 'system_info':
      return 'ℹ️';
    case 'text_counter':
      return '📊';
    default:
      return '🔧';
  }
};

function ToolPanel({ tools, onExecuteTool }: ToolPanelProps) {
  return (
    <div className="tool-panel">
      <h3>Tools</h3>
      <div className="tool-list">
        {tools.map((tool) => (
          <button
            key={tool}
            className="tool-item"
            onClick={() => onExecuteTool(tool)}
          >
            <span className="tool-icon">{getToolIcon(tool)}</span>
            <span className="tool-name">{tool}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Advanced Examples

### Example: Adding a Database Query Model

This example shows how to add a model that can interact with local SQLite databases.

**Step 1: Add Dependencies to `Cargo.toml`**

```toml
[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-shell = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
rusqlite = "0.32"  # Add this line
```

**Step 2: Update Backend**

```rust
use rusqlite::{Connection, Result as SqlResult};

#[tauri::command]
fn get_available_models() -> Result<Vec<AvailableModel>, String> {
    Ok(vec![
        // ... existing models ...
        AvailableModel {
            id: "database".to_string(),
            name: "Database Query Assistant".to_string(),
            description: "Query and analyze local SQLite databases".to_string(),
            capabilities: vec![
                "sql".to_string(),
                "data_analysis".to_string(),
            ],
        },
    ])
}

#[tauri::command]
fn route_request(request: ModelRequest) -> Result<ModelResponse, String> {
    let model_name = &request.model;
    
    let response_text = match model_name.as_str() {
        "database" => {
            // In a real implementation, you would:
            // 1. Parse the SQL query from the prompt
            // 2. Connect to the database
            // 3. Execute the query
            // 4. Format the results
            format!("Database query result for: {}", request.prompt)
        }
        _ => format!("Default response"),
    };
    
    Ok(ModelResponse {
        response: response_text,
        model: model_name.clone(),
        tokens_used: request.prompt.len() as u32,
    })
}
```

### Example: Adding a File Content Tool

**Backend Implementation:**

```rust
use std::fs;
use std::path::Path;

#[tauri::command]
fn execute_tool(request: ToolRequest) -> Result<ToolResponse, String> {
    let tool_name = &request.tool;
    
    let result = match tool_name.as_str() {
        "file_content" => {
            match request.parameters.get("path") {
                Some(path) => {
                    match fs::read_to_string(path) {
                        Ok(content) => {
                            let preview = if content.len() > 500 {
                                format!("{}...\n\n[Total: {} characters]", 
                                    &content[..500], content.len())
                            } else {
                                content
                            };
                            format!("File content:\n{}", preview)
                        }
                        Err(e) => format!("Error reading file: {}", e),
                    }
                }
                None => "No file path provided".to_string(),
            }
        }
        _ => format!("Unknown tool"),
    };
    
    Ok(ToolResponse {
        result,
        tool: tool_name.clone(),
    })
}
```

## Interactive Tool Example

### Creating a Tool with Parameters

**Backend:**

```rust
#[derive(Debug, Serialize, Deserialize)]
struct ConversionRequest {
    tool: String,
    parameters: HashMap<String, String>,
}

#[tauri::command]
fn execute_tool(request: ToolRequest) -> Result<ToolResponse, String> {
    let tool_name = &request.tool;
    
    let result = match tool_name.as_str() {
        "unit_converter" => {
            let value = request.parameters
                .get("value")
                .and_then(|v| v.parse::<f64>().ok())
                .unwrap_or(0.0);
            
            let from_unit = request.parameters.get("from").map(|s| s.as_str()).unwrap_or("");
            let to_unit = request.parameters.get("to").map(|s| s.as_str()).unwrap_or("");
            
            let converted = match (from_unit, to_unit) {
                ("km", "miles") => value * 0.621371,
                ("miles", "km") => value * 1.60934,
                ("kg", "lbs") => value * 2.20462,
                ("lbs", "kg") => value * 0.453592,
                _ => value,
            };
            
            format!("{} {} = {} {}", value, from_unit, converted, to_unit)
        }
        _ => format!("Unknown tool"),
    };
    
    Ok(ToolResponse {
        result,
        tool: tool_name.clone(),
    })
}
```

**Frontend - Add a Custom Tool Component:**

Create `src/components/UnitConverter.tsx`:

```typescript
import { useState } from 'react';
import { executeTool } from '../services/api';

interface UnitConverterProps {
  onResult: (result: string) => void;
}

function UnitConverter({ onResult }: UnitConverterProps) {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit, setToUnit] = useState('miles');

  const handleConvert = async () => {
    try {
      const response = await executeTool({
        tool: 'unit_converter',
        parameters: {
          value,
          from: fromUnit,
          to: toUnit,
        },
      });
      onResult(response.result);
    } catch (error) {
      console.error('Conversion failed:', error);
    }
  };

  return (
    <div className="unit-converter">
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value"
      />
      <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
        <option value="km">Kilometers</option>
        <option value="miles">Miles</option>
        <option value="kg">Kilograms</option>
        <option value="lbs">Pounds</option>
      </select>
      <span>to</span>
      <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
        <option value="km">Kilometers</option>
        <option value="miles">Miles</option>
        <option value="kg">Kilograms</option>
        <option value="lbs">Pounds</option>
      </select>
      <button onClick={handleConvert}>Convert</button>
    </div>
  );
}

export default UnitConverter;
```

## Model Chaining Example

Create a meta-agent that uses multiple models in sequence:

```rust
#[tauri::command]
fn route_request(request: ModelRequest) -> Result<ModelResponse, String> {
    let model_name = &request.model;
    
    let response_text = match model_name.as_str() {
        "multi_step" => {
            // Step 1: Analyze request with general model
            let analysis = analyze_prompt(&request.prompt);
            
            // Step 2: Route to specialized model
            let specialized_response = match analysis.category {
                Category::Math => process_with_math_model(&request.prompt),
                Category::Code => process_with_code_model(&request.prompt),
                _ => process_with_general_model(&request.prompt),
            };
            
            // Step 3: Format and return
            format!("Analysis: {}\n\nResult: {}", analysis.summary, specialized_response)
        }
        _ => format!("Default response"),
    };
    
    Ok(ModelResponse {
        response: response_text,
        model: model_name.clone(),
        tokens_used: request.prompt.len() as u32,
    })
}

struct Analysis {
    category: Category,
    summary: String,
}

enum Category {
    Math,
    Code,
    General,
}

fn analyze_prompt(prompt: &str) -> Analysis {
    // Simple keyword-based analysis
    if prompt.contains("solve") || prompt.contains("calculate") {
        Analysis {
            category: Category::Math,
            summary: "Mathematical problem detected".to_string(),
        }
    } else if prompt.contains("code") || prompt.contains("function") {
        Analysis {
            category: Category::Code,
            summary: "Programming task detected".to_string(),
        }
    } else {
        Analysis {
            category: Category::General,
            summary: "General query detected".to_string(),
        }
    }
}
```

## Testing Your Extensions

### Unit Tests for Tools

Add tests to `src-tauri/src/main.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculator_tool() {
        let request = ToolRequest {
            tool: "calculator".to_string(),
            parameters: HashMap::new(),
        };
        
        let response = execute_tool(request);
        assert!(response.is_ok());
        assert!(response.unwrap().result.contains("42"));
    }

    #[test]
    fn test_math_model() {
        let request = ModelRequest {
            prompt: "solve equation".to_string(),
            model: "math".to_string(),
            temperature: Some(0.7),
        };
        
        let response = route_request(request);
        assert!(response.is_ok());
    }
}
```

Run tests:
```bash
cd src-tauri
cargo test
```

## Performance Optimization Tips

1. **Cache Model Results:**
```rust
use std::collections::HashMap;
use std::sync::Mutex;

lazy_static! {
    static ref CACHE: Mutex<HashMap<String, String>> = Mutex::new(HashMap::new());
}

#[tauri::command]
fn route_request(request: ModelRequest) -> Result<ModelResponse, String> {
    let cache_key = format!("{}-{}", request.model, request.prompt);
    
    // Check cache
    if let Ok(cache) = CACHE.lock() {
        if let Some(cached_response) = cache.get(&cache_key) {
            return Ok(ModelResponse {
                response: cached_response.clone(),
                model: request.model.clone(),
                tokens_used: 0,
            });
        }
    }
    
    // Process request...
    let response_text = process_request(&request);
    
    // Store in cache
    if let Ok(mut cache) = CACHE.lock() {
        cache.insert(cache_key, response_text.clone());
    }
    
    Ok(ModelResponse {
        response: response_text,
        model: request.model.clone(),
        tokens_used: request.prompt.len() as u32,
    })
}
```

2. **Async Processing:**
```rust
use tokio::task;

#[tauri::command]
async fn route_request_async(request: ModelRequest) -> Result<ModelResponse, String> {
    let handle = task::spawn(async move {
        // Heavy processing here
        process_large_model(&request)
    });
    
    match handle.await {
        Ok(result) => Ok(result),
        Err(e) => Err(format!("Processing error: {}", e)),
    }
}
```

## Debugging Your Extensions

Add logging to your Rust code:

```rust
#[tauri::command]
fn route_request(request: ModelRequest) -> Result<ModelResponse, String> {
    println!("Received request for model: {}", request.model);
    println!("Prompt: {}", request.prompt);
    
    let response = process_request(&request);
    
    println!("Generated response: {}", response);
    
    Ok(ModelResponse {
        response,
        model: request.model,
        tokens_used: request.prompt.len() as u32,
    })
}
```

Run with debug logging:
```bash
RUST_LOG=debug npm run tauri:dev
```

## Conclusion

These examples demonstrate the extensibility of DeskAI. The architecture allows you to:

1. Add new models with specialized capabilities
2. Create tools for various tasks
3. Chain models together
4. Optimize performance
5. Test and debug extensions

For more information, see:
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guide
- [README.md](README.md) - Getting started
