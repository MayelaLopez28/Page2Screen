import { useEffect, useState } from 'react';
import StarRating from '../forms/StarRating';

export interface Opinion {
  id: string;
  author: string;
  rating: number;
  text?: string;
}

interface OpinionListProps {
  opinions: Opinion[];
  /** Id de la opinión editable (p. ej. "me") */
  editableId?: string;
  onSaveOpinion?: (rating: number, text: string) => void;
  canCreate?: boolean;
  /** Al incrementar, abre el editor (p. ej. tras “Volví a leer”). */
  editRequestKey?: number;
}

export default function OpinionList({
  opinions,
  editableId,
  onSaveOpinion,
  canCreate = false,
  editRequestKey = 0,
}: OpinionListProps) {
  const mine = opinions.find((o) => o.id === editableId);
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(mine?.rating || 0);
  const [text, setText] = useState(mine?.text || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editing) {
      setRating(mine?.rating || 0);
      setText(mine?.text || '');
      setError('');
    }
  }, [mine?.rating, mine?.text, editing]);

  const startEdit = () => {
    setRating(mine?.rating || 0);
    setText(mine?.text || '');
    setError('');
    setEditing(true);
  };

  useEffect(() => {
    if (editRequestKey > 0 && onSaveOpinion) {
      startEdit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al pedir edición externa
  }, [editRequestKey]);

  const handleSave = () => {
    if (rating <= 0) {
      setError('Marca al menos media estrella.');
      return;
    }
    onSaveOpinion?.(rating, text.trim());
    setEditing(false);
    setError('');
  };

  if (opinions.length === 0 && !canCreate && !editing) {
    return (
      <div className="border-y border-[var(--border-color)] py-8 px-4 sm:px-6">
        <p className="label-mono text-[var(--text-secondary)]">
          Aún no hay opiniones de tu círculo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0 border-y border-[var(--border-color)]">
      {opinions.map((op) => {
        const isMine = op.id === editableId;
        const showEditor = isMine && editing;

        return (
          <article
            key={op.id}
            className="py-6 border-b border-[var(--border-color)] last:border-0"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full border border-[var(--border-color)] flex items-center justify-center font-heading text-sm">
                  {op.author.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-heading text-sm">{op.author}</p>
                  {!showEditor && op.rating > 0 ? (
                    <StarRating value={op.rating} readonly size={14} />
                  ) : null}
                </div>
              </div>
              {isMine && onSaveOpinion && !showEditor ? (
                <button
                  type="button"
                  onClick={startEdit}
                  className="label-mono text-[var(--text-secondary)] underline underline-offset-4 hover:text-[var(--text-primary)]"
                >
                  Editar
                </button>
              ) : null}
            </div>

            {showEditor ? (
              <div className="mt-3 space-y-4">
                <div>
                  <p className="label-mono text-[var(--text-secondary)] mb-2">Tu calificación</p>
                  <StarRating value={rating} onChange={setRating} size={26} step={0.5} />
                </div>
                <div>
                  <label htmlFor="edit-opinion" className="label-mono text-[var(--text-secondary)] mb-2 block">
                    Tu opinión
                  </label>
                  <textarea
                    id="edit-opinion"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    className="w-full border border-[var(--border-color)] bg-transparent p-3 font-mono text-sm outline-none focus:border-[var(--text-primary)]"
                    placeholder="¿Qué te pareció?"
                  />
                </div>
                {error ? (
                  <p className="text-sm text-[var(--color-error)] font-mono" role="alert">
                    {error}
                  </p>
                ) : null}
                <p className="text-xs font-mono text-[var(--text-secondary)]">
                  Puedes cambiar la nota y el comentario, o dejarlos como están y guardar.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="btn-solid min-h-11 px-5" onClick={handleSave}>
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="btn-outline min-h-11 px-5"
                    onClick={() => setEditing(false)}
                  >
                    Dejar como está
                  </button>
                </div>
              </div>
            ) : op.text ? (
              <p className="text-sm font-mono text-[var(--text-primary)] leading-relaxed mt-2">
                {op.text}
              </p>
            ) : null}
          </article>
        );
      })}

      {canCreate && !mine && onSaveOpinion ? (
        <div className="py-6">
          {!editing ? (
            <button
              type="button"
              onClick={startEdit}
              className="btn-outline min-h-11 px-5"
            >
              Escribir tu opinión
            </button>
          ) : (
            <div className="space-y-4">
              <p className="font-heading text-sm">Tu opinión</p>
              <div>
                <p className="label-mono text-[var(--text-secondary)] mb-2">
                  Calificación (obligatoria)
                </p>
                <StarRating value={rating} onChange={setRating} size={26} step={0.5} />
              </div>
              <div>
                <label htmlFor="new-opinion" className="label-mono text-[var(--text-secondary)] mb-2 block">
                  Reseña (opcional)
                </label>
                <textarea
                  id="new-opinion"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  className="w-full border border-[var(--border-color)] bg-transparent p-3 font-mono text-sm outline-none focus:border-[var(--text-primary)]"
                  placeholder="Si quieres, cuenta qué te pareció..."
                />
              </div>
              {error ? (
                <p className="text-sm text-[var(--color-error)] font-mono" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-solid min-h-11 px-5" onClick={handleSave}>
                  Publicar
                </button>
                <button
                  type="button"
                  className="btn-outline min-h-11 px-5"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
