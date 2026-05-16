import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Country } from '../types';

interface Props {
  country: Country;
  position: number;
  isDragging?: boolean;
}

export default function SortableCountry({ country, position, isDragging }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: country.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
    zIndex: isSortableDragging ? 50 : undefined,
  };

  const positionColor =
    position === 1 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
    position === 2 ? 'text-gray-300 bg-gray-300/10 border-gray-300/30' :
    position === 3 ? 'text-amber-600 bg-amber-600/10 border-amber-600/30' :
    'text-purple-300 bg-purple-900/20 border-purple-800/30';

  const medalIcon = position === 1 ? '🥇' : position === 2 ? '🥈' : position === 3 ? '🥉' : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-150 ${
        isDragging
          ? 'glass-purple shadow-lg shadow-purple-500/30'
          : 'glass border-white/10 hover:border-purple-500/40 hover:bg-purple-900/20'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-purple-400/60 hover:text-purple-300 cursor-grab active:cursor-grabbing p-1 rounded touch-none"
        aria-label="Drag to reorder"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" />
          <circle cx="11" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="11" cy="12" r="1.5" />
        </svg>
      </button>

      {/* Position badge */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg border text-xs font-bold flex items-center justify-center ${positionColor}`}>
        {medalIcon || position}
      </div>

      {/* Flag */}
      <span className="text-2xl flex-shrink-0">{country.flag}</span>

      {/* Country name */}
      <span className="flex-1 font-medium text-white/90 text-sm">{country.name}</span>
    </div>
  );
}
