import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { BrowserManager } from "../browser/browser-manager.js";
import { ResourceManager } from "../resources/resource-manager.js";
import { ToolHandler } from "../tools/tool-handler.js";
import { TOOLS } from "../tools/tool-definitions.js";

/**
 * Configure and run the MCP server
 */
export async function setupServer() {
  console.error("Setting up MCP server...");
  
  try {
    // Create the MCP server
    console.error("Creating server instance...");
    const server = new Server(
      {
        name: "mcp-configurable-puppeteer",
        version: "0.1.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      },
    );
    console.error("Server instance created");

    // Create managers that handle browser sessions and resources
    console.error("Creating browser manager...");
    const browserManager = new BrowserManager(server);
    console.error("Browser manager created");
    
    console.error("Creating resource manager...");
    const resourceManager = new ResourceManager(browserManager, server);
    console.error("Resource manager created");
    
    console.error("Creating tool handler...");
    const toolHandler = new ToolHandler(browserManager, resourceManager);
    console.error("Tool handler created");

    // Setup request handlers
    console.error("Setting up request handlers...");
    server.setRequestHandler(ListResourcesRequestSchema, async () => {
      console.error("ListResourcesRequest received");
      return {
        resources: resourceManager.getResourceList(),
      };
    });

    server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      console.error(`ReadResourceRequest received for: ${request.params.uri}`);
      const uri = request.params.uri.toString();
      const resource = resourceManager.getResource(uri);
      
      if (!resource) {
        console.error(`Resource not found: ${uri}`);
        throw new Error(`Resource not found: ${uri}`);
      }
      
      return {
        contents: [resource],
      };
    });

    server.setRequestHandler(ListToolsRequestSchema, async () => {
      console.error("ListToolsRequest received");
      return {
        tools: TOOLS,
      };
    });

    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      console.error(`CallToolRequest received for: ${request.params.name}`);
      return toolHandler.handleToolCall(request.params.name, request.params.arguments ?? {});
    });

    // Setup cleanup handlers
    console.error("Setting up cleanup handlers...");
    setupCleanupHandlers(server, browserManager);
    console.error("Cleanup handlers set up");

    // Start the server
    console.error("Connecting to transport...");
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Server connected to transport");

    return { server, browserManager };
  } catch (error) {
    console.error("Error in setupServer:", error);
    throw error;
  }
}

/**
 * Setup process exit handlers to ensure proper cleanup
 */
function setupCleanupHandlers(server: Server, browserManager: BrowserManager) {
  process.stdin.on("close", async () => {
    console.error("Puppeteer MCP Server stdin closed");
    await browserManager.closeBrowser();
    server.close();
  });

  // Handle process exit
  process.on("SIGINT", async () => {
    console.error("Received SIGINT, shutting down");
    await browserManager.closeBrowser();
    process.exit(0);
  });
}
