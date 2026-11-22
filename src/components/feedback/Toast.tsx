import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 800 }: ToastProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const timer = window.setTimeout(() => onCloseRef.current(), duration);
    return () => window.clearTimeout(timer);
  }, [message, duration]);

  return createPortal(
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[var(--text-primary)]/20"
        aria-hidden="true"
      />
      <div className="relative pointer-events-auto flex items-center gap-4 bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] shadow-2xl rounded-2xl px-8 py-6 sm:px-10 sm:py-7 max-w-[min(92vw,32rem)] animate-in fade-in zoom-in-95 duration-200">
        <CheckCircle2 size={36} className="text-green-600 shrink-0" aria-hidden="true" />
        <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-snug">
          {message}
        </span>
      </div>
    </div>,
    document.body,
  );
}
