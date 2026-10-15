import { HttpError } from '../lib/http-error.js';

// TODO (you): check ?city= and return the trimmed city name. Throw a 400
// HttpError with details.city when it breaks a rule from the assignment page.
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
  throw new Error('parseCities is not written yet');
}

