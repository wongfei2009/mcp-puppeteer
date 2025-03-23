#!/usr/bin/env node

// Re-export from the src directory to maintain backward compatibility
export * from './src/index.js';

// Also run the main function directly
import './src/index.js';
