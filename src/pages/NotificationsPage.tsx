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
    clearViewedNotifications,
    removeNotification,
  } = useLibrary();

  useEffect(() => {
    if (!isLoggedIn) return;
    // Quita actividad ya vista en visitas anteriores; luego marca el resto como leído.
    clearViewedNotifications();
    markNotificationsRead();
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
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
        <p className="text-sm font-mono text-[var(--text-secondary)]">
          Puedes borrar cada aviso. La actividad ya vista se limpia al volver a entrar; las
          solicitudes pendientes se quedan hasta aceptar o rechazar.
        </p>
        {notifications.some((n) => n.type === 'friend_activity') ? (
          <button
            type="button"
            className="btn-outline shrink-0"
            onClick={() => {
              notifications
                .filter((n) => n.type === 'friend_activity')
                .forEach((n) => removeNotification(n.id));
            }}
          >
            Borrar actividad
          </button>
        ) : null}
      </div>

      {friendRequests.length > 0 ? (
        <section className="mb-10" aria-labelledby="req-heading">
          <h2 id="req-heading" className="label-mono text-[var(--text-secondary)] mb-4">
            Solicitudes ({friendRequests.length})
          </h2>
          <ul className="border-y border-[var(--border-color)] divide-y divide-[var(--border-color)]">
            {friendRequests.map((req) => (
              <li
                key={req.id}
                className="py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between"
              >
                <div>
                  <Link
                    to={`/amigo/${req.fromUserId}`}
                    className="font-heading text-lg hover:underline underline-offset-4"
                  >
                    {req.fromName}
                  </Link>
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
          Bandeja
        </h2>
        {notifications.length === 0 ? (
          <p className="py-8 font-mono text-sm text-[var(--text-secondary)] border-y border-[var(--border-color)]">
            No hay notificaciones. Envía o acepta solicitudes desde el perfil.
          </p>
        ) : (
          <ul className="border-y border-[var(--border-color)] divide-y divide-[var(--border-color)]">
            {notifications.map((n) => (
              <li key={n.id} className="py-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="label-mono text-[var(--text-secondary)] text-[0.65rem] mb-1">
                    {n.type === 'friend_request' ? 'Solicitud' : 'Actividad'}
                    {!n.read ? ' · nueva' : ''}
                  </p>
                  <p className="font-heading text-base sm:text-lg">{n.title}</p>
                  <p className="text-sm font-mono text-[var(--text-secondary)] mt-1 leading-relaxed">
                    {n.body}
                  </p>
                  {n.fromUserId ? (
                    <Link
                      to={`/amigo/${n.fromUserId}`}
                      className="inline-block mt-2 label-mono underline underline-offset-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      Ver perfil →
                    </Link>
                  ) : null}
                  {n.type === 'friend_request' &&
                  n.requestId &&
                  friendRequests.some((r) => r.id === n.requestId) ? (
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
                </div>
                <button
                  type="button"
                  className="label-mono text-[var(--text-secondary)] hover:text-[var(--color-error)] shrink-0 self-start"
                  onClick={() => removeNotification(n.id)}
                  aria-label={`Borrar notificación: ${n.title}`}
                >
                  Borrar
                </button>
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
