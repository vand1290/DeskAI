// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
struct ModelRequest {
    prompt: String,
    model: String,
    temperature: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ModelResponse {
    response: String,
    model: String,
    tokens_used: u32,
}

#[derive(Debug, Serialize, Deserialize)]
struct ToolRequest {
    tool: String,
    parameters: HashMap<String, String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct ToolResponse {
    result: String,
    tool: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct AvailableModel {
    id: String,
    name: String,
    description: String,
    capabilities: Vec<String>,
}

// Meta-agent routing logic
#[tauri::command]
fn route_request(request: ModelRequest) -> Result<ModelResponse, String> {
    // Route to appropriate local model based on request
    let model_name = &request.model;
    
    // Simulate routing to different models
    let response_text = match model_name.as_str() {
        "general" => format!("General assistant response to: {}", request.prompt),
        "code" => format!("Code-focused response to: {}", request.prompt),
        "creative" => format!("Creative response to: {}", request.prompt),
        _ => format!("Default model response to: {}", request.prompt),
    };
    
    Ok(ModelResponse {
        response: response_text,
        model: model_name.clone(),
        tokens_used: request.prompt.len() as u32,
    })
}

#[tauri::command]
fn execute_tool(request: ToolRequest) -> Result<ToolResponse, String> {
    // Execute local tools
    let tool_name = &request.tool;
    
    let result = match tool_name.as_str() {
        "calculator" => {
            // Simple calculator tool
            "Calculation result: 42".to_string()
        }
        "file_search" => {
            // File search tool
            format!("Search results for: {:?}", request.parameters)
        }
        "system_info" => {
            // System information tool
            format!("System: {} {}", std::env::consts::OS, std::env::consts::ARCH)
        }
        _ => format!("Unknown tool: {}", tool_name),
    };
    
    Ok(ToolResponse {
        result,
        tool: tool_name.clone(),
    })
}

#[tauri::command]
fn get_available_models() -> Result<Vec<AvailableModel>, String> {
    Ok(vec![
        AvailableModel {
            id: "general".to_string(),
            name: "General Assistant".to_string(),
            description: "General purpose conversational model".to_string(),
            capabilities: vec!["conversation".to_string(), "qa".to_string()],
        },
        AvailableModel {
            id: "code".to_string(),
            name: "Code Assistant".to_string(),
            description: "Specialized in programming and code generation".to_string(),
            capabilities: vec!["coding".to_string(), "debugging".to_string()],
        },
        AvailableModel {
            id: "creative".to_string(),
            name: "Creative Writer".to_string(),
            description: "Creative writing and content generation".to_string(),
            capabilities: vec!["writing".to_string(), "storytelling".to_string()],
        },
    ])
}

#[tauri::command]
fn get_available_tools() -> Result<Vec<String>, String> {
    Ok(vec![
        "calculator".to_string(),
        "file_search".to_string(),
        "system_info".to_string(),
    ])
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            route_request,
            execute_tool,
            get_available_models,
            get_available_tools
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn main() {
    run();
}
