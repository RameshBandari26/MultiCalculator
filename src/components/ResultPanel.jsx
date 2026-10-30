import { forwardRef, useState } from 'react';

/** Presentational result view: headline, rows, formula, steps and assumptions. */
const ResultPanel = forwardRef(function ResultPanel({ result, title }, ref) {
  const [copyState, setCopyState] = useState('Copy result');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${title}: ${result.main}`);
      setCopyState('Copied');
    } catch {
      setCopyState('Copy not available');
    }
  };
  return (
    <div ref={ref} tabIndex={-1} className="outline-none" aria-label="Result">
      <div className="card">
        <div className="muted">Result</div>
        <div className="big" data-testid="main-result">{result.main}</div>
        <table className="result-table"><tbody>
          {result.rows.map(([label, value]) => <tr key={label}><td>{label}</td><td>{value}</td></tr>)}
        </tbody></table>
      </div>
      <div className="card">
        <strong>Formula</strong><p>{result.formula}</p>
        {result.steps.length > 0 && (<><strong>Steps</strong><ul className="list-disc pl-6">{result.steps.map((s) => <li key={s}>{s}</li>)}</ul></>)}
        <strong>Assumptions &amp; warnings</strong>
        <ul className="list-disc pl-6">{result.notes.map((n) => <li key={n}>{n}</li>)}</ul>
      </div>
      <button type="button" className="btn btn-ghost" onClick={copy}>{copyState}</button>
    </div>
  );
});

export default ResultPanel;
