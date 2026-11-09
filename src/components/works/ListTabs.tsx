import { Link } from 'react-router-dom';

interface ListTabsProps {
    currentFilter: 'done' | 'pending';
    doneCount: number;
    pendingCount: number;
}

export default function ListTabs({ currentFilter, doneCount, pendingCount }: ListTabsProps) {
    return (
        <div className="flex items-center gap-4 mb-8 border-b border-[var(--border-color)]" role="tablist">
            <Link
                to="/"
                role="tab"
                aria-selected={currentFilter === 'done'}
                className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors focus-visible:outline-none focus-visible:bg-[var(--border-color)]/20 ${currentFilter === 'done' ? 'border-[var(--text-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
                Leídos y Vistos ({doneCount})
            </Link>
            <Link
                to="/pendientes"
                role="tab"
                aria-selected={currentFilter === 'pending'}
                className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors focus-visible:outline-none focus-visible:bg-[var(--border-color)]/20 ${currentFilter === 'pending' ? 'border-[var(--text-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
                Por Leer / Ver ({pendingCount})
            </Link>
        </div>
    );
}