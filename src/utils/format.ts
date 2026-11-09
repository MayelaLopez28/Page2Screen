export function formatYear(dateString?: string): string {
    if (!dateString) {
        return 'Desconocido';
    }

    const match = dateString.match(/\d{4}/);
    return match ? match[0] : 'Desconocido';
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength).trim() + '...';
}