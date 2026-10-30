import { readJson, writeJson } from './safeStorage.js';

export const FAVOURITES_KEY = 'mc.fav';

export const getFavourites = () => {
  const list = readJson(FAVOURITES_KEY, []);
  return Array.isArray(list) ? list : [];
};

/** Toggle a calculator id and return the new list. */
export function toggleFavourite(calculatorId) {
  const current = getFavourites();
  const next = current.includes(calculatorId) ? current.filter((id) => id !== calculatorId) : [...current, calculatorId];
  writeJson(FAVOURITES_KEY, next);
  return next;
}
