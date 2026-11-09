interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;
    return (
        <nav aria-label="Paginación" className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-[var(--border-color)] rounded text-sm font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-[var(--bg-surface)] focus-visible:ring-2"
            >
                Anterior
            </button>
            <span className="text-sm font-bold px-4" aria-live="polite">Página {currentPage} de {totalPages}</span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-[var(--border-color)] rounded text-sm font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-[var(--bg-surface)] focus-visible:ring-2"
            >
                Siguiente
            </button>
        </nav>
    );
}