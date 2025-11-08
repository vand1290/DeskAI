# 📁 Folder Upload & Bulk Import Guide

## New Features Added

DocuBrain now has **4 upload methods** to handle different scenarios:

---

## 1. 📄 Individual Files (Original)

**Use When:**
- Uploading 1-5 specific files
- Need precise control over each file

**How It Works:**
1. Click "📄 Individual Files"
2. Choose files with file picker
3. Files upload one by one
4. Text extracted automatically

**Best For:**
- Single document uploads
- Quick uploads
- Selective file imports

---

## 2. 📁 Folder Upload (NEW!)

**Use When:**
- Uploading entire folder contents
- Bulk importing 10-100+ files
- Migrating document archives

**How It Works:**
1. Click "📁 Folder Upload"
2. In file picker, navigate to your folder
3. Press **Ctrl+A** to select all files
4. Check "📅 Organize by upload date" (optional)
5. Click "🚀 Upload All Files"
6. Watch progress bar as files process

**Features:**
- ✅ Batch processing with progress tracking
- ✅ Automatic duplicate detection
- ✅ Text extraction for all files
- ✅ Optional date-based organization
- ✅ Summary report at completion
- ✅ Celebration balloons! 🎈

**Supported Formats:**
- PDF, DOCX, PPTX, XLSX
- CSV, TXT, MD

**Example:**
```
Selected: 47 files
Processing 23/47: contract_2024.pdf
...
Upload Complete!
✅ Uploaded: 45 files
⏭️ Skipped (duplicates): 2 files
❌ Errors: 0 files
```

---

## 3. ☁️ Import from Storage (NEW!)

**Use When:**
- Files already in MinIO but not in database
- Recovering from database issues
- Importing legacy files from blob storage

**How It Works:**
1. Click "☁️ Import from Storage"
2. System scans MinIO bucket
3. Shows unregistered files
4. Click "🔄 Import All Unregistered Files"
5. Files get registered with text extraction

**Features:**
- ✅ Discovers orphaned files in storage
- ✅ Batch import from MinIO
- ✅ Extracts text during import
- ✅ Shows metrics (total vs unregistered)
- ✅ Preview first 20 unregistered files

**Use Cases:**
- **Database Reset**: After resetting database, import files from MinIO
- **Legacy Migration**: Import old files already in blob storage
- **Manual Uploads**: Register files uploaded directly to MinIO
- **Sync Check**: Ensure all stored files are registered

**Example:**
```
Total files in storage: 152
Unregistered files: 23

📋 View Unregistered Files
📄 report_2024.pdf (245 KB)
📄 invoice_001.xlsx (89 KB)
...

[🔄 Import All Unregistered Files]
```

---

## 4. 🔍 Folder Watch Info (Original)

**Use When:**
- Want automatic background processing
- Setting up watch folder location

**How It Works:**
- Drop files into watch folder
- System auto-detects and imports
- Files deleted after successful import

**Watch Folder Location:**
```
C:\Users\[YOUR_USERNAME]\DocuBrain\watch
```

---

## Comparison Table

| Feature | Individual | Folder Upload | Storage Import | Watch Folder |
|---------|-----------|---------------|----------------|--------------|
| **Speed** | Slow (1 by 1) | Fast (batch) | Fast (batch) | Auto |
| **Control** | High | Medium | Low | None |
| **Files** | 1-5 | 10-100+ | Existing only | Auto-detect |
| **Use Case** | Specific docs | Bulk import | Recovery/sync | Background |
| **Progress** | Per file | Progress bar | Progress bar | Silent |
| **Organization** | Manual | Date-based | As-is | Auto |

---

## Step-by-Step Examples

### Example 1: Import 50 Project Documents

**Scenario**: You have a folder with 50 project documents on your desktop.

**Steps:**
1. Open DocuBrain: http://localhost:8501
2. Go to "📤 Upload Documents" tab
3. Select "📁 Folder Upload"
4. Click file picker
5. Navigate to your project folder
6. Press **Ctrl+A** to select all 50 files
7. Enable "📅 Organize by upload date"
8. Click "🚀 Upload All Files"
9. Wait 1-3 minutes for processing
10. See success message with stats

**Time**: ~2 seconds per file = ~2 minutes total

---

### Example 2: Recover Database After Reset

**Scenario**: You reset the database but files are still in MinIO.

**Steps:**
1. Open DocuBrain
2. Go to "📤 Upload Documents" tab
3. Select "☁️ Import from Storage"
4. System shows "Unregistered files: 152"
5. Click "🔄 Import All Unregistered Files"
6. Wait for batch processing
7. All files re-registered with text extraction

**Time**: ~1 second per file = ~2-3 minutes for 152 files

---

### Example 3: Organize Department Archive

**Scenario**: Sales department has 200 mixed documents to import.

**Steps:**
1. **Prepare**: Sort files locally into manageable batches (50 files each)
2. **Batch 1**: Upload first 50 files via Folder Upload
3. **Batch 2**: Upload next 50 files via Folder Upload
4. **Batch 3**: Continue until complete
5. **Verify**: Use "Document Library" to check all uploads

