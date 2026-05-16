import { motion } from 'framer-motion';
import { Player, Country } from '../types';

interface Props {
  player: Player;
  countries: Country[];
  onEdit: () => void;
  onDelete: () => void;
}

export default function PlayerCard({ player, countries, onEdit, onDelete }: Props) {
  const totalCountries = countries.length;
  const predictedCount = player.prediction.length;
  const isComplete = predictedCount === totalCountries;
  const isPartial = predictedCount > 0 && !isComplete;

  const statusColor = isComplete
    ? 'text-green-400 bg-green-400/10 border-green-400/30'
    : isPartial
    ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
    : 'text-gray-400 bg-gray-400/10 border-gray-400/30';

  const statusLabel = isComplete ? '✓ הושלם' : isPartial ? `${predictedCount}/${totalCountries}` : 'אין חיזוי';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="glass rounded-2xl p-4 border border-white/10 hover:border-purple-500/40 transition-all duration-200"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}>
          {player.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white truncate">{player.name}</div>
          <div className={`inline-flex items-center gap-1 mt-1 text-xs px-2 py-0.5 rounded-full border ${statusColor}`}>
            {statusLabel}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="px-3 py-2 rounded-lg text-sm font-medium text-purple-300 hover:text-white hover:bg-purple-600/30 border border-purple-600/30 hover:border-purple-500/60 transition-all duration-200"
          >
            {isComplete ? '✏️ עריכה' : '📝 חיזוי'}
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-2 rounded-lg text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            aria-label="מחיקת שחקן"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {totalCountries > 0 && (
        <div className="mt-3">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: isComplete
                  ? 'linear-gradient(90deg, #10B981, #34D399)'
                  : 'linear-gradient(90deg, #7C3AED, #EC4899)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(predictedCount / totalCountries) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
