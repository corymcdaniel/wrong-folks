import { useState, useEffect } from 'react';
import { PlayerProvider } from './contexts/PlayerContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Hero from './components/Hero/Hero';
import Intro from './components/Intro/Intro';
import MusicSection from './components/MusicSection/MusicSection';
import PlayerBar from './components/PlayerBar/PlayerBar';
import UploadModal from './components/UploadModal/UploadModal';
import Footer from './components/Footer/Footer';
import PolaroidStack from './components/PolaroidStack/PolaroidStack';
import About from './components/About/About';
import LoginModal from './components/LoginModal/LoginModal';
import StatsModal from './components/StatsModal/StatsModal';
import { consoleEgg } from './utils/consoleEggs';
import MarkdownModal from './components/MarkdownModal/MarkdownModal';
import lyricsInfo from './content/lyrics.md?raw';
import styles from './App.module.scss';

// `info` is optional markdown shown in a modal when the section heading is clicked
const SECTIONS = [
  { category: 'pieces', title: 'Pieces', id: 'music' },
  { category: 'lyrics', title: 'Lyrics', id: 'lyrics', info: lyricsInfo },
];

function Site() {
  const { isAdmin, token } = useAuth();
  const [songs, setSongs]           = useState([]);
  const [isLoadingSongs, setLoading] = useState(true);
  const [uploadSection, setUploadSection] = useState(null);
  const [showLogin, setShowLogin]   = useState(false);
  const [showStats, setShowStats]   = useState(false);
  const [infoSection, setInfoSection] = useState(null);

  useEffect(() => {
    fetch('/api/songs')
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setSongs(data))
      .catch(() => setSongs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleUploadSuccess = (song) => {
    setSongs((prev) => [song, ...prev]);
    setUploadSection(null);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
    consoleEgg('login');
  };

  const handleDelete = (id) => {
    setSongs((prev) => prev.filter((s) => s.id !== id));
  };

  // The saved order is one list across all sections, so merge the
  // reordered section back in before saving.
  const handleReorder = async (category, reordered) => {
    const merged = [...songs.filter((s) => s.category !== category), ...reordered];
    setSongs(merged);

    try {
      await fetch('/api/songs/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order: merged.map((s) => s.id) }),
      });
    } catch (err) {
      console.error('Failed to save order', err);
    }
  };

  return (
    <div className={styles.app}>
      <Hero />
      <Intro />
      {SECTIONS.map((section) => {
        let handleTitleClick = null;
        if (section.info) {
          handleTitleClick = () => {
            setInfoSection(section);
            consoleEgg(section.id);
          };
        }

        return (
          <MusicSection
            key={section.category}
            id={section.id}
            title={section.title}
            songs={songs.filter((s) => s.category === section.category)}
            isLoading={isLoadingSongs}
            onDelete={handleDelete}
            onReorder={(reordered) => handleReorder(section.category, reordered)}
            onUpload={() => setUploadSection(section)}
            onTitleClick={handleTitleClick}
          />
        );
      })}
      <div className={styles.showcase}>
        <PolaroidStack />
        <About />
      </div>
      <Footer onLoginClick={handleLoginClick} onStatsClick={() => setShowStats(true)} />
      <PlayerBar />

      {uploadSection && (
        <UploadModal
          category={uploadSection.category}
          sectionTitle={uploadSection.title}
          onClose={() => setUploadSection(null)}
          onSuccess={handleUploadSuccess}
        />
      )}
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} />
      )}
      {infoSection && (
        <MarkdownModal
          title={infoSection.title}
          content={infoSection.info}
          onClose={() => setInfoSection(null)}
        />
      )}
      {showStats && isAdmin && (
        <StatsModal onClose={() => setShowStats(false)} />
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
