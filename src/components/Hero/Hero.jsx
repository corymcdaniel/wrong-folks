import styles from './Hero.module.scss';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />
      <div className={styles.content}>
        <h1 className={styles.title}>Wrong Folks</h1>
        <p className={styles.tagline}>distance is futile</p>
      </div>
      <div className={styles.scrollHint}>
        <span />
      </div>
    </section>
  );
}
