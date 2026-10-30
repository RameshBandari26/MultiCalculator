import { Link, Outlet } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  return (
    <div className="mx-auto max-w-4xl p-4">
      <a href="#main-content" onClick={(e) => { e.preventDefault(); document.getElementById('main-content')?.focus(); }}
        className="sr-only focus:not-sr-only focus:absolute focus:bg-[var(--card)] focus:p-2">Skip to content</a>
      <header className="flex items-center justify-between gap-2">
        <div>
          <h1 className="m-0 text-2xl font-bold"><Link to="/" className="!text-inherit no-underline">Master Calculator</Link></h1>
          <p className="muted m-0">Every calculation. One smart place.</p>
        </div>
        <ThemeToggle />
      </header>
      <SearchBar />
      <main id="main-content" tabIndex={-1} className="outline-none"><Outlet /></main>
      <Footer />
    </div>
  );
}
