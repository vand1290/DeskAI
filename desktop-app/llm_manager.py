"""
LLM Model Manager for DocuBrain
Handles dynamic model selection and management from Ollama
Allows users to select different models for different tasks
"""
import requests
import json
from typing import List, Dict, Optional, Any
from pathlib import Path
import os

class LLMModelManager:
    """Manages available LLM models and model selection"""
    
    def __init__(self, ollama_host: str = "http://localhost:12345"):
        """
        Initialize LLM Model Manager
        
        Args:
            ollama_host: Ollama API endpoint (default: localhost:12345)
        """
        self.ollama_host = ollama_host
        self.api_endpoint = f"{ollama_host}/api"
        self.timeout = 30
        self.config_file = Path.home() / "DocuBrain" / "llm_config.json"
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Default model configuration
        self.default_config = {
            "primary_model": "llama3",
            "chat_model": "llama3",
            "summary_model": "phi3:mini",  # Smaller, faster for summaries
            "search_model": "mistral",      # Good for search queries
            "available_models": [],
            "model_profiles": {
                "llama3": {
                    "name": "Llama 3",
                    "size": "4.7 GB",
                    "speed": "Medium",
                    "quality": "High",
                    "use_cases": ["Chat", "Analysis", "Writing"]
                },
                "phi3:mini": {
                    "name": "Phi 3 Mini",
                    "size": "2.0 GB",
                    "speed": "Fast",
                    "quality": "Medium",
                    "use_cases": ["Quick answers", "Summaries", "Tools"]
                },
                "mistral": {
                    "name": "Mistral",
                    "size": "4.1 GB",
                    "speed": "Fast",
                    "quality": "Good",
                    "use_cases": ["Search", "Classification", "Q&A"]
                },
                "neural-chat": {
                    "name": "Neural Chat",
                    "size": "4.1 GB",
                    "speed": "Medium",
                    "quality": "High",
                    "use_cases": ["Conversational", "Friendly responses"]
                },
                "dolphin-mixtral": {
                    "name": "Dolphin Mixtral",
                    "size": "26 GB",
                    "speed": "Slow",
                    "quality": "Very High",
                    "use_cases": ["Complex tasks", "Coding", "Analysis"]
                }
            }
        }
        
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load model configuration from file"""
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading config: {e}")
                return self.default_config.copy()
        return self.default_config.copy()
    
    def _save_config(self) -> None:
        """Save model configuration to file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.config, f, indent=2)
        except Exception as e:
            print(f"Error saving config: {e}")
    
    def get_available_models(self) -> List[Dict[str, Any]]:
        """
        Get list of available models from Ollama
        
        Returns:
            List of model dictionaries with info
        """
        try:
            response = requests.get(
                f"{self.api_endpoint}/tags",
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                data = response.json()
                models = []
                
                if 'models' in data:
                    for model in data['models']:
                        model_name = model.get('name', 'unknown')
                        
                        model_info = {
                            'name': model_name,
                            'modified': model.get('modified_at'),
                            'profile': self.default_config['model_profiles'].get(
                                model_name, 
                                {
                                    'name': model_name,
                                    'size': 'Unknown',
                                    'speed': 'Unknown',
                                    'quality': 'Unknown',
                                    'use_cases': []
                                }
                            )
                        }
                        models.append(model_info)
                
                # Update config with available models
                self.config['available_models'] = [m['name'] for m in models]
                self._save_config()
                
                return models
            else:
                print(f"Error fetching models: {response.status_code}")
                return []
                
        except requests.RequestException as e:
            print(f"Connection error: {e}")
            return []
    
    def set_primary_model(self, model_name: str) -> bool:
        """
        Set the primary/default model
        
        Args:
            model_name: Name of model to use as primary
            
        Returns:
            True if successful, False otherwise
        """
        available = self.get_available_models()
        available_names = [m['name'] for m in available]
        
        if model_name in available_names:
            self.config['primary_model'] = model_name
            self.config['chat_model'] = model_name
            self._save_config()
            return True
        else:
            print(f"Model '{model_name}' not available")
            return False
    
    def set_model_for_task(self, task: str, model_name: str) -> bool:
        """
        Set specific model for a task
        
        Args:
            task: Task name (chat, summary, search, etc)
            model_name: Model to use for this task
            
        Returns:
            True if successful, False otherwise
        """
        available = self.get_available_models()
        available_names = [m['name'] for m in available]
        
        if model_name in available_names:
            task_key = f"{task}_model"
            self.config[task_key] = model_name
            self._save_config()
            return True
        else:
            print(f"Model '{model_name}' not available")
            return False
    
    def get_model_for_task(self, task: str) -> str:
        """
        Get the model configured for a specific task
        
        Args:
            task: Task name
            
        Returns:
            Model name to use for this task
        """
        task_key = f"{task}_model"
        return self.config.get(task_key, self.config['primary_model'])
    
    def query_model(
        self, 
        prompt: str, 
        model: Optional[str] = None,
        task: Optional[str] = None,
        stream: bool = False
    ) -> str:
        """
        Query a model with a prompt
        
        Args:
            prompt: The prompt to send
            model: Specific model to use (overrides task)
            task: Task name to use configured model for
            stream: Whether to stream response
            
        Returns:
            Model response
        """
        # Determine which model to use
        if model is None:
            if task:
                model = self.get_model_for_task(task)
            else:
                model = self.config['primary_model']
        
        try:
            response = requests.post(
                f"{self.api_endpoint}/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": stream
                },
                timeout=300  # Long timeout for large models
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('response', '')
            else:
                return f"Error: {response.status_code}"
                
        except requests.RequestException as e:
            return f"Connection error: {e}"
    
    def query_model_streaming(
        self,
        prompt: str,
        model: Optional[str] = None,
        task: Optional[str] = None
    ):
        """
        Query a model with streaming response
        
        Args:
            prompt: The prompt to send
            model: Specific model to use
            task: Task name
            
        Yields:
            Response chunks
        """
        # Determine which model to use
        if model is None:
            if task:
                model = self.get_model_for_task(task)
            else:
                model = self.config['primary_model']
        
        try:
            response = requests.post(
                f"{self.api_endpoint}/generate",
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": True
                },
                stream=True,
                timeout=300
            )
            
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            yield data.get('response', '')
                        except json.JSONDecodeError:
                            continue
            else:
                yield f"Error: {response.status_code}"
                
        except requests.RequestException as e:
            yield f"Connection error: {e}"
    
    def get_model_info(self, model_name: str) -> Dict[str, Any]:
        """
        Get detailed info about a model
        
        Args:
            model_name: Model name
            
        Returns:
            Model information dictionary
        """
        return self.default_config['model_profiles'].get(
            model_name,
            {
                'name': model_name,
                'size': 'Unknown',
                'speed': 'Unknown',
                'quality': 'Unknown',
                'use_cases': []
            }
        )
    
    def list_models_by_use_case(self, use_case: str) -> List[str]:
        """
        Get models suitable for a specific use case
        
        Args:
            use_case: Use case to search for
            
        Returns:
            List of suitable model names
        """
        suitable = []
        for model_name, profile in self.default_config['model_profiles'].items():
            if use_case.lower() in [uc.lower() for uc in profile.get('use_cases', [])]:
                suitable.append(model_name)
        return suitable
    
    def pull_model(self, model_name: str) -> bool:
        """
        Pull a new model from Ollama
        
        Args:
            model_name: Model to pull
            
        Returns:
            True if successful
        """
        print(f"Pulling model: {model_name}")
        print("This may take several minutes...")
        
        try:
            response = requests.post(
                f"{self.api_endpoint}/pull",
                json={"name": model_name},
                timeout=3600  # 1 hour timeout for download
            )
            
            if response.status_code == 200:
                print(f"Successfully pulled {model_name}")
                return True
            else:
                print(f"Error pulling model: {response.status_code}")
                return False
                
        except requests.RequestException as e:
            print(f"Connection error: {e}")
            return False
    
    def get_config(self) -> Dict[str, Any]:
        """Get current configuration"""
        return self.config.copy()
    
    def reset_config(self) -> None:
        """Reset to default configuration"""
        self.config = self.default_config.copy()
        self._save_config()


