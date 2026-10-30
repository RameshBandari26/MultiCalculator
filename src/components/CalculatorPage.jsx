import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { defaultValues } from '../calculators/index.js';
import { getFavourites, toggleFavourite } from '../storage/favourites.js';
import { addHistory } from '../storage/history.js';
import ResultPanel from './ResultPanel.jsx';

/** Run a calculator and capture either its result or the validation error message. */
function compute(calculator, values) {
  try {
    return { result: calculator.run(values) };
  } catch (error) {
    return { error: error.message };
  }
}

export default function CalculatorPage({ calculator, prefill, onPrefillConsumed }) {
  const [values, setValues] = useState(() => defaultValues(calculator, prefill ?? {}));
  const [outcome, setOutcome] = useState(() => compute(calculator, defaultValues(calculator, prefill ?? {})));
  const [favourite, setFavourite] = useState(() => getFavourites().includes(calculator.id));
  const resultRef = useRef(null);
  const errorRef = useRef(null);
  const savedPrefill = useRef(false);

  useEffect(() => {
    document.title = `${calculator.name} — Master Calculator`;
    // Search-intent opens are saved to history once, then the router state is cleared so a refresh does not repeat it.
    if (prefill && !savedPrefill.current) {
      savedPrefill.current = true;
      if (outcome.result) addHistory(calculator.id, `${calculator.name} → ${outcome.result.main}`);
      onPrefillConsumed();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (event) => {
    event.preventDefault();
    const next = compute(calculator, values);
    setOutcome(next);
    if (next.result) addHistory(calculator.id, `${calculator.name} → ${next.result.main}`);
    setTimeout(() => (next.error ? errorRef : resultRef).current?.focus(), 0);
  };

  return (
    <>
      <p><Link to="/">← All calculators</Link></p>
      <div className="card">
        <span className="pill">{calculator.cat}</span>
        <span className="pill">status: {calculator.verification.status}</span>
        <h2 className="my-2 text-xl font-semibold">{calculator.name}</h2>
        <p className="muted">{calculator.desc}</p>
        <form onSubmit={submit} noValidate>
          {calculator.fields.map((field) => {
            const id = `field-${field.k}`;
            const common = {
              id, className: 'field', value: values[field.k],
              'aria-invalid': outcome.error ? true : undefined,
              'aria-describedby': outcome.error ? 'calc-error' : undefined,
              onChange: (e) => setValues((v) => ({ ...v, [field.k]: e.target.value })),
            };
            return (
              <div key={field.k}>
                <label htmlFor={id} className="mb-1 mt-2.5 block text-[.9rem]">{field.l}</label>
                {field.t === 'select'
                  ? <select {...common}>{field.o.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
                  : <input {...common} type={field.t === 'date' ? 'date' : 'text'} inputMode={field.t === 'text' || field.t === 'date' ? undefined : 'decimal'} />}
              </div>
            );
          })}
          <div className="mt-3.5 flex flex-wrap gap-2">
            <button type="submit" className="btn flex-1">Calculate</button>
            <button type="button" className="btn btn-ghost flex-1" aria-pressed={favourite}
              onClick={() => setFavourite(toggleFavourite(calculator.id).includes(calculator.id))}>
              {favourite ? '★ Favourited' : '☆ Favourite'}
            </button>
          </div>
        </form>
      </div>
      <div aria-live="polite">
        {outcome.error && <div ref={errorRef} tabIndex={-1} id="calc-error" className="card error" role="alert">{outcome.error}</div>}
        {outcome.result && <ResultPanel ref={resultRef} result={outcome.result} title={calculator.name} />}
      </div>
    </>
  );
}
