import { Link, Navigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';
import WorkCard from '../components/works/WorkCard';
import BackButton from '../components/layout/BackButton';
import Toast from '../components/feedback/Toast';

export default function FriendProfilePage() {
  const { userId } = useParams();
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

  if (!isLoggedIn) {
    return <Navigate to="/entrar" replace state={{ from: `/amigo/${userId || ''}` }} />;
  }

  const profile = userId ? getAccountProfile(userId) : null;

  if (!profile) {
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

  if (profile.id === currentUserId) {
    return <Navigate to="/perfil" replace />;
  }

  const isFriend = friends.some((f) => f.id === profile.id);
  const pending = hasOutgoingRequestTo(profile.id);
  const initials = profile.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const doneWorks = (profile.works || []).filter((w) => w.status === 'done');

  const handleRequest = () => {
    setErrorMsg('');
    const err = sendFriendRequest(profile.id);
    if (err) {
      setErrorMsg(err);
      return;
    }
    setToastMsg(`Solicitud enviada a ${profile.name}`);
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
          <h1 className="font-heading text-3xl sm:text-4xl truncate">{profile.name}</h1>
          <p className="font-mono text-sm text-[var(--text-secondary)] mt-1">@{profile.handle}</p>
          <p className="mt-3 text-sm font-mono leading-relaxed text-[var(--text-primary)] max-w-xl">
            {profile.bio}
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
                  removeFriend(profile.id);
                  setToastMsg(`${profile.name} se quitó de tu círculo`);
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

      <section aria-labelledby="friend-works">
        <h2 id="friend-works" className="font-heading text-xl mb-4">
          Obras ({doneWorks.length})
        </h2>
        {doneWorks.length === 0 ? (
          <p className="font-mono text-sm text-[var(--text-secondary)] py-8 border-y border-[var(--border-color)]">
            Aún no tiene obras marcadas como leídas o vistas.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {doneWorks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </section>

      {toastMsg ? <Toast message={`✓ ${toastMsg}`} onClose={() => setToastMsg('')} /> : null}
    </div>
  );
}
