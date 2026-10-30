import { readJson, writeJson } from './safeStorage.js';

export const HISTORY_KEY = 'mc.hist';
export const HISTORY_LIMIT = 20;

/** @returns {{id:string, s:string}[]} Newest first. */
export const getHistory = () => {
  const list = readJson(HISTORY_KEY, []);
  return Array.isArray(list) ? list : [];
};

export function addHistory(calculatorId, summary) {
  const next = [{ id: calculatorId, s: summary }, ...getHistory()].slice(0, HISTORY_LIMIT);
  writeJson(HISTORY_KEY, next);
  return next;
}

export function clearHistory() {
  writeJson(HISTORY_KEY, []);
  return [];
}
