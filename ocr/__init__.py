"""
DeskAI OCR — Offline-first optical character recognition for invoices/receipts.

Features:
- Preprocessing: deskew, invert, binarize, dewarp
- Detection: DBNet placeholder + CRAFT fallback
- Recognition: TrOCR (seq2seq) + PARSeq (CTC) with ONNXRuntime
- Routing: confidence-based model selection
- Postprocessing: locale-aware normalization (dates, amounts, totals)
- Evaluation: CER/WER per line, field accuracy, latency tracking
"""

__version__ = "0.1.0"