# Example usage and tool functions
def create_summary_tool(llm_manager: LLMModelManager, text: str) -> str:
    """
    Create a summary of text using a lightweight model
    
    Args:
        llm_manager: LLM manager instance
        text: Text to summarize
        
    Returns:
        Summary
    """
    prompt = f"""Please provide a concise summary of the following text:

{text}

Summary:"""
    
    return llm_manager.query_model(
        prompt,
        task="summary"
    )


def create_search_tool(llm_manager: LLMModelManager, query: str, documents: List[str]) -> str:
    """
    Search through documents using a model
    
    Args:
        llm_manager: LLM manager instance
        query: Search query
        documents: List of documents to search
        
    Returns:
        Relevant results
    """
    prompt = f"""Search through these documents for information related to: {query}

Documents:
{chr(10).join(documents)}

Relevant information:"""
    
    return llm_manager.query_model(
        prompt,
        task="search"
    )


def create_classification_tool(llm_manager: LLMModelManager, text: str, categories: List[str]) -> str:
    """
    Classify text into categories
    
    Args:
        llm_manager: LLM manager instance
        text: Text to classify
        categories: List of possible categories
        
    Returns:
        Classification result
    """
    prompt = f"""Classify the following text into one of these categories: {', '.join(categories)}

Text: {text}

Classification:"""
    
    return llm_manager.query_model(
        prompt,
        task="search"  # Use search model for classification
    )


def create_extraction_tool(llm_manager: LLMModelManager, text: str, fields: List[str]) -> Dict[str, str]:
    """
    Extract specific fields from text
    
    Args:
        llm_manager: LLM manager instance
        text: Text to extract from
        fields: Fields to extract
        
    Returns:
        Dictionary of extracted fields
    """
    prompt = f"""Extract the following fields from the text: {', '.join(fields)}

Text: {text}

Extracted information (format as JSON):"""
    
    response = llm_manager.query_model(
        prompt,
        task="summary"
    )
    
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {"raw_response": response}
