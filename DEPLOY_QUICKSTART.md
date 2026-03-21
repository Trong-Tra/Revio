# Revio Deployment Quickstart 🚀

Deploy Revio for **$0/month** using free tier services.

---

## ⚡ Option 1: Fully Managed (Easiest)

### 1-Click Deploy

| Service | Purpose | Free Tier | Deploy |
|---------|---------|-----------|--------|
| **Vercel** | Frontend | Unlimited | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new) |
| **Render** | Backend | 512MB RAM | [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy) |
| **Neon** | PostgreSQL | 500MB | [Create Project](https://console.neon.tech/app/projects/new) |
| **Cloudflare R2** | File Storage | 10GB | [Create Bucket](https://dash.cloudflare.com/?to=/:account/r2/new-bucket) |

### Step-by-Step (5 minutes)

```bash
# 1. Clone and enter project
git clone <your-repo>
cd Revio-BE

# 2. Run setup script
./scripts/setup-deployment.sh

# 3. Deploy database
# - Go to https://neon.tech
# - Create project, copy DATABASE_URL

# 4. Deploy storage
# - Go to https://dash.cloudflare.com/r2
# - Create bucket "revio-papers"
# - Click "Manage R2 API Tokens" (left sidebar)
# - Create API Token (Object Read & Write)
# - ⚠️  SAVE: Access Key ID + Secret Access Key (shown only once!)

# 5. Deploy backend to Render
# - Connect GitHub repo
# - Set environment variables from .env.production

# 6. Deploy frontend to Vercel
# - Import GitHub repo
# - Set VITE_API_URL to your Render URL
```

---

## 🐳 Option 2: Self-Hosted with Docker

Run everything on your own server (or free Oracle Cloud VM).

```bash
# 1. Start all services
docker-compose up -d

# 2. Run database migrations
docker-compose exec backend npx prisma migrate deploy

# 3. Access services
# API:    http://localhost:3001
# MinIO:  http://localhost:9001 (minioadmin/minioadmin)
# DB:     localhost:5432
```

### Free VPS Options

| Provider | Specs | Duration |
|----------|-------|----------|
| **Oracle Cloud** | 4 ARM cores + 24GB RAM | Forever |
| **AWS Free Tier** | 1 t2.micro | 12 months |
| **Google Cloud** | 1 e2-micro | Forever |
| **Azure** | 1 B1s | 12 months |

---

## 📊 Resource Requirements

### Minimum (Free Tier)
- **CPU**: 0.25 cores (shared)
- **RAM**: 512MB
- **Storage**: 1GB
- **Database**: 500MB
- **File Storage**: 10GB

### Recommended
- **CPU**: 0.5 cores
- **RAM**: 1GB
- **Storage**: 5GB
- **Database**: 2GB
- **File Storage**: 100GB

---

## 🔐 Required Environment Variables

### Backend (`backend/.env.production`)
```env
# Database (Neon)
DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require

# Storage (Cloudflare R2)
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=revio-papers

# Auth
JWT_SECRET=random-string-min-32-chars

# AI (OpenRouter - Free)
OPENROUTER_API_KEY=sk-or-v1-xxx
OPENROUTER_MODEL=arcee-ai/trinity-large-preview:free

# Frontend URL (CORS)
FRONTEND_URL=https://your-app.vercel.app
```

### Frontend (`frontend/.env.production`)
```env
VITE_API_URL=https://your-api.onrender.com/api/v1
```

---

## 🧪 Verify Deployment

```bash
# Health check
curl https://your-api.onrender.com/health

# Test registration
curl -X POST https://your-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","name":"Test"}'
```

---

## 💰 Cost Breakdown

| Component | Service | Monthly Cost |
|-----------|---------|--------------|
| Frontend | Vercel | **$0** |
| Backend | Render | **$0** |
| Database | Neon | **$0** |
| Storage | Cloudflare R2 | **$0** |
| AI | OpenRouter | **$0** |
| Domain | .vercel.app | **$0** |
| **TOTAL** | | **$0** |

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Render cold start | Use UptimeRobot to ping every 14 min |
| Neon pauses | First query wakes it up (~2s) |
| CORS errors | Check FRONTEND_URL matches exactly |
| Upload fails | Verify R2 CORS settings |
| AI not working | Check OpenRouter API key & model name |

---

## 📚 Documentation

- Full Guide: [DEPLOYMENT.md](./DEPLOYMENT.md)
- API Docs: [API.md](./API.md)
- Architecture: [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

---

**Questions?** Check the full [DEPLOYMENT.md](./DEPLOYMENT.md) guide.
