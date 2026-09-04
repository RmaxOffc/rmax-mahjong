import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import { gameAPI, walletAPI } from '../api';
import { useAuthStore, useWalletStore, useGameStore } from '../store';
import MahjongScene from '../game/MahjongScene';
import './Game.css';

export default function Game() {
  const gameRef = useRef(null);
  const phaserGameRef = useRef(null);
  const navigate = useNavigate();
  
  const user = useAuthStore((s) => s.user);
  const balance = useWalletStore((s) => s.balance);
  const setBalance = useWalletStore((s) => s.setBalance);
  const currentGame = useGameStore((s) => s.currentGame);
  const setCurrentGame = useGameStore((s) => s.setCurrentGame);

  const [betAmount, setBetAmount] = useState(1000);
  const [showBetModal, setShowBetModal] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await walletAPI.getBalance();
      setBalance(res.data.balance);
    } catch (err) {
      console.error('Failed to fetch balance', err);
    }
  };

  const startGame = async () => {
    if (betAmount > balance) {
      alert('Saldo tidak cukup!');
      return;
    }

    setLoading(true);
    try {
      const res = await gameAPI.start(betAmount);
      setCurrentGame(res.data.game);
      setBalance(res.data.balance);
      setShowBetModal(false);
      initPhaserGame(res.data.game);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const initPhaserGame = (game) => {
    if (phaserGameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 1200,
      height: 800,
      backgroundColor: '#1a5f3e',
      scene: [MahjongScene],
      physics: {
        default: 'arcade',
        arcade: { debug: false }
      }
    };

    const phaserGame = new Phaser.Game(config);
    phaserGameRef.current = phaserGame;

    // Pass game end callback
    phaserGame.events.on('game-end', async (result) => {
      await endGame(result);
    });
  };

  const endGame = async (result) => {
    try {
      const res = await gameAPI.end(currentGame.id, result.status, result.winAmount);
      setBalance(res.data.balance);
      setCurrentGame(null);
      setShowBetModal(true);
      
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    } catch (err) {
      console.error('Failed to end game', err);
    }
  };

  const logout = () => {
    useAuthStore.getState().logout();
    navigate('/');
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="header-left">
          <h2>RMAX MAHJONG</h2>
          <span className="username">Player: {user?.username}</span>
        </div>
        <div className="header-right">
          <div className="balance">
            <span className="label">Balance:</span>
            <span className="amount">Rp {(balance / 100).toLocaleString('id-ID')}</span>
          </div>
          <button onClick={() => navigate('/wallet')} className="btn-wallet">Wallet</button>
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </div>

      {showBetModal && (
        <div className="bet-modal-overlay">
          <div className="bet-modal">
            <h3>Place Your Bet</h3>
            <div className="bet-input">
              <label>Bet Amount (Rp)</label>
              <input
                type="number"
                value={betAmount / 100}
                onChange={(e) => setBetAmount(parseInt(e.target.value) * 100)}
                min={100}
                step={100}
              />
            </div>
            <div className="bet-presets">
              <button onClick={() => setBetAmount(1000)}>Rp 10</button>
              <button onClick={() => setBetAmount(5000)}>Rp 50</button>
              <button onClick={() => setBetAmount(10000)}>Rp 100</button>
              <button onClick={() => setBetAmount(50000)}>Rp 500</button>
            </div>
            <button 
              onClick={startGame} 
              disabled={loading || betAmount > balance}
              className="btn-start"
            >
              {loading ? 'Starting...' : 'Start Game'}
            </button>
            <p className="balance-info">Your balance: Rp {(balance / 100).toLocaleString('id-ID')}</p>
          </div>
        </div>
      )}

      <div ref={gameRef} className="phaser-container"></div>
    </div>
  );
}
