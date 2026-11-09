import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useLibrary } from '../context/LibraryContext';
import WorkCard from '../components/works/WorkCard';
import Toast from '../components/feedback/Toast';
import { decodeProfileCode, generateProfileCode } from '../utils/profileCode';
import { sampleAccountToFriend, SAMPLE_ACCOUNTS } from '../data/sampleUsers';
import type { Friend, WorkType } from '../types';

type Tab = 'books' | 'movies' | 'dnf' | 'friends';

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
    setProfileName,
    setProfileHandle,
    setProfileBio,
    addFriend,
    removeFriend,
    addSuggestedFriend,
    createUser,
    switchUser,
  } = useLibrary();

  const [tab, setTab] = useState<Tab>('friends');
  const [friendQuery, setFriendQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [editing, setEditing] = useState(false);
  const [tempName, setTempName] = useState(profileName);
  const [tempHandle, setTempHandle] = useState(profileHandle);
  const [tempBio, setTempBio] = useState(profileBio);

  const [showNewUser, setShowNewUser] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [newBio, setNewBio] = useState('');

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

  const initials = profileName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const code = useMemo(() => generateProfileCode(profileName, works), [profileName, works]);

  const tabs: { id: Tab; label: string }[] = [
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

  const handleCreateUser = (e: FormEvent) => {
    e.preventDefault();

    if (newName.trim().length < 2) {
      setErrorMsg('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    createUser(newName, newHandle, newBio);
    setShowNewUser(false);
    setNewName('');
    setNewHandle('');
    setNewBio('');
    setTab('friends');
    setToastMsg('Nueva sesión creada. Te sugerimos amigos para empezar.');
  };

  return (
    <div className="animate-in fade-in pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-10">
        <label className="sr-only" htmlFor="switch-user">
          Cambiar de cuenta
        </label>
        <select
          id="switch-user"
          value={currentUserId}
          onChange={(e) => {
            switchUser(e.target.value);
            setToastMsg('Sesión cambiada');
          }}
          className="h-11 px-3 bg-transparent border border-[var(--border-color)] text-sm font-mono outline-none flex-1 max-w-md"
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} (@{account.handle})
            </option>
          ))}
        </select>
        <button type="button" onClick={() => setShowNewUser((v) => !v)} className="btn-outline">
          Nueva sesión
        </button>
      </div>

      {showNewUser && (
        <form
          onSubmit={handleCreateUser}
          className="mb-10 p-6 border border-[var(--border-color)] bg-[var(--bg-surface)] space-y-4"
        >
          <h2 className="font-heading text-2xl">Crear nuevo usuario</h2>
          <p className="text-sm text-[var(--text-secondary)] font-mono">
            Empieza una biblioteca limpia. Las cuentas ejemplo seguirán disponibles como sugerencias.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nombre completo"
              className="h-11 px-0 bg-transparent border-b border-[var(--border-color)] outline-none focus:border-[var(--text-primary)]"
              required
            />
            <input
              value={newHandle}
              onChange={(e) => setNewHandle(e.target.value)}
              placeholder="@usuario (opcional)"
              className="h-11 px-0 bg-transparent border-b border-[var(--border-color)] outline-none focus:border-[var(--text-primary)]"
            />
          </div>
          <input
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            placeholder="Bio corta (opcional)"
            className="w-full h-11 px-0 bg-transparent border-b border-[var(--border-color)] outline-none focus:border-[var(--text-primary)]"
          />
          <div className="flex gap-2 justify-end pt-2">
            <button type="button" onClick={() => setShowNewUser(false)} className="btn-outline">
              Cancelar
            </button>
            <button type="submit" className="btn-solid">
              Crear y entrar
            </button>
          </div>
        </form>
      )}

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
        <div className="space-y-4 max-w-2xl">
          {dnf.length === 0 ? (
            <p className="text-[var(--text-secondary)] font-mono text-sm">No tienes obras abandonadas.</p>
          ) : (
            dnf.map((work) => (
              <article
                key={work.id}
                className="flex gap-4 py-4 border-b border-[var(--border-color)]"
              >
                <div className="w-14 h-20 overflow-hidden shrink-0 bg-[var(--bg-chip)] cover-spine">
                  {work.coverUrl ? (
                    <img
                      src={work.coverUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : null}
                </div>
                <div>
                  <h3 className="font-heading text-lg">{work.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{work.creator}</p>
                  {work.notes && (
                    <p className="text-sm italic font-mono text-[var(--text-secondary)] mt-2">
                      “{work.notes}”
                    </p>
                  )}
                </div>
              </article>
            ))
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

          <p className="text-xs text-[var(--text-secondary)] font-mono">
            Cuentas ejemplo: @mayelalopez @andrealopez @reginasosa @danieldorador @danielaleal
          </p>
        </div>
      )}

      {toastMsg && <Toast message={`✓ ${toastMsg}`} onClose={() => setToastMsg('')} />}
    </div>
  );
}
