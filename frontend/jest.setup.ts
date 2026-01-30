// Jest setup file for Dashboard Daddy
import '@testing-library/jest-dom';

// Global fetch polyfill for Node.js test environment
if (!global.fetch) {
  global.fetch = require('node-fetch');
}

// Set test environment variables
process.env.TEST_API_URL = process.env.TEST_API_URL || 'http://localhost:3000';
