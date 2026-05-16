import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Hero section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center mb-16"
      >
        {/* Sparkle row */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {['✦', '⭐', '✦', '★', '✦', '⭐', '✦'].map((s, i) => (
            <span
              key={i}
              className="text-yellow-300"
              style={{
                fontSize: i % 2 === 0 ? '14px' : '20px',
                animation: `twinkle ${2 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
              }}
            >
              {s}
            </span>
          ))}
        </div>

        <h1 className="text-6xl md:text-7xl font-black mb-4 leading-none">
          <span className="text-gradient-gold">Euro</span>
          <span className="text-white">Rank</span>
        </h1>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-purple-500" />
          <span className="text-purple-300 font-semibold tracking-widest text-sm uppercase">
            Eurovision 2025
          </span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-purple-500" />
        </div>

        <p className="text-purple-200/80 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
          Predict the Eurovision final ranking, compete with friends, and find out who knows their Eurovision best!
        </p>
      </motion.div>

      {/* Action cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        className="grid md:grid-cols-2 gap-6 w-full max-w-2xl"
      >
        {/* Players card */}
        <Link to="/players" className="group">
          <div className="card glass-purple h-full flex flex-col items-center text-center gap-4 p-8 hover:scale-105 transition-transform duration-200 cursor-pointer">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-2"
              style={{ background: 'linear-gradient(135deg, #7C3AED33, #EC489933)' }}
            >
              👥
            </div>
            <h2 className="text-2xl font-bold text-white">Manage Players</h2>
            <p className="text-purple-200/70 text-sm leading-relaxed">
              Add players and enter each person's prediction for the Eurovision final ranking.
            </p>
            <div className="mt-auto btn-primary w-full text-center">
              Enter Predictions →
            </div>
          </div>
        </Link>

        {/* Results card */}
        <Link to="/results" className="group">
          <div className="card glass-gold h-full flex flex-col items-center text-center gap-4 p-8 hover:scale-105 transition-transform duration-200 cursor-pointer">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-2"
              style={{ background: 'linear-gradient(135deg, #F59E0B33, #FCD34D33)' }}
            >
              🏆
            </div>
            <h2 className="text-2xl font-bold text-white">Results & Scores</h2>
            <p className="text-purple-200/70 text-sm leading-relaxed">
              Enter the actual Eurovision results and see who predicted best with the animated leaderboard.
            </p>
            <div className="mt-auto btn-gold w-full text-center">
              See Leaderboard →
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Scoring info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="mt-12 max-w-2xl w-full glass rounded-2xl p-6"
      >
        <h3 className="text-center font-bold text-purple-200 mb-4 text-sm uppercase tracking-wider">
          ✦ Scoring System ✦
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: 'Exact match', pts: '+10 pts', color: 'text-green-400' },
            { label: 'Off by 1', pts: '+9 pts', color: 'text-yellow-400' },
            { label: '1st place exact', pts: '+15 bonus', color: 'text-gold-light' },
            { label: 'Max score', pts: '280 pts', color: 'text-purple-300' },
          ].map(item => (
            <div key={item.label} className="glass rounded-xl p-3">
              <div className={`text-lg font-bold ${item.color}`}>{item.pts}</div>
              <div className="text-xs text-white/50 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
