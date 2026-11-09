import type { SearchResult } from '../types';

/** Catálogo curado: título/autor/ISBN alineados → portada fiable por ISBN (Open Library). */
export type CatalogBook = SearchResult & {
  isbn: string;
  aliases?: string[];
  rating?: number;
};

function coverFromIsbn(isbn: string) {
  return `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
}

export const CATALOG_BOOKS: CatalogBook[] = [
  {
    id: 'b_isbn_9780553293357',
    type: 'book',
    title: 'Fundación',
    creator: 'Isaac Asimov',
    year: '1951',
    isbn: '9780553293357',
    coverUrl: coverFromIsbn('9780553293357'),
    genres: ['science_fiction'],
    aliases: ['Foundation', 'Fundacion'],
    rating: 4.6,
  },
  {
    id: 'b_isbn_9780441172719',
    type: 'book',
    title: 'Dune',
    creator: 'Frank Herbert',
    year: '1965',
    isbn: '9780441172719',
    coverUrl: coverFromIsbn('9780441172719'),
    genres: ['science_fiction'],
    aliases: ['Duna'],
    rating: 4.7,
  },
  {
    id: 'b_isbn_9780307743657',
    type: 'book',
    title: 'El resplandor',
    creator: 'Stephen King',
    year: '1977',
    isbn: '9780307743657',
    coverUrl: coverFromIsbn('9780307743657'),
    genres: ['horror'],
    aliases: ['The Shining'],
    rating: 4.5,
  },
  {
    id: 'b_isbn_9780441569595',
    type: 'book',
    title: 'Neuromante',
    creator: 'William Gibson',
    year: '1984',
    isbn: '9780441569595',
    coverUrl: coverFromIsbn('9780441569595'),
    genres: ['science_fiction', 'cyberpunk'],
    aliases: ['Neuromancer'],
    rating: 4.3,
  },
  {
    id: 'b_isbn_9780593135204',
    type: 'book',
    title: 'Project Hail Mary',
    creator: 'Andy Weir',
    year: '2021',
    isbn: '9780593135204',
    coverUrl: coverFromIsbn('9780593135204'),
    genres: ['science_fiction'],
    aliases: ['Proyecto Hail Mary'],
    rating: 4.6,
  },
  {
    id: 'b_isbn_9780553380958',
    type: 'book',
    title: 'Hyperion',
    creator: 'Dan Simmons',
    year: '1989',
    isbn: '9780553380958',
    coverUrl: coverFromIsbn('9780553380958'),
    genres: ['science_fiction'],
    rating: 4.5,
  },
  {
    id: 'b_isbn_9780141439518',
    type: 'book',
    title: 'Orgullo y prejuicio',
    creator: 'Jane Austen',
    year: '1813',
    isbn: '9780141439518',
    coverUrl: coverFromIsbn('9780141439518'),
    genres: ['romance', 'fiction'],
    aliases: ['Pride and Prejudice'],
    rating: 4.5,
  },
  {
    id: 'b_isbn_9780756404741',
    type: 'book',
    title: 'El nombre del viento',
    creator: 'Patrick Rothfuss',
    year: '2007',
    isbn: '9780756404741',
    coverUrl: coverFromIsbn('9780756404741'),
    genres: ['fantasy'],
    aliases: ['The Name of the Wind'],
    rating: 4.6,
  },
  {
    id: 'b_isbn_9780765382030',
    type: 'book',
    title: 'El problema de los tres cuerpos',
    creator: 'Cixin Liu',
    year: '2008',
    isbn: '9780765382030',
    coverUrl: coverFromIsbn('9780765382030'),
    genres: ['science_fiction'],
    aliases: ['The Three-Body Problem', 'Three-Body Problem'],
    rating: 4.3,
  },
  {
    id: 'b_isbn_9781524763138',
    type: 'book',
    title: 'Becoming',
    creator: 'Michelle Obama',
    year: '2018',
    isbn: '9781524763138',
    coverUrl: coverFromIsbn('9781524763138'),
    genres: ['biography', 'nonfiction'],
    rating: 4.7,
  },
  {
    id: 'b_isbn_9781538724736',
    type: 'book',
    title: 'Verity',
    creator: 'Colleen Hoover',
    year: '2018',
    isbn: '9781538724736',
    coverUrl: coverFromIsbn('9781538724736'),
    genres: ['mystery', 'thriller'],
    rating: 4.2,
  },
  {
    id: 'b_isbn_9780439023481',
    type: 'book',
    title: 'Los juegos del hambre',
    creator: 'Suzanne Collins',
    year: '2008',
    isbn: '9780439023481',
    coverUrl: coverFromIsbn('9780439023481'),
    genres: ['young_adult', 'dystopia'],
    aliases: ['The Hunger Games', 'Hunger Games'],
    rating: 4.5,
  },
  {
    id: 'b_isbn_9780451524935',
    type: 'book',
    title: '1984',
    creator: 'George Orwell',
    year: '1949',
    isbn: '9780451524935',
    coverUrl: coverFromIsbn('9780451524935'),
    genres: ['dystopia', 'fiction'],
    rating: 4.6,
  },
  {
    id: 'b_isbn_9780547928227',
    type: 'book',
    title: 'El hobbit',
    creator: 'J. R. R. Tolkien',
    year: '1937',
    isbn: '9780547928227',
    coverUrl: coverFromIsbn('9780547928227'),
    genres: ['fantasy'],
    aliases: ['The Hobbit'],
    rating: 4.7,
  },
  {
    id: 'b_isbn_9780316556345',
    type: 'book',
    title: 'Circe',
    creator: 'Madeline Miller',
    year: '2018',
    isbn: '9780316556345',
    coverUrl: coverFromIsbn('9780316556345'),
    genres: ['fantasy', 'fiction'],
    rating: 4.4,
  },
  {
    id: 'b_isbn_9780525620785',
    type: 'book',
    title: 'Mexican Gothic',
    creator: 'Silvia Moreno-Garcia',
    year: '2020',
    isbn: '9780525620785',
    coverUrl: coverFromIsbn('9780525620785'),
    genres: ['horror', 'gothic'],
    rating: 4.1,
  },
  {
    id: 'b_isbn_9780553381696',
    type: 'book',
    title: 'Un mundo feliz',
    creator: 'Aldous Huxley',
    year: '1932',
    isbn: '9780060850524',
    coverUrl: coverFromIsbn('9780060850524'),
    genres: ['dystopia', 'science_fiction'],
    aliases: ['Brave New World'],
    rating: 4.3,
  },
  {
    id: 'b_isbn_9780143127550',
    type: 'book',
    title: 'La carretera',
    creator: 'Cormac McCarthy',
    year: '2006',
    isbn: '9780307387899',
    coverUrl: coverFromIsbn('9780307387899'),
    genres: ['fiction', 'dystopia'],
    aliases: ['The Road'],
    rating: 4.2,
  },
];

export function searchCatalogBooks(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return CATALOG_BOOKS.filter((b) => {
    const hay = [b.title, b.creator, ...(b.aliases || [])].join(' ').toLowerCase();
    return hay.includes(q) || q.split(/\s+/).every((part) => hay.includes(part));
  }).map(({ isbn: _isbn, aliases: _a, rating: _r, ...rest }) => rest);
}

export function getCatalogBookById(id: string): CatalogBook | undefined {
  const clean = id.replace(/^(b_isbn_|b_gb_|b_)/, '');
  return CATALOG_BOOKS.find(
    (b) =>
      b.id === id ||
      b.id.endsWith(clean) ||
      b.isbn === clean ||
      b.isbn.replace(/-/g, '') === clean,
  );
}
