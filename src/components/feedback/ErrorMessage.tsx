import { AlertTriangle } from 'lucide-react';

export default function ErrorMessage({ message, onRetry }: { message: string, onRetry?: () => void }) {
    return (
        <div className="p-6 text-center border-2 border-error/50 bg-error/10 rounded-xl" role="alert">
            <AlertTriangle size={32} className="mx-auto text-error mb-4" />
            <p className="font-bold text-[var(--text-primary)] mb-4">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="px-4 py-2 bg-error text-white font-bold rounded-lg text-sm">Reintentar</button>
            )}
        </div>
    );
}