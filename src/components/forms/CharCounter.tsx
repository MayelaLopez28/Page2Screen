interface CharCounterProps {
    current: number;
    min?: number;
    max?: number;
}

export default function CharCounter({ current, min = 20, max }: CharCounterProps) {
    const isInvalid = current > 0 && current < min;
    return (
        <div className={`text-xs font-bold uppercase tracking-wider mt-2 text-right ${isInvalid ? 'text-error dark:text-[var(--color-error)]' : 'text-[var(--text-secondary)]'}`}>
            {current} {max ? `/ ${max}` : `/ ${min} mínimo`}
        </div>
    );
}