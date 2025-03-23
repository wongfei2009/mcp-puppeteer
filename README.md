# MCP Puppeteer

A Model Context Protocol server that provides browser automation capabilities using Puppeteer. This server enables LLMs to interact with web pages, take screenshots, and execute JavaScript in a real browser environment, with the ability to customize Puppeteer launch options through environment variables.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Configuration Options](#configuration-options)
  - [Standard Configuration](#standard-configuration)
  - [Connecting to Existing Chrome Instances](#connecting-to-existing-chrome-instances)
  - [Using Custom Puppeteer Options](#using-custom-puppeteer-options)
- [Available Tools](#available-tools)
- [Development](#development)
  - [Setup Development Environment](#setup-development-environment)
  - [Running Tests](#running-tests)
  - [Building from Source](#building-from-source)
- [License](#license)

## Features

- Browser automation for web navigation and interaction
- Screenshot capture of entire pages or specific elements
- JavaScript execution in the browser environment
- Console log monitoring
- Form interaction (clicking, filling, selecting)
- **Configurable Puppeteer options** through environment variables
- **Connect to existing Chrome instances** for debugging or reusing sessions

## Installation

You can use this MCP server directly from GitHub using npx:

```bash
npx github:wongfei2009/mcp-puppeteer
```

Or install it globally:

```bash
npm install -g github:wongfei2009/mcp-puppeteer
```

## Usage

### Using with Claude

To use with Claude, configure the MCP server in your Claude configuration:

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

See the [examples](./examples) directory for more configuration samples.

## Project Structure

```
mcp-puppeteer/
├── src/                  # Source code
│   ├── browser/          # Browser management
│   ├── resources/        # Resource handling (screenshots, logs)
│   ├── server/           # MCP server setup
│   ├── tools/            # Tool definitions and handlers
│   └── index.ts          # Main entry point
├── examples/             # Example configurations
├── tests/                # Test files
├── dist/                 # Compiled output
└── package.json          # Project metadata
```

## Configuration Options

### Standard Configuration

Use in Claude's configuration file:

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

### Connecting to Existing Chrome Instances

#### 1. Launch Chrome with Remote Debugging Enabled

First, start Chrome with remote debugging enabled:

**Windows:**
```
chrome.exe --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1
```

**macOS:**
```
/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1
```

**Linux:**
```
google-chrome --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1
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

You can configure Puppeteer launch options by providing a JSON string in the `PUPPETEER_ARGS` environment variable.

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

## Available Tools

| Tool | Description | Parameters |
|------|-------------|------------|
| **puppeteer_navigate** | Navigate to any URL in the browser | `url` (string) |
| **puppeteer_screenshot** | Capture screenshots of the page or elements | `name` (string, required)<br>`selector` (string, optional)<br>`width` (number, optional, default: 800)<br>`height` (number, optional, default: 600) |
| **puppeteer_click** | Click elements on the page | `selector` (string) |
| **puppeteer_hover** | Hover over elements on the page | `selector` (string) |
| **puppeteer_fill** | Fill out input fields | `selector` (string)<br>`value` (string) |
| **puppeteer_select** | Select an option in a SELECT element | `selector` (string)<br>`value` (string) |
| **puppeteer_evaluate** | Execute JavaScript in the browser console | `script` (string) |

## Development

### Setup Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/wongfei2009/mcp-puppeteer.git
   cd mcp-puppeteer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

### Running Tests

```bash
npm test
```

To test connection to an existing Chrome instance:

```bash
npm run test:connection
```

### Building from Source

```bash
npm run build:clean
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License.
