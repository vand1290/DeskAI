/**
 * Handwriting Recognition Tool for extracting text from handwritten images
 * Enhanced OCR specifically for handwriting with confidence scoring and corrections
 */

import * as fs from 'fs';
import { createWorker, Worker } from 'tesseract.js';
import { Tool } from '../tools';

export interface HandwritingParams {
  action: 'recognize' | 'preprocess' | 'validate';
  imagePath?: string;
  text?: string;
}

/**
 * Handwriting Recognition Tool - specialized OCR for handwritten text
 */
export class HandwritingTool implements Tool {
  name = 'handwriting';
  description = 'Recognize handwritten text from images with confidence scoring';
  private worker?: Worker;
  private initialized: boolean = false;

  isAllowed(): boolean {
    return true;
  }

  async execute(params: HandwritingParams): Promise<any> {
    switch (params.action) {
      case 'recognize':
        return await this.recognizeHandwriting(params.imagePath!);
      case 'preprocess':
        return await this.preprocessHandwriting(params.imagePath!);
      case 'validate':
        return await this.validateRecognition(params.text!, params.imagePath!);
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  /**
   * Initialize Tesseract worker for handwriting recognition
   */
  private async initWorker(): Promise<void> {
    if (this.initialized && this.worker) {
      return;
    }

    // Use English language with best settings for handwriting
    this.worker = await createWorker('eng', 1, {
      logger: () => {} // Suppress logs
    });
    this.initialized = true;
  }

  /**
   * Recognize handwritten text with confidence and correction suggestions
   */
  private async recognizeHandwriting(imagePath: string): Promise<{
    text: string;
    confidence: number;
    corrections: string[];
  }> {
    if (!imagePath) {
      throw new Error('imagePath is required');
    }

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    await this.initWorker();

    try {
      const { data } = await this.worker!.recognize(imagePath);
      
      // Extract low-confidence words for correction suggestions
      const lowConfidenceWords = (data as any).words
        ? (data as any).words
            .filter((word: any) => word.confidence < 70)
            .map((word: any) => word.text)
        : [];

      // Generate correction suggestions for low-confidence words
      const corrections = this.generateCorrections(lowConfidenceWords);

      return {
        text: data.text.trim(),
        confidence: data.confidence,
        corrections
      };
    } catch (error) {
      throw new Error(`Handwriting recognition failed: ${error}`);
    }
  }

  /**
   * Preprocess handwriting image for better recognition
   * Note: Basic implementation - returns original path
   * In production, could implement advanced preprocessing:
   * - Binarization
   * - Noise reduction
   * - Skew correction
   * - Line detection
   */
  private async preprocessHandwriting(imagePath: string): Promise<{ processedPath: string }> {
    if (!imagePath) {
      throw new Error('imagePath is required');
    }

    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // For now, return the original path
    // In production, would apply handwriting-specific preprocessing
    return { processedPath: imagePath };
  }

  /**
   * Validate recognized text against the image
   * Returns true if recognition seems reasonable
   */
  private async validateRecognition(text: string, imagePath: string): Promise<{ valid: boolean; reason?: string }> {
    if (text === undefined || text === null) {
      throw new Error('text is required');
    }
    if (!imagePath) {
      throw new Error('imagePath is required');
    }

    // Basic validation rules
    
    // 1. Check if text is not empty
    if (text.trim().length === 0) {
      return { valid: false, reason: 'No text recognized' };
    }

    // 2. Check for reasonable character distribution
    const alphanumericCount = (text.match(/[a-zA-Z0-9]/g) || []).length;
    const totalChars = text.length;
    const alphanumericRatio = alphanumericCount / totalChars;

    if (alphanumericRatio < 0.3) {
      return { valid: false, reason: 'Too many non-alphanumeric characters detected' };
    }

    // 3. Run actual recognition to get confidence
    try {
      const result = await this.recognizeHandwriting(imagePath);
      
      if (result.confidence < 50) {
        return { valid: false, reason: `Low confidence score: ${result.confidence.toFixed(2)}%` };
      }

      return { valid: true };
    } catch (error) {
      return { valid: false, reason: `Validation failed: ${error}` };
    }
  }

  /**
   * Generate correction suggestions for words
   * Simple implementation based on common patterns
   */
  private generateCorrections(words: string[]): string[] {
    const corrections: string[] = [];

    for (const word of words) {
      // Common OCR mistakes for handwriting
      const commonMistakes: Record<string, string> = {
        // Letter confusions
        '0': 'O',
        'O': '0',
        '1': 'I',
        'I': '1',
        'l': 'I',
        '5': 'S',
        'S': '5',
        '8': 'B',
        'B': '8',
        'rn': 'm',
        'vv': 'w',
        'cl': 'd'
      };

      // Generate variations based on common mistakes
      for (const [mistake, correction] of Object.entries(commonMistakes)) {
        if (word.includes(mistake)) {
          const corrected = word.replace(new RegExp(mistake, 'g'), correction);
          if (corrected !== word && !corrections.includes(corrected)) {
            corrections.push(`${word} → ${corrected}`);
          }
        }
      }
    }

    return corrections.slice(0, 5); // Limit to 5 suggestions
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
