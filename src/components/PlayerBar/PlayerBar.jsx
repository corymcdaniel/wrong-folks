import { usePlayer } from '../../contexts/PlayerContext';
import styles from './PlayerBar.module.scss';

function stripBand(title) {
  return title?.replace(/^wrong folk[\s\-–—:,]+/i, '').trim() || title;
}

function fmt(sec) {
  if (!sec || isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function PlayerBar() {
  const { currentSong, isPlaying, currentTime, duration, togglePlay, seek } = usePlayer();
  if (!currentSong) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <span className={styles.songTitle}>{stripBand(currentSong.title)}</span>

        <div className={styles.controls}>
          <button
            className={styles.playBtn}
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '▐▐' : '▶'}
          </button>

          <div className={styles.seek}>
            <span className={styles.time}>{fmt(currentTime)}</span>
            <div className={styles.track}>
              <div className={styles.fill} style={{ width: `${progress}%` }} />
              <input
                type="range"
                className={styles.range}
                min="0"
                max={duration || 0}
                value={currentTime}
                step="0.1"
                onChange={(e) => seek(parseFloat(e.target.value))}
                aria-label="Seek"
              />
            </div>
            <span className={styles.time}>{fmt(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
