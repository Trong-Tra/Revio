# Revio Deployment Guide - Zero Cost 💰

Complete deployment guide for Revio with 100% free tier services.

---

## 📋 Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel        │────▶│   Render        │────▶│   Neon          │
│   (Frontend)    │     │   (Backend)     │     │   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Cloudflare    │
                        │   R2 (Storage)  │
                        └─────────────────┘
```

**All services offer generous free tiers that never expire (or have long trials).**

---

## 🚀 Step 1: Database (Neon - Free Forever)

Neon offers a serverless PostgreSQL with 500MB storage (more than enough for testing).

### Setup:
1. Go to [neon.tech](https://neon.tech) → Sign up with GitHub
2. Create new project: **revio-db**
3. Select region closest to your backend (US East for Render)
4. Copy the connection string:
   ```
   postgresql://username:password@hostname.neon.tech/revio-db?sslmode=require
   ```

### Database Migration:
```bash
# In backend directory
export DATABASE_URL="postgresql://...your-neon-url..."
npx prisma migrate deploy
npx prisma db seed  # if you have seed data
```

**Free Tier Limits:**
- 500MB storage
- 190 compute hours/month (auto-sleeps after inactivity)
- Unlimited databases

---

## 🚀 Step 2: File Storage (Cloudflare R2 - Free Forever)

R2 offers 10GB storage + 1M operations/month completely free.

### Setup:
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Sign up
2. Go to **R2 Object Storage** → Create bucket
3. Bucket name: `revio-papers`
4. Settings:
   - **Public Access**: Off (use signed URLs)
   - **CORS**: Add your frontend domain
5. Go to **Manage R2 API Tokens**:
   - Create token with `Object Read & Write`
   - Copy Access Key ID and Secret Access Key

### Environment Variables:
```env
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=revio-papers
R2_PUBLIC_URL=https://pub-<hash>.r2.dev  # optional, for public files
```

**Free Tier Limits:**
- 10GB storage/month
- 1M Class A operations
- 10M Class B operations
- Zero egress fees (unlike S3!)

---

## 🚀 Step 3: Backend API (Render - Free Forever)

Render's free tier includes web services that spin down after 15 min inactivity (cold start ~30s).

### Setup:
1. Go to [render.com](https://render.com) → Sign up with GitHub
2. **New Web Service** → Connect your GitHub repo
3. Configure:
   ```
   Name: revio-api
   Region: Oregon (US West) or Ohio (US East)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install && npx prisma generate
   Start Command: npm start
   ```
4. Add Environment Variables (from all sections above):
   ```env
   # Database
   DATABASE_URL=postgresql://neon-url
   
   # Storage (R2)
   R2_ENDPOINT=https://...
   R2_ACCESS_KEY_ID=...
   R2_SECRET_ACCESS_KEY=...
   R2_BUCKET_NAME=revio-papers
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   
   # OpenRouter (Free AI)
   OPENROUTER_API_KEY=sk-or-v1-...
   OPENROUTER_MODEL=arcee-ai/trinity-large-preview:free
   
   # TinyFish (Optional - free tier available)
   TINYFISH_API_KEY=...
   
   # CORS
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
5. Click **Create Web Service**

### Free Tier Notes:
- Service spins down after 15 min idle (first request will be slow)
- 512MB RAM, shared CPU
- 100GB bandwidth/month
- **Pro tip**: Use UptimeRobot to ping your API every 14 minutes to keep it warm

---

## 🚀 Step 4: Frontend (Vercel - Free Forever)

Vercel offers the best React/Vite hosting with zero config.

### Setup:
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. **Add New Project** → Import GitHub repo
3. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```
4. Add Environment Variables:
   ```env
   VITE_API_URL=https://revio-api.onrender.com/api/v1
   ```
5. Click **Deploy**

### Custom Domain (Optional, Free):
1. In Vercel project → **Domains**
2. Add your domain or use free `vercel.app` subdomain

**Free Tier Limits:**
- Unlimited deployments
- 100GB bandwidth/month
- 6,000 build minutes/month
- Edge Network included

---

## 🔧 Alternative: Self-Hosted MinIO (Same Server)

If you prefer to self-host MinIO on the same server as your backend:

### Option A: Docker Compose (Recommended)
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  api:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - MINIO_ENDPOINT=minio:9000
      - MINIO_ACCESS_KEY=minioadmin
      - MINIO_SECRET_KEY=minioadmin
      - MINIO_BUCKET=revio-papers
      - MINIO_USE_SSL=false
    depends_on:
      - postgres
      - minio

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: revio
      POSTGRES_PASSWORD: revio_password
      POSTGRES_DB: revio_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api

volumes:
  postgres_data:
  minio_data:
```

