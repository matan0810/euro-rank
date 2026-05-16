import { useMemo, useRef, useState } from 'react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Country } from '../types';
import Flag from './Flag';

interface Props {
  countries: Country[];
  selected: string[];
  onChange: (next: string[]) => void;
  emptyHint?: string;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[׳'`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function matches(country: Country, query: string): boolean {
  if (!query) return true;
  const q = normalize(query);
  const he = normalize(country.name);
  const en = normalize(country.nameEn || '');
  return he.includes(q) || (en !== '' && en.includes(q));
}

interface SortableRowProps {
  country: Country;
  position: number;
  onRemove: () => void;
}

function SortableRow({ country, position, onRemove }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: country.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

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
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-2.5 rounded-xl border group transition-colors ${
        isDragging
          ? 'glass-purple border-purple-500/60 shadow-lg shadow-purple-500/30'
          : 'glass border-white/10 hover:border-purple-500/40'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        type="button"
        className="flex-shrink-0 text-purple-400/60 hover:text-purple-300 cursor-grab active:cursor-grabbing p-1 rounded touch-none"
        aria-label="גררו לשינוי סדר"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="5" cy="4" r="1.5" />
          <circle cx="11" cy="4" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="11" cy="8" r="1.5" />
          <circle cx="5" cy="12" r="1.5" />
          <circle cx="11" cy="12" r="1.5" />
        </svg>
      </button>

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
      <button
        onClick={onRemove}
        type="button"
        aria-label="הסרה"
        className="flex-shrink-0 opacity-60 group-hover:opacity-100 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-md px-2 py-1 text-xs transition-all"
      >
        ✕
      </button>
    </div>
  );
}

export default function CountryPicker({ countries, selected, onChange, emptyHint }: Props) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const countryMap = useMemo(
    () => new Map(countries.map(c => [c.id, c])),
    [countries]
  );

  const remaining = useMemo(
    () => countries.filter(c => !selected.includes(c.id)),
    [countries, selected]
  );

  const filtered = useMemo(() => {
    const list = remaining.filter(c => matches(c, query));
    if (query.trim()) {
      const q = normalize(query);
      list.sort((a, b) => {
        const aStarts =
          normalize(a.name).startsWith(q) ||
          normalize(a.nameEn || '').startsWith(q);
        const bStarts =
          normalize(b.name).startsWith(q) ||
          normalize(b.nameEn || '').startsWith(q);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return 0;
      });
    }
    return list;
  }, [remaining, query]);

  const selectedCountries = selected
    .map(id => countryMap.get(id))
    .filter((c): c is Country => !!c);

  const pick = (countryId: string) => {
    if (selected.includes(countryId)) return;
    onChange([...selected, countryId]);
    setQuery('');
    setActiveIndex(0);
    inputRef.current?.focus();
  };

  const remove = (countryId: string) => {
    onChange(selected.filter(id => id !== countryId));
  };

  const clearAll = () => {
    onChange([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = filtered[activeIndex];
      if (c) pick(c.id);
    } else if (e.key === 'Backspace' && !query && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selected.indexOf(active.id as string);
    const newIndex = selected.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    onChange(arrayMove(selected, oldIndex, newIndex));
  };

  const nextPosition = selected.length + 1;
  const isDone = selected.length === countries.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-purple-500/60 transition-colors">
          {!isDone && (
            <span className="flex-shrink-0 text-xs font-bold text-purple-300 bg-purple-900/40 border border-purple-700/40 rounded-md px-2 py-0.5">
              {nextPosition}
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isDone
                ? 'כל המדינות נבחרו ✓'
                : `הקלידו שם בעברית או באנגלית למקום ${nextPosition}...`
            }
            disabled={isDone}
            dir="auto"
            className="flex-1 bg-transparent text-white placeholder-white/30 focus:outline-none disabled:cursor-not-allowed"
          />
          {selected.length > 0 && (
            <button
              onClick={clearAll}
              className="flex-shrink-0 text-xs text-red-400/60 hover:text-red-400 transition-colors"
              type="button"
            >
              נקה הכל
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {!isDone && query.trim() && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute top-full left-0 right-0 mt-1 z-30 glass-purple rounded-xl border border-purple-500/30 shadow-2xl shadow-purple-900/40 max-h-64 overflow-y-auto"
            >
              {filtered.slice(0, 8).map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={e => {
                    e.preventDefault();
                    pick(c.id);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-right transition-colors ${
                    i === activeIndex
                      ? 'bg-purple-600/30 text-white'
                      : 'text-white/80 hover:bg-purple-600/20'
                  }`}
                >
                  <Flag country={c} size="md" />
                  <span className="flex-1 text-sm font-medium">{c.name}</span>
                  {c.nameEn && (
                    <span className="text-xs text-purple-300/60" dir="ltr">
                      {c.nameEn}
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          )}
          {!isDone && query.trim() && filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-full left-0 right-0 mt-1 z-30 glass-purple rounded-xl border border-purple-500/30 px-3 py-2 text-sm text-purple-300/70"
            >
              לא נמצאה מדינה תואמת
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Selected list — drag-and-drop reorderable */}
      {selectedCountries.length > 0 && (
        <div className="text-[11px] text-purple-300/60 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.5" />
            <circle cx="11" cy="4" r="1.5" />
            <circle cx="5" cy="8" r="1.5" />
            <circle cx="11" cy="8" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="11" cy="12" r="1.5" />
          </svg>
          גררו את הידית כדי לשנות סדר
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={selected} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5">
            {selectedCountries.map((country, index) => (
              <SortableRow
                key={country.id}
                country={country}
                position={index + 1}
                onRemove={() => remove(country.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {selectedCountries.length === 0 && (
        <div className="text-center py-8 text-purple-300/50 text-sm">
          {emptyHint || 'התחילו להקליד שם מדינה כדי להוסיף למקום הראשון'}
        </div>
      )}
    </div>
  );
}
