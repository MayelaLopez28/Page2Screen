import { Link } from 'react-router-dom';

interface BreadcrumbsProps {
    items: { label: string; to?: string }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav aria-label="Migas de pan" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-6">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    {item.to ? (
                        <Link to={item.to} className="hover:text-[var(--text-primary)] focus-visible:ring-2 rounded">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-[var(--text-primary)]">{item.label}</span>
                    )}
                    {index < items.length - 1 && <span aria-hidden="true">›</span>}
                </div>
            ))}
        </nav>
    );
}