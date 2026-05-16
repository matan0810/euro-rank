import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useAppStore } from '../store';
import { Country } from '../types';
import PlayerCard from '../components/PlayerCard';
import SortableCountry from '../components/SortableCountry';

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
  const [newCountryFlag, setNewCountryFlag] = useState('🏳');
  const [showAddCountry, setShowAddCountry] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddPlayer = () => {
    const name = newPlayerName.trim();
    if (!name) return;
    addPlayer(name);
    setNewPlayerName('');
  };

  const handleEditPlayer = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // Initialize prediction: use existing or default to all countries in order
    const initialPrediction = player.prediction.length === countries.length
      ? player.prediction
      : countries.map(c => c.id);

    setEditingPlayerId(playerId);
    setEditingPrediction(initialPrediction);
  };

  const handleSavePrediction = () => {
    if (!editingPlayerId) return;
    updatePrediction(editingPlayerId, editingPrediction);
    setEditingPlayerId(null);
    setEditingPrediction([]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setEditingPrediction(prev => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleAddCountry = () => {
    const name = newCountryName.trim();
    if (!name) return;
    addCountry(name, newCountryFlag);
    setNewCountryName('');
    setNewCountryFlag('🏳');
    setShowAddCountry(false);
  };

  // Get country objects in prediction order
  const predictionCountries: Country[] = editingPrediction
    .map(id => countries.find(c => c.id === id))
    .filter((c): c is Country => !!c);

  const editingPlayer = players.find(p => p.id === editingPlayerId);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-white mb-2">
          <span className="text-gradient-purple">Players</span> & Predictions
        </h1>
        <p className="text-purple-300/70 mb-8">Add players and enter their Eurovision ranking predictions.</p>
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
                      {editingPlayer.name}'s Prediction
                    </h2>
                    <p className="text-purple-300/70 text-sm mt-1">Drag to reorder — 1st place at top</p>
                  </div>
                  <button
                    onClick={() => setEditingPlayerId(null)}
                    className="text-purple-400 hover:text-white transition-colors text-xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Sortable list */}
              <div className="flex-1 overflow-y-auto p-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={editingPrediction}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2">
                      {predictionCountries.map((country, index) => (
                        <SortableCountry
                          key={country.id}
                          country={country}
                          position={index + 1}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-purple-500/20 flex gap-3">
                <button
                  onClick={() => setEditingPlayerId(null)}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrediction}
                  className="flex-1 btn-primary"
                >
                  Save Prediction ✓
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
              Add New Player
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                placeholder="Player name..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/60 transition-colors"
              />
              <button
                onClick={handleAddPlayer}
                disabled={!newPlayerName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-4 py-2.5"
              >
                Add
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
                  <p>No players yet. Add someone above!</p>
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
                Countries ({countries.length})
              </h3>
              <button
                onClick={() => setShowAddCountry(!showAddCountry)}
                className="text-xs text-purple-400 hover:text-purple-200 transition-colors"
              >
                {showAddCountry ? '✕ Cancel' : '+ Add'}
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
                      onKeyDown={e => e.key === 'Enter' && handleAddCountry()}
                      placeholder="Country name..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-purple-500/60"
                    />
                  </div>
                  <button
                    onClick={handleAddCountry}
                    disabled={!newCountryName.trim()}
                    className="w-full btn-primary text-sm py-1.5 disabled:opacity-50"
                  >
                    Add Country
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
                  <span className="text-lg">{country.flag}</span>
                  <span className="flex-1 text-sm text-white/80">{country.name}</span>
                  <button
                    onClick={() => removeCountry(country.id)}
                    className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 text-xs transition-all"
                    title="Remove country"
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
