import styles from './Intro.module.scss';

export default function Intro() {
  return (
    <section className={styles.intro}>
      <div className={styles.divider} />
      <div className={styles.container}>
        <p className={styles.lead}>
          There was a dream here.
          <br />
          Strong but doubtful at the end.
          <br />
          Drips like palo verde sap.
        </p>
      </div>
    </section>
  );
}
