# MCP Server Development Guide

## Core MCP Concepts

MCP (Model Context Protocol) servers can provide three main types of capabilities:

1. **Resources**: File-like data that can be read by clients (like API responses or file contents)
2. **Tools**: Functions that can be called by the LLM (with user approval)
3. **Prompts**: Pre-written templates that help users accomplish specific tasks

## Setup Requirements

- Node.js 18 or higher
- TypeScript 5.0 or higher
- MCP TypeScript SDK 1.2.0 or higher
- `pnpm` package manager (recommended)

## Weather Server Example

Let's walk through building a simple weather server that demonstrates core MCP concepts.

### Server Capabilities
The example server exposes two tools:
- `get-alerts`: Fetch severe weather alerts for a given location
- `get-forecast`: Get weather forecast for a specific location

### Basic Setup

1. Create a new TypeScript project:
```bash
mkdir weather-server
cd weather-server
pnpm init
pnpm add typescript @types/node ts-node --save-dev
pnpm add @mcp/server
npx tsc --init
```

2. Configure `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  }
}
```

3. Create your main server file (`src/server.ts`)

### Server Implementation

```typescript
import { MCPServer, Tool } from '@mcp/server';

interface Forecast {
  temperature: number;
  conditions: string;
  location: string;
}

interface Alert {
  type: string;
  severity: string;
  area: string;
  description: string;
}

class WeatherServer extends MCPServer {
  @Tool({
    description: 'Get the weather forecast for a specific location'
  })
  async getForecast(location: string): Promise<Forecast> {
    // Implementation here
    return {
      temperature: 72,
      conditions: 'Sunny',
      location
    };
  }

  @Tool({
    description: 'Get active weather alerts for a given state'
  })
  async getAlerts(state: string): Promise<Alert[]> {
    // Implementation here
    return [{
      type: 'Weather Watch',
      severity: 'Moderate',
      area: state,
      description: 'Thunderstorm watch in effect'
    }];
  }
}

const server = new WeatherServer();
server.start();
```

## Claude for Desktop Integration

To integrate your MCP server with Claude for Desktop:

1. Update Claude for Desktop to the latest version
2. Configure the server in `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "weather": {
      "command": "pnpm start"
    }
  }
}
```

Add this to your `package.json`:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts"
  }
}
```

## Testing Procedures

1. **Server Launch Test**
   - Run `pnpm build && pnpm start`
   - Check for successful initialization
   - Verify port binding

2. **Tool Registration Test**
   - Confirm tools are properly registered with decorators
   - Verify TypeScript types and documentation

3. **Integration Test**
   - Look for the hammer icon in Claude for Desktop
   - Verify listed tools match your implementation
   - Test each tool with sample queries

## Troubleshooting

Common issues and solutions:

1. **Server Not Found**
   - Verify TypeScript compilation
   - Check Node.js environment
   - Confirm port availability

2. **Tool Execution Failures**
   - Check TypeScript type validation
   - Verify API dependencies
   - Review error handling

3. **Integration Issues**
   - Restart Claude for Desktop
   - Validate configuration JSON
   - Check server logs

## Best Practices

1. **Tool Design**
   - Use TypeScript interfaces for clear type definitions
   - Leverage decorators for metadata
   - Implement proper error handling with typed errors

2. **Security**
   - Use TypeScript's type system for input validation
   - Handle sensitive data securely
   - Implement rate limiting where appropriate

3. **Performance**
   - Use async/await for asynchronous operations
   - Implement proper error boundaries
   - Handle concurrent requests properly

## Next Steps

- Explore building your own MCP client in TypeScript
- Check out example servers in the gallery
- Learn about debugging tools
- Consider using LLMs to assist in MCP development

For more detailed information, visit the [official MCP documentation](https://modelcontextprotocol.io/).