**Why Batches?**
- Easier to track progress
- Can pause/resume
- Better error handling
- Less browser memory usage

---

## Technical Details

### File Processing Pipeline:

```
Upload → Hash → Duplicate Check → MinIO → Extract Text → Database → Activity Log
```

### Text Extraction:
- **PDF**: Full text extraction with PyPDF2
- **DOCX**: Paragraphs and tables
- **PPTX**: Slide text and notes
- **XLSX**: All sheets and cells
- **CSV**: All rows and columns
- **TXT/MD**: Raw content

### Duplicate Detection:
- Uses SHA-256 hash of file contents
- Same file = same hash, skip upload
- Renamed files = same hash, detected as duplicate

### Organization Modes:

**Date-based** (recommended):
```
uploads/2025/10/20/a1b2c3d4_document.pdf
```

**Flat**:
```
uploads/a1b2c3d4_document.pdf
```

---

## Performance Tips

### ⚡ For Faster Uploads:

1. **Use Folder Upload**: Much faster than individual
2. **Batch Large Collections**: 50-100 files at a time
3. **Close Other Apps**: Free up RAM
4. **Use SSD Storage**: Faster file reading
5. **Organize Beforehand**: Clean folder structure

### 📊 Expected Speeds:

| Files | Method | Time |
|-------|--------|------|
| 10 files | Individual | ~1 minute |
| 10 files | Folder Upload | ~20 seconds |
| 50 files | Folder Upload | ~2 minutes |
| 100 files | Folder Upload | ~4 minutes |
| 150 files | Storage Import | ~3 minutes |

*Speeds depend on file sizes and system performance*

---

## Troubleshooting

### "Upload Failed" Errors

**Cause**: File type not supported or corrupted file

**Solution**:
- Check file extension is in supported list
- Try opening file manually to verify it's not corrupted
- Re-save file in compatible format

### "Duplicate" Skipped

**Cause**: File already uploaded (same content hash)

**Solution**:
- This is normal behavior
- Check Document Library to see existing file
- If you want to re-upload, delete original first

### Slow Processing

**Cause**: Large files or many files

**Solution**:
- Be patient - text extraction takes time
- Reduce batch size to 20-30 files
- Upload large PDFs individually first

### MinIO Import Finds No Files

**Cause**: All files already registered

**Solution**:
- This means your database is in sync! ✅
- Use this feature after database resets
- Or after manually uploading to MinIO

---

## Advanced Usage

### Importing from External Blob Storage

If you have files in Azure Blob, AWS S3, or another system:

1. **Download** files locally or mount storage
2. **Select all** files with Ctrl+A
3. **Use Folder Upload** to import to DocuBrain
4. **Organize** by date for easier management

### Batch Processing Script

For very large collections (1000+ files), consider:

1. Split into folders of 100 files each
2. Upload each batch separately
3. Monitor via Activity Log
4. Verify totals in Document Library

### Quality Control

After bulk upload:

1. Go to "📚 Document Library"
2. Sort by "Recent"
3. Verify file count matches
4. Check "Search & Filter" for text extraction
5. Test AI Chat to confirm documents are accessible

---

## Data Management

### Storage Organization:

```
MinIO (documents bucket)
├── uploads/
│   ├── 2025/10/20/
│   │   ├── a1b2c3d4_report.pdf
│   │   ├── b2c3d4e5_invoice.xlsx
│   └── ...
└── processed/
    └── ...
```

### Database Schema:

```sql
documents table:
- filename: original name
- file_hash: SHA-256 for duplicates
- file_size: bytes
- file_type: extension
- minio_path: storage location
- uploaded_by: user ID
- extracted_text: searchable content
- source: upload/folder_upload/minio_import/watch
- upload_date: timestamp
```

---

## Best Practices

### ✅ DO:
- **Organize before upload**: Clean folder structure
- **Use Folder Upload**: For 10+ files
- **Check duplicates**: Review skip messages
- **Verify after upload**: Check Document Library
- **Use Storage Import**: For recovery scenarios

### ❌ DON'T:
- **Mix file types**: Keep similar docs together
- **Upload 1000+ files at once**: Use batches
- **Ignore errors**: Check error messages
- **Skip verification**: Always check upload results
- **Upload duplicates intentionally**: Clean source first

---

## Summary

You now have **4 powerful ways** to import documents:

1. **📄 Individual**: Precise, controlled, 1-5 files
2. **📁 Folder Upload**: Fast bulk import, 10-100+ files
3. **☁️ Storage Import**: Sync MinIO to database
4. **🔍 Watch Folder**: Automatic background processing

Choose the method that fits your workflow! 🚀

**Quick Decision Tree:**
- Need to upload **1-5 specific files**? → Use Individual Files
- Have a **folder with 10-100 files**? → Use Folder Upload
- Files **already in MinIO**? → Use Storage Import
- Want **automation**? → Use Watch Folder

---

**Happy Uploading!** 📁✨
