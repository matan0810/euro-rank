import { useState, useEffect, useCallback } from 'react';
import { AppState, Country, Player, Results, PlayerScore, CountryScore } from './types';

// 25 finalists of Eurovision 2026 (Grand Final, Vienna, 16 May 2026)
const DEFAULT_COUNTRIES: Country[] = [
  { id: 'albania', name: 'אלבניה', nameEn: 'Albania', flag: '🇦🇱', code: 'al' },
  { id: 'australia', name: 'אוסטרליה', nameEn: 'Australia', flag: '🇦🇺', code: 'au' },
  { id: 'austria', name: 'אוסטריה', nameEn: 'Austria', flag: '🇦🇹', code: 'at' },
  { id: 'belgium', name: 'בלגיה', nameEn: 'Belgium', flag: '🇧🇪', code: 'be' },
  { id: 'bulgaria', name: 'בולגריה', nameEn: 'Bulgaria', flag: '🇧🇬', code: 'bg' },
  { id: 'croatia', name: 'קרואטיה', nameEn: 'Croatia', flag: '🇭🇷', code: 'hr' },
  { id: 'cyprus', name: 'קפריסין', nameEn: 'Cyprus', flag: '🇨🇾', code: 'cy' },
  { id: 'czechia', name: 'צ׳כיה', nameEn: 'Czechia', flag: '🇨🇿', code: 'cz' },
  { id: 'denmark', name: 'דנמרק', nameEn: 'Denmark', flag: '🇩🇰', code: 'dk' },
  { id: 'finland', name: 'פינלנד', nameEn: 'Finland', flag: '🇫🇮', code: 'fi' },
  { id: 'france', name: 'צרפת', nameEn: 'France', flag: '🇫🇷', code: 'fr' },
  { id: 'germany', name: 'גרמניה', nameEn: 'Germany', flag: '🇩🇪', code: 'de' },
  { id: 'greece', name: 'יוון', nameEn: 'Greece', flag: '🇬🇷', code: 'gr' },
  { id: 'israel', name: 'ישראל', nameEn: 'Israel', flag: '🇮🇱', code: 'il' },
  { id: 'italy', name: 'איטליה', nameEn: 'Italy', flag: '🇮🇹', code: 'it' },
  { id: 'lithuania', name: 'ליטא', nameEn: 'Lithuania', flag: '🇱🇹', code: 'lt' },
  { id: 'malta', name: 'מלטה', nameEn: 'Malta', flag: '🇲🇹', code: 'mt' },
  { id: 'moldova', name: 'מולדובה', nameEn: 'Moldova', flag: '🇲🇩', code: 'md' },
  { id: 'norway', name: 'נורווגיה', nameEn: 'Norway', flag: '🇳🇴', code: 'no' },
  { id: 'poland', name: 'פולין', nameEn: 'Poland', flag: '🇵🇱', code: 'pl' },
  { id: 'romania', name: 'רומניה', nameEn: 'Romania', flag: '🇷🇴', code: 'ro' },
  { id: 'serbia', name: 'סרביה', nameEn: 'Serbia', flag: '🇷🇸', code: 'rs' },
  { id: 'sweden', name: 'שוודיה', nameEn: 'Sweden', flag: '🇸🇪', code: 'se' },
  { id: 'ukraine', name: 'אוקראינה', nameEn: 'Ukraine', flag: '🇺🇦', code: 'ua' },
  { id: 'united-kingdom', name: 'בריטניה', nameEn: 'United Kingdom', flag: '🇬🇧', code: 'gb' },
];

// Official Eurovision 2026 Grand Final ranking (1st → 25th)
const OFFICIAL_2026_RESULTS: Results = {
  finalOrder: [
    'bulgaria',       // 1 — Dara "Bangaranga" — 516
    'israel',         // 2 — Noam Bettan "Michelle" — 343
    'romania',        // 3 — Alexandra Căpitănescu "Choke Me" — 296
    'australia',      // 4 — Delta Goodrem "Eclipse" — 287
    'italy',          // 5 — Sal Da Vinci "Per sempre sì" — 281
    'finland',        // 6 — Linda Lampenius & Pete Parkkonen "Liekinheitin" — 279
    'denmark',        // 7 — Søren Torpegaard Lund "Før vi går hjem" — 243
    'moldova',        // 8 — Satoshi "Viva, Moldova" — 226
    'ukraine',        // 9 — Leléka "Ridnym" — 221
    'greece',         // 10 — Akylas "Ferto" — 220
    'france',         // 11 — Monroe "Regarde !" — 158
    'poland',         // 12 — Alicja "Pray" — 150
    'albania',        // 13 — Alis "Nân" — 145
    'norway',         // 14 — Jonas Lovv "Ya ya ya" — 134
    'croatia',        // 15 — Lelek "Andromeda" — 124
    'czechia',        // 16 — Daniel Žižka "Crossroads" — 113
    'serbia',         // 17 — Lavina "Kraj mene" — 90
    'malta',          // 18 — Aidan "Bella" — 89
    'cyprus',         // 19 — Antigoni "Jalla" — 75
    'sweden',         // 20 — Felicia "My System" — 51
    'belgium',        // 21 — Essyla "Dancing on the Ice" — 36
    'lithuania',      // 22 — Lion Ceccah "Sólo quiero más" — 22
    'germany',        // 23 — Sarah Engels "Fire" — 12
    'austria',        // 24 — Cosmó "Tanzschein" — 6
    'united-kingdom', // 25 — Look Mum No Computer "Eins, Zwei, Drei" — 1
  ],
  calculatedAt: '2026-05-16T22:00:00.000Z',
};

const STORAGE_KEY = 'eurorank_state_he_v3';
const LEGACY_KEYS = ['eurorank_state_he', 'eurorank_state_he_v2'];

function loadState(): AppState {
  try {
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k));
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      const cached = parsed.countries;
      // Sanity: if cached country list is missing 'bulgaria' (the 2026 winner) or
      // lacks ISO codes, treat as obsolete and refresh from defaults.
      const isStale =
        !cached ||
        !cached.some(c => c.id === 'bulgaria') ||
        !cached.every(c => !!c.code);
      if (isStale) {
        return {
          countries: DEFAULT_COUNTRIES,
          players: (parsed.players || []).map(p => ({ ...p, prediction: [] })),
          results: OFFICIAL_2026_RESULTS,
        };
      }
      return {
        countries: cached,
        players: parsed.players || [],
        results: parsed.results === undefined ? OFFICIAL_2026_RESULTS : parsed.results,
      };
    }
  } catch {
    // ignore
  }
  return {
    countries: DEFAULT_COUNTRIES,
    players: [],
    results: OFFICIAL_2026_RESULTS,
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
