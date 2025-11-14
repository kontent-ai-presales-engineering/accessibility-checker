# Deployment Guide

This guide covers deploying the Accessibility Scanner to free hosting platforms.

## Quick Deploy

### Railway

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/9C0krv)

Click the button to deploy with one click! Railway will automatically:
- Clone the repository
- Detect `railway.toml` configuration
- Install dependencies and build the project
- Start the server with proper PORT configuration

### Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/butcher-07/accessibility-checker)

Click the button to deploy with one click! Render will automatically:
- Clone the repository
- Detect `render.yaml` blueprint configuration
- Install all dependencies including Puppeteer/Chrome
- Build the optimized production bundle
- Start the server on the correct port
- Provide HTTPS endpoint instantly

---

## 🎨 Render.com Deployment

### ⚡ Method 1: One-Click Blueprint (Recommended)

The fastest way to deploy - just click the button above or follow these steps:

1. **Click** the "Deploy to Render" button
2. **Connect** your GitHub account (if not already)
3. **Wait** ~3 minutes while Render:
   - Clones the repository
   - Reads `render.yaml` configuration
   - Installs Node.js dependencies
   - Downloads Puppeteer & Chrome
   - Builds the production bundle
   - Starts your application
4. **Access** your live app via the provided `.onrender.com` URL

### 🛠️ Method 2: Manual Setup

For more control over the deployment:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +" → "Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `accessibility-scanner`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Free`
5. Click **"Create Web Service"**

### 💎 Free Tier Benefits

- ✅ **750 hours/month** of runtime
- ✅ **Automatic HTTPS** with SSL certificate
- ✅ **Auto-deploy** on git push
- ✅ **Custom domains** supported
- ⚠️ Sleeps after 15 min inactivity (wakes on first request)

---

## 🚂 Railway.app Deployment

### ⚡ One-Click Template Deploy (Recommended)

The fastest way to deploy - just click the button above or follow these steps:

1. **Click** the "Deploy on Railway" button
2. **Sign in** with GitHub (if not already)
3. **Wait** ~2 minutes while Railway:
   - Clones from template
   - Detects `railway.toml` configuration
   - Provisions infrastructure
   - Installs dependencies & Puppeteer
   - Builds the application
   - Deploys to production
4. **Access** your live app via the provided `railway.app` domain

### 🛠️ Alternative: Deploy from Repository

If you want to deploy from your own fork:

1. Go to [Railway Dashboard](https://railway.app/)
2. Click **"New Project" → "Deploy from GitHub repo"**
3. Select `butcher-07/accessibility-checker`
4. Railway automatically:
   - Reads `railway.toml` and `railway.json`
   - Configures build and start commands
   - Sets up environment variables
   - Handles PORT configuration

### 💎 Free Tier Benefits

- ✅ **$5/month credit** (~500 hours runtime)
- ✅ **Instant rollbacks** to previous deployments
- ✅ **Zero-downtime** deployments
- ✅ **Auto-scaling** based on traffic
- ✅ **Custom domains** with SSL
- ✅ **No sleep** - always ready to serve

---

## Docker Deployment (Any Platform)

The included `Dockerfile` can be used on any platform that supports Docker:
- Render.com (Docker)
- Railway (Docker)
- Google Cloud Run
- AWS Fargate
- Azure Container Apps

### Build and Run Locally
```bash
# Build the image
docker build -t accessibility-scanner .

# Run the container
docker run -p 5000:5000 accessibility-scanner
```

---

## Important Notes

### Database
- Currently uses SQLite (`accessibility.db`)
- For production, consider using PostgreSQL:
  - Render: Free PostgreSQL (90 days, then requires upgrade)
  - Railway: PostgreSQL add-on (included in free credit)

### Puppeteer Requirements
- All configs include Chrome/Chromium dependencies
- Render.yaml includes proper Puppeteer environment variables
- Dockerfile installs all necessary system dependencies

### Environment Variables
No environment variables are required for basic operation. The app works out of the box.

---

## Troubleshooting

### Puppeteer Fails to Launch
If you see "Failed to launch chrome":
1. Ensure platform has Chrome installed
2. Check Puppeteer environment variables
3. On Render: Use the provided `render.yaml` config

### Build Timeouts
If build times out on free tier:
- Render: 15min build timeout (should be enough)
- Railway: Generally no timeout issues

### Cold Starts
Free tiers sleep after inactivity:
- First request after sleep takes 30-60s
- Subsequent requests are fast
