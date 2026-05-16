import { motion } from 'framer-motion';
import { PlayerScore } from '../types';

interface Props {
  scores: PlayerScore[];
  onPlayerClick: (score: PlayerScore) => void;
}

const RANK_STYLES = [
  {
    border: 'border-yellow-400/50',
    bg: 'bg-yellow-400/10',
    badge: 'bg-yellow-400 text-gray-900',
    glow: '0 0 30px rgba(245, 158, 11, 0.4)',
    medal: '👑',
    label: '1st',
  },
  {
    border: 'border-gray-300/50',
    bg: 'bg-gray-300/10',
    badge: 'bg-gray-300 text-gray-900',
    glow: '0 0 20px rgba(156, 163, 175, 0.3)',
    medal: '🥈',
    label: '2nd',
  },
  {
    border: 'border-amber-600/50',
    bg: 'bg-amber-600/10',
    badge: 'bg-amber-600 text-white',
    glow: '0 0 20px rgba(180, 83, 9, 0.3)',
    medal: '🥉',
    label: '3rd',
  },
];

export default function Leaderboard({ scores, onPlayerClick }: Props) {
  if (scores.length === 0) {
    return (
      <div className="text-center py-16 text-purple-300/50">
        <div className="text-5xl mb-4">🏆</div>
        <p className="text-lg">No scores to display yet.</p>
        <p className="text-sm mt-2">Make sure players have predictions entered.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {scores.map((score, index) => {
        const rankStyle = RANK_STYLES[index] || null;
        const isTopThree = index < 3;

        return (
          <motion.div
            key={score.playerId}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
            onClick={() => onPlayerClick(score)}
            className={`relative rounded-2xl p-4 border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              isTopThree
                ? `${rankStyle!.border} ${rankStyle!.bg}`
                : 'border-white/10 glass hover:border-purple-500/40'
            }`}
            style={isTopThree ? { boxShadow: rankStyle!.glow } : undefined}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex-shrink-0 w-10 text-center">
                {isTopThree ? (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-2xl">{rankStyle!.medal}</span>
                    {index === 0 && (
                      <span className="text-xs font-bold text-yellow-400">WINNER</span>
                    )}
                  </div>
                ) : (
                  <span className="text-lg font-bold text-purple-400/60">#{index + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0 ${
                  isTopThree ? rankStyle!.badge : 'text-white'
                }`}
                style={
                  !isTopThree
                    ? { background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }
                    : undefined
                }
              >
                {score.playerName.charAt(0).toUpperCase()}
              </div>

              {/* Name & score bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <span className="font-bold text-white text-lg truncate">
                    {score.playerName}
                    {index === 0 && ' 👑'}
                  </span>
                  <span className={`text-xl font-black flex-shrink-0 ${
                    isTopThree
                      ? index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-amber-500'
                      : 'text-purple-300'
                  }`}>
                    {score.totalScore}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: isTopThree
                        ? index === 0
                          ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
                          : index === 1
                          ? 'linear-gradient(90deg, #9CA3AF, #E5E7EB)'
                          : 'linear-gradient(90deg, #B45309, #D97706)'
                        : 'linear-gradient(90deg, #7C3AED, #EC4899)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.08 + 0.3, ease: 'easeOut' }}
                  />
                </div>

                <div className="flex justify-between mt-1">
                  <span className="text-xs text-white/40">{score.percentage}% of max</span>
                  <span className="text-xs text-white/40">max {score.maxScore}</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 text-purple-400/40 hover:text-purple-300 transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
