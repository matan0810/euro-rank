import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store';
import PlayerCard from '../components/PlayerCard';
import CountryPicker from '../components/CountryPicker';
import Flag from '../components/Flag';

interface Props {
  store: ReturnType<typeof useAppStore>;
}

export default function PlayersPage({ store }: Props) {
  const { state, addPlayer, removePlayer, updatePrediction, addCountry, removeCountry } = store;
  const { players, countries } = state;

  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editingPrediction, setEditingPrediction] = useState<string[]>([]);
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryNameEn, setNewCountryNameEn] = useState('');
  const [newCountryFlag, setNewCountryFlag] = useState('🏳');
  const [showAddCountry, setShowAddCountry] = useState(false);

  const handleAddPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    addPlayer(name);
    setNewPlayerName('');
  };

  const handleEditPlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;
    // Keep only valid country IDs, drop the rest
    const valid = player.prediction.filter(id => countries.some(c => c.id === id));
    setEditingPlayerId(playerId);
    setEditingPrediction(valid);
  };

  const handleSavePrediction = () => {
    if (!editingPlayerId) return;
    updatePrediction(editingPlayerId, editingPrediction);
    setEditingPlayerId(null);
    setEditingPrediction([]);
  };

  const handleAddCountry = () => {
    const name = newCountryName.trim();
    if (!name) return;
    addCountry(name, newCountryFlag, newCountryNameEn.trim() || undefined);
    setNewCountryName('');
    setNewCountryNameEn('');
    setNewCountryFlag('🏳');
    setShowAddCountry(false);
  };

  const editingPlayer = players.find(p => p.id === editingPlayerId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-white mb-2">
          <span className="text-gradient-purple">שחקנים</span> וחיזויים
        </h1>
        <p className="text-purple-300/70 mb-8">הוסיפו שחקנים והזינו את חיזויי הדירוג שלהם לאירוויזיון.</p>
      </motion.div>

      {/* Prediction editor modal */}
      <AnimatePresence>
        {editingPlayerId && editingPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg max-h-[90vh] flex flex-col glass-purple rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/50"
            >
              {/* Header */}
              <div className="p-6 border-b border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      החיזוי של {editingPlayer.name}
                    </h2>
                    <p className="text-purple-300/70 text-sm mt-1">
                      הקלידו שם מדינה (עברית/אנגלית) ולחצו Enter — סדר ההוספה הוא הדירוג
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingPlayerId(null)}
                    className="text-purple-400 hover:text-white transition-colors text-xl"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-3 text-xs text-purple-300/60">
                  {editingPrediction.length} / {countries.length} מדינות
                </div>
              </div>

              {/* Picker */}
              <div className="flex-1 overflow-y-auto p-4">
                <CountryPicker
                  countries={countries}
                  selected={editingPrediction}
                  onChange={setEditingPrediction}
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-purple-500/20 flex gap-3">
                <button
                  onClick={() => setEditingPlayerId(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSavePrediction}
                  className="flex-1 btn-primary"
                >
                  שמירת חיזוי ✓
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Left: Players list */}
        <div className="md:col-span-3">
          {/* Add player form */}
          <div className="glass rounded-2xl p-4 mb-6 border border-white/10">
            <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-3">
              הוספת שחקן חדש
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                placeholder="שם השחקן..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
              <button
                onClick={handleAddPlayer}
                disabled={!newPlayerName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-4 py-2.5"
              >
                הוספה
              </button>
            </div>
          </div>

          {/* Players */}
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {players.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-purple-300/50"
                >
                  <div className="text-4xl mb-3">👥</div>
                  <p>אין שחקנים עדיין. הוסיפו מישהו למעלה!</p>
                </motion.div>
              ) : (
                players.map(player => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    countries={countries}
                    onEdit={() => handleEditPlayer(player.id)}
                    onDelete={() => removePlayer(player.id)}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Countries list */}
        <div className="md:col-span-2">
          <div className="glass rounded-2xl p-4 border border-white/10 sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wider">
                מדינות ({countries.length})
              </h3>
              <button
                onClick={() => setShowAddCountry(!showAddCountry)}
                className="text-xs text-purple-400 hover:text-purple-200 transition-colors"
              >
                {showAddCountry ? '✕ ביטול' : '+ הוספה'}
              </button>
            </div>

            <AnimatePresence>
              {showAddCountry && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 overflow-hidden"
                >
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newCountryFlag}
                      onChange={e => setNewCountryFlag(e.target.value)}
                      placeholder="🏳"
                      className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center text-white focus:outline-none focus:border-purple-500/60"
                    />
                    <input
                      type="text"
                      value={newCountryName}
                      onChange={e => setNewCountryName(e.target.value)}
                      placeholder="שם בעברית..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/60"
                    />
                  </div>
                  <input
                    type="text"
                    value={newCountryNameEn}
                    onChange={e => setNewCountryNameEn(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCountry()}
                    placeholder="Name in English (אופציונלי)"
                    dir="ltr"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/60 mb-2"
                  />
                  <button
                    onClick={handleAddCountry}
                    disabled={!newCountryName.trim()}
                    className="w-full btn-primary text-sm py-1.5 disabled:opacity-50"
                  >
                    הוספת מדינה
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1 max-h-96 overflow-y-auto">
              {countries.map(country => (
                <div
                  key={country.id}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 group transition-colors"
                >
                  <Flag country={country} size="md" />
                  <span className="flex-1 text-sm text-white/80">{country.name}</span>
                  {country.nameEn && (
                    <span className="text-[10px] text-purple-300/40" dir="ltr">
                      {country.nameEn}
                    </span>
                  )}
                  <button
                    onClick={() => removeCountry(country.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 text-xs transition-all"
                    title="הסרת מדינה"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
