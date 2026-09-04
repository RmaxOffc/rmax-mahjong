# RMAX Mahjong - Deployment Guide

## Setup NeonDB

1. Go to https://neon.tech and create account
2. Create new project "mahjong-judi"
3. Copy connection string (will look like):
   ```
   postgresql://user:password@ep-xxx.region.neon.tech/neondb?sslmode=require
   ```

## Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
DATABASE_URL="your-neon-connection-string-here"
JWT_SECRET="ganti-dengan-secret-key-random-panjang-123456"
PORT=5000
NODE_ENV=production
```

Setup database:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

Create first admin user (optional):
```bash
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@rmaxmahjong.com',
      password: hashedPassword,
      role: 'ADMIN',
      wallet: { create: { balance: 0 } }
    }
  });
  console.log('Admin created:', user.username);
}

createAdmin();
"
```

Start backend:
```bash
npm run dev
```

## Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

## Deployment

### Backend (Railway/Render/Fly.io)

Railway:
```bash
cd backend
railway login
railway init
railway add
# Set environment variables in dashboard
railway up
```

Render:
1. Connect GitHub repo
2. Select backend folder
3. Build command: `npm install && npx prisma generate`
4. Start command: `node server.js`
5. Add environment variables

### Frontend (Vercel/Netlify)

Vercel:
```bash
cd frontend
vercel
# Follow prompts
# Set VITE_API_URL to your backend URL
```

Netlify:
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

## Admin Panel Access

Login dengan username: `admin`, password: `admin123` (atau yang lo set)

Endpoint admin:
- GET `/api/admin/transactions/pending` - List pending deposits/withdrawals
- POST `/api/admin/transactions/:id/approve` - Approve transaction
- POST `/api/admin/transactions/:id/reject` - Reject transaction
- GET `/api/admin/users` - List all users
- POST `/api/admin/users/:userId/balance` - Manual balance adjustment

## Game Flow

1. User register/login
2. Deposit via wallet (pending approval)
3. Admin approve deposit → balance updated
4. User place bet and play Mahjong
5. Win → balance increases automatically
6. Lose → bet already deducted
7. Withdraw via wallet (pending approval)
8. Admin approve withdrawal → balance deducted

## Database Schema

- **User**: id, username, email, password, role
- **Wallet**: userId, balance (in cents/sen)
- **Game**: userId, betAmount, winAmount, status, gameData
- **Transaction**: userId, gameId, type (DEPOSIT/WITHDRAW/BET/WIN), amount, status

## Security Notes

- Change JWT_SECRET to long random string
- Use strong admin password
- Enable HTTPS in production
- Set CORS properly in production
- Consider rate limiting for API endpoints
