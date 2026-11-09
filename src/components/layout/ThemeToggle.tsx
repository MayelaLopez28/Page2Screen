import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle() {
    const { isDark, toggle } = useTheme();

    return (
        <button
            onClick={toggle}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus-visible:ring-2 rounded-md"
            aria-label={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
            title={`Cambiar a tema ${isDark ? 'claro' : 'oscuro'}`}
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}