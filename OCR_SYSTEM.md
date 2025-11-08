# DeskAI OCR — Working Plan to MVP

## Overview

DeskAI now includes an **offline-first OCR system** for extracting text from:
- **Images** (PNG, JPG, TIFF, BMP)
- **PDFs** (via image rendering)
- **Handwritten text** (via PARSeq model)
- **Printed documents** (via TrOCR model)

Supports **multiple languages**: English, Romanian, Italian (extensible).

---

## Architecture

```
┌─────────────────┐
│  Input Document │ (Image / PDF)
└────────┬────────┘
         │
    ┌────▼────────────────────────────────────────┐
    │ PREPROCESSING                              │
    ├──────────────────────────────────────────────┤
    │ • Deskew (Hough lines)                      │
    │ • Invert detect (mean pixel analysis)       │
    │ • Adaptive binarization                     │
    │ • Light dewarp (polynomial warping)         │
    │ • Normalize to height=32px, width=512px     │
    └────┬─────────────────────────────────────────┘
         │
    ┌────▼──────────────┐
    │ DETECTION         │
    ├───────────────────┤
    │ CRAFT / DBNet     │
    │ (text regions)    │
    └────┬──────────────┘
         │
    ┌────▼────────────────────────────────────┐
    │ RECOGNITION (per line)                 │
    ├─────────────────────────────────────────┤
    │ TrOCR (seq2seq) + PARSeq (CTC)         │
    │ Both run in parallel                    │
    └────┬────────────────────────────────────┘
         │
    ┌────▼────────────────────────────────────┐
    │ ROUTING (confidence-based merge)        │
    ├─────────────────────────────────────────┤
    │ If TrOCR conf ≥ 0.7: use TrOCR        │
    │ Else: boost PARSeq (+0.1) and pick best│
    └────┬────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │ POSTPROCESSING                           │
    ├──────────────────────────────────────────┤
    │ • Normalize dates (YYYY-MM-DD)           │
    │ • Normalize amounts ($1,234.56 → 1234.56)│
    │ • Extract totals (regex patterns)        │
    │ • Language guessing (en/ro/it)           │
    │ • Currency mapping                       │
    └────┬──────────────────────────────────────┘
         │
    ┌────▼────────────────────────┐
    │ OUTPUT (JSON + Database)    │
    ├─────────────────────────────┤
    │ {                           │
    │   "text": "...",            │
    │   "confidence": 0.85,       │
    │   "boxes": [...],           │
    │   "language": "en",         │
    │   "totals": {...}           │
    │ }                           │
    └─────────────────────────────┘
```

---

## Project Structure

```
ocr/
├── __init__.py                 # Package init
├── preprocess.py              # Preprocessing pipeline
├── detect.py                  # Text detection (CRAFT/DBNet)
├── recognize.py               # Recognition (TrOCR/PARSeq)
├── router.py                  # Model routing + postprocessing
├── cli.py                     # Command-line interface
├── requirements.txt           # Dependencies
├── config.yaml                # Configuration template
├── eval/
│   ├── __init__.py
│   ├── metrics.py             # CER/WER evaluation
│   └── expected_manifest.json # Ground truth for bad-cases
└── bad_cases/                 # Sample problematic documents
    ├── bad_case_1.png         # (placeholder)
    ├── bad_case_2.png
    └── ...

02_models_data/               # ONNX model weights (download here)
├── trocr_base.onnx           # ~700MB
├── parseq.onnx                # ~100MB
├── dbnet.onnx                 # ~200MB (optional)
└── craft.onnx                 # ~200MB (optional)
```

---

## Quick Start

### 1. Setup Environment

```powershell
# Windows PowerShell
cd c:\Users\ACESFG167279MF\Desktop\DocBrain\docbrain-starter

# Create virtual environment
python -m venv .venv
. .\.venv\Scripts\Activate.ps1

# Install OCR dependencies
pip install -r ocr/requirements.txt
```

### 2. Download Models

Models are large (~1-1.5GB total) and must be downloaded separately:

```bash
# Download TrOCR (seq2seq for printed text)
# From: https://huggingface.co/microsoft/trocr-base-printed
# Save to: 02_models_data/trocr_base.onnx

# Download PARSeq (CTC for handwriting)
# From: https://huggingface.co/baudm/parseq
# Save to: 02_models_data/parseq.onnx
```

For now, the system runs with **placeholder models** (returns mock data) to test the pipeline.

### 3. Process a Document

```powershell
# Test image
python -m ocr.cli path/to/invoice.png -o out.json

# Test PDF (@220 DPI)
python -m ocr.cli path/to/document.pdf -o out.json --dpi 220

# Verbose output
python -m ocr.cli path/to/image.png -o out.json -v

# Custom config
python -m ocr.cli path/to/image.png -o out.json --config ocr/config.yaml
```

### 4. Evaluate Results

```powershell
# Run evaluation against expected manifest
python -m ocr.eval.metrics \
  --manifest ocr/eval/expected_manifest.json \
  --pred out.json
```

---

## Configuration (config.yaml)

Key tuning parameters:

