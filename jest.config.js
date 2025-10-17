module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/__tests__/**'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  verbose: true,
  transformIgnorePatterns: [
    'node_modules/(?!(pdf-parse|pdfjs-dist)/)'
  ],
  moduleNameMapper: {
    '^pdf-parse$': '<rootDir>/src/__mocks__/pdf-parse.ts',
    '^tesseract\\.js$': '<rootDir>/src/__mocks__/tesseract.js.ts'
  }
};
