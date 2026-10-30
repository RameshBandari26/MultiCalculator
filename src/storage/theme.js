import { readJson, writeJson } from './safeStorage.js';

export const THEME_KEY = 'mc.theme';
export const getStoredTheme = () => readJson(THEME_KEY, null);
export const storeTheme = (theme) => writeJson(THEME_KEY, theme);

/** Apply a theme ("light" | "dark") to <html>. */
export const applyTheme = (theme) => { if (theme) document.documentElement.dataset.theme = theme; };

/** Resolve the theme currently in effect, falling back to the OS preference. */
export function currentTheme() {
  const explicit = document.documentElement.dataset.theme;
  if (explicit) return explicit;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
