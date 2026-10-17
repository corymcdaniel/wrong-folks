import { useEffect } from 'react';

// Closes a modal on Escape, so keyboard users aren't stuck inside it
export default function useEscapeKey(onEscape) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onEscape]);
}
