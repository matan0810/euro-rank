import { motion, AnimatePresence } from 'framer-motion';
import { PlayerScore, Country } from '../types';
import Flag from './Flag';

interface Props {
  score: PlayerScore | null;
  countries: Country[];
  onClose: () => void;
}

function rowColor(diff: number): string {
  if (diff === 0) return 'bg-green-500/10 border-green-500/20';
  if (diff <= 2) return 'bg-yellow-500/10 border-yellow-500/20';
  if (diff <= 5) return 'bg-orange-500/10 border-orange-500/20';
  return 'bg-red-500/10 border-red-500/20';
}

function pointsColor(points: number): string {
  if (points >= 10) return 'text-green-400';
  if (points >= 7) return 'text-yellow-400';
  if (points >= 4) return 'text-orange-400';
  return 'text-red-400';
}

function rowIcon(diff: number): string {
  if (diff === 0) return '✓';
  if (diff <= 2) return '~';
  if (diff <= 5) return '△';
  return '✗';
}

export default function ScoreBreakdownModal({ score, countries, onClose }: Props) {
  const countryMap = new Map(countries.map(c => [c.id, c]));

  return (
    <AnimatePresence>
      {score && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col glass rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/60"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #7C3AED, #EC4899)' }}
                  >
                    {score.playerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{score.playerName}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-gradient-gold text-xl font-black">
                        {score.totalScore} pts
                      </span>
                      <span className="text-purple-300/60 text-sm">
                        {score.percentage}% דיוק
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-purple-400 hover:text-white transition-colors text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                {[
                  {
                    label: 'התאמות מדויקות',
                    value: score.breakdown.filter(b => b.basePoints === 10).length,
                    color: 'text-green-400',
                  },
                  {
                    label: 'נקודות בונוס',
                    value: score.breakdown.reduce((sum, b) => sum + b.bonusPoints, 0),
                    color: 'text-yellow-400',
                  },
                  {
                    label: 'נקודות בסיס',
                    value: score.breakdown.reduce((sum, b) => sum + b.basePoints, 0),
                    color: 'text-purple-300',
                  },
                ].map(stat => (
                  <div key={stat.label} className="glass rounded-xl p-3 text-center">
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="px-6 py-3 border-b border-white/5 flex items-center gap-4 text-xs text-white/40">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-green-500/40 inline-block" />
                מדויק
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-yellow-500/40 inline-block" />
                קרוב (≤2)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-orange-500/40 inline-block" />
                סוטה (3-5)
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-red-500/40 inline-block" />
                רחוק (&gt;5)
              </div>
            </div>

            {/* Table header */}
            <div className="px-6 py-2 grid grid-cols-12 gap-2 text-xs font-semibold text-purple-300/60 uppercase tracking-wider border-b border-white/5">
              <div className="col-span-1">#</div>
              <div className="col-span-5">מדינה</div>
              <div className="col-span-2 text-center">בפועל</div>
              <div className="col-span-2 text-center">נחזה</div>
              <div className="col-span-2 text-right">נקודות</div>
            </div>

            {/* Breakdown rows */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <div className="flex flex-col gap-1">
                {score.breakdown.map((item, index) => {
                  const diff = Math.abs(item.predictedPosition - item.actualPosition);
                  const country = countryMap.get(item.countryId);

                  return (
                    <motion.div
                      key={item.countryId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`grid grid-cols-12 gap-2 items-center px-3 py-2 rounded-lg border text-sm ${rowColor(diff)}`}
                    >
                      <div className="col-span-1 text-white/40 font-mono text-xs">
                        {index + 1}
                      </div>
                      <div className="col-span-5 flex items-center gap-2">
                        <Flag country={country} size="sm" />
                        <span className="text-white/90 font-medium truncate text-xs">
                          {item.countryName}
                        </span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span className="font-bold text-white/80">{item.actualPosition}</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <span
                          className={`font-bold ${
                            diff === 0 ? 'text-green-400' : diff <= 2 ? 'text-yellow-400' : diff <= 5 ? 'text-orange-400' : 'text-red-400'
                          }`}
                        >
                          {item.predictedPosition}
                        </span>
                      </div>
                      <div className="col-span-2 text-right flex items-center justify-end gap-1">
                        <span className={`font-black text-sm ${pointsColor(item.totalPoints)}`}>
                          {item.totalPoints}
                        </span>
                        <span className="text-white/30 text-xs">{rowIcon(diff)}</span>
                        {item.bonusPoints > 0 && (
                          <span className="text-yellow-400 text-xs ml-0.5">+{item.bonusPoints}★</span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 flex justify-end">
              <button
                onClick={onClose}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                סגירה
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
