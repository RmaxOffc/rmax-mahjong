import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletAPI } from '../api';
import { useAuthStore, useWalletStore } from '../store';
import './Wallet.css';

export default function Wallet() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const balance = useWalletStore((s) => s.balance);
  const setBalance = useWalletStore((s) => s.setBalance);

  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceRes, txRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions()
      ]);
      setBalance(balanceRes.data.balance);
      setTransactions(txRes.data.transactions);
    } catch (err) {
      console.error('Failed to fetch wallet data', err);
    }
  };

  const handleDeposit = async () => {
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      await walletAPI.deposit(parseInt(amount) * 100);
      alert('Deposit request submitted! Waiting for admin approval.');
      setAmount('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      await walletAPI.withdraw(parseInt(amount) * 100);
      alert('Withdrawal request submitted!');
      setAmount('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <button onClick={() => navigate('/game')} className="btn-back">← Back to Game</button>
        <h2>Wallet</h2>
        <span className="username">{user?.username}</span>
      </div>

      <div className="wallet-content">
        <div className="balance-card">
          <h3>Current Balance</h3>
          <div className="balance-amount">Rp {(balance / 100).toLocaleString('id-ID')}</div>
        </div>

        <div className="wallet-actions">
          <div className="action-card">
            <h4>Deposit / Withdraw</h4>
            <input
              type="number"
              placeholder="Amount (Rp)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={1}
            />
            <div className="action-buttons">
              <button onClick={handleDeposit} disabled={loading} className="btn-deposit">
                Deposit
              </button>
              <button onClick={handleWithdraw} disabled={loading} className="btn-withdraw">
                Withdraw
              </button>
            </div>
            <p className="info-text">Deposits & withdrawals require admin approval</p>
          </div>
        </div>

        <div className="transactions">
          <h3>Transaction History</h3>
          <div className="transaction-list">
            {transactions.length === 0 ? (
              <p className="empty">No transactions yet</p>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className={`transaction-item ${tx.type.toLowerCase()}`}>
                  <div className="tx-info">
                    <span className="tx-type">{tx.type}</span>
                    <span className="tx-date">{new Date(tx.createdAt).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="tx-amount">
                    {['DEPOSIT', 'WIN'].includes(tx.type) ? '+' : '-'}
                    Rp {(tx.amount / 100).toLocaleString('id-ID')}
                  </div>
                  <div className="tx-status">{tx.status}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
