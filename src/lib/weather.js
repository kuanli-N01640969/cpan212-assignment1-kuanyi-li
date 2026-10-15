import { config } from '../config.js';
import { geocodeCity, getForecast } from './open-meteo.js';
import { describeWeatherCode } from './weather-codes.js';
import { TtlCache } from './cache.js';

// TODO (you): create one cache for the whole app, with a time to live of
const weatherCache = new TtlCache(config.cacheTtlSeconds);

// TODO (you): return the weather summary for one city, in the shape shown on
export async function getCityWeather(city) {
  //uniform cache entry
  const trimmedName = city.trim();
  const cacheKey = trimmedName.toLowercase();
  //Check if cache exists
  const cachedSummary = weatherCache.get(cacheKey);
  if (cachedSummary){
    return{...cachedSummary, cached:true};
  }
  //No cache, require geocode city then forecast
  const location = await geocodeCity(trimmedName);
  const forecast = await getCityWeather(location.latitude, location.longitude);
  //Forcast array
  const daily = [];
  for (let i = 0; i < forecast.daily.time.length; i++){
    const code = forecast.daily.weather_code[i];
    
    daily.push({
      date: forecast.daily.time[i],
      minC: forecast.daily.temperature_2m_min[i],
      maxC: forecast.daily.temperature_2m_max[i],
      precipitationChancePercent: forecast.daily.precipitation_probability_max[i]??null,
      weatherCode: code,
      conditions: describeWeatherCode(code),
    });
  }
  //Storage
  const summary = {
    location:{
      name: location.name,
      region: location.region,
      country: location.country,
      latitude: location.latitude,
      longitude: location.longitude,
      timezone: location.timezone,
    },
    current:{
      time: forecast.current.time,
      temperatureC: forecast.current.temperature_2m,
      feelsLikeC: forecast.current.apparent_temperature,
      humidityPercent: forecast.current.relative_humidity_2m, 
      windKmh: forecast.current.wind_speed_10m,
      weatherCode: forecast.current.weather_code,
      conditions: describeWeatherCode(forecast.current.weather_code),  
    },
    daily,
    fetchedAt: new Date().toISOString,
    cached: false,
  };
  //Only save successful lookups in cache
  weatherCache.set(cacheKey, summary);
  return summary;
}

// TODO (you): return the cache statistics for GET /api/cache/stats.
export function getCacheStats() {
  return weatherCache.stats();
}
