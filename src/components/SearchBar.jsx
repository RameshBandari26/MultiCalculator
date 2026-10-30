import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchCalculators } from '../search/index.js';

/** Search box with intent detection and a keyboard-navigable suggestion list (ARIA combobox). */
export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const options = useMemo(() => {
    if (!query.trim()) return [];
    const { intent, results } = searchCalculators(query);
    return [
      ...(intent ? [{ key: 'intent', id: intent.id, vals: intent.vals, text: `Understood: ${intent.label} — open with these values`, intent: true }] : []),
      ...results.slice(0, 5).map((c) => ({ key: c.id, id: c.id, text: c.name, hint: c.cat })),
    ];
  }, [query]);

  useEffect(() => {
    const onKey = (event) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
      if (event.key === '/' && !typing) { event.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const choose = (option) => {
    navigate(`/${option.id}`, { state: option.vals ? { values: option.vals, nonce: Date.now() } : { nonce: Date.now() } });
    setQuery('');
    setActive(-1);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive((i) => Math.min(i + 1, options.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive((i) => Math.max(i - 1, -1)); }
    else if (event.key === 'Escape') { setQuery(''); setActive(-1); }
    else if (event.key === 'Enter') {
      const option = options[active >= 0 ? active : 0];
      if (option) choose(option);
    }
  };

  return (
    <div className="my-4">
      <label htmlFor="search" className="sr-only">Search calculators</label>
      <input id="search" ref={inputRef} type="search" className="field !p-3.5 text-[1.05rem]" autoComplete="off"
        placeholder="Try: EMI for 8 lakh at 9 percent for 5 years  (press / to focus)"
        role="combobox" aria-expanded={options.length > 0} aria-controls="search-options" aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `opt-${active}` : undefined}
        value={query} onChange={(e) => { setQuery(e.target.value); setActive(-1); }} onKeyDown={onKeyDown} />
      <div aria-live="polite">
        {options.length > 0 && (
          <ul id="search-options" role="listbox" className="suggestions mt-1.5 list-none p-0">
            {options.map((option, index) => (
              <li key={option.key} id={`opt-${index}`} role="option" aria-selected={index === active}
                onClick={() => choose(option)} className={option.intent ? 'font-semibold' : ''}>
                {option.text}{option.hint && <span className="muted"> · {option.hint}</span>}
              </li>
            ))}
          </ul>
        )}
        {query.trim() && options.length === 0 && (
          <p className="muted" role="status">No matching calculator. Unsupported calculations are not guessed — try a name like “EMI” or “GST”.</p>
        )}
      </div>
    </div>
  );
}
