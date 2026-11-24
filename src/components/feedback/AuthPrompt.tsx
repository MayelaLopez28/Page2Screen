import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

interface AuthPromptProps {
  message: string;
  from: string;
  onClose: () => void;
}

export default function AuthPrompt({ message, from, onClose }: AuthPromptProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[var(--text-primary)]/25 border-0 cursor-default"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[min(92vw,28rem)] bg-[var(--bg-surface-elevated)] border-2 border-[var(--border-color)] shadow-2xl rounded-2xl px-6 py-6 sm:px-8 sm:py-7 animate-in fade-in zoom-in-95 duration-200"
      >
        <p id={titleId} className="text-lg sm:text-xl font-bold text-[var(--text-primary)] leading-snug mb-6">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/entrar"
            state={{ reason: message, from }}
            className="btn-solid min-h-11 px-5 justify-center flex-1"
            onClick={onClose}
          >
            Iniciar sesión
          </Link>
          <Link
            to="/entrar"
            state={{ openNewSession: true, reason: message, from }}
            className="btn-outline min-h-11 px-5 justify-center flex-1"
            onClick={onClose}
          >
            Crear cuenta
          </Link>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="mt-4 w-full label-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] min-h-10"
        >
          Cancelar
        </button>
      </div>
    </div>,
    document.body,
  );
}
