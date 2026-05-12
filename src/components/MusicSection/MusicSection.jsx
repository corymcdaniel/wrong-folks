import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePlayer } from '../../contexts/PlayerContext';
import SongItem from '../SongItem/SongItem';
import styles from './MusicSection.module.scss';

export default function MusicSection({ songs, isLoading, onDelete, onUpload, onReorder }) {
  const { isAdmin, token } = useAuth();
  const { playAll, playlist } = usePlayer();
  const [dragIndex, setDragIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const handleDragStart = (i) => setDragIndex(i);
  const handleDragOver = (i) => setOverIndex(i);
  const handleDragEnd = () => { setDragIndex(null); setOverIndex(null); };

  const handleDrop = async (dropI) => {
    if (dragIndex === null || dragIndex === dropI) { handleDragEnd(); return; }

    const reordered = [...songs];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(dropI, 0, moved);
    onReorder(reordered);
    handleDragEnd();

    try {
      await fetch('/api/songs/order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ order: reordered.map((s) => s.id) }),
      });
    } catch (err) {
      console.error('Failed to save order', err);
    }
  };

  return (
    <section className={styles.section} id="music">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Songs (Currently samples and clips between actual songs</h2>
          <div className={styles.headerActions}>
            {songs.length > 0 && (
              <button
                className={`${styles.playAllBtn}${playlist ? ` ${styles.playAllActive}` : ''}`}
                onClick={() => playAll(songs)}
                aria-label="Play all songs"
              >
                <span className={styles.playAllIcon}>&#9654;&#9654;</span>
                Play All
              </button>
            )}
            {isAdmin && (
              <button className={styles.addBtn} onClick={onUpload}>+ Add Song</button>
            )}
          </div>
        </div>
        <div className={styles.list}>
          {isLoading && <p className={styles.state}>Loading&hellip;</p>}
          {!isLoading && songs.length === 0 && (
            <p className={styles.state}>No songs yet.</p>
          )}
          {songs.map((song, i) => (
            <SongItem
              key={song.id}
              song={song}
              index={i + 1}
              onDelete={onDelete}
              isDragging={dragIndex === i}
              isDropTarget={overIndex === i && dragIndex !== i}
              onDragStart={() => handleDragStart(i)}
              onDragOver={() => handleDragOver(i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
