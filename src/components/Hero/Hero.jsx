import styles from './Hero.module.scss';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>Wrong Folks</h1>
        <p className={styles.tagline}>l i m e r e n c e</p>
      </div>
      <div className={styles.scrollHint}>
        <span />
      </div>
    </section>
  );
}
