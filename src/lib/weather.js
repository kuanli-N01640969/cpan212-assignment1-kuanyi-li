import { config } from '../config.js';
import { geocodeCity, getForecast } from './open-meteo.js';
import { describeWeatherCode } from './weather-codes.js';
import { TtlCache } from './cache.js';

// TODO (you): create one cache for the whole app, with a time to live of
const weatherCache = new TtlCache(config.cacheTtlSeconds);

// TODO (you): return the weather summary for one city, in the shape shown on
// the assignment page. Check the cache first. On a miss, geocode the city, get
// the forecast, build the summary, store it, and return it with cached: false.
// On a hit, return the stored summary with cached: true.
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
  const locatoin = await geocodeCity(trimmedName);
  const forecast = await getCityWeather(location.latitude, location.longitude);
}
// TODO (you): return the cache statistics for GET /api/cache/stats.
export function getCacheStats() {
  throw new Error('getCacheStats is not written yet');
}
