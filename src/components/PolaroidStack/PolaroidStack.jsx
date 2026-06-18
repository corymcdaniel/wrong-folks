import { useState, useEffect, useRef, useCallback } from 'react';
import PolaroidCard from './PolaroidCard';
import styles from './PolaroidStack.module.scss';

// Pull every polaroid in at build time, sorted by filename for stable order.
const modules = import.meta.glob('../../images/poloroids/*.{jpg,jpeg,png}', { eager: true });
const photos = Object.keys(modules)
  .sort()
  .map((key) => modules[key].default);

const VISIBLE = 4;           // how many cards are rendered in the pile at once
const AUTO_MS = 3600;        // auto-advance cadence
const DRAG_THRESHOLD = 90;   // px of drag needed to flick the top card away

// Fisher–Yates: deal the polaroids in a fresh random order on each load.
function shuffledIndices() {
  const order = photos.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// A small, persistent position/tilt offset per photo so no two cards sit
// exactly on their slot's base transform — keeps the pile looking hand-stacked.
function makeJitter() {
  return photos.map(() => ({
    x: Math.round((Math.random() - 0.5) * 12), // ±6px
    y: Math.round((Math.random() - 0.5) * 12), // ±6px
    r: Number(((Math.random() - 0.5) * 6).toFixed(2)), // ±3deg
  }));
}

export default function PolaroidStack() {
  const [stack, setStack] = useState(shuffledIndices);
  const [jitter] = useState(makeJitter);
  const [leaving, setLeaving] = useState(null); // null | 'left' | 'right'
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);

  const topRef = useRef(null);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);
  const dragXRef = useRef(0);

  const startAdvance = useCallback((dir) => {
    setLeaving((current) => current || dir);
  }, []);

  // Auto-advance — the only timer, paused whenever the user is interacting.
  useEffect(() => {
    if (hovering || dragging || leaving || photos.length < 2) {
      return undefined;
    }
    const id = setInterval(() => startAdvance('right'), AUTO_MS);
    return () => clearInterval(id);
  }, [hovering, dragging, leaving, startAdvance]);

  const resetDragVars = () => {
    const el = topRef.current;
    if (!el) return;
    el.style.setProperty('--drag-x', '0px');
    el.style.setProperty('--drag-rot', '0deg');
  };

  // Fired by the flick-off animation finishing; rotate the top card to the back.
  const handleAnimationEnd = () => {
    if (!leaving) return;
    setStack((prev) => {
      const next = prev.slice();
      next.push(next.shift());
      return next;
    });
    setLeaving(null);
    resetDragVars();
  };

  const onPointerDown = (e) => {
    if (leaving) return;
    draggingRef.current = true;
    startXRef.current = e.clientX;
    dragXRef.current = 0;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!draggingRef.current || !topRef.current) return;
    const dx = e.clientX - startXRef.current;
    dragXRef.current = dx;
    topRef.current.style.setProperty('--drag-x', `${dx}px`);
    topRef.current.style.setProperty('--drag-rot', `${dx * 0.04}deg`);
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);

    const dx = dragXRef.current;
    if (Math.abs(dx) > DRAG_THRESHOLD) {
      let dir = 'right';
      if (dx < 0) dir = 'left';
      startAdvance(dir);
    } else {
      resetDragVars();
    }
  };

  if (photos.length === 0) return null;

  return (
    <section className={styles.section}>
      <p className={styles.kicker}>dreaming?</p>

      <div
        className={styles.stage}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {stack.slice(0, VISIBLE).map((photoIdx, pos) => (
          <PolaroidCard
            key={photoIdx}
            ref={pos === 0 ? topRef : null}
            src={photos[photoIdx]}
            pos={pos}
            jitter={jitter[photoIdx]}
            dragging={dragging}
            leaving={leaving}
            paused={hovering || dragging}
            onAnimationEnd={handleAnimationEnd}
          />
        ))}
      </div>

      <p className={styles.hint}>does it matter?</p>
    </section>
  );
}
