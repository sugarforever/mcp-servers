Title: For Server Developers - Model Context Protocol

URL Source: https://modelcontextprotocol.io/quickstart/server

Markdown Content:
For Server Developers - Model Context Protocol
===============
 

[Model Context Protocol home page![Image 2: light logo](https://mintlify.s3.us-west-1.amazonaws.com/mcp/logo/light.svg)![Image 3: dark logo](https://mintlify.s3.us-west-1.amazonaws.com/mcp/logo/dark.svg)](https://modelcontextprotocol.io/)

Search...

*   [Python SDK](https://github.com/modelcontextprotocol/python-sdk)
*   [TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
*   [Java SDK](https://github.com/modelcontextprotocol/java-sdk)
*   [Kotlin SDK](https://github.com/modelcontextprotocol/kotlin-sdk)
*   [Specification](https://spec.modelcontextprotocol.io/)

##### Get Started

*   [Introduction](https://modelcontextprotocol.io/introduction)
*   Quickstart
    
    *   [For Server Developers](https://modelcontextprotocol.io/quickstart/server)
    *   [For Client Developers](https://modelcontextprotocol.io/quickstart/client)
    *   [For Claude Desktop Users](https://modelcontextprotocol.io/quickstart/user)
*   [Example Servers](https://modelcontextprotocol.io/examples)
*   [Example Clients](https://modelcontextprotocol.io/clients)

##### Tutorials

*   [Building MCP with LLMs](https://modelcontextprotocol.io/tutorials/building-mcp-with-llms)
*   [Debugging](https://modelcontextprotocol.io/docs/tools/debugging)
*   [Inspector](https://modelcontextprotocol.io/docs/tools/inspector)

##### Concepts

*   [Core architecture](https://modelcontextprotocol.io/docs/concepts/architecture)
*   [Resources](https://modelcontextprotocol.io/docs/concepts/resources)
*   [Prompts](https://modelcontextprotocol.io/docs/concepts/prompts)
*   [Tools](https://modelcontextprotocol.io/docs/concepts/tools)
*   [Sampling](https://modelcontextprotocol.io/docs/concepts/sampling)
*   [Roots](https://modelcontextprotocol.io/docs/concepts/roots)
*   [Transports](https://modelcontextprotocol.io/docs/concepts/transports)

##### Development

*   [What's New](https://modelcontextprotocol.io/development/updates)
*   [Roadmap](https://modelcontextprotocol.io/development/roadmap)
*   [Contributing](https://modelcontextprotocol.io/development/contributing)

[Model Context Protocol home page![Image 4: light logo](https://mintlify.s3.us-west-1.amazonaws.com/mcp/logo/light.svg)![Image 5: dark logo](https://mintlify.s3.us-west-1.amazonaws.com/mcp/logo/dark.svg)](https://modelcontextprotocol.io/)

Search...

*   [GitHub](https://github.com/modelcontextprotocol)
*   [GitHub](https://github.com/modelcontextprotocol)

Search...

Navigation

Quickstart

For Server Developers

[Documentation](https://modelcontextprotocol.io/introduction)[SDKs](https://modelcontextprotocol.io/sdk/java/mcp-overview)

[Documentation](https://modelcontextprotocol.io/introduction)[SDKs](https://modelcontextprotocol.io/sdk/java/mcp-overview)

*   [GitHub](https://github.com/modelcontextprotocol)

Quickstart

For Server Developers
=====================

Get started building your own server to use in Claude for Desktop and other clients.

In this tutorial, we’ll build a simple MCP weather server and connect it to a host, Claude for Desktop. We’ll start with a basic setup, and then progress to more complex use cases.

### 

[​](https://modelcontextprotocol.io/quickstart/server#what-we%E2%80%99ll-be-building)

What we’ll be building

Many LLMs do not currently have the ability to fetch the forecast and severe weather alerts. Let’s use MCP to solve that!

We’ll build a server that exposes two tools: `get-alerts` and `get-forecast`. Then we’ll connect the server to an MCP host (in this case, Claude for Desktop):

Servers can connect to any client. We’ve chosen Claude for Desktop here for simplicity, but we also have guides on [building your own client](https://modelcontextprotocol.io/quickstart/client) as well as a [list of other clients here](https://modelcontextprotocol.io/clients).

Why Claude for Desktop and not Claude.ai?

Because servers are locally run, MCP currently only supports desktop hosts. Remote hosts are in active development.

### 

[​](https://modelcontextprotocol.io/quickstart/server#core-mcp-concepts)

Core MCP Concepts

MCP servers can provide three main types of capabilities:

1.  **Resources**: File-like data that can be read by clients (like API responses or file contents)
2.  **Tools**: Functions that can be called by the LLM (with user approval)
3.  **Prompts**: Pre-written templates that help users accomplish specific tasks

This tutorial will primarily focus on tools.

*   Python
*   Node
*   Java
*   Kotlin

Let’s get started with building our weather server! [You can find the complete code for what we’ll be building here.](https://github.com/modelcontextprotocol/quickstart-resources/tree/main/weather-server-python)

### Prerequisite knowledge

This quickstart assumes you have familiarity with:

*   Python
*   LLMs like Claude

### System requirements

*   Python 3.10 or higher installed.
*   You must use the Python MCP SDK 1.2.0 or higher.

### Set up your environment

First, let’s install `uv` and set up our Python project and environment:

MacOS/Linux

Windows

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Make sure to restart your terminal afterwards to ensure that the `uv` command gets picked up.

Now, let’s create and set up our project:

MacOS/Linux

Windows

```bash
# Create a new directory for our project
uv init weather
cd weather

# Create virtual environment and activate it
uv venv
source .venv/bin/activate

# Install dependencies
uv add "mcp[cli]" httpx

# Create our server file
touch weather.py
```

Now let’s dive into building your server.

Building your server
--------------------

### Importing packages and setting up the instance

Add these to the top of your `weather.py`:

```python
from typing import Any
import httpx
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("weather")

# Constants
NWS_API_BASE = "https://api.weather.gov"
USER_AGENT = "weather-app/1.0"
```

The FastMCP class uses Python type hints and docstrings to automatically generate tool definitions, making it easy to create and maintain MCP tools.

### Helper functions

Next, let’s add our helper functions for querying and formatting the data from the National Weather Service API:

```python
async def make_nws_request(url: str) -> dict[str, Any] | None:
    """Make a request to the NWS API with proper error handling."""
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/geo+json"
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except Exception:
            return None

def format_alert(feature: dict) -> str:
    """Format an alert feature into a readable string."""
    props = feature["properties"]
    return f"""
Event: {props.get('event', 'Unknown')}
Area: {props.get('areaDesc', 'Unknown')}
Severity: {props.get('severity', 'Unknown')}
Description: {props.get('description', 'No description available')}
Instructions: {props.get('instruction', 'No specific instructions provided')}
"""
```

### Implementing tool execution

The tool execution handler is responsible for actually executing the logic of each tool. Let’s add it:

```python
@mcp.tool()
async def get_alerts(state: str) -> str:
    """Get weather alerts for a US state.

    Args:
        state: Two-letter US state code (e.g. CA, NY)
    """
    url = f"{NWS_API_BASE}/alerts/active/area/{state}"
    data = await make_nws_request(url)

    if not data or "features" not in data:
        return "Unable to fetch alerts or no alerts found."

    if not data["features"]:
        return "No active alerts for this state."

    alerts = [format_alert(feature) for feature in data["features"]]
    return "\n---\n".join(alerts)

@mcp.tool()
async def get_forecast(latitude: float, longitude: float) -> str:
    """Get weather forecast for a location.

    Args:
        latitude: Latitude of the location
        longitude: Longitude of the location
    """
    # First get the forecast grid endpoint
    points_url = f"{NWS_API_BASE}/points/{latitude},{longitude}"
    points_data = await make_nws_request(points_url)

    if not points_data:
        return "Unable to fetch forecast data for this location."

    # Get the forecast URL from the points response
    forecast_url = points_data["properties"]["forecast"]
    forecast_data = await make_nws_request(forecast_url)

    if not forecast_data:
        return "Unable to fetch detailed forecast."

    # Format the periods into a readable forecast
    periods = forecast_data["properties"]["periods"]
    forecasts = []
    for period in periods[:5]:  # Only show next 5 periods
        forecast = f"""
{period['name']}:
Temperature: {period['temperature']}°{period['temperatureUnit']}
Wind: {period['windSpeed']} {period['windDirection']}
Forecast: {period['detailedForecast']}
"""
        forecasts.append(forecast)

    return "\n---\n".join(forecasts)
```

### Running the server

Finally, let’s initialize and run the server:

```python
if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')
```

Your server is complete! Run `uv run weather.py` to confirm that everything’s working.

Let’s now test your server from an existing MCP host, Claude for Desktop.

Testing your server with Claude for Desktop
-------------------------------------------

Claude for Desktop is not yet available on Linux. Linux users can proceed to the [Building a client](https://modelcontextprotocol.io/quickstart/client) tutorial to build an MCP client that connects to the server we just built.

First, make sure you have Claude for Desktop installed. [You can install the latest version here.](https://claude.ai/download) If you already have Claude for Desktop, **make sure it’s updated to the latest version.**

We’ll need to configure Claude for Desktop for whichever MCP servers you want to use. To do this, open your Claude for Desktop App configuration at `~/Library/Application Support/Claude/claude_desktop_config.json` in a text editor. Make sure to create the file if it doesn’t exist.

For example, if you have [VS Code](https://code.visualstudio.com/) installed:

*   MacOS/Linux
*   Windows

```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

You’ll then add your servers in the `mcpServers` key. The MCP UI elements will only show up in Claude for Desktop if at least one server is properly configured.

In this case, we’ll add our single weather server like so:

*   MacOS/Linux
*   Windows

Python

```json
{
    "mcpServers": {
        "weather": {
            "command": "uv",
            "args": [
                "--directory",
                "/ABSOLUTE/PATH/TO/PARENT/FOLDER/weather",
                "run",
                "weather.py"
            ]
        }
    }
}
```

You may need to put the full path to the `uv` executable in the `command` field. You can get this by running `which uv` on MacOS/Linux or `where uv` on Windows.

Make sure you pass in the absolute path to your server.

This tells Claude for Desktop:

1.  There’s an MCP server named “weather”
2.  To launch it by running `uv --directory /ABSOLUTE/PATH/TO/PARENT/FOLDER/weather run weather.py`

Save the file, and restart **Claude for Desktop**.

### 

[​](https://modelcontextprotocol.io/quickstart/server#test-with-commands)

Test with commands

Let’s make sure Claude for Desktop is picking up the two tools we’ve exposed in our `weather` server. You can do this by looking for the hammer ![Image 6](https://mintlify.s3.us-west-1.amazonaws.com/mcp/images/claude-desktop-mcp-hammer-icon.svg) icon:

After clicking on the hammer icon, you should see two tools listed:

If your server isn’t being picked up by Claude for Desktop, proceed to the [Troubleshooting](https://modelcontextprotocol.io/_sites/modelcontextprotocol.io/quickstart/server#troubleshooting) section for debugging tips.

If the hammer icon has shown up, you can now test your server by running the following commands in Claude for Desktop:

*   What’s the weather in Sacramento?
*   What are the active weather alerts in Texas?

Since this is the US National Weather service, the queries will only work for US locations.

[​](https://modelcontextprotocol.io/quickstart/server#what%E2%80%99s-happening-under-the-hood)

What’s happening under the hood
--------------------------------------------------------------------------------------------------------------------------------

When you ask a question:

1.  The client sends your question to Claude
2.  Claude analyzes the available tools and decides which one(s) to use
3.  The client executes the chosen tool(s) through the MCP server
4.  The results are sent back to Claude
5.  Claude formulates a natural language response
6.  The response is displayed to you!

[​](https://modelcontextprotocol.io/quickstart/server#troubleshooting)

Troubleshooting
-----------------------------------------------------------------------------------------

Claude for Desktop Integration Issues

**Getting logs from Claude for Desktop**

Claude.app logging related to MCP is written to log files in `~/Library/Logs/Claude`:

*   `mcp.log` will contain general logging about MCP connections and connection failures.
*   Files named `mcp-server-SERVERNAME.log` will contain error (stderr) logging from the named server.

You can run the following command to list recent logs and follow along with any new ones:

```bash
# Check Claude's logs for errors
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
```

**Server not showing up in Claude**

1.  Check your `claude_desktop_config.json` file syntax
2.  Make sure the path to your project is absolute and not relative
3.  Restart Claude for Desktop completely

**Tool calls failing silently**

If Claude attempts to use the tools but they fail:

1.  Check Claude’s logs for errors
2.  Verify your server builds and runs without errors
3.  Try restarting Claude for Desktop

**None of this is working. What do I do?**

Please refer to our [debugging guide](https://modelcontextprotocol.io/docs/tools/debugging) for better debugging tools and more detailed guidance.

Weather API Issues

**Error: Failed to retrieve grid point data**

This usually means either:

1.  The coordinates are outside the US
2.  The NWS API is having issues
3.  You’re being rate limited

Fix:

*   Verify you’re using US coordinates
*   Add a small delay between requests
*   Check the NWS API status page

**Error: No active alerts for \[STATE\]**

This isn’t an error - it just means there are no current weather alerts for that state. Try a different state or check during severe weather.

For more advanced troubleshooting, check out our guide on [Debugging MCP](https://modelcontextprotocol.io/docs/tools/debugging)

[​](https://modelcontextprotocol.io/quickstart/server#next-steps)

Next steps
-------------------------------------------------------------------------------

[Building a client ----------------- Learn how to build your own MCP client that can connect to your server](https://modelcontextprotocol.io/quickstart/client)[Example servers --------------- Check out our gallery of official MCP servers and implementations](https://modelcontextprotocol.io/examples)[Debugging Guide --------------- Learn how to effectively debug MCP servers and integrations](https://modelcontextprotocol.io/docs/tools/debugging)[Building MCP with LLMs ---------------------- Learn how to use LLMs like Claude to speed up your MCP development](https://modelcontextprotocol.io/tutorials/building-mcp-with-llms)

Was this page helpful?

YesNo

[Introduction](https://modelcontextprotocol.io/introduction)[For Client Developers](https://modelcontextprotocol.io/quickstart/client)

[github](https://github.com/modelcontextprotocol)

On this page

*   [What we’ll be building](https://modelcontextprotocol.io/quickstart/server#what-we%E2%80%99ll-be-building)
*   [Core MCP Concepts](https://modelcontextprotocol.io/quickstart/server#core-mcp-concepts)
*   [Test with commands](https://modelcontextprotocol.io/quickstart/server#test-with-commands)
*   [What’s happening under the hood](https://modelcontextprotocol.io/quickstart/server#what%E2%80%99s-happening-under-the-hood)
*   [Troubleshooting](https://modelcontextprotocol.io/quickstart/server#troubleshooting)
*   [Next steps](https://modelcontextprotocol.io/quickstart/server#next-steps)