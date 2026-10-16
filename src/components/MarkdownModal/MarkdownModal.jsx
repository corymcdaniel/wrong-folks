import { useEffect, useMemo } from 'react';
import { marked } from 'marked';
import styles from './MarkdownModal.module.scss';

// Content comes from markdown files in the repo, so rendering its HTML is safe
export default function MarkdownModal({ title, content, onClose }) {
  const html = useMemo(() => marked.parse(content), [content]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.heading}>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">&times;</button>
        </div>
        <div className={styles.body} dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}
