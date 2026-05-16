import { Country } from '../types';
import Flag from './Flag';

interface Props {
  countries: Country[];
  order: string[];
}

export default function RankingDisplay({ countries, order }: Props) {
  const map = new Map(countries.map(c => [c.id, c]));
  const items = order
    .map(id => map.get(id))
    .filter((c): c is Country => !!c);

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-purple-300/50 text-sm">
        אין דירוג עדיין
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((country, index) => {
        const position = index + 1;
        const positionColor =
          position === 1
            ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
            : position === 2
            ? 'text-gray-300 bg-gray-300/10 border-gray-300/30'
            : position === 3
            ? 'text-amber-600 bg-amber-600/10 border-amber-600/30'
            : 'text-purple-300 bg-purple-900/20 border-purple-800/30';
        const medal = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : null;

        return (
          <div
            key={country.id}
            className="flex items-center gap-3 p-2.5 rounded-xl border border-white/10 glass"
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg border text-xs font-bold flex items-center justify-center ${positionColor}`}
            >
              {medal || position}
            </div>
            <Flag country={country} size="lg" />
            <span className="flex-1 font-medium text-white/90 text-sm">{country.name}</span>
            {country.nameEn && (
              <span className="text-xs text-purple-300/40 hidden sm:inline" dir="ltr">
                {country.nameEn}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
