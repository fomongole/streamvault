import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Browse } from './features/browse/Browse';
import { GenrePage } from './features/browse/GenrePage';
import { CategoryPage } from './features/browse/CategoryPage';
import { DetailsPage } from './features/details/DetailsPage';
import { ActorPage } from './features/details/ActorPage';
import { WatchlistPage } from './features/my-list/WatchlistPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Browse />} />
        <Route path="/genre/:id" element={<GenrePage />} />
        <Route path="/category/:id" element={<CategoryPage />} />
        <Route path="/:type/:id" element={<DetailsPage />} />
        <Route path="/person/:id" element={<ActorPage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;