"""
Command-line interface for DeskAI OCR.

Usage:
    python -m ocr.cli path/to/image.png -o out.json
    python -m ocr.cli path/to/document.pdf -o out.json --dpi 220
    python -m ocr.eval.metrics --manifest ocr/eval/expected_manifest.json --pred out.json
"""

import argparse
import json
import logging
from pathlib import Path
from typing import List, Dict, Any
import sys

# Local imports
from ocr.preprocess import Preprocessor, PreprocessConfig
from ocr.detect import Detector
from ocr.recognize import Recognizer, RecognizerConfig
from ocr.router import Router, RouterConfig, Postprocessor, PostprocessorConfig
from ocr.eval.metrics import Evaluator, OCRResult, Metrics

logger = logging.getLogger(__name__)


def setup_logging(verbose: bool = False):
    """Setup logging."""
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )


def process_image(image_path: str, config_dict: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Process single image.
    
    Args:
        image_path: Path to image file
        config_dict: Configuration overrides
    
    Returns:
        {
            "image": str,
            "text": str,
            "confidence": float,
            "boxes": [list of boxes],
            "metadata": {}
        }
    """
    import cv2
    
    config_dict = config_dict or {}
    
    try:
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            raise FileNotFoundError(f"Cannot read {image_path}")
        
        # Preprocess
        preproc_config = PreprocessConfig(**config_dict.get("preprocess", {}))
        preprocessor = Preprocessor(preproc_config)
        preproc_result = preprocessor.process(image)
        
        # Detect
        detector = Detector()
        detect_result = detector.detect(preproc_result["image"])
        
        # Recognize (per line)
        recognizer = Recognizer(RecognizerConfig(**config_dict.get("recognize", {})))
        router = Router(RouterConfig(**config_dict.get("router", {})))
        postprocessor = Postprocessor(PostprocessorConfig(**config_dict.get("postprocess", {})))
        
        lines = []
        for i, box in enumerate(detect_result["boxes"]):
            # Extract line region (simplified)
            rec_result = recognizer.recognize(preproc_result["image"], use_both=True)
            routed = router.route(rec_result)
            postproc = postprocessor.postprocess(routed["text"])
            
            lines.append({
                "box": box.tolist() if hasattr(box, "tolist") else box,
                "text": postproc["text"],
                "confidence": routed["confidence"],
                "model": routed["model"],
                "language": postproc.get("language", "en"),
                "totals": postproc.get("totals", {})
            })
        
        # Aggregate
        full_text = "\n".join([line["text"] for line in lines])
        avg_confidence = sum(line["confidence"] for line in lines) / len(lines) if lines else 0
        
        return {
            "image": str(image_path),
            "text": full_text,
            "confidence": avg_confidence,
            "lines": lines,
            "metadata": {
                "preprocessed": preproc_result,
                "detector": detect_result["method"],
                "num_lines": len(lines),
                "inverted": preproc_result.get("inverted", False)
            }
        }
    
    except Exception as e:
        logger.error(f"Error processing {image_path}: {e}", exc_info=True)
        return {
            "image": str(image_path),
            "error": str(e),
            "text": "",
            "confidence": 0.0
        }


def process_pdf(pdf_path: str, dpi: int = 150, config_dict: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """
    Process PDF (convert to images, then OCR).
    
    Args:
        pdf_path: Path to PDF
        dpi: Resolution for rendering
        config_dict: Configuration
    
    Returns:
        List of OCR results per page
    """
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise ImportError("PyMuPDF required: pip install PyMuPDF")
    
    config_dict = config_dict or {}
    results = []
    
    try:
        doc = fitz.open(pdf_path)
        
        for page_num in range(len(doc)):
            logger.info(f"Processing page {page_num + 1}/{len(doc)}")
            
            page = doc[page_num]
            
            # Render to image
            mat = fitz.Matrix(dpi / 72, dpi / 72)
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("ppm")
            
            # Save temp image
            temp_path = f"/tmp/page_{page_num}.png"
            with open(temp_path, "wb") as f:
                f.write(img_data)
            
            # Process
            result = process_image(temp_path, config_dict)
            result["page"] = page_num + 1
            results.append(result)
        
        doc.close()
    
    except Exception as e:
        logger.error(f"Error processing PDF {pdf_path}: {e}", exc_info=True)
    
    return results


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description="DeskAI OCR - Offline optical character recognition"
    )
    
    parser.add_argument("input", help="Image or PDF file")
    parser.add_argument("-o", "--output", required=True, help="Output JSON file")
    parser.add_argument("--dpi", type=int, default=150, help="DPI for PDF rendering (default: 150)")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose logging")
    parser.add_argument("--config", help="Config YAML file (optional)")
    
    args = parser.parse_args()
    
    setup_logging(args.verbose)
    
    input_path = Path(args.input)
    if not input_path.exists():
        logger.error(f"File not found: {args.input}")
        sys.exit(1)
    
    # Load config
    config_dict = {}
    if args.config:
        try:
            import yaml
            with open(args.config) as f:
                config_dict = yaml.safe_load(f) or {}
        except ImportError:
            logger.warning("PyYAML not installed; using default config")
    
    # Process
    if input_path.suffix.lower() == ".pdf":
        logger.info(f"Processing PDF: {args.input} @ {args.dpi} DPI")
        results = process_pdf(str(input_path), dpi=args.dpi, config_dict=config_dict)
        output_data = {"type": "pdf", "results": results}
    else:
        logger.info(f"Processing image: {args.input}")
        result = process_image(str(input_path), config_dict)
        output_data = {"type": "image", "results": [result]}
    
    # Save output
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "w") as f:
        json.dump(output_data, f, indent=2)
    
    logger.info(f"Results saved to {args.output}")
    
    # Print summary
    for result in output_data["results"]:
        if "error" not in result:
            print(f"\n{result['image']}:")
            print(f"  Text: {result['text'][:100]}...")
            print(f"  Confidence: {result['confidence']:.2f}")
            if "page" in result:
                print(f"  Page: {result['page']}")


if __name__ == "__main__":
    main()
