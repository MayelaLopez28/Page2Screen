import { useNavigate } from 'react-router-dom';

type BackButtonProps = {
  /** Si no hay historial, va a esta ruta. */
  fallbackTo?: string;
  className?: string;
};

/** Botón unificado “Volver” (contorno) para navegación atrás. */
export default function BackButton({ fallbackTo = '/', className = '' }: BackButtonProps) {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className={`btn-outline min-h-11 px-5 shrink-0 ${className}`.trim()}
    >
      ← Volver
    </button>
  );
}
