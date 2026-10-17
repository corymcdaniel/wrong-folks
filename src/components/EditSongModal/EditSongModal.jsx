import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import useEscapeKey from '../../hooks/useEscapeKey';
import SongNotes from '../SongNotes/SongNotes';
// Shares the upload form's look so both admin modals match
import styles from '../UploadModal/UploadModal.module.scss';

export default function EditSongModal({ song, onClose, onSuccess }) {
  const { token } = useAuth();
  const [title, setTitle]     = useState(song.title);
  const [notes, setNotes]     = useState(song.notes ?? '');
  const [isSaving, setSaving] = useState(false);
  const [error, setError]     = useState('');

  useEscapeKey(onClose);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/song/${song.id}`, {
        method: 'PATCH',
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: title.trim(), notes: notes.trim() }),
      });
      if (!res.ok) throw new Error('Save failed');
      const updated = await res.json();
      onSuccess(updated);
    } catch {
      setError('Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={`${styles.modal} ${styles.modalWide}`}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit ${song.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.heading}>Edit Song</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-title">Title</label>
            <input
              id="edit-title"
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-notes">Notes</label>
            <textarea
              id="edit-notes"
              className={`${styles.input} ${styles.textarea}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What's this one about?"
              rows={7}
              autoFocus
            />
            <span className={styles.hint}>Markdown works: *italic*, **bold**, [link](https://…)</span>
          </div>

          {notes.trim() && (
            <div className={styles.field}>
              <span className={styles.label}>Preview</span>
              <div className={styles.preview}>
                <SongNotes notes={notes} />
              </div>
            </div>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!title.trim() || isSaving}
          >
            {isSaving && 'Saving…'}
            {!isSaving && 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
