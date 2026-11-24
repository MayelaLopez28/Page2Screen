import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Catálogo',
  '/explorar': 'Catálogo',
  '/listas': 'Mis listas',
  '/anadir': 'Escribir reseña',
  '/perfil': 'Perfil',
  '/notificaciones': 'Notificaciones',
  '/entrar': 'Entrar',
};

export default function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    let page = ROUTE_TITLES[pathname];

    if (!page && pathname.startsWith('/obra/libro')) {
      page = 'Ficha · Libro';
    } else if (!page && pathname.startsWith('/obra/pelicula')) {
      page = 'Ficha · Película';
    } else if (!page && pathname.startsWith('/obra/')) {
      page = 'Ficha · Obra';
    }

    if (!page) {
      page = 'Página no encontrada';
    }

    document.title = `${page} · Page2Screen`;
  }, [pathname]);

  return null;
}
