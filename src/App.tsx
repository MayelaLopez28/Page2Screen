import { Outlet } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import SkipLink from './components/layout/SkipLink';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DocumentTitle from './components/layout/DocumentTitle';

export default function App() {
  return (
    <LibraryProvider>
      <div className="min-h-screen flex flex-col text-[var(--text-primary)]">
        <DocumentTitle />
        <SkipLink />
        <Header />
        <main id="main-content" className="flex-1 w-full page-shell py-8 sm:py-10 lg:py-12">
          <Outlet />
        </main>
        <Footer />
      </div>
    </LibraryProvider>
  );
}
