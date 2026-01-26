"use client";
import styles from './GameInfo.module.css';

interface GameInfoProps {
  whitePlayer: string;
  blackPlayer: string;
  isWhiteTurn: boolean;
  moveCount: number;
  wager?: string;
  timeRemaining?: number;
}

export default function GameInfo({
  whitePlayer,
  blackPlayer,
  isWhiteTurn,
  moveCount,
  wager,
  timeRemaining
}: GameInfoProps) {
  const formatAddress = (address: string) => {
    if (!address || address === '0x0000000000000000000000000000000000000000') return 'Waiting...';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return '--:--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.players}>
        <div className={`${styles.playerCard} ${!isWhiteTurn ? styles.active : ''}`}>
          <div className={styles.playerIcon}>♚</div>
          <div className={styles.playerInfo}>
            <div className={styles.playerLabel}>Black</div>
            <div className={styles.playerAddress}>{formatAddress(blackPlayer)}</div>
          </div>
        </div>

        <div className={styles.gameStats}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Move</div>
            <div className={styles.statValue}>{moveCount}</div>
          </div>
          {wager && (
            <div className={styles.stat}>
              <div className={styles.statLabel}>Wager</div>
              <div className={styles.statValue}>{wager} ETH</div>
            </div>
          )}
          {timeRemaining !== undefined && (
            <div className={styles.stat}>
              <div className={styles.statLabel}>Time</div>
              <div className={styles.statValue}>{formatTime(timeRemaining)}</div>
            </div>
          )}
        </div>

        <div className={`${styles.playerCard} ${isWhiteTurn ? styles.active : ''}`}>
          <div className={styles.playerIcon}>♔</div>
          <div className={styles.playerInfo}>
            <div className={styles.playerLabel}>White</div>
            <div className={styles.playerAddress}>{formatAddress(whitePlayer)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
