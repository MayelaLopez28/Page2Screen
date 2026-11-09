import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorSummaryProps {
    errors: string[];
}

export default function ErrorSummary({ errors }: ErrorSummaryProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (errors.length > 0) {
            containerRef.current?.focus();
        }
    }, [errors]);

    if (errors.length === 0) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            tabIndex={-1}
            role="alert"
            className="mb-6 p-4 border-2 border-error dark:border-[var(--color-error)] bg-error/10 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-error"
        >
            <div className="flex items-center gap-2 text-error dark:text-[var(--color-error)] mb-2 font-bold">
                <AlertTriangle size={20} aria-hidden="true" />
                <h3 className="text-sm uppercase tracking-wider">Por favor, corrige lo siguiente:</h3>
            </div>
            <ul className="list-disc list-inside text-sm text-[var(--text-primary)] space-y-1">
                {errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                ))}
            </ul>
        </div>
    );
}