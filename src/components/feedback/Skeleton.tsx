export default function Skeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-[var(--border-color)]/30 rounded-md ${className}`}></div>
    );
}