import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import ExplorePage from './pages/ExplorePage';
import ListsPage from './pages/ListsPage';
import WorkDetailPage from './pages/WorkDetailPage';
import AddWorkPage from './pages/AddWorkPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ExplorePage /> },
      { path: 'listas', element: <ListsPage /> },
      { path: 'explorar', element: <ExplorePage /> },
      { path: 'obra/:tipo/:id', element: <WorkDetailPage /> },
      { path: 'anadir', element: <AddWorkPage /> },
      { path: 'perfil', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
