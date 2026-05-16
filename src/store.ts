import { useState, useEffect, useCallback } from 'react';
import { AppState, Country, Player, Results, PlayerScore, CountryScore } from './types';

const DEFAULT_COUNTRIES: Country[] = [
  { id: 'albania', name: 'Albania', flag: '🇦🇱' },
  { id: 'armenia', name: 'Armenia', flag: '🇦🇲' },
  { id: 'australia', name: 'Australia', flag: '🇦🇺' },
  { id: 'austria', name: 'Austria', flag: '🇦🇹' },
  { id: 'azerbaijan', name: 'Azerbaijan', flag: '🇦🇿' },
  { id: 'croatia', name: 'Croatia', flag: '🇭🇷' },
  { id: 'cyprus', name: 'Cyprus', flag: '🇨🇾' },
  { id: 'estonia', name: 'Estonia', flag: '🇪🇪' },
  { id: 'finland', name: 'Finland', flag: '🇫🇮' },
  { id: 'france', name: 'France', flag: '🇫🇷' },
  { id: 'georgia', name: 'Georgia', flag: '🇬🇪' },
  { id: 'germany', name: 'Germany', flag: '🇩🇪' },
  { id: 'greece', name: 'Greece', flag: '🇬🇷' },
  { id: 'iceland', name: 'Iceland', flag: '🇮🇸' },
  { id: 'ireland', name: 'Ireland', flag: '🇮🇪' },
  { id: 'israel', name: 'Israel', flag: '🇮🇱' },
  { id: 'italy', name: 'Italy', flag: '🇮🇹' },
  { id: 'latvia', name: 'Latvia', flag: '🇱🇻' },
  { id: 'lithuania', name: 'Lithuania', flag: '🇱🇹' },
  { id: 'luxembourg', name: 'Luxembourg', flag: '🇱🇺' },
  { id: 'malta', name: 'Malta', flag: '🇲🇹' },
  { id: 'norway', name: 'Norway', flag: '🇳🇴' },
  { id: 'spain', name: 'Spain', flag: '🇪🇸' },
  { id: 'sweden', name: 'Sweden', flag: '🇸🇪' },
  { id: 'switzerland', name: 'Switzerland', flag: '🇨🇭' },
];

const STORAGE_KEY = 'eurorank_state';

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      return {
        countries: parsed.countries || DEFAULT_COUNTRIES,
        players: parsed.players || [],
        results: parsed.results || null,
      };
    }
  } catch {
    // ignore
  }
  return {
    countries: DEFAULT_COUNTRIES,
    players: [],
    results: null,
  };
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(updater);
  }, []);

  // Country management
  const addCountry = useCallback((name: string, flag: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    updateState(prev => ({
      ...prev,
      countries: [...prev.countries, { id, name, flag }],
    }));
  }, [updateState]);

  const removeCountry = useCallback((id: string) => {
    updateState(prev => ({
      ...prev,
      countries: prev.countries.filter(c => c.id !== id),
      players: prev.players.map(p => ({
        ...p,
        prediction: p.prediction.filter(cId => cId !== id),
      })),
      results: prev.results
        ? { ...prev.results, finalOrder: prev.results.finalOrder.filter(cId => cId !== id) }
        : null,
    }));
  }, [updateState]);

  const setCountries = useCallback((countries: Country[]) => {
    updateState(prev => ({ ...prev, countries }));
  }, [updateState]);

  // Player management
  const addPlayer = useCallback((name: string) => {
    const id = 'player-' + Date.now();
    updateState(prev => ({
      ...prev,
      players: [...prev.players, { id, name, prediction: [] }],
    }));
  }, [updateState]);

  const removePlayer = useCallback((id: string) => {
    updateState(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== id),
    }));
  }, [updateState]);

  const updatePrediction = useCallback((playerId: string, prediction: string[]) => {
    updateState(prev => ({
      ...prev,
      players: prev.players.map(p =>
        p.id === playerId ? { ...p, prediction } : p
      ),
    }));
  }, [updateState]);

  // Results management
  const setResults = useCallback((finalOrder: string[]) => {
    updateState(prev => ({
      ...prev,
      results: { finalOrder, calculatedAt: new Date().toISOString() },
    }));
  }, [updateState]);

  const clearResults = useCallback(() => {
    updateState(prev => ({ ...prev, results: null }));
  }, [updateState]);

  return {
    state,
    addCountry,
    removeCountry,
    setCountries,
    addPlayer,
    removePlayer,
    updatePrediction,
    setResults,
    clearResults,
  };
}

export function calculateScores(players: Player[], results: Results, countries: Country[]): PlayerScore[] {
  const countryMap = new Map(countries.map(c => [c.id, c.name]));
  const actualOrder = results.finalOrder;

  return players
    .filter(p => p.prediction.length > 0)
    .map(player => {
      const breakdown: CountryScore[] = [];
      let totalScore = 0;

      actualOrder.forEach((countryId, actualIdx) => {
        const actualPosition = actualIdx + 1;
        const predictedIdx = player.prediction.indexOf(countryId);
        const predictedPosition = predictedIdx >= 0 ? predictedIdx + 1 : player.prediction.length + 1;

        const diff = Math.abs(predictedPosition - actualPosition);
        const basePoints = Math.max(0, 10 - diff);

        let bonusPoints = 0;
        if (actualPosition === 1 && predictedPosition === 1) bonusPoints = 15;
        else if (actualPosition === 2 && predictedPosition === 2) bonusPoints = 10;
        else if (actualPosition === 3 && predictedPosition === 3) bonusPoints = 5;

        const totalPoints = basePoints + bonusPoints;
        totalScore += totalPoints;

        breakdown.push({
          countryId,
          countryName: countryMap.get(countryId) || countryId,
          predictedPosition,
          actualPosition,
          basePoints,
          bonusPoints,
          totalPoints,
        });
      });

      const maxScore = actualOrder.length * 10 + 30; // 250 + 30 bonus max
      const percentage = Math.round((totalScore / maxScore) * 100);

      return {
        playerId: player.id,
        playerName: player.name,
        totalScore,
        maxScore,
        percentage,
        breakdown,
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);
}
