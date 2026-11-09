import type { WorkType } from '../types';

/** Puentes curados: afinidad temática real libro ↔ película (no aleatorios). */
export type CrossBridgeRule = {
  /** Títulos que disparan el puente (ES/EN, minúsculas). */
  matchTitles: string[];
  matchType: WorkType;
  /** Consulta para hidratar portada/id en la API destino. */
  targetQuery: string;
  targetType: WorkType;
  targetTitle: string;
  targetCreator: string;
  affinity: string;
  reason: string;
};

export const CROSS_BRIDGES: CrossBridgeRule[] = [
  {
    matchTitles: ['interstellar', 'interestelar'],
    matchType: 'movie',
    targetType: 'book',
    targetQuery: 'intitle:Foundation inauthor:Asimov',
    targetTitle: 'Fundación',
    targetCreator: 'Isaac Asimov',
    affinity: 'ciencia ficción',
    reason:
      'Como Interstellar, Fundación imagina el destino de la humanidad ante el colapso y el viaje entre estrellas.',
  },
  {
    matchTitles: ['fundación', 'foundation'],
    matchType: 'book',
    targetType: 'movie',
    targetQuery: 'Interstellar',
    targetTitle: 'Interstellar',
    targetCreator: 'Christopher Nolan',
    affinity: 'ciencia ficción',
    reason:
      'Si te gustó Fundación, Interstellar retoma la escala cósmica y la pregunta de cómo salvar a la especie.',
  },
  {
    matchTitles: ['inception', 'el origen', 'origen'],
    matchType: 'movie',
    targetType: 'book',
    targetQuery: 'intitle:Neuromancer inauthor:Gibson',
    targetTitle: 'Neuromante',
    targetCreator: 'William Gibson',
    affinity: 'realidad alterada',
    reason:
      'Inception y Neuromante juegan con capas de consciencia, redes y mundos que no son del todo reales.',
  },
  {
    matchTitles: ['neuromante', 'neuromancer'],
    matchType: 'book',
    targetType: 'movie',
    targetQuery: 'Inception',
    targetTitle: 'Inception',
    targetCreator: 'Christopher Nolan',
    affinity: 'realidad alterada',
    reason:
      'Neuromante e Inception comparten la idea de hackear la mente y perderse entre capas de realidad.',
  },
  {
    matchTitles: ['the shining', 'el resplandor'],
    matchType: 'movie',
    targetType: 'book',
    targetQuery: 'intitle:"The Shining" inauthor:King',
    targetTitle: 'El resplandor',
    targetCreator: 'Stephen King',
    affinity: 'terror psicológico',
    reason:
      'La película nace del libro: el Overlook, el aislamiento y la locura familiar están en ambas obras.',
  },
  {
    matchTitles: ['el resplandor', 'the shining'],
    matchType: 'book',
    targetType: 'movie',
    targetQuery: 'The Shining',
    targetTitle: 'El resplandor',
    targetCreator: 'Stanley Kubrick',
    affinity: 'terror psicológico',
    reason:
      'Kubrick adaptó El resplandor: misma tensión claustrofóbica, otra mirada al mal en el hotel.',
  },
  {
    matchTitles: ['dune', 'duna'],
    matchType: 'book',
    targetType: 'movie',
    targetQuery: 'Dune',
    targetTitle: 'Dune',
    targetCreator: 'Denis Villeneuve',
    affinity: 'épica espacial',
    reason:
      'La adaptación de Villeneuve traduce a imagen la política, la ecología y el mesianismo de Arrakis.',
  },
  {
    matchTitles: ['dune', 'duna'],
    matchType: 'movie',
    targetType: 'book',
    targetQuery: 'intitle:Dune inauthor:Herbert',
    targetTitle: 'Dune',
    targetCreator: 'Frank Herbert',
    affinity: 'épica espacial',
    reason:
      'El libro original profundiza en la religión, la ecología y las intrigas que la película solo esboza.',
  },
  {
    matchTitles: ['arrival', 'la llegada'],
    matchType: 'movie',
    targetType: 'book',
    targetQuery: 'intitle:"Story of Your Life" inauthor:Chiang',
    targetTitle: 'La historia de tu vida',
    targetCreator: 'Ted Chiang',
    affinity: 'primer contacto',
    reason:
      'La llegada adapta el relato de Ted Chiang: lenguaje, tiempo y contacto alienígena entrelazados.',
  },
  {
    matchTitles: ['blade runner', 'blade runner 2049'],
    matchType: 'movie',
    targetType: 'book',
    targetQuery: 'intitle:"Do Androids Dream of Electric Sheep" inauthor:Dick',
    targetTitle: '¿Sueñan los androides con ovejas eléctricas?',
    targetCreator: 'Philip K. Dick',
    affinity: 'distopía',
    reason:
      'Blade Runner nace de la novela de Dick: identidad, empatía y qué significa ser humano.',
  },
  {
    matchTitles: ['the martian', 'marte', 'el marciano'],
    matchType: 'movie',
    targetType: 'book',
    targetQuery: 'intitle:"The Martian" inauthor:Weir',
    targetTitle: 'El marciano',
    targetCreator: 'Andy Weir',
    affinity: 'supervivencia espacial',
    reason:
      'La película sigue el ingenio científico y el humor negro del libro de Andy Weir.',
  },
  {
    matchTitles: ['project hail mary', 'proyecto hail mary'],
    matchType: 'book',
    targetType: 'movie',
    targetQuery: 'The Martian',
    targetTitle: 'Marte (The Martian)',
    targetCreator: 'Ridley Scott',
    affinity: 'ciencia y supervivencia',
    reason:
      'Si disfrutaste Project Hail Mary, The Martian comparte el tono de ciencia práctica y supervivencia.',
  },
  {
    matchTitles: ['2001', '2001: a space odyssey', '2001 odisea'],
    matchType: 'movie',
    targetType: 'book',
    targetQuery: 'intitle:"2001" inauthor:Clarke',
    targetTitle: '2001: Una odisea espacial',
    targetCreator: 'Arthur C. Clarke',
    affinity: 'odisea espacial',
    reason:
      'Libro y película se escribieron en diálogo: inteligencia artificial, evolución y el monolito.',
  },
  {
    matchTitles: ['fight club', 'el club de la lucha'],
    matchType: 'movie',
    targetType: 'book',
    targetQuery: 'intitle:"Fight Club" inauthor:Palahniuk',
    targetTitle: 'El club de la lucha',
    targetCreator: 'Chuck Palahniuk',
    affinity: 'identidad',
    reason:
      'La película es adaptación directa: misma crítica al consumismo y al doble yo.',
  },
  {
    matchTitles: ['the hunger games', 'los juegos del hambre'],
    matchType: 'book',
    targetType: 'movie',
    targetQuery: 'The Hunger Games',
    targetTitle: 'Los juegos del hambre',
    targetCreator: 'Gary Ross',
    affinity: 'distopía',
    reason:
      'La saga llegó a la pantalla casi capítulo a capítulo; misma arena, misma rebelión.',
  },
  {
    matchTitles: ['the hunger games', 'los juegos del hambre'],
    matchType: 'movie',
    targetType: 'book',
    targetQuery: 'intitle:"Hunger Games" inauthor:Collins',
    targetTitle: 'Los juegos del hambre',
    targetCreator: 'Suzanne Collins',
    affinity: 'distopía',
    reason:
      'El libro detalla el interior de Katniss y Panem más allá de lo que muestra la película.',
  },
  {
    matchTitles: ['pride and prejudice', 'orgullo y prejuicio'],
    matchType: 'book',
    targetType: 'movie',
    targetQuery: 'Pride and Prejudice',
    targetTitle: 'Orgullo y prejuicio',
    targetCreator: 'Joe Wright',
    affinity: 'romance clásico',
    reason:
      'Una de las adaptaciones más queridas del choque entre Elizabeth Bennet y Darcy.',
  },
  {
    matchTitles: ['star wars', 'una nueva esperanza'],
    matchType: 'movie',
    targetType: 'book',
    targetQuery: 'intitle:Dune inauthor:Herbert',
    targetTitle: 'Dune',
    targetCreator: 'Frank Herbert',
    affinity: 'mito espacial',
    reason:
      'Star Wars bebió del imaginario de Dune: imperios, desiertos, mesías y casas rivales.',
  },
];

export function normalizeTitle(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findBridgeRule(title: string, type: WorkType): CrossBridgeRule | null {
  const needle = normalizeTitle(title);
  return (
    CROSS_BRIDGES.find(
      (rule) =>
        rule.matchType === type &&
        rule.matchTitles.some((t) => {
          const nt = normalizeTitle(t);
          return needle === nt || needle.includes(nt) || nt.includes(needle);
        }),
    ) || null
  );
}
