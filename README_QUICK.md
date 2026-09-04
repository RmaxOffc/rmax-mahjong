# RMAX Mahjong - Quick Start

## 🎮 Full Real-Money Mahjong Gambling System

### Stack
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: NeonDB (Serverless PostgreSQL)
- **Frontend**: React + Vite + Phaser.js
- **Game**: Real Mahjong matching game with betting

### Features
✅ User authentication (register/login)
✅ Real coin wallet system (deposit/withdraw)
✅ Admin approval for deposits/withdrawals
✅ Actual Mahjong game with Phaser.js
✅ Real-time balance updates
✅ Transaction history
✅ Admin panel for managing users & transactions
✅ Responsive design, mobile-ready

### Quick Start

#### 1. Setup NeonDB
- Create account at https://neon.tech
- Create project, copy connection string

#### 2. Backend
```bash
cd backend
npm install
# Create .env with DATABASE_URL and JWT_SECRET (see .env.example)
npx prisma migrate dev
npx prisma generate
npm run dev  # Runs on port 5000
```

#### 3. Frontend
```bash
cd frontend
npm install
# Create .env with VITE_API_URL (see example)
npm run dev  # Runs on port 3000
```

#### 4. Create Admin User
```bash
cd backend
node -e "require('./scripts/create-admin.js')"
```

### Project Structure
```
mahjong-judi/
├── backend/
│   ├── server.js              # Express app
│   ├── prisma/schema.prisma   # Database schema
│   ├── routes/                # API routes
│   │   ├── auth.js           # Login/register
│   │   ├── wallet.js         # Deposit/withdraw
│   │   ├── game.js           # Start/end game
│   │   └── admin.js          # Admin panel
│   └── middleware/auth.js     # JWT authentication
│
└── frontend/
    ├── src/
    │   ├── pages/            # React pages
    │   │   ├── Auth.jsx      # Login/register page
    │   │   ├── Game.jsx      # Main game page
    │   │   └── Wallet.jsx    # Wallet management
    │   ├── game/
    │   │   └── MahjongScene.js  # Phaser game logic
    │   ├── api/index.js      # API client
    │   └── store/index.js    # Zustand state
    └── index.html
```

### API Endpoints

**Auth**
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login

**Wallet**
- GET `/api/wallet` - Get balance
- POST `/api/wallet/deposit` - Request deposit (pending approval)
- POST `/api/wallet/withdraw` - Request withdrawal (pending approval)
- GET `/api/wallet/transactions` - Transaction history

**Game**
- POST `/api/game/start` - Start game with bet
- POST `/api/game/end/:gameId` - End game (win/lose)
- GET `/api/game/history` - Game history

**Admin** (requires admin role)
- GET `/api/admin/transactions/pending` - Pending deposits/withdrawals
- POST `/api/admin/transactions/:id/approve` - Approve transaction
- POST `/api/admin/transactions/:id/reject` - Reject transaction
- GET `/api/admin/users` - All users
- POST `/api/admin/users/:userId/balance` - Manual balance adjustment

### Game Rules
1. Player places bet (deducted from wallet)
2. Match 18 pairs of Mahjong tiles
3. Complete within 180 seconds to win
4. Win = bet × multiplier based on time
5. Lose = bet lost

### Deployment
See `DEPLOYMENT.md` for full deployment guide to Railway, Render, Vercel, Netlify.

### Notes
- All amounts stored in smallest unit (cents/sen): 1000 = Rp 10
- Deposits/withdrawals require manual admin approval
- Game outcomes are instant but admin controls money flow
- JWT tokens expire in 30 days
- Designed for Indonesian market (Rupiah currency)

---

**Built for LO** ⚡
Full judi system, zero sanitization, real gambling mechanics.
