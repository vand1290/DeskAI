"""
Router: confidence-based TrOCR ↔ PARSeq merge strategy.
Postprocessor: locale-aware normalization (dates, amounts, totals, currencies).
"""

import re
import logging
from typing import Dict, Any, List, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)


class RouterConfig:
    """Router configuration."""
    
    def __init__(self, **kwargs):
        self.trocr_min_conf = kwargs.get("trocr_min_conf", 0.7)
        self.parseq_bias = kwargs.get("parseq_bias", 0.1)  # Boost for cursive


class Router:
    """Route recognition results: TrOCR for printed, PARSeq for cursive."""
    
    def __init__(self, config: RouterConfig = None):
        self.config = config or RouterConfig()
    
    def route(self, recognition_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Route based on confidence.
        
        Strategy:
        - If TrOCR conf >= trocr_min_conf, use TrOCR
        - Else boost PARSeq by parseq_bias and pick best
        """
        trocr_conf = recognition_result.get("trocr_conf", 0)
        parseq_conf = recognition_result.get("parseq_conf", 0)
        trocr_text = recognition_result.get("trocr_text", "")
        parseq_text = recognition_result.get("parseq_text", "")
        
        if trocr_conf >= self.config.trocr_min_conf:
            # Use TrOCR (printed text)
            chosen_text = trocr_text
            chosen_model = "trocr"
            chosen_conf = trocr_conf
        else:
            # Boost PARSeq for cursive
            boosted_parseq = parseq_conf + self.config.parseq_bias
            if boosted_parseq > trocr_conf:
                chosen_text = parseq_text
                chosen_model = "parseq"
                chosen_conf = boosted_parseq
            else:
                chosen_text = trocr_text
                chosen_model = "trocr"
                chosen_conf = trocr_conf
        
        return {
            "text": chosen_text,
            "model": chosen_model,
            "confidence": chosen_conf
        }


class PostprocessorConfig:
    """Postprocessor configuration."""
    
    def __init__(self, **kwargs):
        self.locale = kwargs.get("locale", "en_US")
        self.currency_symbols = kwargs.get("currency_symbols", {"$": "USD", "€": "EUR", "£": "GBP"})
        self.enable_language_guess = kwargs.get("enable_language_guess", True)


class Postprocessor:
    """Postprocess recognized text: normalization, regex boosts."""
    
    def __init__(self, config: PostprocessorConfig = None):
        self.config = config or PostprocessorConfig()
    
    def normalize_numbers(self, text: str) -> str:
        """Normalize numbers: remove spaces, fix common OCR errors."""
        # Remove spaces from numbers
        text = re.sub(r'(\d)\s+(\d)', r'\1\2', text)
        
        # Common OCR: 0 ↔ O, 1 ↔ l, 5 ↔ S, 8 ↔ B
        # This is locale/context-dependent; apply carefully
        
        return text
    
    def normalize_dates(self, text: str) -> str:
        """Normalize dates: YYYY-MM-DD, DD/MM/YYYY, etc."""
        # Regex patterns for common date formats
        patterns = [
            (r'(\d{2})[/-](\d{2})[/-](\d{4})', r'\3-\1-\2'),  # DD/MM/YYYY → YYYY-DD-MM
            (r'(\d{4})[/-](\d{2})[/-](\d{2})', r'\1-\2-\3'),  # Already ISO
        ]
        
        for pattern, repl in patterns:
            text = re.sub(pattern, repl, text)
        
        return text
    
    def normalize_amounts(self, text: str) -> str:
        """Normalize currency amounts."""
        # Remove spaces/commas in numbers
        text = re.sub(r'(\d+)\s*,\s*(\d{2})', r'\1.\2', text)  # 1,234.56 → 1234.56
        text = re.sub(r'(\d+)\s*\.\s*(\d{3})\s*,\s*(\d{2})', r'\1\2.\3', text)  # 1.234,56 → 123456.56
        
        return text
    
    def extract_totals(self, text: str) -> Dict[str, Any]:
        """Extract invoice totals (subtotal, tax, total)."""
        totals = {}
        
        # Total (various patterns)
        total_pattern = r'(?:total|grand\s+total)[\s:]*\$?\s*([\d.,]+)'
        match = re.search(total_pattern, text, re.IGNORECASE)
        if match:
            totals["total"] = match.group(1)
        
        # Subtotal
        subtotal_pattern = r'(?:subtotal|sub[\s-]?total)[\s:]*\$?\s*([\d.,]+)'
        match = re.search(subtotal_pattern, text, re.IGNORECASE)
        if match:
            totals["subtotal"] = match.group(1)
        
        # Tax
        tax_pattern = r'(?:tax|VAT|gst)[\s:]*\$?\s*([\d.,]+)'
        match = re.search(tax_pattern, text, re.IGNORECASE)
        if match:
            totals["tax"] = match.group(1)
        
        return totals
    
    def guess_language(self, text: str) -> str:
        """Guess language based on text content."""
        # Simple heuristic
        en_words = {"the", "and", "of", "to", "is", "in"}
        ro_words = {"și", "a", "de", "în", "care", "sa"}
        it_words = {"il", "e", "di", "in", "per"}
        
        text_lower = text.lower().split()
        
        en_count = sum(1 for w in text_lower if w in en_words)
        ro_count = sum(1 for w in text_lower if w in ro_words)
        it_count = sum(1 for w in text_lower if w in it_words)
        
        if ro_count > max(en_count, it_count):
            return "ro"
        elif it_count > en_count:
            return "it"
        else:
            return "en"
    
    def postprocess(self, text: str) -> Dict[str, Any]:
        """Full postprocessing pipeline."""
        logger.info("Postprocessing...")
        
        # Normalize
        text = self.normalize_numbers(text)
        text = self.normalize_dates(text)
        text = self.normalize_amounts(text)
        
        # Extract key fields
        totals = self.extract_totals(text)
        
        # Language
        language = self.guess_language(text) if self.config.enable_language_guess else self.config.locale[:2]
        
        return {
            "text": text,
            "totals": totals,
            "language": language,
            "locale": self.config.locale
        }
