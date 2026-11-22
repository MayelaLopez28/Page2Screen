export function formatYear(dateString?: string): string {
    if (!dateString) {
        return 'Desconocido';
    }

    const match = dateString.match(/\d{4}/);
    return match ? match[0] : 'Desconocido';
}

export function formatRegisteredDate(timestamp?: number): string {
    if (!timestamp) {
        return 'Fecha no registrada';
    }

    return new Date(timestamp).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength).trim() + '...';
}