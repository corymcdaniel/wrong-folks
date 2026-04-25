import { usePlayer } from '../../contexts/PlayerContext';
import { useAuth } from '../../contexts/AuthContext';
import styles from './SongItem.module.scss';

function stripBand(title) {
  return title.replace(/^wrong folk[\s\-–—:,]+/i, '').trim() || title;
}

function fmt(sec) {
  if (!sec || isNaN(sec)) return '--:--';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function SongItem({
  song, index, onDelete,
  isDragging, isDropTarget,
  onDragStart, onDragOver, onDrop, onDragEnd,
}) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const { isAdmin, token } = useAuth();
  const isActive  = currentSong?.id === song.id;
  const isRunning = isActive && isPlaying;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`Delete "${song.title}"?`)) return;
    try {
      const res = await fetch(`/api/song/${song.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onDelete(song.id);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const className = [
    styles.item,
    isActive      ? styles.active      : '',
    isDragging    ? styles.dragging    : '',
    isDropTarget  ? styles.dropTarget  : '',
    isAdmin       ? styles.adminMode   : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={className}
      draggable={isAdmin}
      onDragStart={onDragStart}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(); }}
      onDrop={(e) => { e.preventDefault(); onDrop?.(); }}
      onDragEnd={onDragEnd}
      onClick={() => playSong(song)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && playSong(song)}
    >
      {isAdmin && (
        <div className={styles.dragHandle} title="Drag to reorder">
          <span /><span /><span /><span /><span /><span />
        </div>
      )}

      <div className={styles.indicator}>
        {isRunning ? (
          <div className={styles.bars} aria-label="Playing">
            <span /><span /><span />
          </div>
        ) : (
          <>
            <span className={styles.trackNum}>{String(index).padStart(2, '0')}</span>
            <div className={styles.playIcon}>&#9654;</div>
          </>
        )}
      </div>

      <span className={styles.title}>{stripBand(song.title)}</span>

      <div className={styles.right}>
        <span className={styles.duration}>{fmt(song.duration)}</span>
        {isAdmin && (
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            aria-label={`Delete ${song.title}`}
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
}
