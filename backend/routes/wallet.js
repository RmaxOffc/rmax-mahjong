import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get wallet balance
router.get('/', authenticate, async (req, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id }
    });

    res.json({ balance: wallet.balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Deposit (manual approval by admin)
router.post('/deposit', authenticate, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        type: 'DEPOSIT',
        amount: parseInt(amount),
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance,
        status: 'PENDING',
        note: 'Awaiting admin approval'
      }
    });

    res.json({ transaction, message: 'Deposit request submitted, waiting for approval' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Deposit request failed' });
  }
});

// Withdraw (manual approval by admin)
router.post('/withdraw', authenticate, async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });

    if (wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user.id,
        type: 'WITHDRAW',
        amount: parseInt(amount),
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance,
        status: 'PENDING',
        note: 'Awaiting admin approval'
      }
    });

    res.json({ transaction, message: 'Withdrawal request submitted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Withdrawal request failed' });
  }
});

// Transaction history
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
