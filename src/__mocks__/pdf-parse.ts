/**
 * Mock for pdf-parse to avoid Jest ESM issues
 */

export default async function pdfParse(dataBuffer: Buffer): Promise<any> {
  // Mock PDF parsing for tests
  return {
    numpages: 1,
    numrender: 1,
    info: {
      Title: 'Test PDF',
      Author: 'Test Author',
      Creator: 'Test Creator'
    },
    metadata: null,
    text: 'This is mock PDF content extracted from the test file.',
    version: '1.10.100'
  };
}
