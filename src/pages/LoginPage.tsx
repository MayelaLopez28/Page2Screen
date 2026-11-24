import { useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent, RefObject } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useLibrary } from '../context/LibraryContext';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as
    | { openNewSession?: boolean; reason?: string; from?: string }
    | null;
  const openRegister = Boolean(locationState?.openNewSession);
  const authReason = locationState?.reason?.trim() || '';
  const redirectAfterAuth = locationState?.from || '/perfil';
  const { loginWithCredentials, createUser, isLoggedIn, profileName } = useLibrary();

  const [mode, setMode] = useState<Mode>(openRegister ? 'register' : 'login');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const loginPasswordRef = useRef<HTMLInputElement>(null);
  const regHandleRef = useRef<HTMLInputElement>(null);
  const regPasswordRef = useRef<HTMLInputElement>(null);
  const regBioRef = useRef<HTMLInputElement>(null);

  const focusNextOnEnter = (
    e: KeyboardEvent<HTMLInputElement>,
    next: RefObject<HTMLInputElement | null>,
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      next.current?.focus();
    }
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const err = loginWithCredentials(handle, password);
    if (err) {
      setErrorMsg(err);
      return;
    }
    navigate(redirectAfterAuth, { replace: true });
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const err = createUser(name, handle, password, bio);
    if (err) {
      setErrorMsg(err);
      return;
    }
    navigate(redirectAfterAuth, { replace: true });
  };

  const passwordInput = (
    id: string,
    placeholder: string,
    autoComplete: string,
    inputRef: RefObject<HTMLInputElement | null>,
    minLength?: number,
  ) => (
    <div>
      <label htmlFor={id} className="label-mono block mb-2">
        Contraseña
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          ref={inputRef}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full h-11 pr-10 px-0 bg-transparent border-b border-[var(--border-color)] outline-none focus:border-[var(--text-primary)] font-mono text-sm"
          required
          minLength={minLength}
        />
        <button
          type="button"
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={showPassword}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-in fade-in max-w-md mx-auto pb-16">
      <p className="label-mono text-[var(--text-secondary)] mb-2 text-center">Sesión</p>
      <h1 className="font-heading text-3xl sm:text-4xl text-center mb-3">
        {mode === 'login' ? 'Iniciar sesión' : 'Crear perfil'}
      </h1>
      <p className="text-center text-sm text-[var(--text-secondary)] font-mono mb-6">
        {isLoggedIn
          ? `Sesión actual: ${profileName}. Puedes entrar con otra cuenta o crear un perfil nuevo.`
          : 'Ingresa con tu usuario y contraseña, o crea una cuenta nueva.'}
      </p>

      {authReason ? (
        <div
          className="mb-8 border border-[var(--border-color)] bg-[var(--bg-chip)] px-4 py-3 text-sm font-mono text-[var(--text-primary)]"
          role="status"
          aria-live="polite"
        >
          {authReason}
        </div>
      ) : null}

      <div className="flex gap-2 mb-8 border-b border-[var(--border-color)] pb-3">
        <button
          type="button"
          className={mode === 'login' ? 'pill pill-active' : 'pill'}
          onClick={() => {
            setMode('login');
            setErrorMsg('');
            setShowPassword(false);
          }}
        >
          Entrar
        </button>
        <button
          type="button"
          className={mode === 'register' ? 'pill pill-active' : 'pill'}
          onClick={() => {
            setMode('register');
            setErrorMsg('');
            setShowPassword(false);
          }}
        >
          Crear perfil
        </button>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div>
            <label htmlFor="login-handle" className="label-mono block mb-2">
              Usuario
            </label>
            <input
              id="login-handle"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => focusNextOnEnter(e, loginPasswordRef)}
              placeholder="@usuario"
              autoComplete="username"
              className="w-full h-11 px-0 bg-transparent border-b border-[var(--border-color)] outline-none focus:border-[var(--text-primary)] font-mono text-sm"
              required
            />
          </div>
          {passwordInput(
            'login-password',
            '••••••••',
            'current-password',
            loginPasswordRef,
          )}
          {errorMsg && (
            <p
              className="text-sm text-[var(--color-error)] font-mono"
              role="alert"
              aria-live="assertive"
            >
              {errorMsg}
            </p>
          )}
          <button type="submit" className="btn-solid w-full min-h-11 justify-center">
            Entrar
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-5" noValidate>
          <div>
            <label htmlFor="reg-name" className="label-mono block mb-2">
              Nombre
            </label>
            <input
              id="reg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => focusNextOnEnter(e, regHandleRef)}
              placeholder="Tu nombre"
              className="w-full h-11 px-0 bg-transparent border-b border-[var(--border-color)] outline-none focus:border-[var(--text-primary)]"
              required
            />
          </div>
          <div>
            <label htmlFor="reg-handle" className="label-mono block mb-2">
              Usuario
            </label>
            <input
              id="reg-handle"
              ref={regHandleRef}
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => focusNextOnEnter(e, regPasswordRef)}
              placeholder="@usuario"
              autoComplete="username"
              className="w-full h-11 px-0 bg-transparent border-b border-[var(--border-color)] outline-none focus:border-[var(--text-primary)] font-mono text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="label-mono block mb-2">
              Contraseña
            </label>
            <div className="relative flex items-center">
              <input
                id="reg-password"
                ref={regPasswordRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => focusNextOnEnter(e, regBioRef)}
                placeholder="Mínimo 4 caracteres"
                autoComplete="new-password"
                className="w-full h-11 pr-10 px-0 bg-transparent border-b border-[var(--border-color)] outline-none focus:border-[var(--text-primary)] font-mono text-sm"
                required
                minLength={4}
              />
              <button
                type="button"
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="reg-bio" className="label-mono block mb-2">
              Bio (opcional)
            </label>
            <input
              id="reg-bio"
              ref={regBioRef}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Una línea sobre ti"
              className="w-full h-11 px-0 bg-transparent border-b border-[var(--border-color)] outline-none focus:border-[var(--text-primary)] font-mono text-sm"
            />
          </div>
          {errorMsg && (
            <p
              className="text-sm text-[var(--color-error)] font-mono"
              role="alert"
              aria-live="assertive"
            >
              {errorMsg}
            </p>
          )}
          <button type="submit" className="btn-solid w-full min-h-11 justify-center">
            Crear y entrar
          </button>
        </form>
      )}

      {isLoggedIn && (
        <p className="text-center text-xs font-mono text-[var(--text-secondary)] mt-8">
          <Link to="/perfil" className="btn-outline min-h-11 px-5 inline-flex">
            ← Volver
          </Link>
        </p>
      )}
    </div>
  );
}
