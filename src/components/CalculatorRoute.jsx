import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { getCalculator } from '../calculators/index.js';
import CalculatorPage from './CalculatorPage.jsx';

/** Resolves the calculator from the URL; shows an empty state for unknown ids. */
export default function CalculatorRoute() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const calculator = getCalculator(id);
  if (!calculator) {
    return (
      <div className="card" role="alert">
        <h2 className="mt-0 text-xl font-semibold">Calculator not found</h2>
        <p>There is no calculator called “{id}”. <Link to="/">Browse all calculators</Link> or use the search box.</p>
      </div>
    );
  }
  const prefill = location.state?.values ?? null;
  const nonce = location.state?.nonce ?? 'direct';
  return (
    <CalculatorPage key={`${id}:${nonce}`} calculator={calculator} prefill={prefill}
      onPrefillConsumed={() => navigate(location.pathname, { replace: true, state: { nonce } })} />
  );
}
