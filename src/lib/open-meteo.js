import { config } from '../config.js';
import { HttpError } from './http-error.js';

// This is the only file that calls fetch or knows Open-Meteo's URLs.
// The exact requests are on the assignment page.

// TODO (you): write a helper that fetches a URL and returns the parsed JSON.
async function fetchJson(url, serviceName) {
  try {
    //Pass AbortSignal
    const res = await fetch(url, {signal: AbortSignal.timeout(config.upstreamTimeoutMs),});
    //Self-check res.ok
    if (!res.ok){
      throw new HttpError(502, `Could not get a valid response from the ${serviceName} service`);
    }
    return await res.json(); //Parsed Json
  } catch(err) {
    //Open-meteo didn't answer within timeout
    if (err.name ===  'TimeoutError'){
      throw new HttpError(504, `The ${serviceName} service did not respond within ${config.upstreamTimeoutMs} ms`);
    }
    //Preserve existing errors
    if (err instanceof HttpError) {
      throw err;
    }
    //Network failure
    throw new HttpError(502, `Could not get a valid response from the ${serviceName} service`);
  }
} 

// TODO (you): look up a city with the geocoding API and return
export async function geocodeCity(name) {
  //API first result
  const params = new URLSearchParams({
    name,
    count: 1,
    language:'en',
    format:'json',
  });
  //Combine base url, endpoint and the query parameters
  const url = `${config.geocodingUrl}/search?${params}`;
  //Fetching data
  const data = await fetchJson(url, 'geocoding');
  //Error 404 for non-array or empty array
  if (!Array.isArray(data.results) || data.results.length === 0){
    throw new HttpError(404, `City not found: ${name}`);
  }
  //Reference first object from array
  const first = data.results[0];
  return {
    name: first.name,
    region: first.admin1 ?? null,
    country: first.country ?? null,
    latitude: first.latitude,
    longitude: first.longitude,
    timezone: first.timezone, 
  };
}

// TODO (you): get the current weather and a 3-day daily forecast from the
export async function getForecast(latitude, longitude) {
  //Combine base url, endpoint and the query parameters
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: 3,
  })
  //Combine base url, endpoint and the query parameters
  const url = `${config.forecastUrl}/forecast?${params}`;
  //fetch data
  return await fetchJson(url, 'forecast');
}
