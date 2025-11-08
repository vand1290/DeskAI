"""
LLM Model Selection UI Component for DocuBrain
Provides GUI for users to select and manage models
"""
import customtkinter as ctk
from typing import Callable, Optional, List, Dict, Any
from llm_manager import LLMModelManager
import threading


class LLMModelSelector(ctk.CTkFrame):
    """Custom frame for LLM model selection and management"""
    
    def __init__(
        self, 
        master, 
        llm_manager: LLMModelManager,
        on_model_change: Optional[Callable] = None,
        **kwargs
    ):
        """
        Initialize model selector
        
        Args:
            master: Parent widget
            llm_manager: LLM manager instance
            on_model_change: Callback when model changes
            **kwargs: Additional arguments for CTkFrame
        """
        super().__init__(master, **kwargs)
        
        self.llm_manager = llm_manager
        self.on_model_change = on_model_change
        self.available_models = []
        self.loading = False
        
        # Create UI
        self._create_widgets()
        self._refresh_models()
    
    def _create_widgets(self):
        """Create UI widgets"""
        # Title
        title_label = ctk.CTkLabel(
            self,
            text="🤖 Model Selection",
            font=("Arial", 16, "bold")
        )
        title_label.pack(pady=10, padx=10)
        
        # Primary Model Section
        primary_frame = ctk.CTkFrame(self, fg_color="transparent")
        primary_frame.pack(fill="x", padx=10, pady=5)
        
        primary_label = ctk.CTkLabel(
            primary_frame,
            text="Primary Model:",
            font=("Arial", 12, "bold")
        )
        primary_label.pack(side="left", padx=5)
        
        self.primary_dropdown = ctk.CTkComboBox(
            primary_frame,
            values=["Loading..."],
            command=self._on_primary_model_change,
            state="disabled"
        )
        self.primary_dropdown.pack(side="left", fill="x", expand=True, padx=5)
        
        # Refresh button
        refresh_btn = ctk.CTkButton(
            primary_frame,
            text="🔄",
            width=40,
            command=self._refresh_models
        )
        refresh_btn.pack(side="right", padx=5)
        
        # Model Info Section
        info_frame = ctk.CTkFrame(self, fg_color="gray20")
        info_frame.pack(fill="x", padx=10, pady=5)
        
        self.info_label = ctk.CTkLabel(
            info_frame,
            text="Select a model to see details...",
            font=("Arial", 10),
            justify="left"
        )
        self.info_label.pack(fill="x", padx=10, pady=10)
        
        # Task-Specific Models Section
        task_label = ctk.CTkLabel(
            self,
            text="Optimize Models by Task",
            font=("Arial", 12, "bold")
        )
        task_label.pack(pady=10, padx=10)
        
        self.task_dropdowns = {}
        tasks = ["chat", "summary", "search"]
        
        for task in tasks:
            task_frame = ctk.CTkFrame(self, fg_color="transparent")
            task_frame.pack(fill="x", padx=10, pady=3)
            
            task_name_label = ctk.CTkLabel(
                task_frame,
                text=f"{task.capitalize()}:",
                width=100
            )
            task_name_label.pack(side="left", padx=5)
            
            dropdown = ctk.CTkComboBox(
                task_frame,
                values=["Loading..."],
                command=lambda val, t=task: self._on_task_model_change(t, val),
                state="disabled"
            )
            dropdown.pack(side="left", fill="x", expand=True, padx=5)
            
            self.task_dropdowns[task] = dropdown
        
        # Model Details Button
        details_btn = ctk.CTkButton(
            self,
            text="📊 View Model Details",
            command=self._show_model_details,
            fg_color="gray30"
        )
        details_btn.pack(fill="x", padx=10, pady=5)
        
        # Download New Model Button
        download_btn = ctk.CTkButton(
            self,
            text="⬇️  Download New Model",
            command=self._show_download_dialog,
            fg_color="gray30"
        )
        download_btn.pack(fill="x", padx=10, pady=5)
        
        # Status Label
        self.status_label = ctk.CTkLabel(
            self,
            text="Status: Ready",
            font=("Arial", 9),
            text_color="gray"
        )
        self.status_label.pack(pady=5)
    
    def _refresh_models(self):
        """Refresh available models in background"""
        if self.loading:
            return
        
        self.loading = True
        self.status_label.configure(text="Status: Refreshing...")
        
        def refresh_thread():
            try:
                models = self.llm_manager.get_available_models()
                self.available_models = [m['name'] for m in models]
                
                # Update dropdowns
                self.after(0, self._update_dropdowns)
                self.after(0, lambda: self.status_label.configure(
                    text=f"Status: {len(self.available_models)} models available"
                ))
            except Exception as e:
                self.after(0, lambda: self.status_label.configure(
                    text=f"Status: Error - {str(e)}"
                ))
            finally:
                self.loading = False
        
        thread = threading.Thread(target=refresh_thread, daemon=True)
        thread.start()
    
    def _update_dropdowns(self):
        """Update all dropdowns with available models"""
        if not self.available_models:
            self.available_models = ["No models found"]
        
        # Update primary dropdown
        self.primary_dropdown.configure(
            values=self.available_models,
            state="readonly"
        )
        current_primary = self.llm_manager.config.get('primary_model', 'llama3')
        if current_primary in self.available_models:
            self.primary_dropdown.set(current_primary)
        
        # Update task dropdowns
        for task, dropdown in self.task_dropdowns.items():
            dropdown.configure(
                values=self.available_models,
                state="readonly"
            )
            current_task_model = self.llm_manager.config.get(f"{task}_model", current_primary)
            if current_task_model in self.available_models:
                dropdown.set(current_task_model)
    
    def _on_primary_model_change(self, selected_model: str):
        """Handle primary model change"""
        if selected_model and selected_model != "No models found":
            self.llm_manager.set_primary_model(selected_model)
            self._update_model_info(selected_model)
            
            if self.on_model_change:
                self.on_model_change(selected_model)
    
    def _on_task_model_change(self, task: str, selected_model: str):
        """Handle task-specific model change"""
        if selected_model and selected_model != "No models found":
            self.llm_manager.set_model_for_task(task, selected_model)
            self.status_label.configure(text=f"Status: {task.capitalize()} model updated")
    
    def _update_model_info(self, model_name: str):
        """Update model info display"""
        info = self.llm_manager.get_model_info(model_name)
        
        info_text = f"""Model: {info.get('name', model_name)}
Size: {info.get('size', 'Unknown')}
Speed: {info.get('speed', 'Unknown')}
Quality: {info.get('quality', 'Unknown')}
Best for: {', '.join(info.get('use_cases', ['General use']))}"""
        
        self.info_label.configure(text=info_text)
    
    def _show_model_details(self):
        """Show detailed model information in a new window"""
        details_window = ctk.CTkToplevel(self)
        details_window.title("Model Details")
        details_window.geometry("600x500")
        
        # Title
        title = ctk.CTkLabel(
            details_window,
            text="Available Models",
            font=("Arial", 14, "bold")
        )
        title.pack(pady=10)
        
        # Scrollable frame for models
        scrollable_frame = ctk.CTkScrollableFrame(details_window)
        scrollable_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        models = self.llm_manager.get_available_models()
        for model in models:
            model_name = model['name']
            profile = model['profile']
            
            model_frame = ctk.CTkFrame(scrollable_frame, fg_color="gray20")
            model_frame.pack(fill="x", padx=5, pady=5)
            
            model_text = f"""
{profile['name']} ({model_name})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Size: {profile['size']} | Speed: {profile['speed']} | Quality: {profile['quality']}
Use cases: {', '.join(profile['use_cases'])}
            """
            
            label = ctk.CTkLabel(
                model_frame,
                text=model_text,
                justify="left",
                font=("Arial", 10)
            )
            label.pack(fill="x", padx=10, pady=10)
    
    def _show_download_dialog(self):
        """Show dialog to download new model"""
        dialog_window = ctk.CTkToplevel(self)
        dialog_window.title("Download Model")
        dialog_window.geometry("500x300")
        
        # Title
        title = ctk.CTkLabel(
            dialog_window,
            text="Download New Model",
            font=("Arial", 14, "bold")
        )
        title.pack(pady=10)
        
        # Info text
        info = ctk.CTkLabel(
            dialog_window,
            text="Popular lightweight models:\n• phi3:mini (2.0 GB) - Fast\n• neural-chat (4.1 GB) - Good\n• mistral (4.1 GB) - Versatile",
            font=("Arial", 10),
            justify="left"
        )
        info.pack(pady=10)
        
        # Input field
        input_label = ctk.CTkLabel(
            dialog_window,
            text="Model name (e.g., 'phi3:mini'):",
            font=("Arial", 11)
        )
        input_label.pack(padx=10, pady=5)
        
        input_entry = ctk.CTkEntry(dialog_window)
        input_entry.pack(fill="x", padx=10, pady=5)
        
        # Status
        status_label = ctk.CTkLabel(
            dialog_window,
            text="",
            font=("Arial", 9),
            text_color="gray"
        )
        status_label.pack(pady=5)
        
        def start_download():
            model_name = input_entry.get().strip()
            if not model_name:
                status_label.configure(text="Please enter a model name")
                return
            
            download_btn.configure(state="disabled")
            status_label.configure(text="Downloading... This may take several minutes")
            
            def download_thread():
                success = self.llm_manager.pull_model(model_name)
                self.after(0, self._refresh_models)
                
                if success:
                    self.after(0, lambda: status_label.configure(
                        text="✓ Download complete!"
                    ))
                    self.after(3000, dialog_window.destroy)
                else:
                    self.after(0, lambda: status_label.configure(
                        text="✗ Download failed"
                    ))
                    self.after(0, lambda: download_btn.configure(state="normal"))
            
            thread = threading.Thread(target=download_thread, daemon=True)
            thread.start()
        
        download_btn = ctk.CTkButton(
            dialog_window,
            text="Start Download",
            command=start_download
        )
        download_btn.pack(fill="x", padx=10, pady=10)
    
    def get_selected_model(self) -> str:
        """Get currently selected primary model"""
        return self.primary_dropdown.get()
