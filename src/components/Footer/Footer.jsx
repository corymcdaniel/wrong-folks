import { useAuth } from '../../contexts/AuthContext';
import styles from './Footer.module.scss';

export default function Footer({ onLoginClick }) {
  const { isAdmin, logout } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <span className={styles.copy}>&copy; {year} Wrong Folk</span>
      <div className={styles.right}>
        {isAdmin ? (
          <button className={styles.authBtn} onClick={logout}>Log out</button>
        ) : (
          <button className={styles.authBtn} onClick={onLoginClick}>Login</button>
        )}
      </div>
    </footer>
  );
}
