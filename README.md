# Puppeteer MCP Server

A Model Context Protocol server that provides browser automation capabilities using Puppeteer. This server enables LLMs to interact with web pages, take screenshots, and execute JavaScript in a real browser environment, with the ability to customize Puppeteer launch options through environment variables.

## Table of Contents

- [Features](#features)
- [Components](#components)
  - [Tools](#tools)
  - [Resources](#resources)
- [Configuration](#configuration)
  - [Standard Configuration](#standard-configuration)
  - [Connecting to Existing Chrome Instances](#connecting-to-existing-chrome-instances)
  - [Using Custom Puppeteer Options](#using-custom-puppeteer-options)
- [License](#license)

## Features

- Browser automation for web navigation and interaction
- Screenshot capture of entire pages or specific elements
- JavaScript execution in the browser environment
- Console log monitoring
- Form interaction (clicking, filling, selecting)
- **Configurable Puppeteer options** through environment variables
- **Connect to existing Chrome instances** for debugging or reusing sessions

## Components

### Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| **puppeteer_navigate** | Navigate to any URL in the browser | `url` (string) |
| **puppeteer_screenshot** | Capture screenshots of the page or elements | `name` (string, required)<br>`selector` (string, optional)<br>`width` (number, optional, default: 800)<br>`height` (number, optional, default: 600) |
| **puppeteer_click** | Click elements on the page | `selector` (string) |
| **puppeteer_hover** | Hover over elements on the page | `selector` (string) |
| **puppeteer_fill** | Fill out input fields | `selector` (string)<br>`value` (string) |
| **puppeteer_select** | Select an option in a SELECT element | `selector` (string)<br>`value` (string) |
| **puppeteer_evaluate** | Execute JavaScript in the browser console | `script` (string) |

### Resources

The server provides access to two types of resources:

1. **Console Logs** (`console://logs`)
   - Browser console output in text format
   - Includes all console messages from the browser

2. **Screenshots** (`screenshot://<n>`)
   - PNG images of captured screenshots
   - Accessible via the screenshot name specified during capture

## Configuration

### Standard Configuration

#### Using NPX

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "github:wongfei2009/mcp-puppeteer"]
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
      "args": ["-y", "github:wongfei2009/mcp-puppeteer#main"]
    }
  }
}
```

### Connecting to Existing Chrome Instances

This server can connect to an already running Chrome instance instead of launching a new browser. This is useful for debugging, reusing browser sessions, or reducing resource usage.

#### 1. Launch Chrome with Remote Debugging Enabled

First, start Chrome with remote debugging enabled:

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

#### 2. Configuration in Claude MCP Config

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "github:wongfei2009/mcp-puppeteer"],
      "env": {
        "CONNECT_TO_EXISTING_BROWSER": "true",
        "BROWSER_URL": "http://localhost:9222"
      }
    }
  }
}
```

### Using Custom Puppeteer Options

You can configure Puppeteer launch options by providing a JSON string in the `PUPPETEER_ARGS` environment variable. This allows you to customize browser behavior without modifying the server code.

#### Example: Using Firefox Instead of Chrome

```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "github:wongfei2009/mcp-puppeteer"],
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
      "args": ["-y", "github:wongfei2009/mcp-puppeteer"],
      "env": {
        "PUPPETEER_ARGS": "{\"defaultViewport\": {\"width\": 1280, \"height\": 800}}"
      }
    }
  }
}
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.