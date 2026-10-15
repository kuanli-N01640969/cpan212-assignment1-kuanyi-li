import { HttpError } from '../lib/http-error.js';

// TODO (you): check ?city= and return the trimmed city name. Throw a 400
export function parseCity(value) {
  //Prevent duplicate value
  if (Array.isArray(value)){
    throw new HttpError(400, `Invalid query`, {city:`city must not be sent more than once`,});
  }
  //Invalid value type
  if (typeof value !== 'string'){
    throw new HttpError(400, 'Invalid query', {city: `city is required`,});
  }
  const trimmed = value.trim();
  //Empty query
  if (trimmed.length === 0){
    throw new HttpError(400, `Invalid query`, {city: `city cannot be empty`},);
  }
  //Character limits
  if (trimmed.length < 2 || trimmed.length > 60){
    throw new HttpError(400, 'Invalid query', {city: `city must be 2 to 60 characters`,});
  }

  return trimmed;
}

// TODO (you): check ?cities= and return an array of trimmed city names. Throw a
// 400 HttpError with details.cities when it breaks a rule from the assignment page.
export function parseCities(value) {
  //Prevent duplicate value
  if (Array.isArray(value)) {
    throw new HttpError(400, 'Invalid query', {cities: 'cities must not be sent more than once',});
  }
  //Invalid value type
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new HttpError(400, 'Invalid query', {
      cities: 'cities is required',
    });
  }
  //Split string into array
  const cities = value.split(',').map((name) => name.trim());
  //Empty query
  if (cities.some((name) => name.length === 0)) {
    throw new HttpError(400, 'Invalid query', {cities: 'cities cannot contain an empty city name',});
  }
  //Charater limits
  if (cities.length < 2 || cities.length > 5) {
    throw new HttpError(400, 'Invalid query', {cities: 'cities must contain 2 to 5 city names',});
  }
  //Validate individual cities
  for (const name of cities) {
    if (name.length < 2 || name.length > 60) {
      throw new HttpError(400, 'Invalid query', {cities: 'each city must be 2 to 60 characters',});
    }
  }
  //Array check for duplication
  const seen = new Set();
  for (const name of cities) {
    //Cache is case sensative 
    const lower = name.toLowerCase();
    //Prevent duplicate value
    if (seen.has(lower)) {
      throw new HttpError(400, 'Invalid query', {cities: `"${name}" is listed more than once`,});
    }
    //Stored successfully
    seen.add(lower);
  }

  return cities;
}

