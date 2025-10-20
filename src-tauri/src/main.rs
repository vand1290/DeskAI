// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::path::PathBuf;
use std::fs;

/// Get the out directory path
fn get_out_dir() -> PathBuf {
    let app_data = tauri::api::path::app_data_dir(&tauri::Config::default())
        .unwrap_or_else(|| PathBuf::from("."));
    app_data.join("deskai").join("out")
}

/// Tauri command to process agent requests
#[tauri::command]
async fn process_request(query: String, model: Option<String>) -> Result<String, String> {
    let model_name = model.unwrap_or_else(|| "qwen2.5:7b".to_string());
    
    let client = reqwest::Client::new();
    let ollama_url = "http://localhost:11434/api/generate";
    
    let payload = serde_json::json!({
        "model": model_name,
        "prompt": query,
        "stream": false
    });
    
    match client.post(ollama_url).json(&payload).send().await {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<serde_json::Value>().await {
                    Ok(json) => {
                        let ai_response = json["response"].as_str().unwrap_or("No response");
                        let result = serde_json::json!({
                            "result": ai_response,
                            "route": model_name,
                            "toolsUsed": [],
                            "deterministic": false
                        });
                        Ok(result.to_string())
                    }
                    Err(e) => Err(format!("Failed to parse Ollama response: {}", e))
                }
            } else {
                Err(format!("Ollama returned error status: {}", response.status()))
            }
        }
        Err(e) => {
            Err(format!("Cannot connect to Ollama (is it running?): {}", e))
        }
    }
}

/// Search for files in local directories
#[tauri::command]
fn search_files(query: String, search_path: Option<String>) -> Result<Vec<serde_json::Value>, String> {
    let base_path = search_path.unwrap_or_else(|| {
        std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\Users".to_string())
    });
    
    let mut results = Vec::new();
    
    fn search_recursive(dir: &std::path::Path, query: &str, results: &mut Vec<serde_json::Value>, depth: usize) {
        if depth > 3 { return; }
        
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                let file_name = entry.file_name().to_string_lossy().to_lowercase();
                
                if file_name.contains(&query.to_lowercase()) {
                    results.push(serde_json::json!({
                        "name": entry.file_name().to_string_lossy(),
                        "path": path.to_string_lossy(),
                        "is_dir": path.is_dir(),
                        "size": entry.metadata().ok().map(|m| m.len())
                    }));
                    
                    if results.len() >= 50 { return; }
                }
                
                if path.is_dir() {
                    search_recursive(&path, query, results, depth + 1);
                }
            }
        }
    }
    
    search_recursive(&PathBuf::from(&base_path), &query, &mut results, 0);
    Ok(results)
}

/// Read file content
#[tauri::command]
fn read_file(file_path: String) -> Result<String, String> {
    fs::read_to_string(&file_path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

/// OCR functionality - extract text from image using Tesseract via command line
#[tauri::command]
async fn extract_text_from_image(image_path: String) -> Result<String, String> {
    use std::process::Command;
    
    // Check if Tesseract is installed
    let tesseract_check = Command::new("tesseract")
        .arg("--version")
        .output();
    
    if tesseract_check.is_err() {
        return Err(
            "Tesseract OCR not found in PATH.\n\n\
            Please install Tesseract OCR:\n\
            1. Download from: https://github.com/UB-Mannheim/tesseract/wiki\n\
            2. Or run: winget install UB-Mannheim.TesseractOCR\n\
            3. Make sure it's added to your PATH".to_string()
        );
    }
    
    // Create temporary output file
    let temp_output = std::env::temp_dir().join("ocr_output");
    let temp_output_str = temp_output.to_string_lossy().to_string();
    
    // Run Tesseract
    let output = Command::new("tesseract")
        .arg(&image_path)
        .arg(&temp_output_str)
        .output()
        .map_err(|e| format!("Failed to execute Tesseract: {}", e))?;
    
    if !output.status.success() {
        let error_msg = String::from_utf8_lossy(&output.stderr);
        return Err(format!("Tesseract failed: {}", error_msg));
    }
    
    // Read the output file (Tesseract adds .txt automatically)
    let output_file = format!("{}.txt", temp_output_str);
    let text = fs::read_to_string(&output_file)
        .map_err(|e| format!("Failed to read OCR output: {}", e))?;
    
    // Clean up temp file
    let _ = fs::remove_file(&output_file);
    
    if text.trim().is_empty() {
        Ok("No text detected in the image.".to_string())
    } else {
        Ok(text)
    }
}

/// Calendar integration - get events (mock for now)
#[tauri::command]
fn get_calendar_events(start_date: Option<String>, end_date: Option<String>) -> Result<Vec<serde_json::Value>, String> {
    Ok(vec![
        serde_json::json!({
            "id": "1",
            "title": "Team Meeting",
            "start": start_date.unwrap_or_else(|| "2025-10-20T10:00:00".to_string()),
            "end": end_date.unwrap_or_else(|| "2025-10-20T11:00:00".to_string()),
            "description": "Weekly team sync"
        })
    ])
}

/// Email integration - get emails (mock for now)
#[tauri::command]
fn get_emails(folder: Option<String>) -> Result<Vec<serde_json::Value>, String> {
    Ok(vec![
        serde_json::json!({
            "id": "1",
            "from": "example@email.com",
            "subject": "Test Email",
            "date": "2025-10-20",
            "folder": folder.unwrap_or_else(|| "Inbox".to_string())
        })
    ])
}

/// Tauri command to get available models from Ollama
#[tauri::command]
async fn get_available_models() -> Result<Vec<String>, String> {
    let client = reqwest::Client::new();
    
    match client.get("http://localhost:11434/api/tags").send().await {
        Ok(response) => {
            if let Ok(json) = response.json::<serde_json::Value>().await {
                if let Some(models) = json["models"].as_array() {
                    let model_names: Vec<String> = models
                        .iter()
                        .filter_map(|m| m["name"].as_str().map(String::from))
                        .collect();
                    
                    if !model_names.is_empty() {
                        return Ok(model_names);
                    }
                }
            }
        }
        Err(_) => {}
    }
    
    Ok(vec![
        "granite3.1-dense:8b".to_string(),
        "ALIENTELLIGENCE/ai2ndbrain:latest".to_string(),
        "aya-expanse:latest".to_string(),
        "gemma3:12b".to_string(),
        "qwen2.5-coder:7b".to_string(),
        "qwen2.5:7b".to_string(),
        "llama3:latest".to_string(),
        "deepseek-r1:8b".to_string(),
    ])
}

/// Tauri command to get available tools
#[tauri::command]
fn get_available_tools() -> Result<Vec<serde_json::Value>, String> {
    Ok(vec![
        serde_json::json!({
            "name": "file_search",
            "description": "Search for files in the system"
        }),
        serde_json::json!({
            "name": "calculator",
            "description": "Perform mathematical calculations"
        }),
        serde_json::json!({
            "name": "code_analyzer",
            "description": "Analyze code snippets"
        }),
        serde_json::json!({
            "name": "ocr",
            "description": "Extract text from images"
        }),
        serde_json::json!({
            "name": "calendar",
            "description": "Access calendar events"
        }),
        serde_json::json!({
            "name": "email",
            "description": "Access emails"
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
    if let Err(e) = init_out_dir() {
        eprintln!("Failed to initialize out directory: {}", e);
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            process_request,
            get_available_models,
            get_available_tools,
            search_files,
            read_file,
            extract_text_from_image,
            get_calendar_events,
            get_emails
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
