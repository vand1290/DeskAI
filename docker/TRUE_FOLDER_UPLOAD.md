# 📂 TRUE Folder Upload - Complete Guide

## 🎯 Now You Can REALLY Upload Entire Folders!

### Two Methods Available:

---

## Method 1: 🖱️ Browse & Select Files (Web-based)

**Limitation**: Browser security doesn't allow selecting folders directly, but you can select all files.

### How It Works:
1. Navigate to your folder in file picker
2. Press **Ctrl+A** to select all files
3. Upload them as a batch

### Best For:
- Quick uploads when folder is easily accessible
- Folders with 10-50 files
- When you don't want to type paths

---

## Method 2: 📂 Specify Folder Path (TRUE FOLDER UPLOAD!)

**NEW FEATURE**: Type the folder path and let DocuBrain scan and upload everything!

### How It Works:

#### Step 1: Enter Folder Path
```
C:\Users\YourName\Documents\ProjectFiles
```

#### Step 2: Choose Options
- ☑️ Include subfolders (recursively scan)
- ☑️ Organize by upload date

#### Step 3: Click "📂 Scan Folder"
DocuBrain will:
- Scan the folder (and subfolders if selected)
- Find all supported files
- Show you the count
- Preview first 10 files

#### Step 4: Click "🚀 Upload All Files from Folder"
Watch the magic happen:
- Real-time progress bar
- File-by-file processing
- Automatic duplicate detection
- Text extraction
- Summary statistics

### Result:
```
📊 Upload Complete!
✅ Uploaded: 127 files
⏭️ Skipped (duplicates): 3 files
❌ Errors: 0 files
📦 Total processed: 130 files
📁 Source folder: C:\Users\...\ProjectFiles
🎈 [Celebration!]
```

---

## 🌟 Key Features

### True Folder Support:
✅ **Just type the path** - no file selection needed  
✅ **Recursive scanning** - includes all subfolders  
✅ **Smart filtering** - only supported file types  
✅ **Preview before upload** - see what will be uploaded  
✅ **Full folder tree** - preserves file structure info  

### Supported Paths:

**Local Folders:**
```
C:\Users\YourName\Documents\Reports
D:\Projects\2024\Q4
```

**Network Shares:**
```
\\SERVER\SharedDocs\Department
\\NAS\Backups\Documents
```

**Mounted Drives:**
```
E:\Archive\OldFiles
Z:\CompanyDocs
```

**Docker Volumes (if mounted):**
```
/app/documents
/mnt/shared/files
```

---

## 📋 Step-by-Step Example

### Scenario: Upload 200 files from nested folders

**Folder Structure:**
```
C:\ProjectDocs\
├── Contracts\
│   ├── 2024\
│   │   ├── Q1\ (30 files)
│   │   ├── Q2\ (45 files)
│   │   └── Q3\ (38 files)
│   └── 2023\ (52 files)
└── Invoices\ (35 files)

Total: 200 files across multiple folders
```

**Steps:**

1. **Open DocuBrain**: http://localhost:8501

2. **Go to**: "📤 Upload Documents" tab

3. **Select**: "📁 Folder Upload"

4. **Choose**: "📂 Specify Folder Path (Local)"

5. **Enter path**:
   ```
   C:\ProjectDocs
   ```

6. **Check**: ☑️ "Include subfolders"

7. **Click**: "📂 Scan Folder"

8. **See result**:
   ```
   ✅ Found 200 files!
   ```

9. **Preview**:
   ```
   📋 Preview files
   📄 contract_2024_Q1_001.pdf
   📄 contract_2024_Q1_002.docx
   📄 contract_2024_Q2_001.pdf
   ...
   ... and 190 more files
   ```

10. **Click**: "🚀 Upload All Files from Folder"

11. **Watch progress**:
    ```
    Processing 47/200: invoice_2023_045.pdf
    [████████░░░░░░] 23%
    ```

