import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { generateProfileCode } from '../../utils/profileCode';
import type { Work } from '../../types';

interface ProfileCodeBoxProps {
  name: string;
  works: Work[];
}

export default function ProfileCodeBox({ name, works }: ProfileCodeBoxProps) {
  const [copied, setCopied] = useState(false);
  const code = generateProfileCode(name, works);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar', err);
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm">
      <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-2">
        Tu código de perfil
      </h3>
      <p className="text-xs text-[var(--text-secondary)] mb-4 leading-relaxed">
        Comparte este código con tus amigos para que puedan añadirte. Contiene tu nombre y tus
        últimas 30 obras (¡sin servidores!).
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={code}
          className="flex-1 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-secondary)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--text-primary)]"
        />
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 flex items-center justify-center w-10 h-10 bg-[var(--text-primary)] text-[var(--bg-app)] rounded-lg hover:opacity-90 focus-visible:ring-2 transition-colors"
          aria-label="Copiar código"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
      </div>
    </div>
  );
}
