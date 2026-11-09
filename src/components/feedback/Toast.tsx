import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
            <div className="flex items-center gap-3 bg-[var(--bg-surface-elevated)] border border-[var(--border-color)] shadow-xl rounded-full px-6 py-3">
                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" aria-hidden="true" />
                <span className="text-sm font-bold text-[var(--text-primary)]">{message}</span>
            </div>
        </div>
    );
}