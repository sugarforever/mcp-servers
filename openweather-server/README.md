# OpenWeather MCP Server

This is a Model Context Protocol (MCP) server that provides tools for accessing weather data from the OpenWeather API.

## Features

- Get current weather for any city
- Get weather forecast for any city (up to 5 days)
- Support for different units of measurement (metric, imperial, standard)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```

## Configuration

The server requires an OpenWeather API key to function. You can get one by signing up at [OpenWeatherMap](https://openweathermap.org/).

Add your API key to the MCP settings configuration file:

```json
{
  "mcpServers": {
    "openweather-server": {
      "command": "node",
      "args": [
        "/path/to/openweather-server/build/index.js"
      ],
      "env": {
        "OPENWEATHER_API_KEY": "your-api-key-here"
      },
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

## Available Tools

### get_current_weather

Get current weather for a city.

**Input Schema:**
```json
{
  "city": "London",
  "units": "metric" // optional, defaults to "metric", can be "metric", "imperial", or "standard"
}
```

**Example Response:**
```json
{
  "city": "London",
  "country": "GB",
  "temperature": {
    "current": "15.2°C",
    "feels_like": "14.8°C",
    "min": "13.9°C",
    "max": "16.7°C"
  },
  "weather": {
    "main": "Clouds",
    "description": "scattered clouds",
    "icon": "https://openweathermap.org/img/wn/03d@2x.png"
  },
  "details": {
    "humidity": "76%",
    "pressure": "1012 hPa",
    "wind_speed": "4.6 m/s",
    "wind_direction": "250°",
    "cloudiness": "40%"
  },
  "sun": {
    "sunrise": "6:45:12 AM",
    "sunset": "7:30:57 PM"
  },
  "timestamp": "2025-03-09T20:03:22.000Z"
}
```

### get_weather_forecast

Get weather forecast for a city.

**Input Schema:**
```json
{
  "city": "London",
  "days": 3, // optional, defaults to 3, max 5
  "units": "metric" // optional, defaults to "metric", can be "metric", "imperial", or "standard"
}
```

**Example Response:**
```json
{
  "city": "London",
  "country": "GB",
  "forecast": [
    {
      "date": "2025-03-09",
      "forecasts": [
        {
          "time": "21:00:00",
          "temperature": "12.5°C",
          "feels_like": "11.8°C",
          "weather": {
            "main": "Clouds",
            "description": "scattered clouds",
            "icon": "https://openweathermap.org/img/wn/03n@2x.png"
          },
          "details": {
            "humidity": "82%",
            "pressure": "1011 hPa",
            "wind_speed": "3.8 m/s",
            "wind_direction": "240°",
            "cloudiness": "45%"
          }
        },
        // More forecasts for this day...
      ]
    },
    // More days...
  ],
  "timestamp": "2025-03-09T20:03:22.000Z"
}
```

## Development

- `npm run build` - Build the project
- `npm run start` - Start the server
- `npm run dev` - Start the server in development mode with watch

## License

ISC
