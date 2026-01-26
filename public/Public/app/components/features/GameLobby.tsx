"use client";
import { useState } from 'react';
import styles from './GameLobby.module.css';

interface OpenGame {
  gameId: number;
  creator: string;
  wager: string;
  timestamp: number;
}

interface GameLobbyProps {
  openGames: OpenGame[];
  onJoinGame: (gameId: number, wager: string) => void;
  onCreateGame: (wager: string) => void;
  loading?: boolean;
}

export default function GameLobby({
  openGames,
  onJoinGame,
  onCreateGame,
  loading = false
}: GameLobbyProps) {
  const [wagerAmount, setWagerAmount] = useState('0.01');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor(Date.now() / 1000) - timestamp;
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleCreateGame = () => {
    onCreateGame(wagerAmount);
    setShowCreateForm(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Game Lobby</h2>
        <button
          className={styles.createButton}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✕ Cancel' : '+ New Game'}
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.createForm}>
          <h3 className={styles.formTitle}>Create New Game</h3>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Wager Amount (ETH)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={wagerAmount}
              onChange={(e) => setWagerAmount(e.target.value)}
              className={styles.input}
              placeholder="0.01"
            />
          </div>
          <button
            className={styles.submitButton}
            onClick={handleCreateGame}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Open Game'}
          </button>
        </div>
      )}

      <div className={styles.gamesList}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading games...</p>
          </div>
        ) : openGames.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>♟</div>
            <p className={styles.emptyText}>No open games</p>
            <p className={styles.emptySubtext}>Create a new game to get started</p>
          </div>
        ) : (
          openGames.map((game) => (
            <div key={game.gameId} className={styles.gameCard}>
              <div className={styles.gameInfo}>
                <div className={styles.gameId}>Game #{game.gameId}</div>
                <div className={styles.gameCreator}>
                  <span className={styles.creatorLabel}>Created by:</span>
                  <span className={styles.creatorAddress}>{formatAddress(game.creator)}</span>
                </div>
                <div className={styles.gameMeta}>
                  <div className={styles.wager}>
                    <span className={styles.wagerIcon}>💰</span>
                    <span>{game.wager} ETH</span>
                  </div>
                  <div className={styles.time}>{formatTimeAgo(game.timestamp)}</div>
                </div>
              </div>
              <button
                className={styles.joinButton}
                onClick={() => onJoinGame(game.gameId, game.wager)}
                disabled={loading}
              >
                Join Game
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