### Option B: Free Cloud VPS (Oracle Cloud Always Free)
Oracle Cloud offers **Always Free** tier:
- 2 AMD-based Compute VMs (1/8 OCPU, 1GB RAM each)
- 4 ARM-based Ampere A1 cores, 24GB RAM
- 200GB block storage
- Completely free forever

**Sign up**: [cloud.oracle.com](https://cloud.oracle.com)

---

## 🔐 Environment Variables Reference

### Backend (.env.production)
```env
# Server
NODE_ENV=production
PORT=3001

# Database (Neon)
DATABASE_URL=postgresql://username:password@host.neon.tech/db?sslmode=require

# Storage (Cloudflare R2)
R2_ENDPOINT=https://<account>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=revio-papers
R2_PUBLIC_URL=https://pub-<hash>.r2.dev

# OR: Self-hosted MinIO
# MINIO_ENDPOINT=minio.example.com
# MINIO_ACCESS_KEY=minioadmin
# MINIO_SECRET_KEY=minioadmin
# MINIO_BUCKET=revio-papers
# MINIO_USE_SSL=true
# MINIO_PORT=443

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AI Services
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=arcee-ai/trinity-large-preview:free

# Optional: TinyFish for synthesis
TINYFISH_API_KEY=...

# CORS
FRONTEND_URL=https://revio.vercel.app
```

### Frontend (.env.production)
```env
VITE_API_URL=https://revio-api.onrender.com/api/v1
```

---

## 🧪 Post-Deployment Testing

After deployment, test everything:

```bash
# 1. Health check
curl https://revio-api.onrender.com/health

# 2. Test auth flow
curl -X POST https://revio-api.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test"}'

# 3. Test paper creation (need auth token)
# 4. Test file upload
# 5. Test AI review generation
```

---

## 💰 Cost Comparison

| Service | Free Tier | Paid Alternative | Your Cost |
|---------|-----------|------------------|-----------|
| **Frontend** | Vercel (Free) | Vercel Pro ($20/mo) | **$0** |
| **Backend** | Render (Free) | Render Starter ($7/mo) | **$0** |
| **Database** | Neon (500MB) | Neon Pro ($19/mo) | **$0** |
| **Storage** | Cloudflare R2 (10GB) | AWS S3 ($0.023/GB) | **$0** |
| **AI** | OpenRouter Free | OpenAI GPT-4 ($0.03/1K) | **$0** |
| **Domain** | .vercel.app | Custom ($12/yr) | **$0** |

### **Total Monthly Cost: $0.00** ✅

---

## ⚠️ Free Tier Limitations & Solutions

### 1. Render Cold Starts (~30s delay)
**Solutions:**
- Use UptimeRobot (free) to ping every 14 minutes
- Or use Railway ($5 credit/month, no cold starts)
- Or use Fly.io (free tier, no cold starts)

### 2. Neon Pauses After Inactivity
**Solutions:**
- First query wakes it up (~2s delay)
- Or use Supabase (always-on, 500MB free)

### 3. R2 Storage Limit (10GB)
**Solutions:**
- Compress PDFs before upload
- Delete old papers or archive to local
- 10GB = ~10,000 papers (1MB each)

---

## 🔄 CI/CD Setup (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Render
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.RENDER_API_KEY }}" \
            https://api.render.com/v1/services/${{ secrets.RENDER_SERVICE_ID }}/deploys

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action-deploy@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql "postgresql://...neon-url..." -c "SELECT 1;"

# Check SSL mode is required for Neon
```

### CORS Errors
- Ensure `FRONTEND_URL` matches your Vercel domain exactly
- Include protocol (`https://`) and no trailing slash

### File Upload Failures
- Check R2 bucket CORS settings
- Verify bucket permissions
- Test with `aws s3 ls s3://revio-papers --endpoint-url=...`

### AI Not Working
- Verify OpenRouter API key
- Check model name is correct
- View logs in Render dashboard

---

## 🎓 Pro Tips

1. **Use Prisma Accelerate** for connection pooling with serverless (free tier: 500 queries/day)
2. **Enable Render Auto-Deploy** for automatic deployments on git push
3. **Set up Vercel Preview Deployments** for PR testing
4. **Monitor with LogRocket** (free tier: 1,000 sessions/month)
5. **Track errors with Sentry** (free tier: 5,000 errors/month)

---

## 📞 Support Links

- **Neon**: [neon.tech/docs](https://neon.tech/docs)
- **Render**: [render.com/docs](https://render.com/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Cloudflare R2**: [developers.cloudflare.com/r2](https://developers.cloudflare.com/r2)
- **OpenRouter**: [openrouter.ai/docs](https://openrouter.ai/docs)

---

**Happy deploying! 🚀**
