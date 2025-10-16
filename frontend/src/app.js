// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupUploadArea();
    loadDocuments();
    setupSearchInput();
});

// Upload Area Setup
function setupUploadArea() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    // Click to upload
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

// Handle File Upload
async function handleFileUpload(file) {
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadResult = document.getElementById('uploadResult');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    // Reset
    uploadResult.style.display = 'none';
    uploadProgress.style.display = 'block';
    progressFill.style.width = '0%';
    progressText.textContent = 'Uploading...';

    try {
        const formData = new FormData();
        formData.append('file', file);

        // Simulate progress
        progressFill.style.width = '30%';

        const response = await fetch(`${API_BASE_URL}/scan/upload`, {
            method: 'POST',
            body: formData
        });

        progressFill.style.width = '60%';
        progressText.textContent = 'Processing OCR...';

        const data = await response.json();

        progressFill.style.width = '100%';
        progressText.textContent = 'Complete!';

        if (data.success) {
            uploadResult.className = 'upload-result';
            uploadResult.innerHTML = `
                <h3>✅ Upload Successful</h3>
                <p><strong>File:</strong> ${data.fileName}</p>
                <p><strong>Confidence:</strong> ${(data.confidence || 0).toFixed(2)}%</p>
                <p><strong>Words extracted:</strong> ${data.metadata.wordCount}</p>
                <div style="margin-top: 10px; max-height: 200px; overflow-y: auto; background: white; padding: 10px; border-radius: 4px;">
                    <strong>Extracted Text Preview:</strong>
                    <pre style="white-space: pre-wrap; margin-top: 5px; font-size: 0.9em;">${data.extractedText.substring(0, 500)}${data.extractedText.length > 500 ? '...' : ''}</pre>
                </div>
            `;
            uploadResult.style.display = 'block';

            // Refresh documents list
            setTimeout(() => {
                loadDocuments();
                uploadProgress.style.display = 'none';
            }, 2000);
        } else {
            throw new Error(data.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Upload error:', error);
        uploadResult.className = 'upload-result error';
        uploadResult.innerHTML = `
            <h3>❌ Upload Failed</h3>
            <p>${error.message}</p>
        `;
        uploadResult.style.display = 'block';
        uploadProgress.style.display = 'none';
    }
}

// Search Input Setup
function setupSearchInput() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Perform Search
async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchType = document.getElementById('searchType');
    const searchResults = document.getElementById('searchResults');
    
    const query = searchInput.value.trim();
    
    if (!query) {
        searchResults.innerHTML = '<p class="empty-state">Please enter a search query</p>';
        return;
    }

    searchResults.innerHTML = '<p style="text-align: center; color: #666;">Searching...</p>';

    try {
        const response = await fetch(
            `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=${searchType.value}&limit=20`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            searchResults.innerHTML = `
                <p style="margin-bottom: 15px; color: #666;">
                    Found ${data.count} result${data.count !== 1 ? 's' : ''} for "${data.query}"
                </p>
                ${data.results.map(result => createSearchResultHTML(result)).join('')}
            `;
        } else {
            searchResults.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <p>No results found for "${query}"</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = `
            <p class="empty-state" style="color: #dc3545;">
                Error performing search: ${error.message}
            </p>
        `;
    }
}

// Create Search Result HTML
function createSearchResultHTML(result) {
    const preview = result.data.text ? 
        result.data.text.substring(0, 150).replace(/\n/g, ' ') : 
        'No text extracted';
    
    return `
        <div class="search-result-item" onclick="showDocumentDetails('${result.documentId}')">
            <div class="result-header">
                <span class="result-title">📄 ${result.data.fileName || 'Untitled'}</span>
                <span class="result-score">Score: ${result.score.toFixed(1)}</span>
            </div>
            <div class="result-preview">${preview}...</div>
        </div>
    `;
}

// Load Documents
async function loadDocuments() {
    const documentsList = document.getElementById('documentsList');
    
    documentsList.innerHTML = '<p style="text-align: center; color: #666;">Loading documents...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/documents`);
        const data = await response.json();

        if (data.documents && data.documents.length > 0) {
            documentsList.innerHTML = data.documents.map(doc => createDocumentHTML(doc)).join('');
        } else {
            documentsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <p>No documents yet. Upload your first scan to get started!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading documents:', error);
        documentsList.innerHTML = `
            <p class="empty-state" style="color: #dc3545;">
                Error loading documents: ${error.message}
            </p>
        `;
    }
}

// Create Document HTML
function createDocumentHTML(doc) {
    const date = new Date(doc.created_at).toLocaleDateString();
    const preview = doc.extracted_text ? 
        doc.extracted_text.substring(0, 100).replace(/\n/g, ' ') : 
        'No text extracted';
    
    return `
        <div class="document-item" onclick="showDocumentDetails('${doc.id}')">
            <div class="document-header">
                <span class="document-name">📄 ${doc.file_name}</span>
                <span class="document-date">${date}</span>
            </div>
            <div class="document-preview">${preview}...</div>
        </div>
    `;
}

// Show Document Details
async function showDocumentDetails(documentId) {
    const modal = document.getElementById('documentModal');
    const documentDetails = document.getElementById('documentDetails');
    
    modal.style.display = 'flex';
    documentDetails.innerHTML = '<p style="text-align: center;">Loading...</p>';

    try {
        const [docResponse, suggestionsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/documents/${documentId}`),
            fetch(`${API_BASE_URL}/documents/${documentId}/suggestions`)
        ]);

        const doc = await docResponse.json();
        const suggestions = await suggestionsResponse.json();

        documentDetails.innerHTML = `
            <h2>📄 ${doc.file_name}</h2>
            
            <div class="detail-section">
                <h3>File Information</h3>
                <div class="detail-content">
                    <p><strong>Type:</strong> ${doc.file_type}</p>
                    <p><strong>Created:</strong> ${new Date(doc.created_at).toLocaleString()}</p>
                    <p><strong>Confidence:</strong> ${(doc.metadata.confidence || 0).toFixed(2)}%</p>
                    <p><strong>Words:</strong> ${doc.metadata.wordCount || 0}</p>
                    <p><strong>Lines:</strong> ${doc.metadata.lineCount || 0}</p>
                </div>
            </div>

            <div class="detail-section">
                <h3>Extracted Text</h3>
                <div class="detail-content">
                    <pre style="white-space: pre-wrap; font-family: inherit;">${doc.extracted_text || 'No text extracted'}</pre>
                </div>
            </div>

            ${doc.tags && doc.tags.length > 0 ? `
                <div class="detail-section">
                    <h3>Tags</h3>
                    <div class="tags">
                        ${doc.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            ${doc.linkedDocuments && doc.linkedDocuments.length > 0 ? `
                <div class="detail-section">
                    <h3>Linked Documents</h3>
                    <div class="linked-documents">
                        ${doc.linkedDocuments.map(linked => `
                            <div class="linked-doc" onclick="showDocumentDetails('${linked.id}')">
                                <strong>📎 ${linked.file_name}</strong>
                                <br>
                                <small>${linked.reason || 'Related document'}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${suggestions.suggestions && suggestions.suggestions.length > 0 ? `
                <div class="detail-section">
                    <h3>Suggested Related Documents</h3>
                    <div class="suggestions">
                        ${suggestions.suggestions.map(sugg => `
                            <div class="suggestion-item" onclick="showDocumentDetails('${sugg.documentId}')">
                                <strong>💡 ${sugg.data.fileName}</strong>
                                <br>
                                <small>${sugg.reason}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div style="margin-top: 20px; display: flex; gap: 10px;">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                <button class="btn btn-primary" onclick="deleteDocument('${documentId}')">Delete Document</button>
            </div>
        `;
    } catch (error) {
        console.error('Error loading document details:', error);
        documentDetails.innerHTML = `
            <p style="color: #dc3545;">Error loading document details: ${error.message}</p>
            <button class="btn btn-secondary" onclick="closeModal()">Close</button>
        `;
    }
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('documentModal');
    modal.style.display = 'none';
}

// Delete Document
async function deleteDocument(documentId) {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('Document deleted successfully');
            closeModal();
            loadDocuments();
        } else {
            throw new Error(data.error || 'Delete failed');
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete document: ' + error.message);
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('documentModal');
    if (event.target === modal) {
        closeModal();
    }
}
