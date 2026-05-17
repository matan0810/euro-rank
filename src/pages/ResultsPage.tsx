import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, calculateScores } from '../store';
import { PlayerScore } from '../types';
import CountryPicker from '../components/CountryPicker';
import RankingDisplay from '../components/RankingDisplay';
import Leaderboard from '../components/Leaderboard';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal';

interface Props {
  store: ReturnType<typeof useAppStore>;
}

export default function ResultsPage({ store }: Props) {
  const { state, setResults, clearResults } = store;
  const { countries, players, results } = state;

  const initialOrder = results?.finalOrder.filter(id => countries.some(c => c.id === id)) || [];

  const [isEditing, setIsEditing] = useState(!results);
  const [draftOrder, setDraftOrder] = useState<string[]>(initialOrder);
  const [selectedScore, setSelectedScore] = useState<PlayerScore | null>(null);

  const handleStartEdit = () => {
    setDraftOrder(results?.finalOrder.filter(id => countries.some(c => c.id === id)) || []);
    setIsEditing(true);
  };

  const handleSave = () => {
    setResults(draftOrder);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftOrder(initialOrder);
    setIsEditing(false);
  };

  const handleReset = () => {
    if (!confirm('לאפס את התוצאות הרשמיות? לא ניתן לבטל פעולה זו.')) return;
    clearResults();
    setDraftOrder([]);
    setIsEditing(true);
  };

  const scores = results && !isEditing ? calculateScores(players, results, countries) : [];
  const completePlayers = players.filter(p => p.prediction.length === countries.length);
  const canSave = draftOrder.length === countries.length;
  const showLeaderboard = !!results && !isEditing;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-white mb-2">
          <span className="text-gradient-gold">תוצאות</span> וטבלת מובילים
        </h1>
        <p className="text-purple-300/70 mb-8">
          קבעו את הדירוג האמיתי של האירוויזיון, ואז חשבו את הניקוד של כולם.
        </p>
      </motion.div>

      <div className={`grid gap-8 ${showLeaderboard ? 'lg:grid-cols-5' : 'lg:grid-cols-1 max-w-lg mx-auto'}`}>
        {/* Left: Results input */}
        <div className={showLeaderboard ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">תוצאות רשמיות</h2>
                  {isEditing && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-yellow-400/90 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-2 py-0.5">
                      ✏ עריכה
                    </span>
                  )}
                </div>
                <p className="text-purple-300/60 text-sm mt-1">
                  {isEditing
                    ? `הקלידו שם מדינה (עברית/אנגלית) או גררו לסידור • ${draftOrder.length}/${countries.length}`
                    : results
                    ? 'לחצו "ערוך" כדי לשנות את הדירוג.'
                    : 'אין דירוג עדיין — היכנסו למצב עריכה כדי להזין.'}
                </p>
              </div>
              {!isEditing && results && (
                <button
                  onClick={handleStartEdit}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium text-purple-300 hover:text-white hover:bg-purple-600/30 border border-purple-600/30 hover:border-purple-500/60 transition-all duration-200"
                >
                  ✏ ערוך
                </button>
              )}
            </div>

            {/* Body */}
            <div className="p-4">
              {isEditing ? (
                <CountryPicker
                  countries={countries}
                  selected={draftOrder}
                  onChange={setDraftOrder}
                  emptyHint="הוסיפו את המדינות לפי סדר התוצאות הרשמיות"
                />
              ) : results ? (
                <RankingDisplay countries={countries} order={results.finalOrder} />
              ) : (
                <div className="text-center py-8 text-purple-300/50 text-sm">
                  לא הוגדר עדיין דירוג רשמי
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="p-4 border-t border-white/10 flex flex-col gap-2">
              {completePlayers.length === 0 && (
                <div className="text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2 text-center">
                  ⚠ אין עדיין שחקנים עם חיזויים מלאים
                </div>
              )}

              {isEditing ? (
                <>
                  {!canSave && (
                    <div className="text-xs text-purple-300/70 bg-purple-900/20 border border-purple-700/20 rounded-lg px-3 py-2 text-center">
                      צריך להזין את כל {countries.length} המדינות לפני שמירה
                    </div>
                  )}
                  <div className="flex gap-2">
                    {results && (
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm"
                      >
                        ביטול
                      </button>
                    )}
                    <button
                      onClick={handleSave}
                      disabled={!canSave}
                      className="btn-gold flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      💾 שמירה
                    </button>
                  </div>
                  {results && (
                    <button
                      onClick={handleReset}
                      className="w-full px-4 py-2 rounded-xl border border-red-500/30 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-xs"
                    >
                      איפוס תוצאות
                    </button>
                  )}
                </>
              ) : !results ? (
                <button onClick={handleStartEdit} className="btn-gold w-full">
                  🏆 התחל להזין תוצאות
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Right: Leaderboard */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <div className="glass rounded-2xl border border-white/10 overflow-hidden">
                <div className="p-5 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-white">🏆 טבלת מובילים</h2>
                      <p className="text-purple-300/60 text-sm mt-1">לחצו על שחקן לפירוט מלא</p>
                    </div>
                    {results?.calculatedAt && (
                      <div className="text-xs text-purple-300/40">
                        {new Date(results.calculatedAt).toLocaleDateString('he-IL')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <Leaderboard scores={scores} onPlayerClick={setSelectedScore} />
                </div>

                {scores.length === 0 && (
                  <div className="p-8 text-center text-purple-300/50">
                    <p>לא נמצאו חיזויים מלאים.</p>
                    <p className="text-sm mt-2">
                      עברו לדף השחקנים וודאו שכולם הזינו חיזוי לכל {countries.length} המדינות.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ScoreBreakdownModal
        score={selectedScore}
        countries={countries}
        onClose={() => setSelectedScore(null)}
      />
    </div>
  );
}
