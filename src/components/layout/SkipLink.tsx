export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--text-primary)] focus:text-[var(--bg-app)] focus:rounded-full focus:font-mono focus:text-xs focus:uppercase focus:tracking-wider focus:outline-none"
    >
      Saltar al contenido principal
    </a>
  );
}
