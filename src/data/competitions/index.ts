import { Competition } from '../../types';
import competition2026 from './2026.json';

const registry: Competition[] = [
  competition2026 as Competition,
];

export const competitions: Record<number, Competition> = Object.fromEntries(
  registry.map(c => [c.year, c])
);

export const years: number[] = registry
  .map(c => c.year)
  .sort((a, b) => b - a);

export const latestYear: number = years[0];

export function getCompetition(year: number): Competition | undefined {
  return competitions[year];
}
