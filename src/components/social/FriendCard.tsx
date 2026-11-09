import type { Friend } from '../../types';
import { Trash2, Star } from 'lucide-react';
import CoverImage from '../works/CoverImage';

interface FriendCardProps {
  friend: Friend;
  onRemove: (id: string) => void;
}

export default function FriendCard({ friend, onRemove }: FriendCardProps) {
  const initials = friend.name.substring(0, 2).toUpperCase();

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-surface-elevated)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--text-primary)] text-[var(--bg-app)] font-heading font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <h3 className="font-bold text-[var(--text-primary)] truncate">{friend.name}</h3>
        </div>
        <button
          type="button"
          onClick={() => onRemove(friend.id)}
          className="p-2 text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-md transition-colors"
          aria-label={`Eliminar a ${friend.name}`}
          title="Eliminar amigo"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
          Últimas obras
        </p>
        <div className="grid grid-cols-3 gap-2">
          {friend.recentWorks.slice(0, 3).map((work, idx) => (
            <div
              key={`${work.id}-${idx}`}
              className="relative aspect-[2/3] rounded overflow-hidden bg-[var(--bg-app)] border border-[var(--border-color)]"
              title={work.title}
            >
              <CoverImage
                src={work.coverUrl}
                title={work.title}
                creator="-"
                type={work.type || 'book'}
                alt={work.title}
                className="w-full h-full object-cover"
              />
              {work.rating ? (
                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold py-1 flex items-center justify-center gap-1">
                  <Star size={10} fill="currentColor" className="text-yellow-400" /> {work.rating}
                </div>
              ) : null}
            </div>
          ))}
          {friend.recentWorks.length === 0 && (
            <div className="col-span-3 text-center py-4 text-xs text-[var(--text-secondary)]">
              Aún no tiene obras públicas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
