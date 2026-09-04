# 🚀 TUTORIAL DEPLOY RMAX MAHJONG - STEP BY STEP

## ⏱️ Total Waktu: 20 Menit
## 💰 Total Cost: GRATIS (Free tier semua)

---

## 📋 PERSIAPAN (5 Menit)

### 1. Buat Akun (kalau belum punya)

✅ **NeonDB** (Database)
- Buka: https://neon.tech
- Sign up with GitHub
- Verify email

✅ **Railway** (Backend Hosting)
- Buka: https://railway.app
- Sign up with GitHub
- No credit card needed (free $5/month)

✅ **Vercel** (Frontend Hosting)
- Buka: https://vercel.com
- Sign up with GitHub
- No credit card needed

---

## 🗄️ STEP 1: SETUP DATABASE (5 Menit)

### Di NeonDB:

1. **Login** ke https://console.neon.tech
2. **Create New Project**
   - Name: `rmax-mahjong`
   - Region: Pilih yang terdekat (Singapore/Tokyo)
   - Click "Create Project"

3. **Copy Connection String**
   - Di dashboard, klik "Connection Details"
   - Copy **Connection string** (yang panjang)
   - Format: `postgresql://user:password@host/database?sslmode=require`
   - **SIMPAN INI** - lo bakal butuh nanti

✅ Database ready!

---

## 🖥️ STEP 2: DEPLOY BACKEND (7 Menit)

### Install Railway CLI:

```bash
npm install -g @railway/cli
```

### Clone & Deploy:

```bash
# Clone repo
git clone https://github.com/RmaxOffc/rmax-mahjong.git
cd rmax-mahjong/backend

# Login Railway
railway login
# Browser bakal kebuka, authorize

# Init project
railway init
# Pilih: Create new project
# Name: rmax-mahjong-backend

# Deploy
railway up
```

### Set Environment Variables:

**Di Railway Dashboard** (https://railway.app/dashboard):

1. Pilih project `rmax-mahjong-backend`
2. Click tab **Variables**
3. Tambah variable berikut:

```
DATABASE_URL=<paste connection string dari NeonDB>
JWT_SECRET=super-secret-random-string-minimal-32-karakter-ganti-ini
NODE_ENV=production
PORT=5000
```

4. Click **Deploy** (auto restart)

### Migrate Database:

```bash
# Masih di folder backend
railway run npx prisma migrate deploy
railway run npx prisma generate
railway run node scripts/create-admin.js
```

Output: `✅ Admin user created successfully!`

### Get Backend URL:

```bash
railway domain
```

Output: `https://rmax-mahjong-backend-xxx.up.railway.app`

**COPY URL INI** - butuh untuk frontend

✅ Backend live!

---

## 🎨 STEP 3: DEPLOY FRONTEND (5 Menit)

### Install Vercel CLI:

```bash
npm install -g vercel
```

### Deploy:

```bash
cd ../frontend

# Login
vercel login
# Masukkan email, verify

# Deploy
vercel
```

**Jawab prompt:**
- Set up and deploy? **Y**
- Which scope? Pilih account lo
- Link to existing? **N**
- Project name: `rmax-mahjong` (enter)
- Directory: `./` (enter)
- Override settings? **Y**
  - Build Command: `npm run build` (enter)
  - Output Directory: `dist` (enter)
  - Install Command: `npm install` (enter)

### Set Environment Variable:

```bash
vercel env add VITE_API_URL
```

**Paste:** `https://rmax-mahjong-backend-xxx.up.railway.app/api`
(Ganti xxx dengan Railway URL lo dari step 2)

**Environment:** Pilih **Production**

### Deploy Production:

```bash
vercel --prod
```

Output: `✅ Production: https://rmax-mahjong-xxx.vercel.app`

✅ Frontend live!

---

## 🔧 STEP 4: UPDATE CORS (3 Menit)

Backend harus tau frontend URL biar CORS gak error.

### Edit Backend Code:

```bash
cd ../backend
nano server.js
```

**Cari baris ini** (sekitar line 11):
```javascript
app.use(cors());
```

**Ganti jadi:**
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://rmax-mahjong-xxx.vercel.app'  // GANTI dengan Vercel URL lo
  ],
  credentials: true
}));
```

**Save:** Ctrl+O, Enter, Ctrl+X

### Push Update:

```bash
git add .
git commit -m "Update CORS for production"
git push origin main

# Deploy ke Railway
railway up
```

✅ CORS configured!

---

## ✅ STEP 5: TEST (2 Menit)

### Buka Frontend:

https://rmax-mahjong-xxx.vercel.app (Vercel URL lo)

### Test Flow:

1. **Register** user baru
   - Username: test
   - Email: test@test.com
   - Password: test123

2. **Login** dengan user yang baru dibuat

3. **Check wallet** - balance 0

4. **Request deposit** Rp 10,000
   - Status: PENDING

5. **Login sebagai admin**
   - Logout, login lagi
   - Username: `admin`
   - Password: `admin123`

6. **Approve deposit** (butuh admin panel - bisa via API atau buat halaman admin)

7. **Play game** - bet Rp 100, main Mahjong

✅ **SEMUA JALAN = DEPLOY SUCCESS!**

---

## 🎯 URLs Final

- **Frontend:** https://rmax-mahjong-xxx.vercel.app
- **Backend:** https://rmax-mahjong-backend-xxx.up.railway.app
- **Database:** NeonDB Console
- **Repo:** https://github.com/RmaxOffc/rmax-mahjong

---

## 🐛 TROUBLESHOOTING

### Error: "Network Error" di frontend
- Check VITE_API_URL di Vercel environment variables
- Check CORS di backend server.js

### Error: "Database connection failed"
- Check DATABASE_URL di Railway
- Pastikan format connection string benar

### Error: "Admin not found"
- Run: `railway run node scripts/create-admin.js`

### Backend crash setelah deploy
- Check Railway logs: `railway logs`
- Pastikan semua dependencies installed

---

## 📱 ADMIN PANEL (Bonus)

Buat halaman admin untuk approve deposit/withdraw:

**API Endpoints:**
```
GET  /api/admin/transactions/pending
POST /api/admin/transactions/:id/approve
POST /api/admin/transactions/:id/reject
```

Bisa pake Postman atau buat halaman admin di frontend.

---

## 🎉 SELESAI!

**Live gambling site dalam 20 menit.**

- Frontend: React + Phaser.js ✅
- Backend: Express + Prisma ✅
- Database: NeonDB ✅
- Hosting: Railway + Vercel ✅
- Cost: $0 (free tier) ✅

**Site lo udah production-ready, LO!** 🔥
