"""
Text detection: DBNet placeholder + CRAFT fallback.
"""

import cv2
import numpy as np
from typing import List, Tuple, Dict, Any
import logging

logger = logging.getLogger(__name__)


class Detector:
    """Text detector (DBNet placeholder + CRAFT fallback)."""
    
    def __init__(self, method: str = "craft"):
        """
        Args:
            method: "dbnet" or "craft"
        """
        self.method = method
        # Placeholder: real implementation would load ONNX models
        # self.dbnet = onnxruntime.InferenceSession("models/dbnet.onnx")
        # self.craft = onnxruntime.InferenceSession("models/craft.onnx")
    
    def detect_craft(self, image: np.ndarray) -> List[np.ndarray]:
        """CRAFT detection (placeholder)."""
        logger.info("CRAFT detection (placeholder)")
        # In real implementation:
        # - Preprocess image
        # - Run ONNX CRAFT model
        # - Extract boxes from heatmap + affinity map
        # - Non-max suppression
        # For now, return dummy bbox
        h, w = image.shape[:2]
        return [np.array([[0, 0], [w, 0], [w, h], [0, h]])]
    
    def detect_dbnet(self, image: np.ndarray) -> List[np.ndarray]:
        """DBNet detection (placeholder)."""
        logger.info("DBNet detection (placeholder)")
        # Similar to CRAFT
        h, w = image.shape[:2]
        return [np.array([[0, 0], [w, 0], [w, h], [0, h]])]
    
    def detect(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Detect text regions.
        
        Returns:
            {
                "boxes": [polygon, ...],  # List of (N, 2) polygons
                "method": "craft" or "dbnet",
                "confidence": [float, ...]  # Per-box confidence
            }
        """
        if self.method == "craft":
            boxes = self.detect_craft(image)
        else:
            boxes = self.detect_dbnet(image)
        
        return {
            "boxes": boxes,
            "method": self.method,
            "confidence": [0.95] * len(boxes)  # Placeholder
        }
