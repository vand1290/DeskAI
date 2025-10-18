/**
 * OCR Tool for extracting text from images
 * Uses Tesseract.js for offline text extraction
 */

import * as fs from 'fs';
import { createWorker, Worker } from 'tesseract.js';
import { Tool } from '../tools';

export interface TextBlock {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
}

export interface OCRResult {
  text: string;
  confidence: number;
  imagePath: string;
}

export interface OCRParams {
  action: 'extract' | 'extractLayout' | 'preprocess' | 'languages' | 'batch';
  imagePath?: string;
  imagePaths?: string[];
  language?: string;
}

/**
 * OCR Tool - extract text from images using Tesseract.js
 */
export class OCRTool implements Tool {
  name = 'ocr';
  description = 'Extract text from images using OCR (supports JPG, PNG, BMP, WebP)';
  private worker?: Worker;
  private initialized: boolean = false;

  isAllowed(): boolean {
    return true;
  }

  async execute(params: OCRParams): Promise<any> {
    switch (params.action) {
      case 'extract':
        return await this.extractText(params.imagePath!, params.language);
      case 'extractLayout':
        return await this.extractTextWithLayout(params.imagePath!);
      case 'preprocess':
        return await this.preprocessImage(params.imagePath!);
      case 'languages':
        return this.supportedLanguages();
      case 'batch':
        return await this.batchProcess(params.imagePaths!);
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  /**
   * Initialize Tesseract worker
   */
  private async initWorker(language: string = 'eng'): Promise<void> {
    if (this.initialized && this.worker) {
      return;
    }

    this.worker = await createWorker(language, 1, {
      logger: () => {} // Suppress logs for cleaner output
    });
    this.initialized = true;
  }

  /**
   * Extract text from image with confidence score
   */
  private async extractText(
    imagePath: string,
    language: string = 'eng'
  ): Promise<{ text: string; confidence: number }> {
    if (!imagePath) {
      throw new Error('imagePath is required');
    }

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // Validate image format
    const validFormats = ['.jpg', '.jpeg', '.png', '.bmp', '.webp'];
    const ext = imagePath.toLowerCase().slice(imagePath.lastIndexOf('.'));
    if (!validFormats.includes(ext)) {
      throw new Error(`Unsupported image format: ${ext}. Supported: ${validFormats.join(', ')}`);
    }

    // Initialize worker with specified language
    await this.initWorker(language);

    try {
      const { data } = await this.worker!.recognize(imagePath);
      
      return {
        text: data.text.trim(),
        confidence: data.confidence
      };
    } catch (error) {
      throw new Error(`OCR extraction failed: ${error}`);
    }
  }

  /**
   * Extract text with layout information (bounding boxes)
   */
  private async extractTextWithLayout(imagePath: string): Promise<{ blocks: TextBlock[] }> {
    if (!imagePath) {
      throw new Error('imagePath is required');
    }

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    await this.initWorker();

    try {
      const { data } = await this.worker!.recognize(imagePath);
      
      const blocks: TextBlock[] = (data as any).words
        ? (data as any).words.map((word: any) => ({
            text: word.text,
            confidence: word.confidence,
            bbox: {
              x0: word.bbox.x0,
              y0: word.bbox.y0,
              x1: word.bbox.x1,
              y1: word.bbox.y1
            }
          }))
        : [];

      return { blocks };
    } catch (error) {
      throw new Error(`OCR layout extraction failed: ${error}`);
    }
  }

  /**
   * Preprocess image for better OCR accuracy
   * Note: Basic implementation - returns original path
   * In production, could implement actual preprocessing (contrast, denoise, etc.)
   */
  private async preprocessImage(imagePath: string): Promise<{ processedPath: string }> {
    if (!imagePath) {
      throw new Error('imagePath is required');
    }

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // For now, return the original path
    // In production, would apply image preprocessing here
    return { processedPath: imagePath };
  }

  /**
   * Get list of supported languages
   */
  private supportedLanguages(): { languages: Array<{ code: string; name: string }> } {
    return {
      languages: [
        { code: 'eng', name: 'English' },
        { code: 'deu', name: 'German' },
        { code: 'fra', name: 'French' },
        { code: 'spa', name: 'Spanish' },
        { code: 'ita', name: 'Italian' },
        { code: 'por', name: 'Portuguese' },
        { code: 'nld', name: 'Dutch' },
        { code: 'rus', name: 'Russian' },
        { code: 'chi_sim', name: 'Chinese Simplified' },
        { code: 'jpn', name: 'Japanese' }
      ]
    };
  }

  /**
   * Process multiple images in batch
   */
  private async batchProcess(imagePaths: string[]): Promise<{ results: OCRResult[] }> {
    if (!imagePaths || imagePaths.length === 0) {
      throw new Error('imagePaths is required and must not be empty');
    }

    const results: OCRResult[] = [];

    for (const imagePath of imagePaths) {
      try {
        const { text, confidence } = await this.extractText(imagePath);
        results.push({ text, confidence, imagePath });
      } catch (error) {
        // Continue processing other images even if one fails
        results.push({
          text: '',
          confidence: 0,
          imagePath
        });
      }
    }

    return { results };
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = undefined;
      this.initialized = false;
    }
  }
}
