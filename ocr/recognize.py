"""
Text recognition: TrOCR (seq2seq) + PARSeq (CTC) with ONNXRuntime.
"""

import numpy as np
from typing import List, Dict, Any, Tuple
import logging
import os
from pathlib import Path

logger = logging.getLogger(__name__)


class RecognizerConfig:
    """Recognition model configuration."""
    
    def __init__(self, **kwargs):
        self.trocr_onnx_path = kwargs.get("trocr_onnx_path", None)
        self.parseq_onnx_path = kwargs.get("parseq_onnx_path", None)
        self.use_onnx = kwargs.get("use_onnx", True)


class Recognizer:
    """Text recognizer: TrOCR + PARSeq."""
    
    def __init__(self, config: RecognizerConfig = None):
        self.config = config or RecognizerConfig()
        self.trocr_session = None
        self.parseq_session = None
        
        if self.config.use_onnx:
            try:
                import onnxruntime as ort
                
                if self.config.trocr_onnx_path and os.path.exists(self.config.trocr_onnx_path):
                    self.trocr_session = ort.InferenceSession(self.config.trocr_onnx_path)
                    logger.info(f"Loaded TrOCR: {self.config.trocr_onnx_path}")
                
                if self.config.parseq_onnx_path and os.path.exists(self.config.parseq_onnx_path):
                    self.parseq_session = ort.InferenceSession(self.config.parseq_onnx_path)
                    logger.info(f"Loaded PARSeq: {self.config.parseq_onnx_path}")
            except ImportError:
                logger.warning("ONNXRuntime not installed, using placeholder inference")
                self.config.use_onnx = False
    
    def recognize_trocr(self, image: np.ndarray) -> Tuple[str, float]:
        """
        TrOCR recognition (seq2seq).
        
        Args:
            image: Preprocessed line image
        
        Returns:
            (text, confidence)
        """
        if self.trocr_session:
            try:
                # Normalize image to [0, 1]
                if image.max() > 1:
                    image = image.astype(np.float32) / 255.0
                
                # Add batch + channel dims if needed
                if len(image.shape) == 2:
                    image = np.expand_dims(np.expand_dims(image, 0), 0)
                
                input_name = self.trocr_session.get_inputs()[0].name
                output_name = self.trocr_session.get_outputs()[0].name
                
                result = self.trocr_session.run([output_name], {input_name: image})
                text = str(result[0])
                confidence = 0.85
                
            except Exception as e:
                logger.error(f"TrOCR error: {e}")
                text = ""
                confidence = 0.0
        else:
            text = "[TrOCR placeholder]"
            confidence = 0.7
        
        return text, confidence
    
    def recognize_parseq(self, image: np.ndarray) -> Tuple[str, float]:
        """
        PARSeq recognition (CTC).
        
        Args:
            image: Preprocessed line image
        
        Returns:
            (text, confidence)
        """
        if self.parseq_session:
            try:
                if image.max() > 1:
                    image = image.astype(np.float32) / 255.0
                
                if len(image.shape) == 2:
                    image = np.expand_dims(np.expand_dims(image, 0), 0)
                
                input_name = self.parseq_session.get_inputs()[0].name
                output_name = self.parseq_session.get_outputs()[0].name
                
                result = self.parseq_session.run([output_name], {input_name: image})
                text = str(result[0])
                confidence = 0.80
                
            except Exception as e:
                logger.error(f"PARSeq error: {e}")
                text = ""
                confidence = 0.0
        else:
            text = "[PARSeq placeholder]"
            confidence = 0.65
        
        return text, confidence
    
    def recognize(self, image: np.ndarray, use_both: bool = False) -> Dict[str, Any]:
        """
        Recognize text using TrOCR and/or PARSeq.
        
        Args:
            image: Preprocessed line image
            use_both: If True, return both models; if False, use router to pick best
        
        Returns:
            {
                "text": str,
                "confidence": float,
                "model": "trocr" | "parseq" | "trocr+parseq",
                "trocr_text": str,
                "trocr_conf": float,
                "parseq_text": str,
                "parseq_conf": float
            }
        """
        trocr_text, trocr_conf = self.recognize_trocr(image)
        parseq_text, parseq_conf = self.recognize_parseq(image)
        
        if use_both:
            # Router will merge in next step
            model_used = "trocr+parseq"
            text = trocr_text if trocr_conf > parseq_conf else parseq_text
            confidence = max(trocr_conf, parseq_conf)
        else:
            if trocr_conf > parseq_conf:
                model_used = "trocr"
                text = trocr_text
                confidence = trocr_conf
            else:
                model_used = "parseq"
                text = parseq_text
                confidence = parseq_conf
        
        return {
            "text": text,
            "confidence": confidence,
            "model": model_used,
            "trocr_text": trocr_text,
            "trocr_conf": trocr_conf,
            "parseq_text": parseq_text,
            "parseq_conf": parseq_conf
        }
