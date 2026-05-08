import bandPhoto from '../../images/20251129_153346.jpg';
import styles from './BandPhoto.module.scss';

export default function BandPhoto() {
  return (
    <div className={styles.wrap}>
      <img src={bandPhoto} alt="Wrong Folk" className={styles.photo} />
    </div>
  );
}
