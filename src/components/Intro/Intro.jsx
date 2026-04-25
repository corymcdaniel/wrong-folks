import styles from './Intro.module.scss';

export default function Intro() {
  return (
    <section className={styles.intro}>
      <div className={styles.divider} />
      <div className={styles.container}>
        <p className={styles.lead}>
          Fluid like the sap of a palo verde.
        </p>
      </div>
    </section>
  );
}
