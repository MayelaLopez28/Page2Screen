import { Link, Navigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import WorkCard from '../components/works/WorkCard';
import BackButton from '../components/layout/BackButton';
import Toast from '../components/feedback/Toast';
import type { Work } from '../types';

export default function FriendProfilePage() {
  const { userId: rawId } = useParams();
  const userId = rawId ? decodeURIComponent(rawId) : '';
  const {
    isLoggedIn,
    currentUserId,
    friends,
    getAccountProfile,
    sendFriendRequest,
    hasOutgoingRequestTo,
    removeFriend,
  } = useLibrary();
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const friendFromList = useMemo(
    () => friends.find((f) => f.id === userId || f.handle === userId),
    [friends, userId],
  );

  const account = userId ? getAccountProfile(userId) : null;

  if (!isLoggedIn) {
    return <Navigate to="/entrar" replace state={{ from: `/amigo/${userId || ''}` }} />;
  }

  // Cuenta real o, si solo está en el círculo, perfil a partir del Friend
  const profileName = account?.name || friendFromList?.name;
  const profileHandle = account?.handle || friendFromList?.handle || '';
  const profileBio =
    account?.bio ||
    friendFromList?.activity ||
    'Miembro del círculo Page2Screen.';
  const profileId = account?.id || friendFromList?.id || userId;

  if (!profileName || !profileId) {
    return (
      <div className="animate-in fade-in max-w-lg mx-auto py-16 text-center space-y-6">
        <BackButton fallbackTo="/perfil" />
        <h1 className="font-heading text-3xl">Perfil no encontrado</h1>
        <p className="text-sm font-mono text-[var(--text-secondary)]">
          Esa cuenta no existe en la demo local.
        </p>
        <Link to="/perfil" className="btn-outline inline-flex">
          Volver a tu perfil
        </Link>
      </div>
    );
  }

  if (profileId === currentUserId) {
    return <Navigate to="/perfil" replace />;
  }

  const isFriend = friends.some((f) => f.id === profileId);
  const pending = hasOutgoingRequestTo(profileId);
  const initials = profileName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const accountWorks: Work[] = account?.works || [];
  const doneWorks = accountWorks.filter((w) => w.status === 'done');
  const pendingWorks = accountWorks.filter((w) => w.status === 'pending');
  const dnfWorks = accountWorks.filter((w) => w.status === 'dnf');
  // Fallback: obras recientes guardadas en el objeto Friend del círculo
  const fallbackWorks: Work[] =
    doneWorks.length === 0 && (friendFromList?.recentWorks?.length || 0) > 0
      ? friendFromList!.recentWorks
      : [];
  const visibleDone = doneWorks.length > 0 ? doneWorks : fallbackWorks;

  const handleRequest = () => {
    setErrorMsg('');
    const err = sendFriendRequest(profileId);
    if (err) {
      setErrorMsg(err);
      return;
    }
    setToastMsg(`Solicitud enviada a ${profileName}`);
  };

  return (
    <div className="animate-in fade-in pb-16 max-w-4xl mx-auto">
      <div className="mb-8">
        <BackButton fallbackTo="/perfil" />
      </div>

      <header className="flex flex-col sm:flex-row sm:items-end gap-6 border-b border-[var(--border-color)] pb-8 mb-10">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[var(--border-color)] font-heading text-xl flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="label-mono text-[var(--text-secondary)] mb-1">Perfil público</p>
          <h1 className="font-heading text-3xl sm:text-4xl truncate">{profileName}</h1>
          {profileHandle ? (
            <p className="font-mono text-sm text-[var(--text-secondary)] mt-1">@{profileHandle}</p>
          ) : null}
          <p className="mt-3 text-sm font-mono leading-relaxed text-[var(--text-primary)] max-w-xl">
            {profileBio}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {isFriend ? (
            <>
              <span className="label-mono self-center text-[var(--text-secondary)]">En tu círculo</span>
              <button
                type="button"
                className="btn-outline"
                onClick={() => {
                  removeFriend(profileId);
                  setToastMsg(`${profileName} se quitó de tu círculo`);
                }}
              >
                Quitar
              </button>
            </>
          ) : pending ? (
            <span className="label-mono self-center text-[var(--text-secondary)]">
              Solicitud pendiente
            </span>
          ) : (
            <button type="button" className="btn-solid" onClick={handleRequest}>
              Enviar solicitud
            </button>
          )}
        </div>
      </header>

      {errorMsg ? (
        <p className="mb-6 text-sm font-mono text-[var(--color-error)]" role="alert">
          {errorMsg}
        </p>
      ) : null}

      <section aria-labelledby="friend-done" className="mb-10">
        <h2 id="friend-done" className="font-heading text-xl mb-4">
          Leídas / vistas ({visibleDone.length})
        </h2>
        {visibleDone.length === 0 ? (
          <p className="font-mono text-sm text-[var(--text-secondary)] py-8 border-y border-[var(--border-color)]">
            Aún no tiene obras marcadas como leídas o vistas.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {visibleDone.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </section>

      {pendingWorks.length > 0 ? (
        <section aria-labelledby="friend-pending" className="mb-10">
          <h2 id="friend-pending" className="font-heading text-xl mb-4">
            Por leer / por ver ({pendingWorks.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {pendingWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>
      ) : null}

      {dnfWorks.length > 0 ? (
        <section aria-labelledby="friend-dnf" className="mb-10">
          <h2 id="friend-dnf" className="font-heading text-xl mb-4">
            Lo dejó (DNF) ({dnfWorks.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {dnfWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        </section>
      ) : null}

      {toastMsg ? <Toast message={`✓ ${toastMsg}`} onClose={() => setToastMsg('')} /> : null}
    </div>
  );
}
