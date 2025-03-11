#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// Get API key from environment variables
const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) {
  throw new Error('OPENWEATHER_API_KEY environment variable is required');
}

// Define interfaces for OpenWeather API responses
interface WeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  name: string;
}

interface ForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
    };
    dt_txt: string;
  }>;
  city: {
    name: string;
    country: string;
  };
}

// Type guards for tool arguments
const isValidCurrentWeatherArgs = (
  args: any
): args is { city: string; units?: string } =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.city === 'string' &&
  (args.units === undefined ||
    ['standard', 'metric', 'imperial'].includes(args.units));

const isValidForecastArgs = (
  args: any
): args is { city: string; days?: number; units?: string } =>
  typeof args === 'object' &&
  args !== null &&
  typeof args.city === 'string' &&
  (args.days === undefined || typeof args.days === 'number') &&
  (args.units === undefined ||
    ['standard', 'metric', 'imperial'].includes(args.units));

class OpenWeatherServer {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'openweather-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: 'https://api.openweathermap.org/data/2.5',
      params: {
        appid: API_KEY,
      },
    });

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_current_weather',
          description: 'Get current weather for a city',
          inputSchema: {
            type: 'object',
            properties: {
              city: {
                type: 'string',
                description: 'City name (e.g., "London", "New York", "Tokyo")',
              },
              units: {
                type: 'string',
                enum: ['standard', 'metric', 'imperial'],
                description: 'Units of measurement (standard: Kelvin, metric: Celsius, imperial: Fahrenheit)',
                default: 'metric',
              },
            },
            required: ['city'],
          },
        },
        {
          name: 'get_weather_forecast',
          description: 'Get weather forecast for a city',
          inputSchema: {
            type: 'object',
            properties: {
              city: {
                type: 'string',
                description: 'City name (e.g., "London", "New York", "Tokyo")',
              },
              days: {
                type: 'number',
                description: 'Number of days for forecast (1-5)',
                minimum: 1,
                maximum: 5,
                default: 3,
              },
              units: {
                type: 'string',
                enum: ['standard', 'metric', 'imperial'],
                description: 'Units of measurement (standard: Kelvin, metric: Celsius, imperial: Fahrenheit)',
                default: 'metric',
              },
            },
            required: ['city'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'get_current_weather':
          return this.handleGetCurrentWeather(request.params.arguments);
        case 'get_weather_forecast':
          return this.handleGetWeatherForecast(request.params.arguments);
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${request.params.name}`
          );
      }
    });
  }

  private async handleGetCurrentWeather(args: unknown) {
    if (!isValidCurrentWeatherArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid arguments for get_current_weather'
      );
    }

    const { city, units = 'metric' } = args;

    try {
      const response = await this.axiosInstance.get<WeatherResponse>('weather', {
        params: {
          q: city,
          units,
        },
      });

      const data = response.data;
      const tempUnit = units === 'metric' ? '°C' : units === 'imperial' ? '°F' : 'K';
      const windUnit = units === 'imperial' ? 'mph' : 'm/s';

      const formattedResponse = {
        city: data.name,
        country: data.sys.country,
        temperature: {
          current: `${data.main.temp}${tempUnit}`,
          feels_like: `${data.main.feels_like}${tempUnit}`,
          min: `${data.main.temp_min}${tempUnit}`,
          max: `${data.main.temp_max}${tempUnit}`,
        },
        weather: {
          main: data.weather[0].main,
          description: data.weather[0].description,
          icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
        },
        details: {
          humidity: `${data.main.humidity}%`,
          pressure: `${data.main.pressure} hPa`,
          wind_speed: `${data.wind.speed} ${windUnit}`,
          wind_direction: `${data.wind.deg}°`,
          cloudiness: `${data.clouds.all}%`,
        },
        sun: {
          sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString(),
          sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString(),
        },
        timestamp: new Date().toISOString(),
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formattedResponse, null, 2),
          },
        ],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          content: [
            {
              type: 'text',
              text: `Weather API error: ${
                error.response?.data.message ?? error.message
              }`,
            },
          ],
          isError: true,
        };
      }
      throw error;
    }
  }

  private async handleGetWeatherForecast(args: unknown) {
    if (!isValidForecastArgs(args)) {
      throw new McpError(
        ErrorCode.InvalidParams,
        'Invalid arguments for get_weather_forecast'
      );
    }

    const { city, days = 3, units = 'metric' } = args;

    try {
      const response = await this.axiosInstance.get<ForecastResponse>('forecast', {
        params: {
          q: city,
          units,
          cnt: days * 8, // OpenWeather provides forecast in 3-hour steps, so 8 per day
        },
      });

      const data = response.data;
      const tempUnit = units === 'metric' ? '°C' : units === 'imperial' ? '°F' : 'K';
      const windUnit = units === 'imperial' ? 'mph' : 'm/s';

      // Group forecast by day
      const forecastByDay: Record<string, any[]> = {};
      data.list.forEach((item) => {
        const date = item.dt_txt.split(' ')[0];
        if (!forecastByDay[date]) {
          forecastByDay[date] = [];
        }
        forecastByDay[date].push({
          time: item.dt_txt.split(' ')[1],
          temperature: `${item.main.temp}${tempUnit}`,
          feels_like: `${item.main.feels_like}${tempUnit}`,
          weather: {
            main: item.weather[0].main,
            description: item.weather[0].description,
            icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
          },
          details: {
            humidity: `${item.main.humidity}%`,
            pressure: `${item.main.pressure} hPa`,
            wind_speed: `${item.wind.speed} ${windUnit}`,
            wind_direction: `${item.wind.deg}°`,
            cloudiness: `${item.clouds.all}%`,
          },
        });
      });

      const formattedResponse = {
        city: data.city.name,
        country: data.city.country,
        forecast: Object.entries(forecastByDay).map(([date, forecasts]) => ({
          date,
          forecasts,
        })),
        timestamp: new Date().toISOString(),
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(formattedResponse, null, 2),
          },
        ],
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          content: [
            {
              type: 'text',
              text: `Weather API error: ${
                error.response?.data.message ?? error.message
              }`,
            },
          ],
          isError: true,
        };
      }
      throw error;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('OpenWeather MCP server running on stdio');
  }
}

const server = new OpenWeatherServer();
server.run().catch(console.error);
