# City Weather API

An Express 5 back-end service that geocodes city names and retrieves current weather conditions and a 3-day daily forecast using the Open-Meteo API. It supports single-city lookups, parallel multi-city comparisons.

## Run it

Make sure you are using Node.js 24 (`node -v`), then install dependencies, create your `.env` file, and start the development server:

npm install
cp .env.example .env
npm run dev

## Environment variables

| Variable | Default | Controls |
| --- | --- | --- |
| `PORT` | `4000` | The port the server listens on |
| `GEOCODING_URL` | `https://geocoding-api.open-meteo.com/v1` | Base URL of the geocoding API |
| `FORECAST_URL` | `https://api.open-meteo.com/v1` | Base URL of the forecast API |
| `UPSTREAM_TIMEOUT_MS` | `5000` | How long to wait for each Open-Meteo request (in milliseconds) |
| `CACHE_TTL_SECONDS` | `600` | How long a cached answer stays valid (in seconds) |

## Endpoints

### `GET /api/weather`
Returns the resolved location, current weather, and a 3-day daily forecast for a single city (`200`), or an error response (`400`, `404`, `502`, `504`) when validation or the upstream lookup fails.

Example request:
```bash
curl "http://localhost:4000/api/weather?city=Toronto"
```

### `GET /api/compare`
Looks up 2 to 5 comma-separated cities in parallel using `Promise.allSettled`. Responds with `200` whenever the query is valid, returning a `cities` array in request order (with `ok: true` and `weather`, or `ok: false` and `error` per city) and a `summary` object (`succeeded`, `failed`, `warmest`, `coldest`).

Example request:
```bash
curl "http://localhost:4000/api/compare?cities=Toronto,Vancouver,Halifax"
```

### `GET /api/cache/stats`
Returns the current in-memory cache statistics (`200`) with `{ "data": { "entries", "hits", "misses", "ttlSeconds" } }`, counting only non-expired entries.

Example request:
```bash
curl "http://localhost:4000/api/cache/stats"
```

## Data source

Weather and geocoding data provided by [Open-Meteo](https://open-meteo.com/).

## AI use

**Tool used:** Google Gemini

### Concept explanations
* **Upstream fetch and timeout handling (`src/lib/open-meteo.js`):** Used to review how `AbortSignal.timeout()` interacts with `fetch()`, why `!res.ok` must be checked manually for non-2xx HTTP responses, and how to map `TimeoutError` to `504` while mapping network failures and invalid JSON responses to `502`.
* **Parallel lookups with partial failures (`src/routes/weather.routes.js`):** Used to review how `Promise.allSettled()` runs an array of promises mapped from `requestedCities.map((city) => getCityWeather(city))` concurrently without rejecting when one city fails, and how to inspect `result.status === 'fulfilled'` vs. `result.reason`.
* **In-memory TTL caching (`src/lib/cache.js`):** Used to review storing `{ value, expiresAt }` entries inside a JavaScript `Map` and pruning expired keys when reporting `stats()` so `entries` only counts active cache items without incrementing `misses`.

### Troubleshooting and debugging
Used to diagnose and fix 4 bugs during development and testing:
1. **Recursive function call in `src/lib/weather.js` (`TypeError: city.trim is not a function`):** Fixed a bug on line 21 where `getCityWeather(location.latitude, location.longitude)` was accidentally called instead of `getForecast(location.latitude, location.longitude)`, which passed a numeric latitude into `city.trim()`.
2. **Missing parentheses on `toISOString` in `src/lib/weather.js`:** Fixed `fetchedAt: new Date().toISOString` to `fetchedAt: new Date().toISOString()` so the timestamp string is generated and included in the JSON response instead of being omitted as a function reference.
3. **Missing `async`/`await` in `GET /api/weather` (`src/routes/weather.routes.js`):** Added `async` to the route handler and `await` before `getCityWeather(city)` so Express waits for the weather lookup to resolve instead of returning an empty object (`data: {}`).
4. **Missing `async`/`await` in `GET /api/compare` (`src/routes/weather.routes.js`):** Added `async` to the route handler and `await` before `Promise.allSettled(...)` so the route iterates over the resolved results array rather than a pending `Promise`.
