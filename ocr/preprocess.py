"""
Preprocessing pipeline: deskew, invert detection, adaptive binarization, light dewarp, crop/normalize.
"""

import cv2
import numpy as np
from typing import Tuple, Dict, Any
import logging

logger = logging.getLogger(__name__)


class PreprocessConfig:
    """Preprocessing configuration."""
    
    def __init__(self, **kwargs):
        # Binarization
        self.binarize_method = kwargs.get("binarize_method", "adaptive")  # "adaptive", "otsu"
        self.adaptive_block_size = kwargs.get("adaptive_block_size", 11)
        self.adaptive_c = kwargs.get("adaptive_c", 2)
        
        # Inversion
        self.invert_threshold_mean = kwargs.get("invert_threshold_mean", 127)
        
        # Dewarp
        self.enable_dewarp = kwargs.get("enable_dewarp", True)
        self.dewarp_strength = kwargs.get("dewarp_strength", 0.02)
        
        # Normalization
        self.height_px = kwargs.get("height_px", 32)
        self.width_px = kwargs.get("width_px", 512)
        
        # Blur
        self.gaussian_blur = kwargs.get("gaussian_blur", 1)  # kernel size (odd)


class Preprocessor:
    """Preprocessing pipeline."""
    
    def __init__(self, config: PreprocessConfig = None):
        self.config = config or PreprocessConfig()
    
    def deskew(self, image: np.ndarray) -> np.ndarray:
        """Deskew image (stub for now, can use Hough transform)."""
        # Placeholder: return as-is
        # TODO: Implement proper deskew with Hough line detection
        return image
    
    def detect_invert(self, image: np.ndarray) -> Tuple[np.ndarray, bool]:
        """Detect if image should be inverted (text darker than background)."""
        # Mean pixel value
        mean_val = np.mean(image)
        should_invert = mean_val < self.config.invert_threshold_mean
        
        if should_invert:
            image = cv2.bitwise_not(image)
            logger.debug(f"Inverted image (mean={mean_val:.1f})")
        
        return image, should_invert
    
    def binarize(self, image: np.ndarray) -> np.ndarray:
        """Adaptive or Otsu binarization."""
        if len(image.shape) == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        if self.config.binarize_method == "adaptive":
            binary = cv2.adaptiveThreshold(
                image,
                255,
                cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY,
                self.config.adaptive_block_size,
                self.config.adaptive_c
            )
        else:  # otsu
            _, binary = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        return binary
    
    def light_dewarp(self, image: np.ndarray) -> np.ndarray:
        """Light perspective correction (stub)."""
        if not self.config.enable_dewarp:
            return image
        # Placeholder: light polynomial warping
        # TODO: Implement page-shape detection with cv2.getPerspectiveTransform
        return image
    
    def normalize_line_height(self, image: np.ndarray) -> np.ndarray:
        """Resize line to standard height, preserve aspect ratio."""
        if len(image.shape) == 3:
            image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        h, w = image.shape
        aspect = w / h
        
        target_w = int(self.config.height_px * aspect)
        target_w = min(target_w, self.config.width_px)
        
        resized = cv2.resize(image, (target_w, self.config.height_px), interpolation=cv2.INTER_CUBIC)
        
        # Pad to fixed width
        if resized.shape[1] < self.config.width_px:
            padded = np.pad(resized, ((0, 0), (0, self.config.width_px - resized.shape[1])), 
                          constant_values=255)
        else:
            padded = resized[:, :self.config.width_px]
        
        return padded
    
    def apply_blur(self, image: np.ndarray) -> np.ndarray:
        """Optional Gaussian blur."""
        if self.config.gaussian_blur > 1:
            image = cv2.GaussianBlur(image, (self.config.gaussian_blur, self.config.gaussian_blur), 0)
        return image
    
    def process(self, image: np.ndarray) -> Dict[str, Any]:
        """Full preprocessing pipeline."""
        logger.info("Starting preprocessing...")
        
        image = self.deskew(image)
        image, inverted = self.detect_invert(image)
        image = self.binarize(image)
        image = self.light_dewarp(image)
        image = self.apply_blur(image)
        image = self.normalize_line_height(image)
        
        logger.info("Preprocessing complete")
        
        return {
            "image": image,
            "inverted": inverted,
            "height": self.config.height_px,
            "width": image.shape[1]
        }
