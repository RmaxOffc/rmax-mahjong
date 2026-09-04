import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Start new game
router.post('/start', authenticate, async (req, res) => {
  const { betAmount } = req.body;

  if (!betAmount || betAmount <= 0) {
    return res.status(400).json({ error: 'Invalid bet amount' });
  }

  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });

    if (wallet.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Deduct bet from wallet
    const newBalance = wallet.balance - parseInt(betAmount);
    await prisma.wallet.update({
      where: { userId: req.user.id },
      data: { balance: newBalance }
    });

    // Create game
    const game = await prisma.game.create({
      data: {
        userId: req.user.id,
        betAmount: parseInt(betAmount),
        status: 'IN_PROGRESS'
      }
    });

    // Record bet transaction
    await prisma.transaction.create({
      data: {
        userId: req.user.id,
        gameId: game.id,
        type: 'BET',
        amount: parseInt(betAmount),
        balanceBefore: wallet.balance,
        balanceAfter: newBalance,
        status: 'COMPLETED'
      }
    });

    res.json({ game, balance: newBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start game' });
  }
});

// End game (win/lose)
router.post('/end/:gameId', authenticate, async (req, res) => {
  const { gameId } = req.params;
  const { status, winAmount } = req.body; // status: WON, LOST, DRAW

  if (!['WON', 'LOST', 'DRAW'].includes(status)) {
    return res.status(400).json({ error: 'Invalid game status' });
  }

  try {
    const game = await prisma.game.findFirst({
      where: { id: gameId, userId: req.user.id, status: 'IN_PROGRESS' }
    });

    if (!game) {
      return res.status(404).json({ error: 'Game not found or already ended' });
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
    let newBalance = wallet.balance;
    const finalWinAmount = parseInt(winAmount) || 0;

    // Update wallet if win
    if (status === 'WON' && finalWinAmount > 0) {
      newBalance = wallet.balance + finalWinAmount;
      await prisma.wallet.update({
        where: { userId: req.user.id },
        data: { balance: newBalance }
      });

      // Record win transaction
      await prisma.transaction.create({
        data: {
          userId: req.user.id,
          gameId: game.id,
          type: 'WIN',
          amount: finalWinAmount,
          balanceBefore: wallet.balance,
          balanceAfter: newBalance,
          status: 'COMPLETED'
        }
      });
    }

    // Update game
    await prisma.game.update({
      where: { id: gameId },
      data: {
        status,
        winAmount: finalWinAmount,
        endedAt: new Date()
      }
    });

    res.json({ game: { id: gameId, status, winAmount: finalWinAmount }, balance: newBalance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to end game' });
  }
});

// Get game history
router.get('/history', authenticate, async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    res.json({ games });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch game history' });
  }
});

export default router;
