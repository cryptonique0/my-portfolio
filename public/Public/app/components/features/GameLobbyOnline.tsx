'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { useChessContract, OpenGame } from '../../hooks/useChessContractNew';
import styles from './GameLobbyOnline.module.css';

interface GameLobbyOnlineProps {
  onBack: () => void;
  onJoinGame: (gameId: number) => void;
}

export default function GameLobbyOnline({ onBack, onJoinGame }: GameLobbyOnlineProps) {
  const { address, isConnected } = useAccount();
  const { 
    createOpenGame, 
    createPrivateGame,
    joinGame,
    getOpenGames,
    loading: contractLoading,
    error: contractError
  } = useChessContract();

  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [openGames, setOpenGames] = useState<OpenGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create game form state
  const [gameType, setGameType] = useState<'open' | 'private'>('open');
  const [wagerAmount, setWagerAmount] = useState('0');
  const [opponentAddress, setOpponentAddress] = useState('');

  // Load open games
  const loadOpenGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const games = await getOpenGames();
      // Filter out user's own games and filled games
      const filteredGames = games.filter(
        (game) => game.creator.toLowerCase() !== address?.toLowerCase() && !game.filled
      );
      setOpenGames(filteredGames);
    } catch (err) {
      console.error('Error loading games:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to load open games';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [getOpenGames, address]);

  useEffect(() => {
    if (isConnected && activeTab === 'browse') {
      loadOpenGames();
    }
  }, [isConnected, activeTab, loadOpenGames]);

  const handleCreateGame = async () => {
    setError(null);
    try {
      let result;

      if (gameType === 'open') {
        result = await createOpenGame(wagerAmount || '0');
      } else {
        if (!opponentAddress || !/^0x[a-fA-F0-9]{40}$/.test(opponentAddress)) {
          setError('Please enter a valid opponent address');
          return;
        }
        result = await createPrivateGame(opponentAddress, wagerAmount || '0');
      }

      if (result.success) {
        // Refresh the games list
        loadOpenGames();
        setActiveTab('browse');
      } else {
        setError(result.error || 'Failed to create game');
      }
    } catch (err) {
      console.error('Error creating game:', err);
      setError('Failed to create game. Make sure you have enough funds.');
    }
  };

  const handleJoinGame = async (gameId: number, wager: string) => {
    setError(null);
    try {
      const result = await joinGame(gameId, wager);
      if (result.success) {
        onJoinGame(gameId);
      } else {
        setError(result.error || 'Failed to join game');
      }
    } catch (err) {
      console.error('Error joining game:', err);
      setError('Failed to join game. Make sure you have enough funds.');
    }
  };

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={onBack}>
            ← Back
          </button>
          <h1 className={styles.title}>Online Chess</h1>
          <div />
        </div>
        <div className={styles.connectPrompt}>
          <h2>Connect Your Wallet</h2>
          <p>Connect your wallet to play on-chain chess against other players.</p>
          <p className={styles.hint}>Use the wallet button in the header to connect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
        <h1 className={styles.title}>Online Chess</h1>
        <div className={styles.walletInfo}>
          {shortenAddress(address || '')}
        </div>
      </div>

      {(error || contractError) && (
        <div className={styles.error}>
          {error || contractError}
        </div>
      )}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'browse' ? styles.active : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse Games
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'create' ? styles.active : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Create Game
        </button>
      </div>

      {activeTab === 'browse' ? (
        <div className={styles.browseSection}>
          <div className={styles.sectionHeader}>
            <h2>Open Games</h2>
            <button 
              className={styles.refreshBtn} 
              onClick={loadOpenGames}
              disabled={loading}
            >
              {loading ? 'Loading...' : '↻ Refresh'}
            </button>
          </div>

          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading games...</p>
            </div>
          ) : openGames.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>♟</div>
              <h3>No Open Games</h3>
              <p>Be the first to create a game!</p>
              <button
                className={styles.createCta}
                onClick={() => setActiveTab('create')}
              >
                Create Game
              </button>
            </div>
          ) : (
            <div className={styles.gamesList}>
              {openGames.map((game) => (
                <div key={game.gameId} className={styles.gameCard}>
                  <div className={styles.gameInfo}>
                    <div className={styles.gameCreator}>
                      <span className={styles.label}>Created by</span>
                      <span className={styles.address}>{shortenAddress(game.creator)}</span>
                    </div>
                    <div className={styles.gameWager}>
                      <span className={styles.label}>Wager</span>
                      <span className={styles.wagerAmount}>
                        {game.wager} ETH
                      </span>
                    </div>
                  </div>
                  <button
                    className={styles.joinBtn}
                    onClick={() => handleJoinGame(game.gameId, game.wager)}
                    disabled={contractLoading}
                  >
                    {contractLoading ? 'Joining...' : 'Join Game'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.createSection}>
          <h2>Create New Game</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Game Type</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="gameType"
                  checked={gameType === 'open'}
                  onChange={() => setGameType('open')}
                />
                <span className={styles.radioText}>
                  <strong>Open Game</strong>
                  <small>Anyone can join</small>
                </span>
              </label>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="gameType"
                  checked={gameType === 'private'}
                  onChange={() => setGameType('private')}
                />
                <span className={styles.radioText}>
                  <strong>Private Game</strong>
                  <small>Invite specific player</small>
                </span>
              </label>
            </div>
          </div>

          {gameType === 'private' && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Opponent Address</label>
              <input
                type="text"
                className={styles.input}
                placeholder="0x..."
                value={opponentAddress}
                onChange={(e) => setOpponentAddress(e.target.value)}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>Wager Amount (ETH)</label>
            <input
              type="number"
              className={styles.input}
              placeholder="0.0"
              min="0"
              step="0.001"
              value={wagerAmount}
              onChange={(e) => setWagerAmount(e.target.value)}
            />
            <span className={styles.hint}>
              Leave at 0 for a free game. Both players must match the wager.
            </span>
          </div>

          <button
            className={styles.createBtn}
            onClick={handleCreateGame}
            disabled={contractLoading}
          >
            {contractLoading ? (
              <>Creating...</>
            ) : (
              <>
                Create Game
                {parseFloat(wagerAmount) > 0 && (
                  <span className={styles.wagerNote}>
                    + {wagerAmount} ETH
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
