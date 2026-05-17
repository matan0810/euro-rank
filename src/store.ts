import { useState, useEffect, useCallback } from 'react';
import { AppState, Country, Player, Results, PlayerScore, CountryScore } from './types';
import { competitions, latestYear, years } from './data/competitions';

const STORAGE_PREFIX = 'eurorank_state_he_';
const LEGACY_KEYS = ['eurorank_state_he', 'eurorank_state_he_v2', 'eurorank_state_he_v3'];

function storageKey(year: number) {
  return `${STORAGE_PREFIX}${year}`;
}

function baselineFor(year: number): AppState {
  const c = competitions[year];
  if (!c) {
    return { year, countries: [], players: [], results: null };
  }
  return {
    year,
    countries: c.countries,
    players: c.players,
    results: c.results,
  };
}

function loadState(year: number): AppState {
  try {
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k));
    const raw = localStorage.getItem(storageKey(year));
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      const baseline = baselineFor(year);
      return {
        year,
        countries: parsed.countries ?? baseline.countries,
        players: parsed.players ?? baseline.players,
        results: parsed.results === undefined ? baseline.results : parsed.results,
      };
    }
  } catch {
    // ignore
  }
  return baselineFor(year);
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(storageKey(state.year), JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function useAppStore() {
  const [state, setState] = useState<AppState>(() => loadState(latestYear));

  useEffect(() => {
    saveState(state);
  }, [state]);

  const updateState = useCallback((updater: (prev: AppState) => AppState) => {
    setState(updater);
  }, []);

  // Year management
  const setYear = useCallback((year: number) => {
    setState(loadState(year));
  }, []);

  const resetYear = useCallback(() => {
    setState(prev => {
      try {
        localStorage.removeItem(storageKey(prev.year));
      } catch {
        // ignore
      }
      return baselineFor(prev.year);
    });
  }, []);

  // Country management
  const addCountry = useCallback((name: string, flag: string, nameEn?: string) => {
    const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    updateState(prev => ({
      ...prev,
      countries: [...prev.countries, { id, name, nameEn: nameEn?.trim() || undefined, flag }],
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
    availableYears: years,
    setYear,
    resetYear,
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
