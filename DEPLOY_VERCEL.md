# Deploy RMAX Mahjong ke Vercel + Railway

## ⚠️ PENTING
Vercel cuma bisa host **frontend** (static files). Backend butuh Railway/Render karena Express perlu Node.js server jalan terus.

## Setup: Frontend di Vercel, Backend di Railway

### 1️⃣ Deploy Backend ke Railway (GRATIS)

**Setup Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy backend
cd backend
railway init
railway up
```

**Set Environment Variables di Railway Dashboard:**
- `DATABASE_URL` = your NeonDB connection string
- `JWT_SECRET` = random string panjang (min 32 char)
- `NODE_ENV` = production
- `PORT` = 5000

**Railway auto-deploy & kasih URL:**
- Contoh: `https://rmax-backend.up.railway.app`
- Copy URL ini untuk frontend

### 2️⃣ Deploy Frontend ke Vercel

**Setup Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

**Vercel Setup (jawab prompt):**
- Set up project? **Y**
- Which scope? Pilih account lo
- Link to existing? **N**
- Project name: `rmax-mahjong`
- Directory: `./`
- Override settings? **Y**
  - Build Command: `npm run build`
  - Output Directory: `dist`
  - Install Command: `npm install`

**Set Environment Variable:**
```bash
vercel env add VITE_API_URL
# Paste: https://rmax-backend.up.railway.app/api
# Environment: Production, Preview, Development (pilih semua)
```

**Deploy Production:**
```bash
vercel --prod
```

### 3️⃣ Update Backend CORS

Edit `backend/server.js`, update CORS:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://rmax-mahjong.vercel.app',  // Ganti dengan Vercel URL lo
    'https://rmax-mahjong-*.vercel.app' // Preview deployments
  ],
  credentials: true
}));
```

Push update ke Railway:
```bash
cd backend
railway up
```

### ✅ Done!

**Frontend:** https://rmax-mahjong.vercel.app  
**Backend:** https://rmax-backend.up.railway.app

---

## 🚀 Alternative: Render (Kalau Railway Penuh)

**Deploy Backend ke Render:**
1. Push backend ke GitHub repo
2. Connect Render.com ke GitHub
3. Create New Web Service
4. Set:
   - Build: `npm install && npx prisma generate`
   - Start: `node server.js`
   - Environment variables sama kayak Railway

**Deploy Frontend ke Netlify (Alternative Vercel):**
```bash
npm i -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

## 📝 Checklist Deploy

✅ NeonDB database created & connection string ready  
✅ Backend deployed ke Railway/Render  
✅ Backend environment variables set (DATABASE_URL, JWT_SECRET)  
✅ Database migrated: `npx prisma migrate deploy`  
✅ Admin user created: `node scripts/create-admin.js`  
✅ Frontend deployed ke Vercel/Netlify  
✅ Frontend VITE_API_URL points to backend  
✅ Backend CORS updated dengan frontend URL  
✅ Test: register user, deposit, play game  

---

**Railway Free Tier:**
- 500 hours/month (cukup untuk 1 app jalan 24/7)
- $5 credit/month

**Vercel Free Tier:**
- Unlimited deployments
- 100GB bandwidth/month
- Perfect untuk frontend

**Kedua gratis cukup untuk production kecil-menengah.**
