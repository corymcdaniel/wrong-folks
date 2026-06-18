import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './PolaroidStack.module.scss';

// Pull every polaroid in at build time, sorted by filename for stable order.
const modules = import.meta.glob('../../images/poloroids/*.{jpg,jpeg,png}', { eager: true });
const photos = Object.keys(modules)
  .sort()
  .map((key) => modules[key].default);

const VISIBLE = 4;           // how many cards are rendered in the pile at once
const AUTO_MS = 3600;        // auto-advance cadence
const DRAG_THRESHOLD = 90;   // px of drag needed to flick the top card away

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function PolaroidStack() {
  const [stack, setStack] = useState(() => photos.map((_, i) => i));
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

  const cardClass = (pos) => {
    const classes = [styles.card, styles[`pos${pos}`]];
    if (pos === 0 && dragging) classes.push(styles.dragging);
    if (pos === 0 && leaving === 'left') classes.push(styles.leavingLeft);
    if (pos === 0 && leaving === 'right') classes.push(styles.leavingRight);
    return cx(...classes);
  };

  if (photos.length === 0) return null;

  return (
    <section className={cx(styles.section, (hovering || dragging) && styles.paused)}>
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
          <div
            key={photoIdx}
            ref={pos === 0 ? topRef : null}
            className={cardClass(pos)}
            onAnimationEnd={pos === 0 ? handleAnimationEnd : undefined}
          >
            <div className={styles.inner}>
              <div className={styles.frame}>
                <div className={styles.imgWrap}>
                  <img
                    src={photos[photoIdx]}
                    alt=""
                    className={styles.img}
                    draggable={false}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className={styles.hint}>drag to shuffle</p>
    </section>
  );
}
