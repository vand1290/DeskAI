"""
DocuBrain Desktop Application
Native Windows/Linux/macOS app with full filesystem access
"""
import customtkinter as ctk
from tkinter import filedialog, messagebox
import os
import sys
from pathlib import Path
import threading
from typing import Optional, List
import json
import subprocess
import platform
import time

# Import our modules
from database import Database
from document_processor import DocumentProcessor
from ai_chat import AIChat
from llm_manager import LLMModelManager
from llm_model_selector_ui import LLMModelSelector


def ensure_router_running():
    """Ensure the router service is running in the background"""
    try:
        # Check if router is already running
        if platform.system() == "Windows":
            result = subprocess.run(
                ["tasklist", "/FI", "IMAGENAME eq DocuBrainRouter.exe"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if "DocuBrainRouter.exe" not in result.stdout:
                # Router not running, start it
                router_path = os.path.join(os.path.dirname(__file__), "..", "router", "dist", "DocuBrainRouter.exe")
                if not os.path.exists(router_path):
                    # Try Program Files location (after installation)
                    router_path = os.path.join(os.environ.get("ProgramFiles", "C:\\Program Files"), "DocuBrain", "DocuBrainRouter.exe")
                
                if os.path.exists(router_path):
                    # Start router in background, minimized
                    subprocess.Popen(
                        [router_path, "--host", "0.0.0.0", "--port", "8000"],
                        stdout=subprocess.DEVNULL,
                        stderr=subprocess.DEVNULL,
                        creationflags=subprocess.CREATE_NO_WINDOW
                    )
                    time.sleep(2)  # Give router time to start
        else:
            # For Linux/Mac, check if process exists
            result = subprocess.run(
                ["pgrep", "-f", "DocuBrainRouter"],
                capture_output=True,
                timeout=5
            )
            if result.returncode != 0:
                # Start router if not running
                router_path = os.path.join(os.path.dirname(__file__), "..", "router", "dist", "DocuBrainRouter")
                if os.path.exists(router_path):
                    subprocess.Popen([router_path, "--host", "0.0.0.0", "--port", "8000"])
                    time.sleep(2)
    except Exception as e:
        # Silently fail - router might already be running or not installed
        pass

class DocuBrainApp(ctk.CTk):
    """Main application window"""
    
    def __init__(self):
        super().__init__()
        
        # Ensure router is running before UI loads
        ensure_router_running()
        
        # Configure window
        self.title("DocuBrain - Document Intelligence")
        self.geometry("1400x900")
        self.minsize(1200, 700)
        
        # Set theme - Dark blue professional theme
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")
        
        # Custom colors inspired by DeskAI
        self.colors = {
            'bg_dark': '#0a0e27',           # Dark blue background
            'bg_medium': '#1a1f3a',         # Medium blue
            'bg_card': '#232946',           # Card background
            'accent_cyan': '#2dd4bf',       # Cyan accent
            'accent_purple': '#a855f7',     # Purple accent
            'accent_blue': '#3b82f6',       # Blue accent
            'text_primary': '#ffffff',      # White text
            'text_secondary': '#94a3b8',    # Gray text
            'success': '#10b981',           # Green
            'error': '#ef4444'              # Red
        }
        
        # Initialize components
        self.db = Database()
        self.doc_processor = DocumentProcessor(self.db)
        self.ai_chat = AIChat()
        self.llm_manager = LLMModelManager()  # Initialize LLM model manager
        
        # Create UI
        self.create_layout()
        self.load_documents()
        
        # Setup drag and drop
        self.setup_drag_drop()
        
    def create_layout(self):
        """Create the main UI layout"""
        
        # Configure window colors
        self.configure(fg_color=self.colors['bg_dark'])
        
        # Configure grid
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)
        
        # Sidebar with gradient effect
        self.sidebar = ctk.CTkFrame(
            self, 
            width=280, 
            corner_radius=0,
            fg_color=self.colors['bg_medium'],
            border_width=0
        )
        self.sidebar.grid(row=0, column=0, rowspan=2, sticky="nsew")
        self.sidebar.grid_rowconfigure(7, weight=1)
        
        # Logo with subtitle
        logo_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        logo_frame.grid(row=0, column=0, padx=20, pady=(30, 10), sticky="ew")
        
        self.logo_label = ctk.CTkLabel(
            logo_frame, 
            text="🧠 DocuBrain", 
            font=ctk.CTkFont(size=28, weight="bold"),
            text_color=self.colors['text_primary']
        )
        self.logo_label.pack(anchor="w")
        
        self.subtitle_label = ctk.CTkLabel(
            logo_frame,
            text="Document Intelligence",
            font=ctk.CTkFont(size=12),
            text_color=self.colors['text_secondary']
        )
        self.subtitle_label.pack(anchor="w", pady=(2, 0))
        
        # Navigation buttons with modern styling
        nav_buttons = [
            ("📁", "Browse Folder", self.browse_folder, self.colors['accent_cyan'], 1),
            ("📄", "Import Files", self.import_files, self.colors['accent_blue'], 2),
            ("🔄", "Refresh", self.load_documents, self.colors['accent_purple'], 3),
            ("⚙️", "Settings", self.open_settings, self.colors['text_secondary'], 4)
        ]
        
        for icon, text, command, color, row in nav_buttons:
            btn_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
            btn_frame.grid(row=row, column=0, padx=20, pady=8, sticky="ew")
            
            # Different styling for first 3 buttons vs settings
            if row <= 3:
                btn = ctk.CTkButton(
                    btn_frame,
                    text=f"{icon}  {text}",
                    command=command,
                    height=45,
                    corner_radius=10,
                    font=ctk.CTkFont(size=14, weight="bold"),
                    fg_color=self.colors['bg_card'],
                    hover_color=color,
                    border_width=2,
                    border_color=color,
                    anchor="w",
                    text_color=self.colors['text_primary']
                )
            else:
                btn = ctk.CTkButton(
                    btn_frame,
                    text=f"{icon}  {text}",
                    command=command,
                    height=45,
                    corner_radius=10,
                    font=ctk.CTkFont(size=14, weight="bold"),
                    fg_color=self.colors['bg_card'],
                    hover_color=self.colors['accent_blue'],
                    anchor="w",
                    text_color=self.colors['text_primary']
                )
            btn.pack(fill="x")
        
        # Stats card with gradient
        self.stats_frame = ctk.CTkFrame(
            self.sidebar,
            fg_color=self.colors['bg_card'],
            corner_radius=15,
            border_width=1,
            border_color=self.colors['accent_blue']
        )
        self.stats_frame.grid(row=5, column=0, padx=20, pady=20, sticky="ew")
        
        self.stats_label = ctk.CTkLabel(
            self.stats_frame,
            text="📊 Library Stats",
            font=ctk.CTkFont(size=15, weight="bold"),
            text_color=self.colors['text_primary']
        )
        self.stats_label.pack(pady=(15, 5))
        
        self.doc_count_label = ctk.CTkLabel(
            self.stats_frame,
            text="Documents: 0",
            font=ctk.CTkFont(size=13),
            text_color=self.colors['text_secondary']
        )
        self.doc_count_label.pack(pady=(0, 15))
        
        # LLM Model Selector
        self.model_selector = LLMModelSelector(
            self.sidebar,
            self.llm_manager,
            on_model_change=self.on_model_changed,
            fg_color=self.colors['bg_medium'],
            corner_radius=10
        )
        self.model_selector.grid(row=6, column=0, padx=15, pady=10, sticky="ew")
        
        # Version/info label at bottom
        self.info_label = ctk.CTkLabel(
            self.sidebar,
            text="v1.0.0 • Native Desktop",
            font=ctk.CTkFont(size=10),
            text_color=self.colors['text_secondary']
        )
        self.info_label.grid(row=8, column=0, padx=20, pady=(0, 20))
        
        # Main content area - Tabview with modern styling
        self.tabview = ctk.CTkTabview(
            self,
            width=250,
            fg_color=self.colors['bg_dark'],
            segmented_button_fg_color=self.colors['bg_medium'],
            segmented_button_selected_color=self.colors['accent_blue'],
            segmented_button_selected_hover_color=self.colors['accent_cyan'],
            corner_radius=15
        )
        self.tabview.grid(row=0, column=1, padx=20, pady=20, sticky="nsew")
        
        # Add tabs with icons
        self.tabview.add("📚 Documents")
        self.tabview.add("💬 AI Chat")
        self.tabview.add("📊 Analytics")
        
        # Documents tab
        self.setup_documents_tab()
        
        # AI Chat tab
        self.setup_chat_tab()
        
        # Analytics tab (new)
        self.setup_analytics_tab()
        
        # Status bar with modern styling
        status_frame = ctk.CTkFrame(
            self,
            fg_color=self.colors['bg_medium'],
            corner_radius=10,
            height=40
        )
        status_frame.grid(row=1, column=1, padx=20, pady=(0, 20), sticky="ew")
        
        self.status_bar = ctk.CTkLabel(
            status_frame,
            text="🟢 Ready",
            anchor="w",
            font=ctk.CTkFont(size=12),
            text_color=self.colors['text_secondary'],
            padx=15
        )
        self.status_bar.pack(fill="both", expand=True)
        
    def setup_documents_tab(self):
        """Setup the documents library tab"""
        tab = self.tabview.tab("📚 Documents")
        tab.configure(fg_color=self.colors['bg_dark'])
        
        # Header with title and actions
        header = ctk.CTkFrame(tab, fg_color="transparent")
        header.pack(fill="x", padx=15, pady=(15, 10))
        
        title_label = ctk.CTkLabel(
            header,
            text="Document Library",
            font=ctk.CTkFont(size=24, weight="bold"),
            text_color=self.colors['text_primary']
        )
        title_label.pack(side="left")
        
        # Search bar with modern styling
        self.search_frame = ctk.CTkFrame(
            tab,
            fg_color=self.colors['bg_medium'],
            corner_radius=12
        )
        self.search_frame.pack(fill="x", padx=15, pady=(0, 15))
        
        self.search_entry = ctk.CTkEntry(
            self.search_frame,
            placeholder_text="🔍 Search documents...",
            height=45,
            font=ctk.CTkFont(size=13),
            fg_color=self.colors['bg_card'],
            border_width=0,
            text_color=self.colors['text_primary']
        )
        self.search_entry.pack(side="left", fill="x", expand=True, padx=15, pady=10)
        self.search_entry.bind("<KeyRelease>", self.on_search)
        
        self.btn_clear_search = ctk.CTkButton(
            self.search_frame,
            text="Clear",
            width=90,
            height=35,
            corner_radius=8,
            fg_color=self.colors['accent_purple'],
            hover_color=self.colors['accent_cyan'],
            command=self.clear_search
        )
        self.btn_clear_search.pack(side="right", padx=(0, 15))
        
        # Documents scrollable frame with grid layout
        self.docs_scroll = ctk.CTkScrollableFrame(
            tab,
            fg_color=self.colors['bg_dark']
        )
        self.docs_scroll.pack(fill="both", expand=True, padx=15, pady=(0, 15))
        
    def setup_chat_tab(self):
        """Setup the AI chat tab"""
        tab = self.tabview.tab("💬 AI Chat")
        tab.configure(fg_color=self.colors['bg_dark'])
        
        # Header
        header = ctk.CTkFrame(tab, fg_color="transparent")
        header.pack(fill="x", padx=15, pady=(15, 10))
        
        title_label = ctk.CTkLabel(
            header,
            text="AI Assistant",
            font=ctk.CTkFont(size=24, weight="bold"),
            text_color=self.colors['text_primary']
        )
        title_label.pack(side="left")
        
        # Model selector with colorful cards
        self.model_frame = ctk.CTkFrame(
            tab,
            fg_color=self.colors['bg_medium'],
            corner_radius=15
        )
        self.model_frame.pack(fill="x", padx=15, pady=(0, 15))
        
        # Model label and selector
        model_inner = ctk.CTkFrame(self.model_frame, fg_color="transparent")
        model_inner.pack(fill="x", padx=15, pady=12)
        
        ctk.CTkLabel(
            model_inner,
            text="🤖 Model:",
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color=self.colors['text_primary']
        ).pack(side="left", padx=(0, 10))
        
        self.model_selector = ctk.CTkComboBox(
            model_inner,
            values=["tinyllama", "phi3:mini", "llama3.2:3b"],
            width=180,
            height=35,
            corner_radius=8,
            fg_color=self.colors['bg_card'],
            button_color=self.colors['accent_cyan'],
            button_hover_color=self.colors['accent_blue'],
            dropdown_fg_color=self.colors['bg_card']
        )
        self.model_selector.pack(side="left", padx=5)
        self.model_selector.set("tinyllama")
        
        self.btn_refresh_models = ctk.CTkButton(
            model_inner,
            text="🔄 Refresh",
            width=100,
            height=35,
            corner_radius=8,
            fg_color=self.colors['accent_purple'],
            hover_color=self.colors['accent_cyan'],
            command=self.refresh_models
        )
        self.btn_refresh_models.pack(side="left", padx=5)
        
        # Chat display with modern styling
        self.chat_display = ctk.CTkTextbox(
            tab,
            state="disabled",
            fg_color=self.colors['bg_medium'],
            corner_radius=15,
            font=ctk.CTkFont(size=13),
            text_color=self.colors['text_primary']
        )
        self.chat_display.pack(fill="both", expand=True, padx=15, pady=(0, 15))
        
        # Input area with gradient
        self.input_frame = ctk.CTkFrame(
            tab,
            fg_color=self.colors['bg_medium'],
            corner_radius=15
        )
        self.input_frame.pack(fill="x", padx=15, pady=(0, 15))
        
        input_inner = ctk.CTkFrame(self.input_frame, fg_color="transparent")
        input_inner.pack(fill="x", padx=15, pady=12)
        
        self.chat_input = ctk.CTkEntry(
            input_inner,
            placeholder_text="💭 Ask a question about your documents...",
            height=45,
            font=ctk.CTkFont(size=13),
            fg_color=self.colors['bg_card'],
            border_width=0,
            text_color=self.colors['text_primary']
        )
        self.chat_input.pack(side="left", fill="x", expand=True, padx=(0, 10))
        self.chat_input.bind("<Return>", lambda e: self.send_message())
        
        self.btn_send = ctk.CTkButton(
            input_inner,
            text="Send ➤",
            width=120,
            height=45,
            corner_radius=10,
            font=ctk.CTkFont(size=14, weight="bold"),
            fg_color=self.colors['accent_cyan'],
            hover_color=self.colors['accent_blue'],
            command=self.send_message
        )
        self.btn_send.pack(side="right")
        
    def setup_analytics_tab(self):
        """Setup the analytics/stats tab"""
        tab = self.tabview.tab("📊 Analytics")
        tab.configure(fg_color=self.colors['bg_dark'])
        
        # Header
        header = ctk.CTkFrame(tab, fg_color="transparent")
        header.pack(fill="x", padx=15, pady=(15, 20))
        
        title_label = ctk.CTkLabel(
            header,
            text="Library Analytics",
            font=ctk.CTkFont(size=24, weight="bold"),
            text_color=self.colors['text_primary']
        )
        title_label.pack(side="left")
        
        # Colorful stat cards (like DeskAI mode cards)
        cards_frame = ctk.CTkFrame(tab, fg_color="transparent")
        cards_frame.pack(fill="x", padx=15, pady=(0, 20))
        
        # Card 1: Total Documents (Cyan)
        card1 = ctk.CTkFrame(
            cards_frame,
            fg_color=self.colors['accent_cyan'],
            corner_radius=20,
            width=200,
            height=150
        )
        card1.pack(side="left", padx=(0, 15), fill="both", expand=True)
        
        ctk.CTkLabel(
            card1,
            text="📚",
            font=ctk.CTkFont(size=40)
        ).pack(pady=(20, 5))
        
        ctk.CTkLabel(
            card1,
            text="Total Documents",
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="white"
        ).pack()
        
        self.analytics_doc_count = ctk.CTkLabel(
            card1,
            text="0",
            font=ctk.CTkFont(size=32, weight="bold"),
            text_color="white"
        )
        self.analytics_doc_count.pack(pady=(5, 20))
        
        # Card 2: AI Queries (Purple)
        card2 = ctk.CTkFrame(
            cards_frame,
            fg_color=self.colors['accent_purple'],
            corner_radius=20,
            width=200,
            height=150
        )
        card2.pack(side="left", padx=(0, 15), fill="both", expand=True)
        
        ctk.CTkLabel(
            card2,
            text="💬",
            font=ctk.CTkFont(size=40)
        ).pack(pady=(20, 5))
        
        ctk.CTkLabel(
            card2,
            text="AI Queries Today",
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="white"
        ).pack()
        
        ctk.CTkLabel(
            card2,
            text="0",
            font=ctk.CTkFont(size=32, weight="bold"),
            text_color="white"
        ).pack(pady=(5, 20))
        
        # Card 3: Storage Used (Blue)
        card3 = ctk.CTkFrame(
            cards_frame,
            fg_color=self.colors['accent_blue'],
            corner_radius=20,
            width=200,
            height=150
        )
        card3.pack(side="left", fill="both", expand=True)
        
        ctk.CTkLabel(
            card3,
            text="💾",
            font=ctk.CTkFont(size=40)
        ).pack(pady=(20, 5))
        
        ctk.CTkLabel(
            card3,
            text="Storage Used",
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="white"
        ).pack()
        
        ctk.CTkLabel(
            card3,
            text="0 MB",
            font=ctk.CTkFont(size=32, weight="bold"),
            text_color="white"
        ).pack(pady=(5, 20))
        
        # Recent activity section
        activity_header = ctk.CTkLabel(
            tab,
            text="Recent Activity",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['text_primary'],
            anchor="w"
        )
        activity_header.pack(fill="x", padx=15, pady=(0, 10))
        
        self.activity_scroll = ctk.CTkScrollableFrame(
            tab,
            fg_color=self.colors['bg_medium'],
            corner_radius=15
        )
        self.activity_scroll.pack(fill="both", expand=True, padx=15, pady=(0, 15))
        
        # Placeholder activity
        ctk.CTkLabel(
            self.activity_scroll,
            text="No recent activity",
            font=ctk.CTkFont(size=13),
            text_color=self.colors['text_secondary']
        ).pack(pady=40)
        
    def setup_drag_drop(self):
        """Setup drag and drop functionality"""
        # Note: tkinterdnd2 would be needed for full drag-drop
        # For now, we'll use the browse button
        pass
        
    def browse_folder(self):
        """Open folder browser dialog"""
        folder_path = filedialog.askdirectory(
            title="Select Folder to Import",
            initialdir=os.path.expanduser("~")
        )
        
        if folder_path:
            self.import_folder(folder_path)
            
    def import_folder(self, folder_path: str):
        """Import all documents from a folder"""
        self.update_status(f"Scanning folder: {folder_path}")
        
        # Run import in background thread
        thread = threading.Thread(
            target=self._import_folder_thread,
            args=(folder_path,),
            daemon=True
        )
        thread.start()
        
    def _import_folder_thread(self, folder_path: str):
        """Background thread for folder import"""
        try:
            # Find all supported files
            supported_extensions = ['.pdf', '.txt', '.docx', '.pptx', '.xlsx', '.csv', '.md']
            files_found = []
            
            for root, dirs, files in os.walk(folder_path):
                for file in files:
                    if any(file.lower().endswith(ext) for ext in supported_extensions):
                        files_found.append(os.path.join(root, file))
            
            if not files_found:
                self.after(0, lambda: messagebox.showinfo(
                    "No Files",
                    f"No supported documents found in:\n{folder_path}"
                ))
                self.update_status("Ready")
                return
            
            # Process each file
            total = len(files_found)
            for idx, file_path in enumerate(files_found, 1):
                self.update_status(f"Processing {idx}/{total}: {os.path.basename(file_path)}")
                
                try:
                    self.doc_processor.process_document(file_path)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
            
            # Refresh UI
            self.after(0, self.load_documents)
            self.update_status(f"✅ Imported {total} documents")
            
            # Show success message
            self.after(0, lambda: messagebox.showinfo(
                "Import Complete",
                f"Successfully imported {total} documents!"
            ))
            
        except Exception as e:
            self.after(0, lambda: messagebox.showerror(
                "Import Error",
                f"Error during import:\n{str(e)}"
            ))
            self.update_status("Ready")
            
    def import_files(self):
        """Import individual files"""
        file_paths = filedialog.askopenfilenames(
            title="Select Documents to Import",
            filetypes=[
                ("All Documents", "*.pdf *.txt *.docx *.pptx *.xlsx *.csv *.md"),
                ("PDF Files", "*.pdf"),
                ("Text Files", "*.txt"),
                ("Word Documents", "*.docx"),
                ("PowerPoint", "*.pptx"),
                ("Excel", "*.xlsx"),
                ("CSV Files", "*.csv"),
                ("Markdown", "*.md")
            ]
        )
        
        if file_paths:
            thread = threading.Thread(
                target=self._import_files_thread,
                args=(file_paths,),
                daemon=True
            )
            thread.start()
            
    def _import_files_thread(self, file_paths: tuple):
        """Background thread for file import"""
        total = len(file_paths)
        for idx, file_path in enumerate(file_paths, 1):
            self.update_status(f"Processing {idx}/{total}: {os.path.basename(file_path)}")
            try:
                self.doc_processor.process_document(file_path)
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
        
        self.after(0, self.load_documents)
        self.update_status(f"✅ Imported {total} files")
        
    def load_documents(self):
        """Load and display documents from database"""
        # Clear current display
        for widget in self.docs_scroll.winfo_children():
            widget.destroy()
        
        # Get documents from database
        documents = self.db.get_all_documents()
        
        # Update stats
        self.doc_count_label.configure(text=f"Documents: {len(documents)}")
        if hasattr(self, 'analytics_doc_count'):
            self.analytics_doc_count.configure(text=str(len(documents)))
        
        # Display documents
        if documents:
            for doc in documents:
                self.create_document_card(doc)
            self.update_status(f"🟢 Loaded {len(documents)} documents")
        else:
            no_docs_frame = ctk.CTkFrame(
                self.docs_scroll,
                fg_color=self.colors['bg_medium'],
                corner_radius=20
            )
            no_docs_frame.pack(pady=100, padx=50, fill="both", expand=True)
            
            ctk.CTkLabel(
                no_docs_frame,
                text="📂",
                font=ctk.CTkFont(size=64)
            ).pack(pady=(40, 10))
            
            ctk.CTkLabel(
                no_docs_frame,
                text="No documents yet",
                font=ctk.CTkFont(size=20, weight="bold"),
                text_color=self.colors['text_primary']
            ).pack(pady=(0, 5))
            
            ctk.CTkLabel(
                no_docs_frame,
                text="Click 'Browse Folder' or 'Import Files' to get started",
                font=ctk.CTkFont(size=14),
                text_color=self.colors['text_secondary']
            ).pack(pady=(0, 40))
            
            self.update_status("🟡 No documents in library")
            
    def create_document_card(self, doc: dict):
        """Create a modern card widget for a document"""
        card = ctk.CTkFrame(
            self.docs_scroll,
            fg_color=self.colors['bg_medium'],
            corner_radius=15,
            border_width=2,
            border_color=self.colors['bg_card']
        )
        card.pack(fill="x", padx=5, pady=8)
        
        # Hover effect
        def on_enter(e):
            card.configure(border_color=self.colors['accent_cyan'])
        def on_leave(e):
            card.configure(border_color=self.colors['bg_card'])
        
        card.bind("<Enter>", on_enter)
        card.bind("<Leave>", on_leave)
        
        # Document icon based on type with gradient colors
        ext = os.path.splitext(doc['filename'])[1].lower()
        icon_map = {
            '.pdf': ('📕', self.colors['accent_cyan']),
            '.txt': ('📄', self.colors['text_secondary']),
            '.docx': ('📘', self.colors['accent_blue']),
            '.pptx': ('📊', self.colors['accent_purple']),
            '.xlsx': ('📗', self.colors['success']),
            '.csv': ('📋', self.colors['accent_cyan']),
            '.md': ('📝', self.colors['text_primary'])
        }
        icon, icon_color = icon_map.get(ext, ('📄', self.colors['text_secondary']))
        
        # Header with icon and title
        header_frame = ctk.CTkFrame(card, fg_color="transparent")
        header_frame.pack(fill="x", padx=15, pady=(15, 5))
        
        icon_label = ctk.CTkLabel(
            header_frame,
            text=icon,
            font=ctk.CTkFont(size=28),
            width=40
        )
        icon_label.pack(side="left", padx=(0, 10))
        
        title_frame = ctk.CTkFrame(header_frame, fg_color="transparent")
        title_frame.pack(side="left", fill="x", expand=True)
        
        title_label = ctk.CTkLabel(
            title_frame,
            text=doc['filename'],
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w",
            text_color=self.colors['text_primary']
        )
        title_label.pack(fill="x", anchor="w")
        
        # Path with smaller font
        path_label = ctk.CTkLabel(
            title_frame,
            text=f"📁 {doc['file_path'][:60]}..." if len(doc['file_path']) > 60 else f"📁 {doc['file_path']}",
            font=ctk.CTkFont(size=10),
            text_color=self.colors['text_secondary'],
            anchor="w"
        )
        path_label.pack(fill="x", anchor="w", pady=(2, 0))
        
        # Stats row
        stats_frame = ctk.CTkFrame(card, fg_color="transparent")
        stats_frame.pack(fill="x", padx=15, pady=(10, 5))
        
        date_label = ctk.CTkLabel(
            stats_frame,
            text=f"📅 {doc['upload_date']}",
            font=ctk.CTkFont(size=10),
            text_color=self.colors['text_secondary']
        )
        date_label.pack(side="left", padx=(0, 15))
        
        size_label = ctk.CTkLabel(
            stats_frame,
            text=f"📏 {doc.get('file_size', 'N/A')}",
            font=ctk.CTkFont(size=10),
            text_color=self.colors['text_secondary']
        )
        size_label.pack(side="left")
        
        # Action buttons
        btn_frame = ctk.CTkFrame(card, fg_color="transparent")
        btn_frame.pack(fill="x", padx=15, pady=(5, 15))
        
        btn_open = ctk.CTkButton(
            btn_frame,
            text="Open",
            width=90,
            height=32,
            corner_radius=8,
            fg_color=self.colors['accent_blue'],
            hover_color=self.colors['accent_cyan'],
            font=ctk.CTkFont(size=12, weight="bold"),
            command=lambda: self.open_document(doc)
        )
        btn_open.pack(side="left", padx=(0, 8))
        
        btn_chat = ctk.CTkButton(
            btn_frame,
            text="💬 Chat",
            width=90,
            height=32,
            corner_radius=8,
            fg_color=self.colors['accent_purple'],
            hover_color=self.colors['accent_blue'],
            font=ctk.CTkFont(size=12, weight="bold"),
            command=lambda: self.chat_about_document(doc)
        )
        btn_chat.pack(side="left", padx=(0, 8))
        
        btn_delete = ctk.CTkButton(
            btn_frame,
            text="Delete",
            width=80,
            height=32,
            corner_radius=8,
            fg_color=self.colors['error'],
            hover_color="#dc2626",
            font=ctk.CTkFont(size=12, weight="bold"),
            command=lambda: self.delete_document(doc)
        )
        btn_delete.pack(side="right")
        
    def open_document(self, doc: dict):
        """Open document with system default application"""
        file_path = doc['file_path']
        if os.path.exists(file_path):
            os.startfile(file_path) if sys.platform == 'win32' else os.system(f'open "{file_path}"')
            self.update_status(f"🟢 Opened: {doc['filename']}")
        else:
            messagebox.showerror("File Not Found", f"Cannot find:\n{file_path}")
            self.update_status("🔴 Error: File not found")
            
    def chat_about_document(self, doc: dict):
        """Switch to chat tab and prepare to chat about this document"""
        self.tabview.set("💬 AI Chat")
        self.chat_input.delete(0, 'end')
        self.chat_input.insert(0, f"Tell me about {doc['filename']}")
        self.chat_input.focus()
        self.update_status(f"🟢 Ready to chat about: {doc['filename']}")
            
    def delete_document(self, doc: dict):
        """Delete document from library"""
        if messagebox.askyesno("Confirm Delete", f"Delete document:\n{doc['filename']}?"):
            self.db.delete_document(doc['id'])
            self.load_documents()
            self.update_status(f"🗑️ Deleted: {doc['filename']}")
            
    def on_search(self, event):
        """Handle search input"""
        query = self.search_entry.get()
        # TODO: Implement search filtering
        pass
        
    def clear_search(self):
        """Clear search and show all documents"""
        self.search_entry.delete(0, 'end')
        self.load_documents()
        
    def send_message(self):
        """Send message to AI"""
        message = self.chat_input.get().strip()
        if not message:
            return
        
        # Clear input
        self.chat_input.delete(0, 'end')
        
        # Display user message
        self.append_chat_message(f"You: {message}\n\n", "user")
        
        # Get AI response in background
        thread = threading.Thread(
            target=self._get_ai_response,
            args=(message,),
            daemon=True
        )
        thread.start()
        
    def _get_ai_response(self, message: str):
        """Get AI response in background thread"""
        self.update_status("🤖 Thinking...")
        
        try:
            model = self.model_selector.get()
            response = self.ai_chat.query(message, model, self.db)
            
            self.after(0, lambda: self.append_chat_message(f"AI: {response}\n\n", "assistant"))
            self.update_status("Ready")
            
        except Exception as e:
            self.after(0, lambda: self.append_chat_message(f"Error: {str(e)}\n\n", "error"))
            self.update_status("Ready")
            
    def append_chat_message(self, message: str, sender: str):
        """Append message to chat display"""
        self.chat_display.configure(state="normal")
        
        # Add color coding
        if sender == "user":
            self.chat_display.insert("end", message)
        elif sender == "assistant":
            self.chat_display.insert("end", message)
        else:
            self.chat_display.insert("end", message)
        
        self.chat_display.configure(state="disabled")
        self.chat_display.see("end")
        
    def refresh_models(self):
        """Refresh available Ollama models"""
        try:
            models = self.ai_chat.get_available_models()
            self.model_selector.configure(values=models)
            self.update_status(f"Found {len(models)} models")
        except Exception as e:
            messagebox.showerror("Error", f"Cannot connect to Ollama:\n{str(e)}")
    
    def on_model_changed(self, new_model: str):
        """Callback when model is changed in the selector"""
        self.update_status(f"🤖 Model switched to: {new_model}")
            
    def open_settings(self):
        """Open settings dialog"""
        # TODO: Create settings dialog
        messagebox.showinfo("Settings", "Settings dialog coming soon!")
        
    def update_status(self, message: str):
        """Update status bar with color-coded icon"""
        self.status_bar.configure(text=message)


def main():
    """Main entry point"""
    app = DocuBrainApp()
    app.mainloop()


if __name__ == "__main__":
    main()
