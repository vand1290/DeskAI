"""
Database module using SQLite for local storage
"""
import sqlite3
import os
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional


class Database:
    """Local SQLite database manager"""
    
    def __init__(self, db_path: Optional[str] = None):
        """Initialize database connection"""
        if db_path is None:
            # Use app data directory
            app_data = Path.home() / "DocuBrain"
            app_data.mkdir(exist_ok=True)
            db_path = str(app_data / "docubrain.db")
        
        self.db_path = db_path
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.create_tables()
        
    def create_tables(self):
        """Create database tables if they don't exist"""
        cursor = self.conn.cursor()
        
        # Documents table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                file_path TEXT NOT NULL UNIQUE,
                file_size INTEGER,
                file_type TEXT,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                extracted_text TEXT,
                metadata TEXT
            )
        """)
        
        # Create index for faster searches
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_filename 
            ON documents(filename)
        """)
        
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_upload_date 
            ON documents(upload_date)
        """)
        
        self.conn.commit()
        
    def add_document(self, filename: str, file_path: str, file_size: int, 
                     file_type: str, extracted_text: str = "", metadata: str = "{}") -> int:
        """Add a new document to the database"""
        cursor = self.conn.cursor()
        
        try:
            cursor.execute("""
                INSERT INTO documents 
                (filename, file_path, file_size, file_type, extracted_text, metadata)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (filename, file_path, file_size, file_type, extracted_text, metadata))
            
            self.conn.commit()
            return cursor.lastrowid
            
        except sqlite3.IntegrityError:
            # Document already exists
            print(f"Document already in database: {file_path}")
            return -1
            
    def get_all_documents(self, limit: Optional[int] = None) -> List[Dict]:
        """Get all documents from database"""
        cursor = self.conn.cursor()
        
        query = "SELECT * FROM documents ORDER BY upload_date DESC"
        if limit:
            query += f" LIMIT {limit}"
            
        cursor.execute(query)
        rows = cursor.fetchall()
        
        return [dict(row) for row in rows]
        
    def get_document_by_id(self, doc_id: int) -> Optional[Dict]:
        """Get a specific document by ID"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
        row = cursor.fetchone()
        
        return dict(row) if row else None
        
    def search_documents(self, query: str) -> List[Dict]:
        """Search documents by filename or content"""
        cursor = self.conn.cursor()
        
        search_pattern = f"%{query}%"
        cursor.execute("""
            SELECT * FROM documents 
            WHERE filename LIKE ? OR extracted_text LIKE ?
            ORDER BY upload_date DESC
        """, (search_pattern, search_pattern))
        
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
        
    def delete_document(self, doc_id: int):
        """Delete a document from database"""
        cursor = self.conn.cursor()
        cursor.execute("DELETE FROM documents WHERE id = ?", (doc_id,))
        self.conn.commit()
        
    def get_recent_documents(self, limit: int = 10) -> List[Dict]:
        """Get most recent documents"""
        return self.get_all_documents(limit=limit)
        
    def get_document_count(self) -> int:
        """Get total number of documents"""
        cursor = self.conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM documents")
        return cursor.fetchone()[0]
        
    def get_context_for_query(self, limit: int = 3, max_chars: int = 800) -> str:
        """Get document context for AI queries"""
        docs = self.get_recent_documents(limit=limit)
        
        context_parts = []
        for doc in docs:
            text = doc.get('extracted_text', '')
            if text:
                # Truncate to max_chars
                truncated = text[:max_chars]
                context_parts.append(f"Document: {doc['filename']}\n{truncated}\n")
        
        return "\n---\n".join(context_parts)
        
    def close(self):
        """Close database connection"""
        self.conn.close()
