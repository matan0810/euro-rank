import { Country } from '../types';

interface Props {
  country?: Country | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES: Record<NonNullable<Props['size']>, { h: number; w: number; text: string }> = {
  sm: { h: 14, w: 21, text: 'text-sm' },
  md: { h: 18, w: 27, text: 'text-base' },
  lg: { h: 22, w: 33, text: 'text-2xl' },
  xl: { h: 28, w: 42, text: 'text-3xl' },
};

export default function Flag({ country, size = 'lg', className = '' }: Props) {
  const dims = SIZES[size];

  if (!country?.code) {
    return (
      <span
        className={`inline-flex items-center justify-center ${dims.text} ${className}`}
        style={{ width: dims.w, height: dims.h }}
        aria-hidden
      >
        {country?.flag || '🏳'}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/${country.code.toLowerCase()}.svg`}
      alt={country.nameEn || country.name || ''}
      width={dims.w}
      height={dims.h}
      loading="lazy"
      className={`inline-block rounded-[3px] shadow-sm ring-1 ring-black/20 object-cover flex-shrink-0 ${className}`}
      style={{ width: dims.w, height: dims.h }}
    />
  );
}