12. **Success**:
    ```
    📊 Upload Complete!
    ✅ Uploaded: 197 files
    ⏭️ Skipped: 3 files (duplicates)
    ❌ Errors: 0 files
    📦 Total: 200 files
    📁 Source: C:\ProjectDocs
    ```

**Time**: ~6-8 minutes for 200 files

---

## 🆚 Comparison: Web vs Path Method

| Feature | Web (Browse) | Path (Type) |
|---------|-------------|-------------|
| **Folder Selection** | No - must select files | ✅ Yes - type path |
| **Subfolders** | No - one level only | ✅ Yes - recursive |
| **File Count Limit** | Browser dependent (~100) | No limit |
| **Preview** | After selection | ✅ Before upload |
| **Network Shares** | May not work | ✅ Works |
| **Ease of Use** | Click & select | Type path |
| **Speed** | Same upload speed | Same upload speed |
| **Best For** | Small folders | Large/nested folders |

---

## 🎯 Use Cases

### Use Case 1: Department Archive Migration
```
Problem: 500 files across 20 subfolders
Solution: Path method with "Include subfolders"
Time: ~15 minutes
Result: All files uploaded with folder structure preserved in metadata
```

### Use Case 2: Project Handover
```
Problem: Client sends Zip file with nested folders
Solution: Extract zip, use path method on root folder
Time: ~5 minutes for 150 files
Result: Complete project imported in one go
```

### Use Case 3: Network Share Sync
```
Problem: \\SERVER\Docs has 300 PDFs
Solution: Path method: \\SERVER\Docs
Time: ~10 minutes
Result: All network files imported directly
```

### Use Case 4: Scheduled Batch Import
```
Problem: Weekly import from D:\Incoming
Solution: Path method with same folder each week
Time: ~5 minutes
Result: Quick weekly sync
```

---

## 💡 Pro Tips

### Tip 1: Preview Before Upload
Always click "Scan Folder" first to:
- ✅ Verify correct path
- ✅ Check file count
- ✅ See what will be uploaded
- ✅ Avoid mistakes

### Tip 2: Organize by Date
Enable "📅 Organize by upload date" to:
- ✅ Keep MinIO storage organized
- ✅ Group files by import date
- ✅ Easier to find in storage later

### Tip 3: Batch Large Folders
For 500+ files:
- Upload parent folder first (without subfolders)
- Then upload each subfolder separately
- Better progress tracking
- Easier error recovery

