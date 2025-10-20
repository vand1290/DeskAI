import Tesseract from 'tesseract.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * OCR Processor for extracting text from scanned documents and images
 * Uses Tesseract.js for offline OCR processing
 */
class OCRProcessor {
  constructor() {
    this.worker = null;
    this.initialized = false;
  }

  /**
   * Initialize the OCR worker
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      this.worker = await Tesseract.createWorker('eng');
      this.initialized = true;
      console.log('OCR Worker initialized successfully');
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw new Error('OCR initialization failed');
    }
  }

  /**
   * Process an image file and extract text
   * @param {string|Buffer} imagePath - Path to image file or buffer
   * @returns {Promise<Object>} Extracted text and metadata
   */
  async processImage(imagePath) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const { data } = await this.worker.recognize(imagePath);
      
      return {
        text: data.text,
        confidence: data.confidence,
        words: data.words.map(word => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox
        })),
        lines: data.lines.map(line => ({
          text: line.text,
          confidence: line.confidence,
          bbox: line.bbox
        })),
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error('Failed to process image: ' + error.message);
    }
  }

  /**
   * Process multiple images in batch
   * @param {Array<string>} imagePaths - Array of image paths
   * @returns {Promise<Array>} Array of extraction results
   */
  async processBatch(imagePaths) {
    const results = [];
    
    for (const imagePath of imagePaths) {
      try {
        const result = await this.processImage(imagePath);
        results.push({
          filePath: imagePath,
          success: true,
          data: result
        });
      } catch (error) {
        results.push({
          filePath: imagePath,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Clean up resources
   */
  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.initialized = false;
      console.log('OCR Worker terminated');
    }
  }
}

export default OCRProcessor;
