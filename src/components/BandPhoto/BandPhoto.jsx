import bandPhoto from '../../images/20231224_132745.jpg';
import styles from './BandPhoto.module.scss';

export default function BandPhoto() {
  return (
    <div className={styles.wrap}>
      <img src={bandPhoto} alt="Wrong Folks" className={styles.photo} />
    </div>
  );
}
