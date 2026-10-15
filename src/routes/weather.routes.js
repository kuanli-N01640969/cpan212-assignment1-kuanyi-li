import { Router } from 'express';
import { HttpError } from '../lib/http-error.js';
import { getCityWeather } from '../lib/weather.js';
import { parseCities, parseCity } from './weather-query.js';

export const weatherRouter = Router();
const ATTRIBUTION = 'Weather data by Open-Meteo.com (https://open-meteo.com/)';
// TODO (you): GET /api/weather?city=Toronto
// Validate with parseCity, get the summary with getCityWeather, and respond
// with { data, attribution }. Routes never call fetch themselves.
weatherRouter.get('/weather', (req, res) => {
  const city = parseCity(req.query.city);
  const data = getCityWeather(city);

  res.json({
    data,
    attribution: ATTRIBUTION,
  });
});

// TODO (you): GET /api/compare?cities=Toronto,Vancouver,Halifax
// Validate with parseCities, start every lookup at once with Promise.allSettled,
// then build the cities array and the summary described on the assignment page.
weatherRouter.get('/compare', (req, res) => {
  res.status(501).json({ error: { message: 'Not written yet: GET /api/compare' } });
});
