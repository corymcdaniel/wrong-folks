const SESSION_KEY = 'wf_session_id';
const TRACK_URL   = '/api/track-play';

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const getSessionId = () => {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = makeId();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return makeId();
  }
};

// Wall-clock tracker: counts only time while audio was actually playing.
// One instance per active song. Call start() on play, pause() on pause/end/skip,
// and finalize() when the play is "done" (song change or ended).
export function createPlayTracker() {
  const sessionId = getSessionId();
  let current = null; // { playId, songId, listenedMs, playingSince, songDuration, completed, sentLast }

  const flush = (useBeacon = false) => {
    if (!current) return;
    const now = Date.now();
    if (current.playingSince) {
      current.listenedMs += now - current.playingSince;
      current.playingSince = now;
    }
    const listenedSeconds = Math.round(current.listenedMs / 1000);
    if (listenedSeconds < 1) return;
    if (listenedSeconds === current.sentLast && !current.completed) return;

    const payload = JSON.stringify({
      playId:          current.playId,
      songId:          current.songId,
      sessionId,
      listenedSeconds,
      songDuration:    current.songDuration || 0,
      completed:       current.completed,
    });

    current.sentLast = listenedSeconds;

    if (useBeacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        navigator.sendBeacon(TRACK_URL, new Blob([payload], { type: 'application/json' }));
        return;
      } catch { /* fall through to fetch */ }
    }

    fetch(TRACK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => { /* best-effort */ });
  };

  return {
    // A new song just started loading/playing
    begin(songId) {
      // Finalize any prior play before starting a new one
      flush(false);
      current = {
        playId:        makeId(),
        songId,
        listenedMs:    0,
        playingSince:  null,
        songDuration:  0,
        completed:     false,
        sentLast:      0,
      };
    },
    play() {
      if (!current) return;
      if (!current.playingSince) current.playingSince = Date.now();
    },
    pause() {
      if (!current?.playingSince) return;
      current.listenedMs += Date.now() - current.playingSince;
      current.playingSince = null;
    },
    setDuration(seconds) {
      if (current && seconds > 0) current.songDuration = seconds;
    },
    end() {
      if (!current) return;
      if (current.playingSince) {
        current.listenedMs += Date.now() - current.playingSince;
        current.playingSince = null;
      }
      current.completed = true;
      flush(false);
      current = null;
    },
    // Called on page unload / visibility hidden
    flush(useBeacon = false) {
      flush(useBeacon);
    },
    // Stop tracking without reporting completion (e.g., on unmount cleanup)
    finalize() {
      flush(false);
      current = null;
    },
  };
}
