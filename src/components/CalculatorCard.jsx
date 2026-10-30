import { Link } from 'react-router-dom';

export default function CalculatorCard({ calculator, favourite }) {
  return (
    <Link to={`/${calculator.id}`} className="card card-link">
      <span className="pill">{calculator.cat}</span>
      {favourite && <span aria-label="Favourite">★ </span>}
      <strong>{calculator.name}</strong>
      <div className="muted">{calculator.desc}</div>
    </Link>
  );
}
