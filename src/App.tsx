import { Routes, Route } from 'react-router-dom';
import { useAppStore } from './store';
import NavBar from './components/NavBar';
import StarBackground from './components/StarBackground';
import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import ResultsPage from './pages/ResultsPage';

function App() {
  const store = useAppStore();

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <StarBackground />
      <NavBar />
      <main className="relative z-10 pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/players" element={<PlayersPage store={store} />} />
          <Route path="/results" element={<ResultsPage store={store} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
