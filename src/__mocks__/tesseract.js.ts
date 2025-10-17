/**
 * Mock for tesseract.js to avoid heavy initialization in tests
 */

export interface Worker {
  recognize(image: string): Promise<any>;
  terminate(): Promise<void>;
}

export async function createWorker(language: string = 'eng', oem: number = 1, options?: any): Promise<Worker> {
  return {
    async recognize(image: string) {
      return {
        data: {
          text: 'Mock OCR text extracted from image',
          confidence: 85.5,
          words: [
            {
              text: 'Mock',
              confidence: 90,
              bbox: { x0: 0, y0: 0, x1: 50, y1: 20 }
            },
            {
              text: 'OCR',
              confidence: 85,
              bbox: { x0: 55, y0: 0, x1: 90, y1: 20 }
            },
            {
              text: 'text',
              confidence: 82,
              bbox: { x0: 95, y0: 0, x1: 140, y1: 20 }
            }
          ]
        }
      };
    },
    async terminate() {
      // Mock termination
    }
  };
}
