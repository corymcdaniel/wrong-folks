import { useState, useEffect } from 'react';
import { PlayerProvider } from './contexts/PlayerContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Hero from './components/Hero/Hero';
import Intro from './components/Intro/Intro';
import MusicSection from './components/MusicSection/MusicSection';
import PlayerBar from './components/PlayerBar/PlayerBar';
import UploadModal from './components/UploadModal/UploadModal';
import Footer from './components/Footer/Footer';
import BandPhoto from './components/BandPhoto/BandPhoto';
import LoginModal from './components/LoginModal/LoginModal';
import styles from './App.module.scss';

function Site() {
  const { isAdmin } = useAuth();
  const [songs, setSongs]           = useState([]);
  const [isLoadingSongs, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showLogin, setShowLogin]   = useState(false);

  useEffect(() => {
    fetch('/api/songs')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setSongs(data))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUploadSuccess = (song) => {
    setSongs((prev) => [song, ...prev]);
    setShowUpload(false);
  };

  const handleDelete = (id) => {
    setSongs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleReorder = (reordered) => {
    setSongs(reordered);
  };

  return (
    <div className={styles.app}>
      <Hero />
      <Intro />
      <MusicSection songs={songs} isLoading={isLoadingSongs} onDelete={handleDelete} onReorder={handleReorder} onUpload={() => setShowUpload(true)} />
      <Footer onLoginClick={() => setShowLogin(true)} />
      <BandPhoto />
      <PlayerBar />

      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onSuccess={handleUploadSuccess} />
      )}
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <Site />
      </PlayerProvider>
    </AuthProvider>
  );
}
