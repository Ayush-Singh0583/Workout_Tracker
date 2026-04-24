# 🚀 Hosting Guide — IronForge PPL Tracker

Your app has **3 parts** to host:

| Part | What | Where to Host |
|------|------|---------------|
| **Frontend** | Next.js app | Vercel (free) |
| **Backend** | NestJS API | Render / Railway / VPS |
| **Database** | PostgreSQL | Neon / Supabase / Railway |

---

## Option 1: Free Tier Stack (Recommended for Starting Out)

### 📦 Total Cost: **$0/month**

| Service | Component | Free Tier |
|---------|-----------|-----------|
| [Vercel](https://vercel.com) | Frontend | Unlimited for hobby |
| [Render](https://render.com) | Backend | 750 hrs/month free |
| [Neon](https://neon.tech) | PostgreSQL | 0.5 GB free |

---

### Step 1: Set Up the Database (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project → name it `ironforge`
3. Copy the **connection string** — it looks like:
   ```
   postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/ironforge?sslmode=require
   ```
4. Save this — you'll need it for the backend

---

### Step 2: Deploy the Backend (Render)

1. **Push your code to GitHub** (if not already):
   ```bash
   cd "a:\IronForge PPL Tracker implementation"
   git init
   git add .
   git commit -m "Initial commit"
   # Create a repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/ironforge-ppl-tracker.git
   git push -u origin main
   ```

2. Go to [render.com](https://render.com) → **New Web Service**

3. Connect your GitHub repo

4. Configure the service:
   | Setting | Value |
   |---------|-------|
   | **Name** | `ironforge-api` |
   | **Root Directory** | `Backend` |
   | **Runtime** | Node |
   | **Build Command** | `npm install && npx prisma generate && npm run build` |
   | **Start Command** | `npm run start:prod` |

5. Add **Environment Variables**:
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Neon connection string from Step 1 |
   | `JWT_SECRET` | A long random string (use `openssl rand -hex 32`) |
   | `PORT` | `4000` |
   | `FRONTEND_URL` | `https://your-app.vercel.app` (update after Step 3) |

6. Click **Deploy** → wait for it to go live

7. **Run the database migration and seed** (one-time):
   - Go to Render dashboard → your service → **Shell** tab
   - Run:
     ```bash
     npx prisma migrate deploy
     npm run seed
     ```

8. Your API is now live at: `https://ironforge-api.onrender.com`

> [!WARNING]
> Render's free tier spins down after 15 min of inactivity. First request after sleep takes ~30s. Upgrade to $7/mo for always-on.

---

### Step 3: Deploy the Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **New Project**

2. Import your GitHub repo

3. Configure:
   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Next.js |
   | **Root Directory** | `Frontend` |

4. Add **Environment Variable**:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://ironforge-api.onrender.com/api` |

5. Click **Deploy**

6. Your app is live at: `https://your-app.vercel.app`

7. **Go back to Render** and update `FRONTEND_URL` to your Vercel URL (for CORS)

---

## Option 2: Railway (Easiest — One Platform)

### 📦 Cost: **$5/month** (includes $5 usage credit)

[Railway](https://railway.app) hosts everything in one place.

1. Sign up at [railway.app](https://railway.app)

2. Click **New Project** → **Deploy from GitHub Repo**

3. Add a **PostgreSQL** service → copy the `DATABASE_URL`

4. Add the **Backend** service:
   | Setting | Value |
   |---------|-------|
   | Root Directory | `Backend` |
   | Build Command | `npm install && npx prisma generate && npx prisma migrate deploy && npm run build` |
   | Start Command | `npm run start:prod` |
   | Variables | `DATABASE_URL`, `JWT_SECRET`, `PORT=4000`, `FRONTEND_URL` |

5. Add the **Frontend** service:
   | Setting | Value |
   |---------|-------|
   | Root Directory | `Frontend` |
   | Build Command | `npm install && npm run build` |
   | Start Command | `npm run start` |
   | Variables | `NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api` |

6. Run seed from Railway shell:
   ```bash
   npm run seed
   ```

---

## Option 3: VPS (Full Control)

### 📦 Cost: **$4-6/month** (DigitalOcean / Hetzner / AWS Lightsail)

Best for production apps. You get a Linux server and run everything yourself.

### Step 1: Get a VPS

- [DigitalOcean](https://digitalocean.com) → $4/mo droplet (1GB RAM, Ubuntu 24.04)
- [Hetzner](https://hetzner.com) → €3.79/mo (better value)
- [AWS Lightsail](https://aws.amazon.com/lightsail) → $3.50/mo

### Step 2: Install Dependencies

```bash
# SSH into your server
ssh root@YOUR_SERVER_IP

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx certbot python3-certbot-nginx
```

### Step 3: Set Up PostgreSQL

```bash
sudo -u postgres psql
CREATE USER ironforge WITH PASSWORD 'your_strong_password';
CREATE DATABASE ironforge OWNER ironforge;
\q
```

### Step 4: Deploy the App

```bash
# Clone your repo
cd /var/www
git clone https://github.com/YOUR_USERNAME/ironforge-ppl-tracker.git
cd ironforge-ppl-tracker

# Backend
cd Backend
cp .env.example .env   # or create .env manually
# Edit .env with your DATABASE_URL, JWT_SECRET, etc.
npm install
npx prisma migrate deploy
npx prisma generate
npm run build
npm run seed
pm2 start dist/main.js --name ironforge-api

# Frontend
cd ../Frontend
echo "NEXT_PUBLIC_API_URL=https://yourdomain.com/api" > .env.local
npm install
npm run build
pm2 start npm --name ironforge-web -- start

# Auto-restart on reboot
pm2 save
pm2 startup
```

### Step 5: Nginx Config

```bash
cat > /etc/nginx/sites-available/ironforge << 'EOF'
server {
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:4000/api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

ln -s /etc/nginx/sites-available/ironforge /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL (free with Let's Encrypt)
certbot --nginx -d yourdomain.com
```

---

## Environment Variables Checklist

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/ironforge
JWT_SECRET=generate-a-long-random-string-here
PORT=4000
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
```

> [!IMPORTANT]
> **Generate a strong JWT_SECRET** for production:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## Quick Comparison

| Approach | Cost | Difficulty | Cold Start | Best For |
|----------|------|------------|------------|----------|
| Vercel + Render + Neon | **Free** | Easy | ~30s on Render | Learning / Portfolio |
| Railway | **$5/mo** | Easiest | None | Side projects |
| VPS | **$4-6/mo** | Medium | None | Production apps |

---

## After Deploying

1. ✅ Register a new account on your live site
2. ✅ Check that the PPL templates appear on the Dashboard
3. ✅ Start a workout and log some sets
4. ✅ Verify progressive overload suggestions appear
5. ✅ Check the Progress page charts work