### Tip 4: Use Full Paths
Always use complete paths:
- ✅ `C:\Users\John\Documents\Reports`
- ❌ `Documents\Reports` (relative path)
- ❌ `.\Reports` (won't work)

### Tip 5: Network Share Format
For Windows network shares:
- ✅ `\\SERVER\Share\Folder`
- ✅ `\\192.168.1.100\Docs`
- ❌ `//SERVER/Share` (use backslashes)

---

## 🔧 Troubleshooting

### "Folder not found"
**Cause**: Path doesn't exist or is inaccessible

**Solutions**:
1. Check spelling and case
2. Verify folder exists
3. Check permissions
4. Try copying path from File Explorer (Shift + Right-click → Copy as path)

### "Path is not a folder"
**Cause**: You entered a file path, not a folder path

**Solution**:
- Remove the filename from the path
- Example: Change `C:\Docs\file.pdf` to `C:\Docs`

### "No supported files found"
**Cause**: Folder contains no PDF, DOCX, etc.

**Solutions**:
1. Check folder contents
2. Verify subfolders option if files are nested
3. Check file extensions (only .pdf, .docx, .pptx, .xlsx, .csv, .txt, .md)

### "Access Denied" or Permission Errors
**Cause**: Docker container can't access the folder

**Solutions**:

**Option A - Copy files to accessible location:**
```powershell
# Copy to watch folder (if you have one)
Copy-Item "C:\Restricted\Docs\*" "C:\Users\$env:USERNAME\DocuBrain\watch"
```

**Option B - Map network drive:**
```
1. Map network share to drive letter (e.g., Z:)
2. Use Z:\Folder in path
```

**Option C - Use Web method:**
- Use "Browse & Select Files" instead
- Manually navigate and select files

### Slow Scanning
**Cause**: Very large folder or slow disk

**Solutions**:
- Be patient during scan phase
- Uncheck "Include subfolders" if not needed
- Upload subfolders separately

---

## 📊 Performance Guide

### Expected Scan Times:

| File Count | Subfolders | Scan Time |
|-----------|------------|-----------|
| 50 files | 0 | <1 second |
| 100 files | 5 | 1-2 seconds |
| 500 files | 20 | 3-5 seconds |
| 1000 files | 50 | 5-10 seconds |

### Expected Upload Times:

| File Count | Avg Size | Upload Time |
|-----------|----------|-------------|
| 50 files | 1MB | ~2 minutes |
| 100 files | 1MB | ~4 minutes |
| 200 files | 1MB | ~8 minutes |
| 500 files | 1MB | ~20 minutes |

*Times include text extraction*

---

## 🔐 Security Notes

### What DocuBrain Can Access:
- ✅ Folders you explicitly type the path to
- ✅ Folders with read permissions
- ✅ Network shares you're connected to

### What DocuBrain CANNOT Access:
- ❌ Random folders without your input
- ❌ System folders without permission
- ❌ Other users' private folders

### Privacy:
- Folder scanning happens in Docker container
- No data sent outside your system
- Files stored in your MinIO (local)
- Database on your PostgreSQL (local)

---

## 🎓 Advanced Usage

### Scripting Folder Uploads

If you want to automate, you could:

1. **Create a script** to prepare folders
2. **Use path method** with predefined paths
3. **Schedule** regular imports

Example PowerShell script:
```powershell
# Prepare folders for import
$sourceFolders = @(
    "C:\Incoming\Folder1",
    "D:\Archive\Folder2",
    "\\SERVER\Share\Folder3"
)

# Print paths for manual input
foreach ($folder in $sourceFolders) {
    Write-Host "Ready to import: $folder"
}
```

### Docker Volume Mounting

To upload folders from host to container:

**docker-compose.yml:**
```yaml
services:
  worker:
    volumes:
      - C:\YourDocs:/app/host_docs:ro
```

Then in DocuBrain:
```
/app/host_docs
```

---

## 📚 Quick Reference

### Path Method Workflow:
```
1. Click "📁 Folder Upload"
2. Select "📂 Specify Folder Path"
3. Type folder path
4. Check "Include subfolders" if needed
5. Click "📂 Scan Folder"
6. Review file count
7. Click "🚀 Upload All Files"
8. Wait for progress bar
9. See success message
10. Check Document Library
```

### Supported File Types:
- **Documents**: PDF, DOCX, TXT, MD
- **Presentations**: PPTX
- **Spreadsheets**: XLSX, CSV

### Path Examples:
```
✅ C:\Users\John\Documents\Reports
✅ D:\Projects\2024\Q4\Contracts
✅ \\FILESERVER\Shared\Department\Sales
✅ E:\Backup\ImportantDocs
✅ /app/documents (if Docker volume)
```

---

## 🎉 Success Checklist

After folder upload, verify:

- [ ] File count matches expectation
- [ ] Check "Document Library" for files
- [ ] Search for a filename to test
- [ ] Try AI Chat to test text extraction
- [ ] Check Activity Log for upload records
- [ ] Verify no errors in summary

---

## 🚀 Try It Now!

**Quick Test:**

1. Create test folder: `C:\TestUpload`
2. Add 5-10 documents
3. Open DocuBrain: http://localhost:8501
4. Go to "📤 Upload Documents"
5. Select "📁 Folder Upload"
6. Choose "📂 Specify Folder Path"
7. Type: `C:\TestUpload`
8. Click "📂 Scan Folder"
9. Click "🚀 Upload All Files"
10. Success! 🎈

---

**You now have TRUE folder upload capability!** 📂✨

**No more selecting individual files - just type the path and go!** 🚀
