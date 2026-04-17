import type { WeatherData, WeatherCondition } from '../types';

export const fetchWeather = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    // We use open-meteo which requires no API key.
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,weather_code&timezone=Asia%2FSeoul`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Weather fetching failed');
    }

    const data = await response.json();
    const temp = data.current.temperature_2m;
    const precip = data.current.precipitation;
    const weatherCode = data.current.weather_code;

    let condition: WeatherCondition = 'any';
    let isRaining = false;

    let isSnowing = false;

    // Based on WMO weather codes: 50-69 are drizzle/rain, 80-82 rain showers, 95-99 thunderstorms, 70-79 snow
    if (
      (weatherCode >= 50 && weatherCode <= 69) || 
      (weatherCode >= 80 && weatherCode <= 82) || 
      (weatherCode >= 95 && weatherCode <= 99) ||
      precip > 0
    ) {
      condition = 'rain';
      isRaining = true;
    } else if (weatherCode >= 70 && weatherCode <= 79) {
      condition = 'cold'; // Map snow to cold for menu types, but flag it
      isSnowing = true;
    } else if (weatherCode === 2 || weatherCode === 3 || weatherCode === 45 || weatherCode === 48) {
      condition = 'cloudy';
    } else if (temp >= 26) {
      condition = 'hot';
    } else if (temp <= 10) {
      condition = 'cold';
    } else {
      condition = 'clear';
    }

    return {
      temperature: temp,
      isRaining: isRaining || isSnowing, // Treat both as raining for UI flags if needed
      condition
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    // Fallback default
    return {
      temperature: 20,
      isRaining: false,
      condition: 'any'
    };
  }
};
