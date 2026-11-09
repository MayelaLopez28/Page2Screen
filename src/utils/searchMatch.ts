export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesQuery(query: string, ...candidates: Array<string | undefined>): boolean {
  const q = normalizeSearchText(query);
  if (!q) {
    return true;
  }

  return candidates.some((candidate) => {
    if (!candidate) {
      return false;
    }

    const hay = normalizeSearchText(candidate);
    return hay.includes(q) || q.split(' ').every((part) => part && hay.includes(part));
  });
}

export function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}
