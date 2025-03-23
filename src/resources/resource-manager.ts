import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { BrowserManager } from "../browser/browser-manager.js";

/**
 * Manages resources like screenshots and console logs
 */
export class ResourceManager {
  private screenshots: Map<string, string> = new Map();
  private browserManager: BrowserManager;
  private server: Server;

  constructor(browserManager: BrowserManager, server: Server) {
    this.browserManager = browserManager;
    this.server = server;
  }

  /**
   * Add a new screenshot
   */
  addScreenshot(name: string, data: string): void {
    this.screenshots.set(name, data);
    this.server.notification({
      method: "notifications/resources/list_changed",
    });
  }

  /**
   * Get all resource URIs
   */
  getResourceList(): Array<{ uri: string; mimeType: string; name: string }> {
    const consoleLogs = [{
      uri: "console://logs",
      mimeType: "text/plain",
      name: "Browser console logs",
    }];

    const screenshotResources = Array.from(this.screenshots.keys()).map(name => ({
      uri: `screenshot://${name}`,
      mimeType: "image/png",
      name: `Screenshot: ${name}`,
    }));

    return [...consoleLogs, ...screenshotResources];
  }

  /**
   * Get a specific resource by URI
   */
  getResource(uri: string): { uri: string; mimeType: string; text?: string; blob?: string } | null {
    if (uri === "console://logs") {
      return {
        uri,
        mimeType: "text/plain",
        text: this.browserManager.getConsoleLogs().join("\n"),
      };
    }

    if (uri.startsWith("screenshot://")) {
      const name = uri.split("://")[1];
      const screenshot = this.screenshots.get(name);
      if (screenshot) {
        return {
          uri,
          mimeType: "image/png",
          blob: screenshot,
        };
      }
    }

    return null;
  }
}
