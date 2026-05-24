import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { createPlayTracker } from '../utils/playTracker';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef        = useRef(null);
  const playlistRef     = useRef(null);
  const playlistIdxRef  = useRef(0);
  const trackerRef      = useRef(null);

  const [currentSong, setCurrentSong]     = useState(null);
  const [isPlaying, setIsPlaying]         = useState(false);
  const [currentTime, setCurrentTime]     = useState(0);
  const [duration, setDuration]           = useState(0);
  const [playlist, setPlaylist]           = useState(null);
  const [playlistIndex, setPlaylistIndex] = useState(0);

  // Start a song immediately (used internally)
  const loadSong = useRef(null);
  loadSong.current = (song) => {
    const audio = audioRef.current;
    trackerRef.current?.begin(song.id);
    setCurrentSong(song);
    setCurrentTime(0);
    setDuration(0);
    audio.src = `/api/song/${song.id}`;
    audio.play().then(() => setIsPlaying(true)).catch(console.error);
  };

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    const tracker = createPlayTracker();
    trackerRef.current = tracker;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration   = () => {
      const d = isNaN(audio.duration) ? 0 : audio.duration;
      setDuration(d);
      tracker.setDuration(d);
    };
    const onPlay  = () => tracker.play();
    const onPause = () => tracker.pause();
    const onError = () => { tracker.pause(); setIsPlaying(false); };
    const onEnded = () => {
      tracker.end();
      const pl = playlistRef.current;
      if (pl?.length > 0) {
        const nextIdx = (playlistIdxRef.current + 1) % pl.length;
        playlistIdxRef.current = nextIdx;
        setPlaylistIndex(nextIdx);
        loadSong.current(pl[nextIdx]);
      } else {
        setIsPlaying(false);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') tracker.flush(true);
    };
    const onPageHide = () => tracker.flush(true);

    audio.addEventListener('timeupdate',     onTimeUpdate);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('play',           onPlay);
    audio.addEventListener('pause',          onPause);
    audio.addEventListener('ended',          onEnded);
    audio.addEventListener('error',          onError);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      audio.removeEventListener('timeupdate',     onTimeUpdate);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('play',           onPlay);
      audio.removeEventListener('pause',          onPause);
      audio.removeEventListener('ended',          onEnded);
      audio.removeEventListener('error',          onError);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      tracker.finalize();
      audio.pause();
    };
  }, []);

  const playSong = useCallback((song) => {
    const audio = audioRef.current;
    const pl    = playlistRef.current;

    // If song is in the active playlist, keep queue mode and jump to it
    if (pl) {
      const idx = pl.findIndex((s) => s.id === song.id);
      if (idx !== -1) {
        playlistIdxRef.current = idx;
        setPlaylistIndex(idx);
      } else {
        playlistRef.current = null;
        setPlaylist(null);
      }
    }

    if (currentSong?.id === song.id) {
      if (isPlaying) { audio.pause(); setIsPlaying(false); }
      else            { audio.play().catch(console.error); setIsPlaying(true); }
      return;
    }

    loadSong.current(song);
  }, [currentSong, isPlaying]);

  const playAll = useCallback((songs) => {
    if (!songs?.length) return;
    playlistRef.current    = songs;
    playlistIdxRef.current = 0;
    setPlaylist(songs);
    setPlaylistIndex(0);
    loadSong.current(songs[0]);
  }, []);

  const playNext = useCallback(() => {
    const pl = playlistRef.current;
    if (!pl?.length) return;
    const idx = (playlistIdxRef.current + 1) % pl.length;
    playlistIdxRef.current = idx;
    setPlaylistIndex(idx);
    loadSong.current(pl[idx]);
  }, []);

  const playPrev = useCallback(() => {
    const pl = playlistRef.current;
    if (!pl?.length) return;
    // If more than 3 s into the song, restart it; otherwise go to previous
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const idx = (playlistIdxRef.current - 1 + pl.length) % pl.length;
    playlistIdxRef.current = idx;
    setPlaylistIndex(idx);
    loadSong.current(pl[idx]);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else            { audio.play().catch(console.error); setIsPlaying(true); }
  }, [isPlaying]);

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  return (
    <PlayerContext.Provider value={{
      currentSong, isPlaying, currentTime, duration,
      playlist, playlistIndex,
      playSong, playAll, playNext, playPrev, togglePlay, seek,
    }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
