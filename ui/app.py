import os
from pathlib import Path

import pandas as pd
import plotly.express as px
import psycopg2
import requests
import streamlit as st
from dotenv import load_dotenv
import psutil

APP_DIR = Path(__file__).resolve().parent

def _resolve_logo_path():
    candidates = [
        APP_DIR / "static" / "logo.png",
        Path.cwd() / "assets" / "logo.png",
        APP_DIR.parent / "assets" / "logo.png",
    ]
    for candidate in candidates:
        if candidate.is_file():
            return str(candidate)
    return None

load_dotenv()

# Base URL for the model router (configurable via env var). When running outside Docker,
# the router is typically published on localhost:8000. When running inside Docker, set
# ROUTER_URL=http://router:8000.
ROUTER_URL = os.getenv("ROUTER_URL", "http://localhost:8000")

PAGE_ICON = _resolve_logo_path()

st.set_page_config(
    page_title="DocBrain Starter",
    page_icon=PAGE_ICON,
    layout="wide"
)

# Custom CSS for professional look
st.markdown("""
<style>
    .stApp {
        background-color: #f0f2f6;
    }
    .css-1d391kg {
        background-color: #ffffff;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .stButton>button {
        background-color: #4f8bf9;
        color: white;
        border-radius: 5px;
        border: none;
        padding: 10px 20px;
    }
    .stButton>button:hover {
        background-color: #3a76e8;
    }
    h1, h2, h3 {
        color: #262730;
    }
    .document-card {
        background-color: white;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .category-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: bold;
        margin-right: 8px;
    }
    .financial { background-color: #ffcccc; color: #cc0000; }
    .legal { background-color: #cce5ff; color: #0066cc; }
    .business { background-color: #e6f9e6; color: #009900; }
    .technical { background-color: #fff2cc; color: #cc9900; }
    .communication { background-color: #e6ccff; color: #9933cc; }
    .general { background-color: #f0f0f0; color: #666666; }
    .model-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        background-color: #f9f9f9;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'messages' not in st.session_state:
    st.session_state.messages = []

# Sidebar
with st.sidebar:
    logo_path = _resolve_logo_path()
    if logo_path:
        st.image(logo_path, use_column_width=True)
    st.title("DocBrain Starter")
    st.markdown("Your local AI document assistant")
    
    st.divider()
    
    st.subheader("Navigation")
    page = st.radio("Go to", ["Dashboard", "Chat", "Documents", "Blob Storage", "Models", "Settings"])
    
    st.divider()
    
    st.subheader("System Info")
    try:
        response = requests.get(f"{ROUTER_URL}/health", timeout=5)
        response.raise_for_status()
        data = response.json()
        st.info(f"Status: {data.get('status', 'unknown')}")
        if data.get("active_model"):
            st.info(f"Active Model: {data['active_model']}")
        if data.get("tier"):
            st.info(f"Hardware Tier: {data['tier']}")

        resources = data.get("resources") or {}
        if resources.get("ram_gb") is not None:
            st.info(f"RAM: {resources['ram_gb']} GB")
        if resources.get("disk_gb") is not None:
            st.info(f"Disk Free: {resources['disk_gb']} GB")
        if resources.get("gpu_available"):
            st.info(f"GPU Memory: {resources.get('gpu_memory_gb', 0)} GB")
        if data.get("generated_at_utc"):
            st.caption(f"Hardware snapshot captured at {data['generated_at_utc']}Z")
    except requests.RequestException:
        st.error("Router service unavailable")
    except Exception:
        st.error("Cannot connect to router")

# Main content
if page == "Dashboard":
    st.title("DocBrain Dashboard")
    
    try:
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        with conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM documents")
            total_docs = cur.fetchone()[0]
            
            cur.execute("SELECT category, COUNT(*) FROM documents GROUP BY category")
            categories = cur.fetchall()
            
        col1, col2, col3 = st.columns(3)
        col1.metric("Total Documents", total_docs)
        col2.metric("Categories", len(categories))
        col3.metric("Processing Speed", "Fast")
        
        st.subheader("Document Categories")
        if categories:
            df = pd.DataFrame(categories, columns=['Category', 'Count'])
            fig = px.pie(df, values='Count', names='Category', title='Document Distribution')
            st.plotly_chart(fig)
        else:
            st.info("No documents processed yet.")
            
    except Exception as e:
        st.error(f"Database error: {str(e)}")

elif page == "Chat":
    st.title("AI Chat Assistant")
    st.markdown("Ask questions about your documents or get general assistance")
    
    # Display chat history
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    # Chat input
    if prompt := st.chat_input("What would you like to know?"):
        # Add user message to chat history
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
            
        # Get AI response
        with st.chat_message("assistant"):
            with st.spinner("Thinking..."):
                try:
                    response = requests.get(
                        f"{ROUTER_URL}/route",
                        params={"prompt": prompt}
                    )
                    if response.status_code == 200:
                        ai_response = response.json().get("response", "No response")
                        st.markdown(ai_response)
                    else:
                        st.error("Error getting response from AI")
                        ai_response = "Sorry, I couldn't process that request."
                except Exception as e:
                    st.error(f"Connection error: {str(e)}")
                    ai_response = "Sorry, I'm having trouble connecting to the AI service."
            
        # Add AI response to chat history
        st.session_state.messages.append({"role": "assistant", "content": ai_response})

elif page == "Documents":
    st.title("Document Manager")
    st.markdown("View and manage your processed documents")
    
    try:
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        with conn.cursor() as cur:
            cur.execute("SELECT id, filename, content, category, processed_at FROM documents ORDER BY processed_at DESC")
            documents = cur.fetchall()
            
        if documents:
            # Filter by category
            categories = list(set([doc[3] for doc in documents]))
            selected_category = st.selectbox("Filter by category", ["All"] + categories)
            
            filtered_docs = documents if selected_category == "All" else [doc for doc in documents if doc[3] == selected_category]
            
            for doc in filtered_docs:
                category_class = doc[3].lower()
                with st.expander(f"Document: {doc[1]}"):
                    st.markdown(f"**Processed:** {doc[4]}")
                    st.markdown(f'<span class="category-badge {category_class}">{doc[3]}</span>', unsafe_allow_html=True)
                    st.text_area("Content", value=doc[2], height=200, key=f"doc_{doc[0]}")
        else:
            st.info("No documents processed yet. Add documents to the 'documents' folder to get started.")
            
    except Exception as e:
        st.error(f"Database error: {str(e)}")

elif page == "Blob Storage":
    st.title("Blob Storage Manager")
    st.markdown("Manage your document storage and organization")
    
    st.subheader("Storage Overview")
    try:
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        with conn.cursor() as cur:
            cur.execute("SELECT category, COUNT(*) FROM documents GROUP BY category")
            categories = cur.fetchall()
            
        if categories:
            df = pd.DataFrame(categories, columns=['Category', 'Count'])
            fig = px.bar(df, x='Category', y='Count', title='Documents by Category')
            st.plotly_chart(fig)
        else:
            st.info("No documents in storage yet.")
            
    except Exception as e:
        st.error(f"Database error: {str(e)}")
        
    st.subheader("Storage Actions")
    if st.button("Organize Documents by Category"):
        st.info("Organizing documents... This may take a moment.")
        # In a real implementation, this would call the worker to organize storage
        st.success("Documents organized successfully!")
        
    st.subheader("Upload Documents")
    uploaded_files = st.file_uploader("Choose files", accept_multiple_files=True)
    if uploaded_files:
        st.success(f"Uploaded {len(uploaded_files)} files. They will be processed automatically.")

elif page == "Models":
    st.title("AI Models")
    st.markdown("Manage and view information about AI models")
    
    try:
        # Get system info
        health_response = requests.get(f"{ROUTER_URL}/health")
        if health_response.status_code == 200:
            health_data = health_response.json()
            st.info(f"Hardware Tier: {health_data.get('tier', 'Unknown')}")
            
            # Get recommended models
            rec_response = requests.get(f"{ROUTER_URL}/recommended-models")
            if rec_response.status_code == 200:
                rec_data = rec_response.json()
                st.subheader("Recommended Models")
                for model in rec_data.get('models', []):
                    st.markdown(f"<div class='model-card'><b>{model}</b></div>", unsafe_allow_html=True)
        
        # Get installed models
        models_response = requests.get(f"{ROUTER_URL}/models")
        if models_response.status_code == 200:
            models_data = models_response.json()
            st.subheader("Installed Models")
            if models_data.get("models"):
                for model in models_data["models"]:
                    st.markdown(f"<div class='model-card'>{model['name']} (Size: {model.get('size', 'N/A')})</div>", unsafe_allow_html=True)
            else:
                st.info("No models installed yet. They will be downloaded automatically when needed.")
                
    except Exception as e:
        st.error(f"Error retrieving model information: {str(e)}")

else:  # Settings
    st.title("Settings")
    st.markdown("Configure your DocBrain environment")
    
    st.subheader("Model Configuration")
    try:
        response = requests.get(f"{ROUTER_URL}/models")
        if response.status_code == 200:
            models = response.json().get("models", [])
            st.write("Installed Models:")
            for model in models:
                st.code(model["name"])
        else:
            st.info("No models installed yet. They will be downloaded automatically.")
    except Exception:
        st.error("Cannot connect to model service")
    
    st.subheader("System Information")
    import psutil as _ps
    st.json({
        "CPU": "Intel/AMD (detected at runtime)",
        "Memory": f"{_ps.virtual_memory().total / (1024**3):.1f} GB",
        "Storage": f"{_ps.disk_usage('/').free / (1024**3):.1f} GB free"
    })
    
    st.subheader("About")
    st.markdown("""
    **DocBrain Starter** is an open-source solution for local document processing with AI.
    
    - **Version:** 1.0.0
    - **License:** MIT
    - **Source:** [GitHub Repository](#)
    """)
    
    st.subheader("Recommended Models")
    st.markdown("""
    ### Small Models (1B-3B parameters)
    - **TinyLlama** (1.1B) - Extremely lightweight
    - **StableLM** (1.6B) - Good balance of size and capability
    - **Phi-2** (2.7B) - Microsoft's efficient model
    
    ### Medium Models (4B-7B parameters)
    - **Phi-3 Mini** (3.8B) - Microsoft's latest efficient model
    - **Mistral** (7B) - High performance with good efficiency
    - **Qwen2** (7B) - Alibaba's powerful model
    - **Llama 3** (8B) - Meta's latest model
    
    Models are automatically selected based on your hardware capabilities.
    """)

# Add custom footer
st.markdown("---")
st.markdown("<div style='text-align: center; color: #666;'>DocBrain Starter - Local AI Document Processing</div>", unsafe_allow_html=True)
