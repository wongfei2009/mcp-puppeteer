import { CallToolResult, TextContent, ImageContent } from "@modelcontextprotocol/sdk/types.js";
import { BrowserManager } from "../browser/browser-manager.js";
import { ResourceManager } from "../resources/resource-manager.js";

// Handler for all tool invocations
export class ToolHandler {
  private browserManager: BrowserManager;
  private resourceManager: ResourceManager;

  constructor(browserManager: BrowserManager, resourceManager: ResourceManager) {
    this.browserManager = browserManager;
    this.resourceManager = resourceManager;
  }

  /**
   * Handle a tool call by name with arguments
   */
  async handleToolCall(name: string, args: any): Promise<CallToolResult> {
    try {
      const page = await this.browserManager.ensureBrowser();

      switch (name) {
      case "puppeteer_navigate":
        return this.handleNavigate(page, args);
      case "puppeteer_screenshot":
        return this.handleScreenshot(page, args);
      case "puppeteer_click":
        return this.handleClick(page, args);
      case "puppeteer_fill":
        return this.handleFill(page, args);
      case "puppeteer_select":
        return this.handleSelect(page, args);
      case "puppeteer_hover":
        return this.handleHover(page, args);
      case "puppeteer_evaluate":
        return this.handleEvaluate(page, args);
      default:
        return {
          content: [{
            type: "text",
            text: `Unknown tool: ${name}`,
          }],
          isError: true,
        };
      }
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Error executing tool ${name}: ${(error as Error).message}`,
        }],
        isError: true,
      };
    }
  }

  /**
   * Navigate to a URL
   */
  private async handleNavigate(page: any, args: any): Promise<CallToolResult> {
    await page.goto(args.url);
    return {
      content: [{
        type: "text",
        text: `Navigated to ${args.url}`,
      }],
      isError: false,
    };
  }

  /**
   * Take a screenshot
   */
  private async handleScreenshot(page: any, args: any): Promise<CallToolResult> {
    const width = args.width ?? 800;
    const height = args.height ?? 600;
    await page.setViewport({ width, height });

    const screenshot = await (args.selector ?
      (await page.$(args.selector))?.screenshot({ encoding: "base64" }) :
      page.screenshot({ encoding: "base64", fullPage: false }));

    if (!screenshot) {
      return {
        content: [{
          type: "text",
          text: args.selector ? `Element not found: ${args.selector}` : "Screenshot failed",
        }],
        isError: true,
      };
    }

    this.resourceManager.addScreenshot(args.name, screenshot as string);

    return {
      content: [
        {
          type: "text",
          text: `Screenshot '${args.name}' taken at ${width}x${height}`,
        } as TextContent,
        {
          type: "image",
          data: screenshot,
          mimeType: "image/png",
        } as ImageContent,
      ],
      isError: false,
    };
  }

  /**
   * Click an element
   */
  private async handleClick(page: any, args: any): Promise<CallToolResult> {
    try {
      await page.click(args.selector);
      return {
        content: [{
          type: "text",
          text: `Clicked: ${args.selector}`,
        }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Failed to click ${args.selector}: ${(error as Error).message}`,
        }],
        isError: true,
      };
    }
  }

  /**
   * Fill an input field
   */
  private async handleFill(page: any, args: any): Promise<CallToolResult> {
    try {
      await page.waitForSelector(args.selector);
      await page.type(args.selector, args.value);
      return {
        content: [{
          type: "text",
          text: `Filled ${args.selector} with: ${args.value}`,
        }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Failed to fill ${args.selector}: ${(error as Error).message}`,
        }],
        isError: true,
      };
    }
  }

  /**
   * Select an option
   */
  private async handleSelect(page: any, args: any): Promise<CallToolResult> {
    try {
      await page.waitForSelector(args.selector);
      await page.select(args.selector, args.value);
      return {
        content: [{
          type: "text",
          text: `Selected ${args.selector} with: ${args.value}`,
        }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Failed to select ${args.selector}: ${(error as Error).message}`,
        }],
        isError: true,
      };
    }
  }

  /**
   * Hover over an element
   */
  private async handleHover(page: any, args: any): Promise<CallToolResult> {
    try {
      await page.waitForSelector(args.selector);
      await page.hover(args.selector);
      return {
        content: [{
          type: "text",
          text: `Hovered ${args.selector}`,
        }],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Failed to hover ${args.selector}: ${(error as Error).message}`,
        }],
        isError: true,
      };
    }
  }

  /**
   * Evaluate JavaScript in the browser context
   */
  private async handleEvaluate(page: any, args: any): Promise<CallToolResult> {
    try {
      await page.evaluate(() => {
        window.mcpHelper = {
          logs: [],
          originalConsole: { ...console },
        };

        ["log", "info", "warn", "error"].forEach(method => {
          (console as any)[method] = (...args: any[]) => {
            window.mcpHelper.logs.push(`[${method}] ${args.join(" ")}`);
            (window.mcpHelper.originalConsole as any)[method](...args);
          };
        });
      });

      const result = await page.evaluate(args.script);

      const logs = await page.evaluate(() => {
        Object.assign(console, window.mcpHelper.originalConsole);
        const logs = window.mcpHelper.logs;
        delete (window as any).mcpHelper;
        return logs;
      });

      return {
        content: [
          {
            type: "text",
            text: `Execution result:\n${JSON.stringify(result, null, 2)}\n\nConsole output:\n${logs.join("\n")}`,
          },
        ],
        isError: false,
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: `Script execution failed: ${(error as Error).message}`,
        }],
        isError: true,
      };
    }
  }
}
