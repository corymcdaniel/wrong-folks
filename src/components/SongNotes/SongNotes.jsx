import { useState, useEffect, useMemo, useRef } from 'react';
import { renderNotes } from '../../utils/notesMarkdown';
import styles from './SongNotes.module.scss';

// Notes under a song title: clamped to two lines, with "more" to show the rest.
// Clicks inside are kept from bubbling up so they don't start the song.
export default function SongNotes({ notes }) {
  const html = useMemo(() => renderNotes(notes), [notes]);
  const bodyRef = useRef(null);
  const [isExpanded, setExpanded] = useState(false);
  const [isClamped, setClamped]   = useState(false);

  // Only show "more" when the text actually runs past two lines. A
  // ResizeObserver re-checks when the layout width changes.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el || isExpanded) return undefined;

    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, [html, isExpanded]);

  const toggle = (e) => {
    e.stopPropagation();
    setExpanded((v) => !v);
  };

  const bodyClass = [
    styles.body,
    isExpanded ? styles.expanded : styles.collapsed,
  ].join(' ');

  return (
    <div
      className={styles.notes}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div
        ref={bodyRef}
        className={bodyClass}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {(isClamped || isExpanded) && (
        <button
          type="button"
          className={styles.toggle}
          onClick={toggle}
          aria-expanded={isExpanded}
        >
          {isExpanded && 'less'}
          {!isExpanded && 'more'}
        </button>
      )}
    </div>
  );
}
