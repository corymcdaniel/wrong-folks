import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './UploadModal.module.scss';

const MAX_BYTES = 6 * 1024 * 1024;

function getDuration(file) {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.addEventListener('loadedmetadata', () => {
      resolve(Math.round(audio.duration));
      URL.revokeObjectURL(url);
    });
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve(null);
    });
    audio.src = url;
  });
}

export default function UploadModal({ onClose, onSuccess }) {
  const { token } = useAuth();
  const [title, setTitle]       = useState('');
  const [file, setFile]         = useState(null);
  const [isDragging, setDrag]   = useState(false);
  const [isUploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const fileRef = useRef(null);

  const setFileAndTitle = (f) => {
    setFile(f);
    if (!title) {
      const raw = f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(raw.replace(/^wrong folks[\s\-–—:,]+/i, '').trim() || raw);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type.startsWith('audio/')) setFileAndTitle(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    if (file.size > MAX_BYTES) {
      setError('File must be under 6 MB. Use a compressed MP3.');
      return;
    }

    setUploading(true);
    setError('');

    const duration = await getDuration(file);
    const form = new FormData();
    form.append('file', file);
    form.append('title', title.trim());
    if (duration != null) form.append('duration', String(duration));

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new Error('Upload failed');
      const song = await res.json();
      onSuccess(song);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Add Song</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div
            className={`${styles.drop} ${isDragging ? styles.dragging : ''} ${file ? styles.filled : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className={styles.fileInput}
              onChange={(e) => { const f = e.target.files[0]; if (f) setFileAndTitle(f); }}
            />
            {file
              ? <span className={styles.fileName}>{file.name}</span>
              : <span className={styles.dropHint}>Drop audio file or click to browse</span>
            }
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="upload-title">Title</label>
            <input
              id="upload-title"
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Song title"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!file || !title.trim() || isUploading}
          >
            {isUploading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
