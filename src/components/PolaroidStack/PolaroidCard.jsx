import { forwardRef, useCallback } from 'react';
import styles from './PolaroidCard.module.scss';

function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * A single polaroid in the pile. Position-aware (pos 0 is the top, draggable
 * card) but otherwise self-contained — all of its styling and animation lives
 * in PolaroidCard.module.scss. The forwarded ref points at the outer card
 * element so the parent can drive --drag-x / --drag-rot during a drag.
 */
const PolaroidCard = forwardRef(function PolaroidCard(
  { src, pos, jitter, dragging, leaving, paused, onAnimationEnd },
  ref
) {
  const isTop = pos === 0;
  const classes = [styles.card, styles[`pos${pos}`]];
  if (isTop && paused) classes.push(styles.paused);
  if (isTop && dragging) classes.push(styles.dragging);
  if (isTop && leaving === 'left') classes.push(styles.leavingLeft);
  if (isTop && leaving === 'right') classes.push(styles.leavingRight);

  // Forward the node to the parent (for drag vars) and stamp this card's
  // personal jitter onto it as CSS variables the stylesheet reads.
  const setRef = useCallback(
    (el) => {
      if (typeof ref === 'function') ref(el);
      else if (ref) ref.current = el;
      if (el && jitter) {
        el.style.setProperty('--jx', `${jitter.x}px`);
        el.style.setProperty('--jy', `${jitter.y}px`);
        el.style.setProperty('--jr', `${jitter.r}deg`);
      }
    },
    [ref, jitter]
  );

  return (
    <div ref={setRef} className={cx(...classes)} onAnimationEnd={onAnimationEnd}>
      <div className={styles.inner}>
        <div className={styles.frame}>
          <div className={styles.imgWrap}>
            <img src={src} alt="" className={styles.img} draggable={false} />
          </div>
        </div>
      </div>
    </div>
  );
});

export default PolaroidCard;
