// lib/weather-api.ts

const OPENWEATHER_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_KEY || "";

export interface PortWeather {
  port: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDeg: number;
  visibility: number;
  condition: string;
  icon: string;
  description: string;
  lat: number;
  lon: number;
}

const PORT_COORDS: Record<string, { lat: number; lon: number }> = {
  Rotterdam: { lat: 51.9244, lon: 4.4777 },
  "Los Angeles": { lat: 33.7362, lon: -118.2922 },
  Shanghai: { lat: 31.2304, lon: 121.4737 },
  Singapore: { lat: 1.3521, lon: 103.8198 },
  Hamburg: { lat: 53.5511, lon: 9.9937 },
  Felixstowe: { lat: 51.9637, lon: 1.3513 },
  Oakland: { lat: 37.8044, lon: -122.2712 },
  Genoa: { lat: 44.4056, lon: 8.9463 },
  Busan: { lat: 35.1028, lon: 129.0403 },
  Mumbai: { lat: 19.0760, lon: 72.8777 },
  Ningbo: { lat: 29.8683, lon: 121.5440 },
  "Jebel Ali": { lat: 24.9857, lon: 55.0270 },
};

// Demo weather data (realistic for each port)
const DEMO_WEATHER: Record<string, PortWeather> = {
  Rotterdam: { port: "Rotterdam", temp: 18, feelsLike: 16, humidity: 72, windSpeed: 14, windDeg: 245, visibility: 10000, condition: "Clouds", icon: "03d", description: "scattered clouds", lat: 51.9244, lon: 4.4777 },
  "Los Angeles": { port: "Los Angeles", temp: 24, feelsLike: 25, humidity: 55, windSpeed: 8, windDeg: 180, visibility: 10000, condition: "Clear", icon: "01d", description: "clear sky", lat: 33.7362, lon: -118.2922 },
  Shanghai: { port: "Shanghai", temp: 29, feelsLike: 33, humidity: 78, windSpeed: 12, windDeg: 120, visibility: 8000, condition: "Rain", icon: "10d", description: "light rain", lat: 31.2304, lon: 121.4737 },
  Singapore: { port: "Singapore", temp: 31, feelsLike: 36, humidity: 85, windSpeed: 6, windDeg: 90, visibility: 9000, condition: "Thunderstorm", icon: "11d", description: "thunderstorm", lat: 1.3521, lon: 103.8198 },
  Hamburg: { port: "Hamburg", temp: 16, feelsLike: 14, humidity: 68, windSpeed: 18, windDeg: 270, visibility: 10000, condition: "Clouds", icon: "04d", description: "overcast clouds", lat: 53.5511, lon: 9.9937 },
  Felixstowe: { port: "Felixstowe", temp: 15, feelsLike: 13, humidity: 70, windSpeed: 16, windDeg: 260, visibility: 9500, condition: "Clouds", icon: "03d", description: "scattered clouds", lat: 51.9637, lon: 1.3513 },
  Oakland: { port: "Oakland", temp: 19, feelsLike: 18, humidity: 60, windSpeed: 10, windDeg: 200, visibility: 10000, condition: "Clear", icon: "01d", description: "clear sky", lat: 37.8044, lon: -122.2712 },
  Genoa: { port: "Genoa", temp: 22, feelsLike: 23, humidity: 62, windSpeed: 9, windDeg: 150, visibility: 10000, condition: "Clear", icon: "02d", description: "few clouds", lat: 44.4056, lon: 8.9463 },
  Busan: { port: "Busan", temp: 26, feelsLike: 28, humidity: 75, windSpeed: 11, windDeg: 110, visibility: 8500, condition: "Rain", icon: "09d", description: "light intensity shower rain", lat: 35.1028, lon: 129.0403 },
  Mumbai: { port: "Mumbai", temp: 30, feelsLike: 35, humidity: 82, windSpeed: 14, windDeg: 170, visibility: 7000, condition: "Haze", icon: "50d", description: "haze", lat: 19.0760, lon: 72.8777 },
  Ningbo: { port: "Ningbo", temp: 28, feelsLike: 31, humidity: 76, windSpeed: 13, windDeg: 130, visibility: 8000, condition: "Clouds", icon: "04d", description: "broken clouds", lat: 29.8683, lon: 121.5440 },
  "Jebel Ali": { port: "Jebel Ali", temp: 38, feelsLike: 42, humidity: 45, windSpeed: 15, windDeg: 300, visibility: 10000, condition: "Clear", icon: "01d", description: "clear sky", lat: 24.9857, lon: 55.0270 },
};

export async function getPortWeather(port: string): Promise<PortWeather> {
  if (!OPENWEATHER_KEY) {
    return DEMO_WEATHER[port] || DEMO_WEATHER["Rotterdam"];
  }
  const coords = PORT_COORDS[port];
  if (!coords) return DEMO_WEATHER["Rotterdam"];

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${OPENWEATHER_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("Failed");
    const data = await res.json();
    return {
      port,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      windDeg: data.wind.deg || 0,
      visibility: data.visibility || 10000,
      condition: data.weather[0]?.main || "Clear",
      icon: data.weather[0]?.icon || "01d",
      description: data.weather[0]?.description || "clear sky",
      lat: coords.lat,
      lon: coords.lon,
    };
  } catch {
    return DEMO_WEATHER[port] || DEMO_WEATHER["Rotterdam"];
  }
}

export function getWeatherIcon(condition: string): string {
  const icons: Record<string, string> = {
    "Clear": "☀️",
    "Clouds": "☁️",
    "Rain": "🌧️",
    "Drizzle": "🌦️",
    "Thunderstorm": "⛈️",
    "Snow": "🌨️",
    "Mist": "🌫️",
    "Fog": "🌫️",
    "Haze": "🌫️",
    "Dust": "🌫️",
  };
  return icons[condition] || "🌤️";
}

export function getWindDirection(deg: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return directions[Math.round(deg / 22.5) % 16];
}