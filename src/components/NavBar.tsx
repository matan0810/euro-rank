import { Link, useLocation } from 'react-router-dom';
import { latestYear } from '../data/competitions';

export default function NavBar() {
  const location = useLocation();

  const links = [
    { to: '/', label: '✦ דף הבית' },
    { to: '/players', label: '👥 שחקנים' },
    { to: '/results', label: '🏆 תוצאות' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-purple-900/30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl">⭐</span>
          <span className="font-bold text-lg text-gradient-gold">יורורנק</span>
          <span className="text-xs text-purple-300 font-medium">{latestYear}</span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === link.to
                  ? 'bg-purple-600/40 text-white border border-purple-500/50'
                  : 'text-purple-200 hover:text-white hover:bg-white/10'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
