"""
Evaluation harness: CER/WER metrics, JSON schema validation, bad-cases evaluation.
"""

import json
import logging
from typing import List, Dict, Any, Tuple
from pathlib import Path
import Levenshtein  # pip install python-Levenshtein

logger = logging.getLogger(__name__)


class Metrics:
    """Calculate Character Error Rate (CER) and Word Error Rate (WER)."""
    
    @staticmethod
    def cer(reference: str, hypothesis: str) -> float:
        """Character Error Rate."""
        if len(reference) == 0:
            return 0.0 if len(hypothesis) == 0 else 1.0
        
        distance = Levenshtein.distance(reference, hypothesis)
        return distance / len(reference)
    
    @staticmethod
    def wer(reference: str, hypothesis: str) -> float:
        """Word Error Rate."""
        ref_words = reference.split()
        hyp_words = hypothesis.split()
        
        if len(ref_words) == 0:
            return 0.0 if len(hyp_words) == 0 else 1.0
        
        distance = Levenshtein.distance(ref_words, hyp_words)
        return distance / len(ref_words)


class OCRResult:
    """Single OCR result."""
    
    def __init__(self, image_path: str, text: str, confidence: float, boxes: List = None):
        self.image_path = image_path
        self.text = text
        self.confidence = confidence
        self.boxes = boxes or []
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "image": self.image_path,
            "text": self.text,
            "confidence": self.confidence,
            "boxes": self.boxes
        }


class Evaluator:
    """Evaluate OCR results against expected manifest."""
    
    def __init__(self, manifest_path: str):
        """
        Load expected manifest.
        
        Format:
        {
            "bad_case_1.png": "Expected text here",
            "bad_case_2.png": "Another expected text",
            ...
        }
        """
        self.manifest_path = Path(manifest_path)
        self.expected = {}
        
        if self.manifest_path.exists():
            with open(self.manifest_path) as f:
                self.expected = json.load(f)
            logger.info(f"Loaded manifest with {len(self.expected)} items")
    
    def evaluate(self, results: List[OCRResult]) -> Dict[str, Any]:
        """
        Evaluate results.
        
        Returns:
            {
                "total": int,
                "correct": int,
                "accuracy": float,
                "avg_cer": float,
                "avg_wer": float,
                "per_case": [
                    {
                        "image": str,
                        "expected": str,
                        "predicted": str,
                        "cer": float,
                        "wer": float,
                        "correct": bool
                    },
                    ...
                ]
            }
        """
        if not self.expected:
            logger.warning("No expected manifest; skipping evaluation")
            return {}
        
        per_case = []
        total_cer = 0.0
        total_wer = 0.0
        correct_count = 0
        
        for result in results:
            image_name = Path(result.image_path).name
            expected_text = self.expected.get(image_name, "")
            predicted_text = result.text
            
            cer = Metrics.cer(expected_text, predicted_text)
            wer = Metrics.wer(expected_text, predicted_text)
            is_correct = cer == 0
            
            if is_correct:
                correct_count += 1
            
            total_cer += cer
            total_wer += wer
            
            per_case.append({
                "image": image_name,
                "expected": expected_text,
                "predicted": predicted_text,
                "cer": cer,
                "wer": wer,
                "correct": is_correct,
                "confidence": result.confidence
            })
        
        avg_cer = total_cer / len(results) if results else 0.0
        avg_wer = total_wer / len(results) if results else 0.0
        accuracy = correct_count / len(results) if results else 0.0
        
        return {
            "total": len(results),
            "correct": correct_count,
            "accuracy": accuracy,
            "avg_cer": avg_cer,
            "avg_wer": avg_wer,
            "per_case": per_case
        }
    
    def report(self, eval_results: Dict[str, Any]) -> str:
        """Generate human-readable report."""
        report = []
        report.append("=" * 60)
        report.append("OCR Evaluation Report")
        report.append("=" * 60)
        report.append(f"Total cases: {eval_results.get('total', 0)}")
        report.append(f"Correct: {eval_results.get('correct', 0)}")
        report.append(f"Accuracy: {eval_results.get('accuracy', 0)*100:.1f}%")
        report.append(f"Avg CER: {eval_results.get('avg_cer', 0):.1%}")
        report.append(f"Avg WER: {eval_results.get('avg_wer', 0):.1%}")
        report.append("")
        report.append("Per-case results:")
        report.append("-" * 60)
        
        for case in eval_results.get("per_case", []):
            status = "✓" if case["correct"] else "✗"
            report.append(f"{status} {case['image']}")
            report.append(f"  Expected: {case['expected']}")
            report.append(f"  Got:      {case['predicted']}")
            report.append(f"  CER: {case['cer']:.1%}, WER: {case['wer']:.1%}, Conf: {case['confidence']:.2f}")
            report.append("")
        
        return "\n".join(report)
