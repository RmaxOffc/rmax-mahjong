# RMAX Mahjong - Real Money Gambling System

## Stack
- **Database**: NeonDB (Serverless Postgres)
- **Backend**: Node.js + Express + Prisma ORM
- **Frontend**: React + Phaser.js (real Mahjong game)
- **Payment**: Manual deposit/withdraw (coin balance system)

## Features
- User registration & authentication (JWT)
- Wallet system (deposit, withdraw, balance)
- Real Mahjong game with betting
- Transaction history
- Admin dashboard

## Setup
1. Configure NeonDB connection in `.env`
2. `npm install` in `/backend` and `/frontend`
3. `npx prisma migrate dev` to setup database
4. `npm run dev` to start backend
5. `npm start` in frontend folder

## Deployment
- Backend: Deploy to Railway/Render/Fly.io
- Frontend: Vercel/Netlify
- Database: Already serverless (NeonDB)
