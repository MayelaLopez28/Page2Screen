import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import WorkCard from '../components/works/WorkCard';
import Toast from '../components/feedback/Toast';
import CrossBridge from '../components/recommendations/CrossBridge';
import CoverImage from '../components/works/CoverImage';
import StarRating from '../components/forms/StarRating';
import { decodeProfileCode, generateProfileCode } from '../utils/profileCode';
import { sampleAccountToFriend, SAMPLE_ACCOUNTS } from '../data/sampleUsers';
import { formatRegisteredDate } from '../utils/format';
import { workPath } from '../utils/routes';
import type { Friend, Work, WorkType } from '../types';

type Tab = 'history' | 'books' | 'movies' | 'dnf' | 'friends';

export default function ProfilePage() {
  const {
    works,
    friends,
    profileName,
    profileHandle,
    profileBio,
    accounts,
    currentUserId,
    friendSuggestions,
    isLoggedIn,
    setProfileName,
    setProfileHandle,
    setProfileBio,
    addFriend,
    removeFriend,
    addSuggestedFriend,
    logout,
  } = useLibrary();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('history');
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [friendQuery, setFriendQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(profileName);
  const [tempHandle, setTempHandle] = useState(profileHandle);
  const [tempBio, setTempBio] = useState(profileBio);

  useEffect(() => {
    setTempName(profileName);
    setTempHandle(profileHandle);
    setTempBio(profileBio);
    setEditing(false);
    setErrorMsg('');
  }, [currentUserId, profileName, profileHandle, profileBio]);

  const booksDone = works.filter((w) => w.type === 'book' && w.status === 'done');
  const moviesDone = works.filter((w) => w.type === 'movie' && w.status === 'done');
  const dnf = works.filter((w) => w.status === 'dnf');
  const historyWorks = useMemo(() => {
    return [...booksDone, ...moviesDone].sort(
      (a, b) => (b.addedAt || 0) - (a.addedAt || 0),
    );
  }, [booksDone, moviesDone]);
  const selectedHistory: Work | null =
    historyWorks.find((w) => w.id === selectedHistoryId) || null;

  const initials = profileName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const code = useMemo(() => generateProfileCode(profileName, works), [profileName, works]);

  if (!isLoggedIn) {
    return <Navigate to="/entrar" replace />;
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'history', label: 'Historial' },
    { id: 'books', label: 'Libros leídos' },
    { id: 'movies', label: 'Películas vistas' },
    { id: 'dnf', label: 'Lo dejé (DNF)' },
    { id: 'friends', label: 'Amigos' },
  ];

  const handleSaveProfile = () => {
    if (tempName.trim().length >= 2) {
      setProfileName(tempName.trim());
      setProfileHandle(tempHandle.trim());
      setProfileBio(tempBio.trim());
      setEditing(false);
      setToastMsg('Perfil actualizado');
    }
  };

  const resolveFriendFromQuery = (raw: string): Friend | null => {
    const value = raw.trim();
    if (!value) {
      return null;
    }

    const decoded = decodeProfileCode(value);
    if (decoded) {
      const latest = decoded.w[0];
      return {
        id: `f_${Date.now()}`,
        name: decoded.n,
        handle: decoded.n.toLowerCase().replace(/\s+/g, ''),
        recentWorks: decoded.w.map((w) => ({
          id: w.id,
          title: w.t,
          rating: w.r,
          type: (w.id.startsWith('m_') ? 'movie' : 'book') as WorkType,
          creator: w.cr || 'Desconocido',
          year: w.y || '',
          coverUrl: w.c || undefined,
          genres: [],
          status: 'done' as const,
          addedAt: Date.now(),
        })),
        activity: latest
          ? `${latest.id.startsWith('m_') ? 'Vio' : 'Terminó de leer'} ${latest.t}`
          : 'Se unió a tu círculo',
        activityAt: 'hace un momento',
      };
    }

    const needle = value.replace(/^@/, '').toLowerCase().replace(/\s+/g, '');
    const found =
      accounts.find(
        (a) =>
          a.id !== currentUserId &&
          (a.handle.toLowerCase() === needle ||
            a.name.toLowerCase().replace(/\s+/g, '') === needle ||
            a.name.toLowerCase().includes(value.toLowerCase())),
      ) ||
      SAMPLE_ACCOUNTS.find(
        (a) =>
          a.id !== currentUserId &&
          (a.handle.toLowerCase() === needle ||
            a.name.toLowerCase().replace(/\s+/g, '') === needle ||
            a.name.toLowerCase().includes(value.toLowerCase())),
      );

    return found ? sampleAccountToFriend(found) : null;
  };

  const handleAddFriend = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!friendQuery.trim()) {
      return;
    }

    const friend = resolveFriendFromQuery(friendQuery);

    if (!friend) {
      setErrorMsg('No encontramos ese usuario. Prueba @mayelalopez o un código de perfil.');
      return;
    }

    if (friends.some((f) => f.id === friend.id || f.handle === friend.handle)) {
      setErrorMsg('Esa persona ya está en tu círculo.');
      return;
    }

    addFriend(friend);
    setFriendQuery('');
    setToastMsg(`${friend.name} se añadió a tu círculo`);
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setToastMsg('Código de invitación copiado');
    } catch {
      setErrorMsg('No se pudo copiar el código');
    }
  };

  return (
    <div className="animate-in fade-in pb-16">
      <div className="flex justify-end mb-6">
        <button
          type="button"
          className="btn-outline"
          onClick={() => {
            logout();
            navigate('/entrar');
          }}
        >
          Cerrar sesión
        </button>
      </div>

      <header className="flex flex-col sm:flex-row gap-6 sm:items-start mb-10">
        <div className="w-20 h-20 rounded-full border border-[var(--border-color)] font-heading text-2xl flex items-center justify-center shrink-0 bg-[var(--bg-surface)]">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-3 mb-2 max-w-lg">
              <input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="w-full bg-transparent border-b border-[var(--border-color)] py-2 text-2xl font-heading outline-none"
                autoFocus
              />
              <input
                value={tempHandle}
                onChange={(e) => setTempHandle(e.target.value)}
                className="w-full bg-transparent border-b border-[var(--border-color)] py-2 text-sm font-mono outline-none"
                placeholder="@usuario"
              />
              <input
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
                className="w-full bg-transparent border-b border-[var(--border-color)] py-2 text-sm font-mono outline-none"
                placeholder="Bio"
              />
              <button type="button" onClick={handleSaveProfile} className="btn-solid mt-2">
                Guardar
              </button>
            </div>
          ) : (
            <div className="flex items-baseline gap-3 mb-1 flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-heading">{profileName}</h1>
              <button
                type="button"
                onClick={() => {
                  setTempName(profileName);
                  setTempHandle(profileHandle);
                  setTempBio(profileBio);
                  setEditing(true);
                }}
                className="label-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline"
              >
                Editar
              </button>
            </div>
          )}
          {!editing && (
            <p className="text-[var(--text-secondary)] font-mono text-sm">
              @{profileHandle} · {profileBio}
            </p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-10 max-w-xl">
        {[
          { n: booksDone.length, label: 'Libros' },
          { n: moviesDone.length, label: 'Películas' },
          { n: friends.length, label: 'Amigos' },
        ].map((stat) => (
          <div key={stat.label} className="border-t border-[var(--border-color)] pt-3">
            <p className="font-heading text-3xl tabular-nums">{stat.n}</p>
            <p className="label-mono text-[var(--text-secondary)] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <CrossBridge dismissible />

      <div
        role="tablist"
        aria-label="Secciones del perfil"
        className="flex flex-wrap gap-2 mb-8 border-b border-[var(--border-color)] pb-4"
      >
        {tabs.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={active ? 'pill pill-active' : 'pill'}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === 'history' && (
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)] gap-6 lg:gap-8 items-start">
          <div className="space-y-0 border-y border-[var(--border-color)]">
            {historyWorks.length === 0 ? (
              <p className="py-8 font-mono text-sm text-[var(--text-secondary)]">
                Aún no has registrado libros leídos ni películas vistas.
              </p>
            ) : (
              historyWorks.map((work) => {
                const active = selectedHistoryId === work.id;
                const isBook = work.type === 'book';
                const dates = (
                  work.consumptionDates?.length ? work.consumptionDates : [work.addedAt]
                )
                  .slice()
                  .sort((a, b) => b - a);

                return (
                  <div
                    key={work.id}
                    className={`border-b border-[var(--border-color)] last:border-0 ${
                      active ? 'bg-[var(--bg-chip)]/40' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedHistoryId((prev) => (prev === work.id ? null : work.id))
                      }
                      className="w-full text-left flex gap-3 sm:gap-4 py-3.5 sm:py-4 min-h-11 px-1 sm:px-0 transition-colors"
                      aria-pressed={active}
                      aria-expanded={active}
                    >
                      <div className="w-11 h-16 sm:w-12 sm:h-16 shrink-0 overflow-hidden bg-[var(--bg-chip)] cover-spine">
                        <CoverImage
                          src={work.coverUrl}
                          title={work.title}
                          creator={work.creator}
                          type={work.type}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="label-mono text-[var(--text-secondary)] text-[0.65rem] mb-1">
                          {isBook ? 'Libro leído' : 'Película vista'}
                        </p>
                        <p className="font-heading text-base sm:text-lg leading-snug line-clamp-2">
                          {work.title}
                        </p>
                        <p className="text-xs font-mono text-[var(--text-secondary)] mt-1 truncate">
                          {work.creator}
                        </p>
                      </div>
                    </button>

                    {/* En móvil: fechas debajo del título seleccionado */}
                    {active ? (
                      <div className="lg:hidden px-1 pb-4 space-y-3">
                        <p className="label-mono text-[var(--text-secondary)]">
                          Fechas de registro
                        </p>
                        <ul className="space-y-2">
                          {dates.map((ts, idx) => (
                            <li
                              key={`${work.id}-m-${ts}-${idx}`}
                              className="text-sm font-mono text-[var(--text-primary)]"
                            >
                              {formatRegisteredDate(ts)}
                              {dates.length > 1 ? (
                                <span className="text-[var(--text-secondary)]">
                                  {' '}
                                  · {idx === 0 ? 'más reciente' : `vez ${dates.length - idx}`}
                                </span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                        {typeof work.rating === 'number' && work.rating > 0 ? (
                          <StarRating value={work.rating} readonly size={16} />
                        ) : null}
                        {work.notes ? (
                          <p className="text-sm font-mono italic text-[var(--text-secondary)]">
                            “{work.notes}”
                          </p>
                        ) : null}
                        <Link
                          to={workPath(work.type, work.id)}
                          className="btn-outline min-h-11 px-4 inline-flex"
                        >
                          Ver ficha
                        </Link>
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {selectedHistory ? (
            <aside
              className="hidden lg:block border border-[var(--border-color)] p-5 sm:p-6 bg-[var(--bg-surface)] lg:sticky lg:top-28"
              aria-live="polite"
            >
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-16 h-24 shrink-0 overflow-hidden bg-[var(--bg-chip)] cover-spine">
                    <CoverImage
                      src={selectedHistory.coverUrl}
                      title={selectedHistory.title}
                      creator={selectedHistory.creator}
                      type={selectedHistory.type}
                      alt={`Portada de ${selectedHistory.title}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="label-mono text-[var(--text-secondary)] mb-1">
                      {selectedHistory.type === 'book' ? 'Libro' : 'Película'}
                    </p>
                    <h3 className="font-heading text-xl leading-snug">{selectedHistory.title}</h3>
                    <p className="text-sm font-mono text-[var(--text-secondary)] mt-1">
                      {selectedHistory.creator}
                    </p>
                    {typeof selectedHistory.rating === 'number' && selectedHistory.rating > 0 ? (
                      <div className="mt-2">
                        <StarRating value={selectedHistory.rating} readonly size={16} />
                      </div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <p className="label-mono text-[var(--text-secondary)] mb-2">
                    Fechas de registro
                  </p>
                  <ul className="space-y-2">
                    {(selectedHistory.consumptionDates?.length
                      ? selectedHistory.consumptionDates
                      : [selectedHistory.addedAt]
                    )
                      .slice()
                      .sort((a, b) => b - a)
                      .map((ts, idx, arr) => (
                        <li
                          key={`${selectedHistory.id}-${ts}-${idx}`}
                          className="text-sm font-mono text-[var(--text-primary)] border-b border-[var(--border-color)] pb-2"
                        >
                          {formatRegisteredDate(ts)}
                          {arr.length > 1 ? (
                            <span className="text-[var(--text-secondary)]">
                              {' '}
                              · {idx === 0 ? 'más reciente' : `vez ${arr.length - idx}`}
                            </span>
                          ) : null}
                        </li>
                      ))}
                  </ul>
                </div>

                {selectedHistory.notes ? (
                  <p className="text-sm font-mono italic text-[var(--text-secondary)] leading-relaxed">
                    “{selectedHistory.notes}”
                  </p>
                ) : null}

                <Link
                  to={workPath(selectedHistory.type, selectedHistory.id)}
                  className="btn-outline min-h-11 px-4 inline-flex"
                >
                  Ver ficha
                </Link>
              </div>
            </aside>
          ) : null}
        </div>
      )}

      {tab === 'books' && (
        <div className="grid-works w-full">
          {booksDone.length === 0 ? (
            <p className="col-span-full text-[var(--text-secondary)] font-mono text-sm">
              Aún no hay libros leídos.
            </p>
          ) : (
            booksDone.map((work) => <WorkCard key={work.id} work={work} />)
          )}
        </div>
      )}

      {tab === 'movies' && (
        <div className="grid-works w-full">
          {moviesDone.length === 0 ? (
            <p className="col-span-full text-[var(--text-secondary)] font-mono text-sm">
              Aún no hay películas vistas.
            </p>
          ) : (
            moviesDone.map((work) => <WorkCard key={work.id} work={work} />)
          )}
        </div>
      )}

      {tab === 'dnf' && (
        <div className="grid-works w-full">
          {dnf.length === 0 ? (
            <p className="col-span-full text-[var(--text-secondary)] font-mono text-sm">
              No tienes libros ni películas en DNF.
            </p>
          ) : (
            dnf.map((work) => <WorkCard key={work.id} work={work} />)
          )}
        </div>
      )}

      {tab === 'friends' && (
        <div className="space-y-10 w-full">
          {friendSuggestions.length > 0 && (
            <section className="w-full">
              <h2 className="font-heading text-xl mb-4">Sugerencias de amistad</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {friendSuggestions.map((suggestion) => {
                  const initialsSug = suggestion.name
                    .split(' ')
                    .map((p) => p[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  return (
                    <div
                      key={suggestion.id}
                      className="flex items-center gap-3 p-4 border border-[var(--border-color)] bg-[var(--bg-surface)]"
                    >
                      <div className="w-10 h-10 rounded-full border border-[var(--border-color)] font-heading text-sm flex items-center justify-center shrink-0">
                        {initialsSug}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-heading text-sm truncate">{suggestion.name}</p>
                        <p className="text-xs text-[var(--text-secondary)] font-mono truncate">
                          @{suggestion.handle} · {suggestion.works.length} obras
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          addSuggestedFriend(suggestion.id);
                          setToastMsg(`${suggestion.name} se añadió a tu círculo`);
                        }}
                        className="btn-outline !px-3 !py-1.5 shrink-0"
                      >
                        Seguir
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <form onSubmit={handleAddFriend} className="flex gap-3 max-w-xl">
            <input
              value={friendQuery}
              onChange={(e) => setFriendQuery(e.target.value)}
              placeholder="@mayelalopez, nombre o código"
              className="flex-1 h-11 px-0 bg-transparent border-b border-[var(--border-color)] text-sm font-mono outline-none focus:border-[var(--text-primary)]"
              aria-label="Buscar amigo"
            />
            <button type="submit" className="btn-solid shrink-0">
              Añadir
            </button>
          </form>
          {errorMsg && (
            <p className="text-sm text-[var(--color-error)] font-mono" role="alert">
              {errorMsg}
            </p>
          )}

          <button type="button" onClick={copyInvite} className="btn-outline">
            Copiar código de invitación
          </button>

          <div className="space-y-3 max-w-2xl">
            <h3 className="label-mono text-[var(--text-secondary)]">
              Tu círculo ({friends.length})
            </h3>
            {friends.length === 0 ? (
              <p className="text-[var(--text-secondary)] font-mono text-sm py-6">
                Aún no tienes amigos. Usa las sugerencias de arriba para empezar.
              </p>
            ) : (
              friends.map((friend) => {
                const friendInitials = friend.name
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div
                    key={friend.id}
                    className="flex items-center gap-4 py-4 border-b border-[var(--border-color)]"
                  >
                    <div className="w-11 h-11 rounded-full border border-[var(--border-color)] font-heading flex items-center justify-center shrink-0">
                      {friendInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-heading text-sm truncate">
                        {friend.name}{' '}
                        <span className="text-[var(--text-secondary)] font-mono font-normal text-xs">
                          @{friend.handle || friend.name.toLowerCase().replace(/\s+/g, '')}
                        </span>
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] font-mono truncate">
                        {friend.activity ||
                          (friend.recentWorks[0]
                            ? `Reciente: ${friend.recentWorks[0].title}`
                            : 'Sin actividad')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFriend(friend.id)}
                      className="label-mono text-[var(--text-secondary)] hover:text-[var(--color-error)]"
                      aria-label={`Eliminar a ${friend.name}`}
                    >
                      Quitar
                    </button>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {toastMsg && <Toast message={`✓ ${toastMsg}`} onClose={() => setToastMsg('')} />}
    </div>
  );
}
