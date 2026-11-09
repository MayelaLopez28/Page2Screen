import { BookOpen, Film } from 'lucide-react';
import type { SearchResult } from '../../types';
import { formatYear } from '../../utils/format';
import CoverImage from '../works/CoverImage';

interface SearchResultItemProps {
  item: SearchResult;
  active: boolean;
  id: string;
  onSelect: (item: SearchResult) => void;
}

export default function SearchResultItem({ item, active, id, onSelect }: SearchResultItemProps) {
  const isBook = item.type === 'book';

  return (
    <li
      id={id}
      role="option"
      aria-selected={active}
      className={`flex gap-3 p-3 cursor-pointer border-b border-[var(--border-color)] last:border-0 ${
        active ? 'bg-[var(--border-color)]/25' : 'hover:bg-[var(--border-color)]/15'
      }`}
      onMouseDown={(e) => {
        e.preventDefault();
        onSelect(item);
      }}
    >
      <div className="w-10 h-14 shrink-0 rounded overflow-hidden bg-[var(--bg-app)]">
        <CoverImage
          src={item.coverUrl}
          title={item.title}
          creator={item.creator}
          type={item.type}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm text-[var(--text-primary)] truncate">{item.title}</p>
        <p className="text-xs text-[var(--text-secondary)] truncate">
          {item.creator} · {formatYear(item.year)}
        </p>
        <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
          {isBook ? <BookOpen size={12} /> : <Film size={12} />}
          {isBook ? 'Libro' : 'Película'}
        </p>
      </div>
    </li>
  );
}
