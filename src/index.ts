#!/usr/bin/env node

import { setupServer } from "./server/server-setup.js";

/**
 * Main entry point for the MCP Puppeteer server
 */
async function main() {
  try {
    // Add process event listeners for more visibility
    process.on('uncaughtException', (error) => {
      console.error('UNCAUGHT EXCEPTION:', error);
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('UNHANDLED REJECTION:', reason);
    });
    
    console.error('MCP Puppeteer server starting...');
    await setupServer();
    console.error("MCP Puppeteer server running");
  } catch (error) {
    console.error("Error starting server:", error);
    // Keep process alive even on error
    process.stdin.resume();
  }
}

// Explicitly catch any top-level errors
main().catch(error => {
  console.error("FATAL ERROR in main():", error);
  // Keep process alive even on fatal error
  process.stdin.resume();
});

// Add this to prevent immediate exit
process.stdin.resume();
