export interface Country {
  id: string;
  name: string;
  flag: string;
}

export interface Player {
  id: string;
  name: string;
  prediction: string[]; // array of country IDs in predicted order (index 0 = 1st place)
}

export interface Results {
  finalOrder: string[]; // array of country IDs in actual order (index 0 = 1st place)
  calculatedAt?: string;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  breakdown: CountryScore[];
}

export interface CountryScore {
  countryId: string;
  countryName: string;
  predictedPosition: number; // 1-indexed
  actualPosition: number; // 1-indexed
  basePoints: number;
  bonusPoints: number;
  totalPoints: number;
}

export type AppState = {
  countries: Country[];
  players: Player[];
  results: Results | null;
};
