# Configurable Puppeteer MCP Server

A Model Context Protocol server that provides browser automation capabilities using Puppeteer with configurable options. This server enables LLMs to interact with web pages, take screenshots, and execute JavaScript in a real browser environment, with the ability to customize Puppeteer launch options through environment variables.

## Components

### Tools

- **puppeteer_navigate**
  - Navigate to any URL in the browser
  - Input: `url` (string)

- **puppeteer_screenshot**
  - Capture screenshots of the entire page or specific elements
  - Inputs:
    - `name` (string, required): Name for the screenshot
    - `selector` (string, optional): CSS selector for element to screenshot
    - `width` (number, optional, default: 800): Screenshot width
    - `height` (number, optional, default: 600): Screenshot height

- **puppeteer_click**
  - Click elements on the page
  - Input: `selector` (string): CSS selector for element to click

- **puppeteer_hover**
  - Hover elements on the page
  - Input: `selector` (string): CSS selector for element to hover

- **puppeteer_fill**
  - Fill out input fields
  - Inputs:
    - `selector` (string): CSS selector for input field
    - `value` (string): Value to fill

- **puppeteer_select**
  - Select an element with SELECT tag
  - Inputs:
    - `selector` (string): CSS selector for element to select
    - `value` (string): Value to select

- **puppeteer_evaluate**
  - Execute JavaScript in the browser console
  - Input: `script` (string): JavaScript code to execute

### Resources

The server provides access to two types of resources:

1. **Console Logs** (`console://logs`)
   - Browser console output in text format
   - Includes all console messages from the browser

2. **Screenshots** (`screenshot://<name>`)
   - PNG images of captured screenshots
   - Accessible via the screenshot name specified during capture

## Key Features

- Browser automation
- Console log monitoring
- Screenshot capabilities
- JavaScript execution
- Basic web interaction (navigation, clicking, form filling)
- **Configurable Puppeteer options** through environment variables
- **Connect to existing Chrome instances** for debugging or reusing sessions

## Configuration

### Connecting to Existing Chrome Instances

This server can connect to an already running Chrome instance instead of launching a new browser. This is useful for debugging, reusing browser sessions, or reducing resource usage.

#### 1. Launch Chrome with Remote Debugging Enabled

First, you need to start Chrome with remote debugging enabled:

**Windows:**
```
chrome.exe --remote-debugging-port=9222
```

**macOS:**
```
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
```

**Linux:**
```
google-chrome --remote-debugging-port=9222
```

#### 2. Connect MCP Puppeteer to the Running Instance

Use one of the provided npm scripts:

```
# Connect to Chrome at default address (http://localhost:9222)
npm run start:connect

# Connect to Chrome at a custom address
BROWSER_URL="http://localhost:9222" npm run start:connect
```

Or set environment variables directly:

```
CONNECT_TO_EXISTING_BROWSER=true BROWSER_URL="http://localhost:9222" node dist/index.js
```

#### Configuration in Claude MCP Config

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "github:afshawnlotfi/mcp-configurable-puppeteer"],
      "env": {
        "CONNECT_TO_EXISTING_BROWSER": "true",
        "BROWSER_URL": "http://localhost:9222"
      }
    }
  }
}
```

### Using with Custom Puppeteer Options

You can configure Puppeteer launch options by providing a JSON string in the `PUPPETEER_ARGS` environment variable. This allows you to customize browser behavior without modifying the server code.

#### Example: Using Firefox Instead of Chrome

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "github:afshawnlotfi/mcp-configurable-puppeteer"],
      "env": {
        "PUPPETEER_ARGS": "{\"browser\": \"firefox\"}"
      }
    }
  }
}
```

#### Example: Configuring Browser Window Size

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "github:afshawnlotfi/mcp-configurable-puppeteer"],
      "env": {
        "PUPPETEER_ARGS": "{\"defaultViewport\": {\"width\": 1280, \"height\": 800}}"
      }
    }
  }
}
```

### Standard Configuration

#### NPX
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "github:afshawnlotfi/mcp-configurable-puppeteer"]
    }
  }
}
```

You can also specify a branch, tag, or commit:

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "github:afshawnlotfi/mcp-configurable-puppeteer#main"]
    }
  }
}
```


## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
