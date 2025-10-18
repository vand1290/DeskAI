// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;
use tauri::Manager;

/// Get the out directory path
fn get_out_dir() -> PathBuf {
    let app_data = tauri::api::path::app_data_dir(&tauri::Config::default())
        .unwrap_or_else(|| PathBuf::from("."));
    app_data.join("deskai").join("out")
}

/// Tauri command to process agent requests
#[tauri::command]
fn process_request(query: String, model: Option<String>) -> Result<String, String> {
    // In production, this would call the TypeScript backend
    // For now, return a structured JSON response
    let response = serde_json::json!({
        "result": format!("Processing query: {} with model: {}", query, model.unwrap_or_else(|| "default".to_string())),
        "route": "model:qwen2.5:7b",
        "toolsUsed": [],
        "deterministic": true
    });
    
    Ok(response.to_string())
}

/// Tauri command to get available models
#[tauri::command]
fn get_available_models() -> Result<Vec<String>, String> {
    Ok(vec![
        "qwen2.5:7b".to_string(),
        "llama2:7b".to_string(),
        "mistral:7b".to_string(),
    ])
}

/// Tauri command to get available tools
#[tauri::command]
fn get_available_tools() -> Result<Vec<serde_json::Value>, String> {
    Ok(vec![
        serde_json::json!({
            "name": "file_write",
            "description": "Write content to a file in the out/ directory"
        }),
        serde_json::json!({
            "name": "file_read",
            "description": "Read content from a file in the out/ directory"
        }),
        serde_json::json!({
            "name": "calculator",
            "description": "Perform basic arithmetic calculations"
        }),
        serde_json::json!({
            "name": "text_analysis",
            "description": "Analyze text properties"
        }),
    ])
}

/// Initialize the out directory
fn init_out_dir() -> Result<(), Box<dyn std::error::Error>> {
    let out_dir = get_out_dir();
    if !out_dir.exists() {
        std::fs::create_dir_all(&out_dir)?;
    }
    Ok(())
}

fn main() {
    // Initialize out directory
    if let Err(e) = init_out_dir() {
        eprintln!("Failed to initialize out directory: {}", e);
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            process_request,
            get_available_models,
            get_available_tools
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
