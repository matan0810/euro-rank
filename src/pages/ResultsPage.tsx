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
import { useAppStore, calculateScores } from '../store';
import { PlayerScore, Country } from '../types';
import SortableCountry from '../components/SortableCountry';
import Leaderboard from '../components/Leaderboard';
import ScoreBreakdownModal from '../components/ScoreBreakdownModal';

interface Props {
  store: ReturnType<typeof useAppStore>;
}

export default function ResultsPage({ store }: Props) {
  const { state, setResults, clearResults } = store;
  const { countries, players, results } = state;

  const [finalOrder, setFinalOrder] = useState<string[]>(
    results?.finalOrder.length === countries.length
      ? results.finalOrder
      : countries.map(c => c.id)
  );
  const [showScores, setShowScores] = useState(!!results);
  const [selectedScore, setSelectedScore] = useState<PlayerScore | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setFinalOrder(prev => {
      const oldIndex = prev.indexOf(active.id as string);
      const newIndex = prev.indexOf(over.id as string);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const handleCalculate = () => {
    setResults(finalOrder);
    setShowScores(true);
  };

  const handleReset = () => {
    clearResults();
    setShowScores(false);
    setFinalOrder(countries.map(c => c.id));
  };

  // Get country objects in current order
  const orderedCountries: Country[] = finalOrder
    .map(id => countries.find(c => c.id === id))
    .filter((c): c is Country => !!c);

  // Calculate scores if results are set
  const scores = results && showScores ? calculateScores(players, results, countries) : [];
  const completePlayers = players.filter(p => p.prediction.length === countries.length);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-black text-white mb-2">
          <span className="text-gradient-gold">Results</span> & Leaderboard
        </h1>
        <p className="text-purple-300/70 mb-8">
          Set the actual Eurovision ranking, then calculate everyone's score.
        </p>
      </motion.div>

      <div className={`grid gap-8 ${showScores ? 'lg:grid-cols-5' : 'lg:grid-cols-1 max-w-lg mx-auto'}`}>
        {/* Left: Results input */}
        <div className={showScores ? 'lg:col-span-2' : 'lg:col-span-1'}>
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Official Results</h2>
              <p className="text-purple-300/60 text-sm mt-1">
                Drag to set the final ranking
              </p>
            </div>

            {/* DnD list */}
            <div className="p-4">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={finalOrder} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col gap-1.5">
                    {orderedCountries.map((country, index) => (
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

            {/* Action buttons */}
            <div className="p-4 border-t border-white/10 flex flex-col gap-2">
              {completePlayers.length === 0 && !showScores && (
                <div className="text-xs text-yellow-400/80 bg-yellow-400/10 border border-yellow-400/20 rounded-lg px-3 py-2 text-center">
                  ⚠ No players with complete predictions yet
                </div>
              )}
              <button
                onClick={handleCalculate}
                className="btn-gold w-full"
              >
                🏆 Calculate Scores
              </button>
              {showScores && (
                <button
                  onClick={handleReset}
                  className="w-full px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm"
                >
                  Reset Results
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Leaderboard */}
        <AnimatePresence>
          {showScores && (
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
                      <h2 className="text-lg font-bold text-white">🏆 Leaderboard</h2>
                      <p className="text-purple-300/60 text-sm mt-1">Click a player for detailed breakdown</p>
                    </div>
                    {results?.calculatedAt && (
                      <div className="text-xs text-purple-300/40">
                        {new Date(results.calculatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <Leaderboard scores={scores} onPlayerClick={setSelectedScore} />
                </div>

                {scores.length === 0 && (
                  <div className="p-8 text-center text-purple-300/50">
                    <p>No complete predictions found.</p>
                    <p className="text-sm mt-2">
                      Go to the Players page and make sure everyone has submitted their {countries.length}-country prediction.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Score breakdown modal */}
      <ScoreBreakdownModal
        score={selectedScore}
        countries={countries}
        onClose={() => setSelectedScore(null)}
      />
    </div>
  );
}
