import { Link } from 'react-router-dom';

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    actionTo?: string;
}

export default function EmptyState({ title, description, actionLabel, actionTo }: EmptyStateProps) {
    return (
        <div className="text-center py-20 px-4 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-color)] shadow-sm">
            <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-3">{title}</h2>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-8">{description}</p>
            {actionLabel && actionTo && (
                <Link to={actionTo} className="inline-flex px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-app)] rounded-full font-bold uppercase tracking-wider text-sm hover:opacity-90">
                    {actionLabel}
                </Link>
            )}
        </div>
    );
}