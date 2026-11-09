interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export default function FormField({ label, error, id, ...props }: FormFieldProps) {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-bold uppercase tracking-wider mb-2 text-[var(--text-primary)]">
                {label}
            </label>
            <input
                id={id}
                className={`w-full h-12 px-4 bg-[var(--bg-app)] border rounded-lg focus:ring-2 focus:ring-[var(--text-primary)] outline-none transition-colors ${error ? 'border-error ring-1 ring-error' : 'border-[var(--border-color)]'}`}
                {...props}
            />
            {error && <p className="mt-2 text-xs font-bold text-error dark:text-[var(--color-error)]">{error}</p>}
        </div>
    );
}