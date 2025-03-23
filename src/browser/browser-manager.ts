#!/usr/bin/env node

import puppeteer, { Browser, Page } from "puppeteer";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// Global state management for browser instances
export class BrowserManager {
  private browser: Browser | undefined;
  private page: Page | undefined;
  private consoleLogs: string[] = [];
  private server: Server;

  constructor(server: Server) {
    this.server = server;
  }

  /**
   * Ensures a browser instance is available, either by connecting to an existing one
   * or creating a new instance based on configuration.
   */
  async ensureBrowser(): Promise<Page> {
    console.error('Starting ensureBrowser function');
    console.error(`Environment variables: CONNECT_TO_EXISTING_BROWSER=${process.env.CONNECT_TO_EXISTING_BROWSER}, BROWSER_URL=${process.env.BROWSER_URL}`);
    
    if (!this.browser) {
      // Check if we should connect to existing browser or launch a new one
      let connectToExisting = process.env.CONNECT_TO_EXISTING_BROWSER === 'true';
      const browserURL = process.env.BROWSER_URL || 'http://localhost:9222';
      
      console.error(`Connect to existing: ${connectToExisting}, Browser URL: ${browserURL}`);
      
      if (connectToExisting) {
        console.error(`Connecting to existing browser at: ${browserURL}`);
        try {
          this.browser = await puppeteer.connect({ 
            browserURL,
            defaultViewport: null
          });
          console.error("Successfully connected to existing browser instance");
        } catch (error) {
          console.error(`Failed to connect to browser at ${browserURL}:`, error);
          console.error("Falling back to launching a new browser instance");
          // Fall back to launching a new browser
          connectToExisting = false;
        }
      }
      
      // Only launch a new browser if we're not connecting to an existing one or if connection failed
      if (!connectToExisting) {
        // Default arguments for different environments
        const npx_args = { headless: false };
        const docker_args = { headless: true, args: ["--no-sandbox", "--single-process", "--no-zygote"] };
        
        // Get custom Puppeteer arguments from environment variables if available
        let puppeteerArgs = {};
        if (process.env.PUPPETEER_ARGS) {
          try {
            puppeteerArgs = JSON.parse(process.env.PUPPETEER_ARGS);
            console.error("Using custom Puppeteer arguments:", puppeteerArgs);
          } catch (error) {
            console.error("Error parsing PUPPETEER_ARGS:", error);
          }
        }
        
        // Merge the appropriate default args with custom args
        const launchArgs = {
          ...(process.env.DOCKER_CONTAINER ? docker_args : npx_args),
          ...puppeteerArgs
        };
        
        console.error("Launching browser with arguments:", launchArgs);
        this.browser = await puppeteer.launch(launchArgs);
      }
      
      // Get the first page or create a new one if none exists
      const pages = await this.browser!.pages();
      this.page = pages.length > 0 ? pages[0] : await this.browser!.newPage();

      this.page.on("console", (msg) => {
        const logEntry = `[${msg.type()}] ${msg.text()}`;
        this.consoleLogs.push(logEntry);
        this.server.notification({
          method: "notifications/resources/updated",
          params: { uri: "console://logs" },
        });
      });
    }
    return this.page!;
  }

  /**
   * Get the current console logs
   */
  getConsoleLogs(): string[] {
    return this.consoleLogs;
  }

  /**
   * Close or disconnect from the browser based on how it was initialized
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      try {
        if (process.env.CONNECT_TO_EXISTING_BROWSER === 'true') {
          console.error("Disconnecting from browser");
          await this.browser.disconnect();
        } else {
          console.error("Closing browser");
          await this.browser.close();
        }
      } catch (error) {
        console.error("Error closing/disconnecting browser:", error);
      }
      this.browser = undefined;
      this.page = undefined;
    }
  }
}

// Type definition for the mcpHelper object added to the browser window
declare global {
  interface Window {
    mcpHelper: {
      logs: string[],
      originalConsole: Partial<typeof console>,
    }
  }
}
