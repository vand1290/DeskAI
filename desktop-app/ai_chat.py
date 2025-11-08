"""
AI Chat integration via Router (preferred) or direct Ollama fallback.

Preferred flow:
- If ROUTER_URL is set (or reachable on http://localhost:8000), use router endpoints
    - /route for generation
    - /models for installed models
- Otherwise, fall back to direct Ollama (OLLAMA_URL env or default http://localhost:11434)
"""
import os
import requests
import json
from typing import Optional, List


class AIChat:
    """Handle AI chat using Router if available, otherwise direct Ollama."""

    def __init__(self, ollama_url: Optional[str] = None, router_url: Optional[str] = None):
        # Configurable endpoints via env
        self.router_url = router_url or os.getenv("ROUTER_URL", "http://localhost:8000")
        self.ollama_url = ollama_url or os.getenv("OLLAMA_URL", "http://localhost:11434")
        self.api_url = f"{self.ollama_url}/api/generate"
        
    def query(self, question: str, model: str, database, use_context: bool = True) -> str:
        """Query AI with optional document context"""
        
        # Build prompt with context
        if use_context:
            context = database.get_context_for_query(limit=3, max_chars=800)
            if context:
                prompt = f"""You are a helpful AI assistant. Answer based on these documents:

{context}

Question: {question}

Answer briefly and directly:"""
            else:
                prompt = f"You are a helpful AI assistant.\n\nQuestion: {question}\n\nAnswer:"
        else:
            prompt = question
            
        # Model-specific settings
        if model == "tinyllama":
            max_tokens = 100
            timeout = 300
        else:
            max_tokens = 150
            timeout = 600
            
        # Try router first
        try:
            resp = requests.get(f"{self.router_url}/health", timeout=2)
            if resp.ok:
                try:
                    r = requests.get(
                        f"{self.router_url}/route",
                        params={"prompt": prompt},
                        timeout=timeout,
                    )
                    if r.status_code == 200:
                        data = r.json()
                        # Router typically returns full JSON from ollama /api/generate
                        return data.get("response") or data.get("message") or json.dumps(data)[:1000]
                    return f"Router error: {r.status_code} - {r.text[:300]}"
                except requests.exceptions.Timeout:
                    return "Router request timed out. Try a faster model like 'tinyllama'."
        except Exception:
            # Router not reachable; fall back to direct Ollama
            pass

        # Fall back to direct Ollama
        try:
            response = requests.post(
                self.api_url,
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "num_predict": max_tokens,
                        "temperature": 0.7
                    }
                },
                timeout=timeout
            )

            if response.status_code == 200:
                result = response.json()
                return result.get('response', 'No response')
            else:
                return f"Error: {response.status_code} - {response.text}"

        except requests.exceptions.Timeout:
            return "Request timed out. Try a faster model like 'tinyllama'."
        except Exception as e:
            return f"Error: {str(e)}"
            
    def get_available_models(self) -> List[str]:
        """Get list of available models via router, fallback to direct Ollama."""
        # Try router
        try:
            resp = requests.get(f"{self.router_url}/models", timeout=3)
            if resp.ok:
                data = resp.json()
                return [m.get('name') for m in data.get('models', []) if m.get('name')]
        except Exception:
            pass

        # Fallback: direct Ollama
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if response.status_code == 200:
                data = response.json()
                return [model['name'] for model in data.get('models', [])]
            return []
        except Exception as e:
            print(f"Error fetching models: {e}")
            return ["tinyllama", "phi3:mini", "llama3.2:3b"]
            
    def test_connection(self) -> bool:
        """Test connection to Ollama"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
