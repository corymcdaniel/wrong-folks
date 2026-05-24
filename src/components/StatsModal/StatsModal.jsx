import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './StatsModal.module.scss';

const formatDuration = (totalSeconds) => {
  const s = Math.round(totalSeconds);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return `${m}m ${rem}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
};

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString();
};

export default function StatsModal({ onClose }) {
  const { token } = useAuth();
  const [data, setData]       = useState(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error(r.status === 401 ? 'Unauthorized' : 'Failed');
        return r.json();
      })
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Listening Stats</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">&times;</button>
        </div>

        <div className={styles.body}>
          {loading && <p className={styles.muted}>Loading…</p>}
          {error   && <p className={styles.error}>{error}</p>}

          {data && (
            <>
              <div className={styles.totals}>
                <div className={styles.totalCell}>
                  <span className={styles.totalLabel}>Plays</span>
                  <span className={styles.totalValue}>{data.totals.plays}</span>
                </div>
                <div className={styles.totalCell}>
                  <span className={styles.totalLabel}>Listened</span>
                  <span className={styles.totalValue}>{formatDuration(data.totals.listenedSeconds)}</span>
                </div>
                <div className={styles.totalCell}>
                  <span className={styles.totalLabel}>Completes</span>
                  <span className={styles.totalValue}>{data.totals.completes}</span>
                </div>
              </div>

              {data.songs.length === 0 ? (
                <p className={styles.muted}>No plays recorded yet.</p>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Song</th>
                      <th className={styles.num}>Plays</th>
                      <th className={styles.num}>Listened</th>
                      <th className={styles.num}>Avg</th>
                      <th className={styles.num}>Completes</th>
                      <th>Last</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.songs.map((s) => {
                      const avg = s.plays > 0 ? s.listenedSeconds / s.plays : 0;
                      return (
                        <tr key={s.songId}>
                          <td className={styles.title}>{s.title}</td>
                          <td className={styles.num}>{s.plays}</td>
                          <td className={styles.num}>{formatDuration(s.listenedSeconds)}</td>
                          <td className={styles.num}>{formatDuration(avg)}</td>
                          <td className={styles.num}>{s.completes}</td>
                          <td className={styles.dim}>{formatDate(s.lastPlayedAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
