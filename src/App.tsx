
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from './components/theme-provider';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreatePlaylist from './pages/CreatePlaylist';
import ViewPlaylist from './pages/ViewPlaylist';
import MyPlaylists from './pages/MyPlaylists';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="reels-mixer-theme">
      <Router>
        <Toaster position="top-right" />
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreatePlaylist />} />
            <Route path="/playlist/:id" element={<ViewPlaylist />} />
            <Route path="/my-playlists" element={<MyPlaylists />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </Router>
    </ThemeProvider>
  );
}

export default App;