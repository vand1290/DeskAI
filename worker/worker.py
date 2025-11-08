import os
import time
from pathlib import Path

import fitz  # PyMuPDF
import psycopg2
from dotenv import load_dotenv
from minio import Minio
from paddleocr import PaddleOCR
from sentence_transformers import SentenceTransformer
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

DOCUMENTS_DIR = Path("/app/documents")
PROCESSED_DIR = Path("/app/processed")

load_dotenv()


class DocumentProcessor(FileSystemEventHandler):
    def __init__(self):
        self.ocr = PaddleOCR(use_angle_cls=True, lang='en')
        self.minio_client = Minio(
            os.getenv('MINIO_ENDPOINT').replace('http://', ''),
            access_key=os.getenv('MINIO_ACCESS_KEY'),
            secret_key=os.getenv('MINIO_SECRET_KEY'),
            secure=False
        )
        
        # Create bucket if not exists
        if not self.minio_client.bucket_exists("documents"):
            self.minio_client.make_bucket("documents")
            
        # Connect to database
        self.conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        self.conn.autocommit = True
        self.create_tables()
        
        # Load embedding model for document classification
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
    def create_tables(self):
        with self.conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS documents (
                    id SERIAL PRIMARY KEY,
                    filename VARCHAR(255) UNIQUE,
                    content TEXT,
                    category VARCHAR(100),
                    embedding VECTOR(384),
                    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            
    def on_created(self, event):
        if not event.is_directory:
            self.process_document(event.src_path)
            
    def process_document(self, file_path):
        filename = os.path.basename(file_path)
        print(f"Processing document: {filename}")
        
        source_path = Path(file_path)
        if source_path.suffix.lower() == '.pdf':
            content = self.extract_pdf_text(source_path)
        else:
            content = self.extract_ocr_text(source_path)

        if not content.strip():
            print(f"No textual content detected in {filename}; skipping.")
            return
            
        # Categorize document using AI
        category = self.categorize_document(content)
        
        # Generate embedding for similarity search
        embedding = self.generate_embedding(content)
        embedding_text = self.format_embedding(embedding)
        
        # Save to database
        with self.conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO documents (filename, content, category, embedding)
                VALUES (%s, %s, %s, %s::vector)
                ON CONFLICT (filename) DO UPDATE SET
                    content = EXCLUDED.content,
                    category = EXCLUDED.category,
                    embedding = EXCLUDED.embedding,
                    processed_at = CURRENT_TIMESTAMP
                """,
                (filename, content, category, embedding_text),
            )
            
        # Upload to MinIO
        self.minio_client.fput_object(
            "documents",
            filename,
            str(source_path)
        )
        
        # Move to processed folder
        processed_path = self.move_to_processed(source_path)
        
        print(f"Processed document: {filename} (Category: {category})")
        
    def extract_pdf_text(self, file_path: Path) -> str:
        doc = fitz.open(str(file_path))
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
        
    def extract_ocr_text(self, file_path: Path) -> str:
        result = self.ocr.ocr(str(file_path), cls=True)
        text = ""
        for idx in range(len(result)):
            res = result[idx]
            for line in res:
                text += line[1][0] + " "
        return text
        
    def categorize_document(self, content):
        # Simple categorization based on keywords
        content_lower = content.lower()
        
        if 'invoice' in content_lower or 'bill' in content_lower or 'payment' in content_lower:
            return 'Financial'
        elif 'contract' in content_lower or 'agreement' in content_lower:
            return 'Legal'
        elif 'report' in content_lower or 'analysis' in content_lower:
            return 'Business'
        elif 'manual' in content_lower or 'guide' in content_lower:
            return 'Technical'
        elif 'email' in content_lower or 'correspondence' in content_lower:
            return 'Communication'
        else:
            return 'General'
            
    def generate_embedding(self, content):
        # Generate embedding for the document content
        embedding = self.embedding_model.encode(content[:500])  # Limit to first 500 chars for performance
        return embedding

    def format_embedding(self, embedding) -> str:
        return "[" + ",".join(f"{value:.6f}" for value in embedding.tolist()) + "]"

    def move_to_processed(self, source_path: Path) -> Path:
        PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
        target_path = PROCESSED_DIR / source_path.name

        # Avoid overwriting an existing processed file
        if target_path.exists():
            suffix = int(time.time())
            target_path = PROCESSED_DIR / f"{source_path.stem}-{suffix}{source_path.suffix}"

        source_path.replace(target_path)
        return target_path
        
    def organize_blob_storage(self):
        """Organize documents in blob storage by category"""
        print("Organizing blob storage...")
        
        with self.conn.cursor() as cur:
            cur.execute("SELECT filename, category FROM documents")
            documents = cur.fetchall()
            
        for filename, category in documents:
            # Move document to category folder in blob storage
            try:
                self.minio_client.copy_object(
                    "documents",
                    f"{category}/{filename}",
                    "documents",
                    filename
                )
                print(f"Moved {filename} to {category} folder")
            except Exception as e:
                print(f"Error moving {filename}: {e}")

if __name__ == "__main__":
    # Create directories if they don't exist
    DOCUMENTS_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    Path("/app/blob-storage").mkdir(parents=True, exist_ok=True)
    
    event_handler = DocumentProcessor()
    observer = Observer()
    observer.schedule(event_handler, path="/app/documents", recursive=False)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
