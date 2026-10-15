import { Router } from 'express';
import { HttpError } from '../lib/http-error.js';
import { getCityWeather } from '../lib/weather.js';
import { parseCities, parseCity } from '../validators/weather-query.js';

export const weatherRouter = Router();
const ATTRIBUTION = 'Weather data by Open-Meteo.com (https://open-meteo.com/)';
// TODO (you): GET /api/weather?city=Toronto
// Validate with parseCity, get the summary with getCityWeather, and respond
// with { data, attribution }. Routes never call fetch themselves.
weatherRouter.get('/weather', async(req, res) => {
  const city = parseCity(req.query.city);
  const data = await getCityWeather(city);

  res.json({
    data,
    attribution: ATTRIBUTION,
  });
});

// TODO (you): GET /api/compare?cities=Toronto,Vancouver,Halifax
// Validate with parseCities, start every lookup at once with Promise.allSettled,
// then build the cities array and the summary described on the assignment page.
weatherRouter.get('/compare', async(req, res) => {
  const requestedCities = parseCities(req.query.cities);
  //Start all query in parallel at once
  const results = await Promise.allSettled(
    requestedCities.map((city) => getCityWeather(city))
  );
  //Array and variable initialization
  const cities = [];
  let succeeded = 0;
  let failed = 0;
  let warmest = null;
  let coldest = null;
  let highestTemp = -Infinity;
  let lowestTemp = Infinity;
  //Process results in request order so the response matches the input city order
  for (let i = 0; i < results.length; i++) {
    const city = requestedCities[i];
    const result = results[i];
    // Compare current temperatures to identify the warmest and coldest cities  
    if (result.status === 'fulfilled') {
      const weather = result.value;
      succeeded += 1;

      cities.push({
        city,
        ok: true,
        weather,
      });

      const temp = weather.current.temperatureC;
      const locationName = weather.location.name;

      //Strict comparisons preserve the first city encountered when temperatures tie
      if (temp > highestTemp) {
        highestTemp = temp;
        warmest = locationName;
      }

      if (temp < lowestTemp) {
        lowestTemp = temp;
        coldest = locationName;
      }
    } else {
      //Count failed requests and inspect the reason for each failure.
      failed += 1;
      const err = result.reason;
      //Return known HTTP errors using original status and message
      if (err instanceof HttpError) {
        cities.push({
          city,
          ok: false,
          error: {
            status: err.status,
            message: err.message,
          },
        });
      } else {
        //Log unexpected errors internally and return a generic message to the client
        console.error(err);
        cities.push({
          city,
          ok: false,
          error: {
            status: 500,
            message: 'Internal server error',
          },
        });
      }
    }
  }

  res.json({
    data: {
      cities,
      summary: {
        succeeded,
        failed,
        warmest,
        coldest,
      },
    },
    attribution: ATTRIBUTION,
  });
});
