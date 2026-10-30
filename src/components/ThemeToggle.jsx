import { useState } from 'react';
import { applyTheme, currentTheme, storeTheme } from '../storage/theme.js';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(currentTheme);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storeTheme(next);
    setTheme(next);
  };
  return (
    <button type="button" className="btn btn-ghost" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
      Theme
    </button>
  );
}
