import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CALCULATORS, getCalculator } from '../calculators/index.js';
import { getFavourites } from '../storage/favourites.js';
import { clearHistory, getHistory } from '../storage/history.js';
import CalculatorCard from './CalculatorCard.jsx';

export default function Home() {
  const [history, setHistory] = useState(getHistory);
  const favouriteIds = getFavourites();
  const favourites = favouriteIds.map(getCalculator).filter(Boolean);
  useEffect(() => { document.title = 'Master Calculator — Every calculation. One smart place.'; }, []);

  return (
    <>
      <h2 className="text-xl font-semibold">Favourites</h2>
      {favourites.length ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
          {favourites.map((c) => <CalculatorCard key={c.id} calculator={c} favourite />)}
        </div>
      ) : <p className="muted">No favourites yet. Open a calculator and choose “Favourite” to pin it here.</p>}

      <h2 className="text-xl font-semibold">Calculators</h2>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
        {CALCULATORS.map((c) => <CalculatorCard key={c.id} calculator={c} favourite={favouriteIds.includes(c.id)} />)}
      </div>

      <h2 className="text-xl font-semibold">Recent calculations</h2>
      {history.length ? (
        <div className="card">
          <ul className="m-0 list-none p-0">
            {history.slice(0, 8).map((entry, index) => (
              <li key={`${entry.id}-${index}`}><Link to={`/${entry.id}`}>{entry.s}</Link></li>
            ))}
          </ul>
          <button type="button" className="btn btn-ghost mt-2" onClick={() => setHistory(clearHistory())}>Clear history</button>
        </div>
      ) : <p className="muted">No calculations yet. Your recent results will appear here.</p>}

      <p className="muted">
        Planned but not yet built: education/CGPA, health, construction, engineering, programming, agriculture, vehicles,
        a user-configurable workflow builder, regional languages. Nothing here is marked verified yet.
      </p>
    </>
  );
}
