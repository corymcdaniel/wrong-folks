import SongItem from '../SongItem/SongItem';
import { useAuth } from '../../contexts/AuthContext';
import styles from './MusicSection.module.scss';

export default function MusicSection({ songs, isLoading, onDelete, onUpload }) {
  const { isAdmin } = useAuth();
  return (
    <section className={styles.section} id="music">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Songs</h2>
          {isAdmin && (
            <button className={styles.addBtn} onClick={onUpload}>
              + Add Song
            </button>
          )}
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
            />
          ))}
        </div>
      </div>
    </section>
  );
}
