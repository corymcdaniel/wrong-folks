import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { createPlayTracker } from '../utils/playTracker';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef        = useRef(null);
  const playlistRef     = useRef(null);
  const playlistIdxRef  = useRef(0);
  const loopRef         = useRef(false);
  const trackerRef      = useRef(null);

  const [currentSong, setCurrentSong]     = useState(null);
  const [isPlaying, setIsPlaying]         = useState(false);
  const [currentTime, setCurrentTime]     = useState(0);
  const [duration, setDuration]           = useState(0);
  const [playlist, setPlaylist]           = useState(null);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [isPlayAll, setIsPlayAll]         = useState(false);

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
      const isLast = playlistIdxRef.current >= (pl?.length ?? 0) - 1;
      // Single-song plays continue through the section, then stop;
      // Play All loops back to the start
      if (pl?.length > 0 && (!isLast || loopRef.current)) {
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

  // `songs` is the list the song belongs to, so playback continues
  // through it after the song ends
  const playSong = useCallback((song, songs) => {
    const audio = audioRef.current;
    const pl    = playlistRef.current;
    const plIdx = pl ? pl.findIndex((s) => s.id === song.id) : -1;

    if (plIdx !== -1) {
      // Song is in the active queue, so keep queue mode and jump to it
      playlistIdxRef.current = plIdx;
      setPlaylistIndex(plIdx);
    } else if (songs?.length) {
      const idx = Math.max(0, songs.findIndex((s) => s.id === song.id));
      playlistRef.current    = songs;
      playlistIdxRef.current = idx;
      loopRef.current        = false;
      setPlaylist(songs);
      setPlaylistIndex(idx);
      setIsPlayAll(false);
    } else {
      playlistRef.current = null;
      setPlaylist(null);
      setIsPlayAll(false);
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
    loopRef.current        = true;
    setPlaylist(songs);
    setPlaylistIndex(0);
    setIsPlayAll(true);
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
      playlist, playlistIndex, isPlayAll,
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
