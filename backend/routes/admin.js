import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authenticate, adminOnly);

// Get all pending transactions
router.get('/transactions/pending', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { status: 'PENDING' },
      include: { user: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Approve/reject transaction
router.post('/transactions/:id/:action', async (req, res) => {
  const { id, action } = req.params;

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  try {
    const transaction = await prisma.transaction.findUnique({ where: { id } });

    if (!transaction || transaction.status !== 'PENDING') {
      return res.status(404).json({ error: 'Transaction not found or already processed' });
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId: transaction.userId } });

    if (action === 'approve') {
      let newBalance = wallet.balance;

      if (transaction.type === 'DEPOSIT') {
        newBalance = wallet.balance + transaction.amount;
      } else if (transaction.type === 'WITHDRAW') {
        if (wallet.balance < transaction.amount) {
          return res.status(400).json({ error: 'User has insufficient balance' });
        }
        newBalance = wallet.balance - transaction.amount;
      }

      await prisma.wallet.update({
        where: { userId: transaction.userId },
        data: { balance: newBalance }
      });

      await prisma.transaction.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          balanceAfter: newBalance,
          note: 'Approved by admin'
        }
      });

      res.json({ message: 'Transaction approved', newBalance });
    } else {
      await prisma.transaction.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          note: 'Rejected by admin'
        }
      });

      res.json({ message: 'Transaction rejected' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process transaction' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        wallet: { select: { balance: true } }
      }
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user balance (manual adjustment)
router.post('/users/:userId/balance', async (req, res) => {
  const { userId } = req.params;
  const { amount, note } = req.body;

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId } });

    if (!wallet) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newBalance = wallet.balance + parseInt(amount);

    await prisma.wallet.update({
      where: { userId },
      data: { balance: newBalance }
    });

    await prisma.transaction.create({
      data: {
        userId,
        type: amount > 0 ? 'DEPOSIT' : 'WITHDRAW',
        amount: Math.abs(parseInt(amount)),
        balanceBefore: wallet.balance,
        balanceAfter: newBalance,
        status: 'COMPLETED',
        note: note || 'Manual adjustment by admin'
      }
    });

    res.json({ message: 'Balance updated', newBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update balance' });
  }
});

export default router;