```yaml
preprocess:
  binarize_method: adaptive    # Thresholding method
  invert_threshold_mean: 127   # When to invert (dark text)
  height_px: 32                # Line height
  gaussian_blur: 1             # Smoothing

router:
  trocr_min_conf: 0.7          # Confidence threshold for TrOCR
  parseq_bias: 0.1             # Bonus for PARSeq (cursive)

postprocess:
  locale: en_US                # Language for normalization
  enable_language_guess: true  # Auto-detect language
```

---

## Integration with DeskAI Desktop App

### OCR Tab in UI

The desktop app has an **OCR** button that:

1. Opens file picker → select image/PDF
2. Runs preprocessing + detection + recognition
3. Displays extracted text + confidence
4. Shows detected bounding boxes
5. Saves to database + JSON export

### Python API

```python
from ocr.cli import process_image
from ocr.router import Router, Postprocessor

# Process image
result = process_image("invoice.png")

# Result structure
{
    "image": "invoice.png",
    "text": "...",
    "confidence": 0.85,
    "lines": [
        {
            "text": "Line 1",
            "confidence": 0.90,
            "box": [[x,y], [x,y], ...],
            "model": "trocr",
            "language": "en"
        },
        ...
    ],
    "metadata": {
        "preprocessed": {...},
        "detector": "craft",
        "num_lines": 15,
        "inverted": false
    }
}
```

---

## KPI Targets (MVP)

| Metric | Target | Status |
|--------|--------|--------|
| **Line CER** | ≤ 8% (bad-cases 1/2/3/5) | 🔄 Tuning |
| **Line CER** | ≤ 5% (bad-case 4 after inversion) | 🔄 Tuning |
| **Field Accuracy** | Dates ≥ 98% | 🔄 Testing |
| **Field Accuracy** | Amounts ≥ 98% | 🔄 Testing |
| **Field Accuracy** | Totals ≥ 99% | 🔄 Testing |
| **Latency (CPU)** | A4 @300DPI ≤ 6s | 🔄 Benchmarking |
| **Latency (GPU)** | A4 @300DPI ≤ 1.5s | 🔄 Benchmarking |

---

## Mitigations for Known Issues

### Issue: Handwriting Not Recognized
**Solution**: Route low-confidence TrOCR results to PARSeq with confidence boost.

### Issue: Glare / Mobile Photos
**Solution**: 
- Aggressive inversion detection
- Adaptive binarization
- Light perspective correction

### Issue: Multiple Locales (EN/RO/IT)
**Solution**:
- Language guessing module
- Locale-specific normalizers
- Multi-language training later

---

## Next Steps (5-Day Roadmap)

### Day 1–2: Model Integration
- [ ] Download ONNX models (TrOCR, PARSeq)
- [ ] Verify ONNXRuntime inference
- [ ] Test on sample images

### Day 3: Preprocessing Tuning
- [ ] Collect bad-cases
- [ ] Tune binarization / dewarp
- [ ] Measure CER improvements

### Day 4: Field Extraction & Routing
- [ ] Implement confidence router
- [ ] Add regex patterns for dates/totals
- [ ] Normalize currencies

### Day 5: MVP & Deployment
- [ ] End-to-end testing (image → JSON)
- [ ] PDF multi-page support
- [ ] Package as .exe (PyInstaller)

### 90-Day Roadmap (Post-MVP)
1. **Model Fine-tuning** (Week 2–3)
   - Collect invoice/receipt dataset
   - Fine-tune TrOCR + PARSeq on domain data

2. **Performance Optimization** (Week 4)
   - CUDA / DirectML GPU acceleration
   - Model quantization (int8)
   - Batch inference

3. **Advanced Features** (Week 5–8)
   - Page-shape detection (perspective correction)
   - Table structure recognition
   - Handwriting segmentation

4. **Scale & Polish** (Week 9–12)
   - Production database integration
   - API layer (REST)
   - Web UI for batch processing

---

## Testing

### Unit Tests

```powershell
pytest ocr/ -v
pytest ocr/ -v --cov=ocr --cov-report=html
```

### Manual Testing

```powershell
# Test preprocessing
python -c "from ocr.preprocess import Preprocessor; p = Preprocessor(); print(p.config.__dict__)"

# Test detection
python -c "from ocr.detect import Detector; d = Detector(); print(d.detect_craft(...))"

# Test recognition
python -c "from ocr.recognize import Recognizer; r = Recognizer(); print(r.recognize(...))"
```

---

## References

- **TrOCR Paper**: https://arxiv.org/abs/2109.10282
- **PARSeq Paper**: https://arxiv.org/abs/2207.06966
- **CRAFT Detection**: https://arxiv.org/abs/1904.01941
- **ONNXRuntime**: https://onnxruntime.ai/
- **Hugging Face Models**: https://huggingface.co/

---

## Support

For questions:
- Check `ocr/config.yaml` for tuning
- Run with `-v` flag for debug logs
- Review `ocr/eval/metrics.py` for evaluation details

**Status**: ✅ **Ready for MVP integration** (placeholder models in place, full models to be downloaded)
