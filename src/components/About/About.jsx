import styles from './About.module.scss';

export default function About() {
  return (
    <section className={styles.about} id="about">
      <div className={styles.container}>
        <h2 className={styles.heading}>About</h2>
        <p className={styles.lead}>
          Wrong Folks is a project led by <a href="https://www.corymcdaniel.com" target="_blank" rel="noopener noreferrer">Cory McDaniel</a>.
        </p>
        <p className={styles.text}>It is a collaboration with others, whether
          public recordings of nature and/or unique places as backdrop, or with fellow musicians.
          Based in Phoenix, Arizona, the long hot summers influence brooding in dark shade with
          a hope that there can be comfort found somewhere.
        </p>
        <p className={styles.text}>
          Limerance is the first compiled work and features field recording from Phoenix to as far as
          Ireland forests and Amsterdam canals. Considered outsider, likely brown music, but let the
          soundscapes and tracks take you somewhere, anywhere but here.
        </p>
      </div>
    </section>
  );
}
