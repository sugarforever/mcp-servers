# OpenAPI-based MCP Server Implementation Plan

## Overview
This project aims to create a Model Context Protocol (MCP) server that dynamically generates tools based on an OpenAPI specification. The server will:
1. Read OpenAPI spec from a configuration provided via environment variable
2. Generate MCP tools that map to OpenAPI endpoints
3. Support Bearer token authentication
4. Handle request/response mapping between MCP tools and API endpoints

## Configuration
The server will read configuration from `OPENAPI_CONFIG` environment variable in JSON format:

```json
{
  "spec_uri": "file:///path/to/spec.yaml",  // or "https://api.example.com/openapi.json"
  "auth": {
    "bearer_token": "your-token-here"
  }
}
```

Supported URI schemes:
- `file://` - Local file path
- `http://` or `https://` - Remote URL

## Technical Components

### 1. Project Setup
- Use `uv` for Python project management
- Required core dependencies:
  - `mcp[cli]`: For MCP server implementation
  - `pyyaml`: For YAML parsing
  - `pydantic`: For config and data validation
  - `httpx`: For making HTTP requests

### 2. OpenAPI Spec Parsing
Recommended library: `openapi-parser`
- Parses OpenAPI/Swagger specs in YAML/JSON format
- Validates spec against OpenAPI schema
- Provides structured access to endpoints, parameters, and schemas

### 3. MCP Tool Generation
For each API endpoint, generate an MCP tool with:
- Name: Derived from operationId or path
- Description: From endpoint description
- Parameters: Mapped from endpoint parameters
- Return type: Mapped from endpoint response schema

### 4. Request Handling
Components needed:
1. Parameter validation using OpenAPI schema
2. Authentication header injection
3. Request transformation
4. Response parsing and formatting

## Implementation Phases

### Phase 1: Basic Structure
1. Project initialization with `uv`
2. Configuration management
3. OpenAPI spec loading and validation

### Phase 2: Tool Generation
1. Endpoint to tool mapping logic
2. Parameter type conversion
3. Description formatting

### Phase 3: Request Handling
1. Authentication implementation
2. Request building and sending
3. Response processing

### Phase 4: Error Handling & Validation
1. OpenAPI schema validation
2. Error response mapping
3. Rate limiting support

## Open Issues and Considerations

### 1. Type Mapping ~~[BLOCKER]~~ [SIMPLIFIED]
- ~~How to map OpenAPI types to Python types~~
  - Using generic dict for all responses
  - Future enhancement: Add proper type mapping
- ~~Handling complex schemas and nested objects~~
- ~~Array and map type support~~

### 2. Authentication
- Support for other auth methods beyond Bearer tokens
- Token refresh mechanisms
- Multiple auth methods per spec

### 3. Response Handling ~~[BLOCKER]~~ [SIMPLIFIED]
- ~~Binary response types~~
  - Initial version only supports JSON responses
  - Future enhancement: Support other response types
- ~~Streaming responses~~
- Error response formatting

### 4. Rate Limiting
- Implementing rate limit tracking
- Backoff strategies
- Multiple endpoint rate limits

### 5. Performance
- Caching of parsed OpenAPI specs
- Connection pooling
- Response caching

### 6. Security ~~[BLOCKER]~~ [SIMPLIFIED]
- ~~Token storage security~~
  - Initial version reads directly from environment config
  - Future enhancement: Add secure token storage
- Request/response data sanitization
- Sensitive data handling

## Implementation Scope V1

Based on the simplifications:

1. Response Types:
   - All responses will be treated as JSON and returned as Python dicts
   - Non-JSON responses will return an error
   - Error responses will include the HTTP status code and error message

2. Type Handling:
   - All request parameters will be passed as strings or dicts
   - Response data will be returned as generic Python dicts
   - No schema validation for responses

3. Authentication:
   - Bearer token read directly from config
   - No token refresh or secure storage
   - Token applied to all requests that require authentication

## Future Enhancements

The following features are deferred to future versions:
1. Proper OpenAPI type mapping to Python types
2. Support for non-JSON response types
3. Secure token storage and refresh mechanisms
4. Response schema validation
5. Rate limiting implementation

## Next Steps

1. Review and discuss open issues
2. Prioritize authentication methods to support
3. Define type mapping strategy
4. Create initial project structure
5. Implement proof of concept with a simple API

## Questions for Discussion

1. Should we support multiple OpenAPI specs in one server instance?
   - No, one spec per server instance

2. How should we handle versioning of the API specs?
   - Users are responsible for providing the correct version of the spec

3. Should we implement automatic OpenAPI spec refresh?
   - No, users will restart the MCP server when needed

4. How should we handle deprecated endpoints?
   - Users are responsible for updating their specs to remove deprecated endpoints

5. Should we support OpenAPI spec URL in addition to file path?
   - Yes, will implement support for both file paths and URLs

## Implementation Updates

Based on the questions discussion:
1. Configuration simplified to use URI format:
```json
{
  "spec_uri": "file:///path/to/spec.yaml",  // or "https://api.example.com/openapi.json"
  "auth": {
    "bearer_token": "your-token-here"
  }
}
```

2. Add URI parsing and validation
   - Use Python's `urllib.parse` for URI parsing
   - Support `file://` and `http(s)://` schemes
3. Add appropriate loader based on URI scheme
   - File system loader for `file://`
   - HTTP client for `http(s)://` 