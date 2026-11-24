import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useLibrary } from '../context/LibraryContext';

export default function NotificationsPage() {
  const {
    isLoggedIn,
    notifications,
    friendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    markNotificationsRead,
  } = useLibrary();

  useEffect(() => {
    if (isLoggedIn) {
      markNotificationsRead();
    }
    // Solo al entrar a la página
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="animate-in fade-in max-w-lg mx-auto py-16 text-center space-y-6">
        <h1 className="font-heading text-3xl sm:text-4xl">Notificaciones</h1>
        <p className="text-sm font-mono text-[var(--text-secondary)]">
          Inicia sesión para ver solicitudes de amistad y la actividad de tu círculo.
        </p>
        <Link to="/entrar" state={{ from: '/notificaciones' }} className="btn-solid inline-flex min-h-11 px-6">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in max-w-2xl mx-auto">
      <p className="label-mono text-[var(--text-secondary)] mb-2">Tu círculo</p>
      <h1 className="font-heading text-3xl sm:text-4xl mb-2">Notificaciones</h1>
      <p className="text-sm font-mono text-[var(--text-secondary)] mb-10">
        Solicitudes de amistad y lo que hacen tus amigos.
      </p>

      {friendRequests.length > 0 ? (
        <section className="mb-10" aria-labelledby="req-heading">
          <h2 id="req-heading" className="label-mono text-[var(--text-secondary)] mb-4">
            Solicitudes ({friendRequests.length})
          </h2>
          <ul className="border-y border-[var(--border-color)] divide-y divide-[var(--border-color)]">
            {friendRequests.map((req) => (
              <li key={req.id} className="py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div>
                  <p className="font-heading text-lg">{req.fromName}</p>
                  <p className="text-sm font-mono text-[var(--text-secondary)]">
                    @{req.fromHandle} · quiere unirse a tu círculo
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn-solid min-h-11 px-4"
                    onClick={() => acceptFriendRequest(req.id)}
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    className="btn-outline min-h-11 px-4"
                    onClick={() => rejectFriendRequest(req.id)}
                  >
                    Rechazar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="feed-heading">
        <h2 id="feed-heading" className="label-mono text-[var(--text-secondary)] mb-4">
          Actividad
        </h2>
        {notifications.length === 0 ? (
          <p className="py-8 font-mono text-sm text-[var(--text-secondary)] border-y border-[var(--border-color)]">
            Aún no hay notificaciones. Añade amigos desde tu perfil para ver su actividad.
          </p>
        ) : (
          <ul className="border-y border-[var(--border-color)] divide-y divide-[var(--border-color)]">
            {notifications.map((n) => (
              <li key={n.id} className="py-5">
                <p className="label-mono text-[var(--text-secondary)] text-[0.65rem] mb-1">
                  {n.type === 'friend_request' ? 'Solicitud' : 'Actividad'}
                  {!n.read ? ' · nueva' : ''}
                </p>
                <p className="font-heading text-base sm:text-lg">{n.title}</p>
                <p className="text-sm font-mono text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {n.body}
                </p>
                {n.type === 'friend_request' && n.requestId && friendRequests.some((r) => r.id === n.requestId) ? (
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      className="btn-solid min-h-11 px-4"
                      onClick={() => acceptFriendRequest(n.requestId!)}
                    >
                      Aceptar
                    </button>
                    <button
                      type="button"
                      className="btn-outline min-h-11 px-4"
                      onClick={() => rejectFriendRequest(n.requestId!)}
                    >
                      Rechazar
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8">
        <Link to="/perfil" className="label-mono underline underline-offset-4">
          Ir al perfil →
        </Link>
      </p>
    </div>
  );
}
