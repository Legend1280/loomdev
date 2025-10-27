# LoomDev - Connection Status & Fix Guide

**Date**: October 27, 2025  
**Status**: 🔧 Configuration Issues Detected

This document tracks the connection status between all LoomDev infrastructure components and provides fixes.

---

## 🔍 Current Status

### ✅ GitHub Repository
- **Status**: ✅ Working
- **Repository**: https://github.com/Legend1280/loomdev
- **Branch**: main
- **Commits**: 7
- **Files**: 150+

### ❌ Vercel Frontend
- **Status**: ❌ **DEPLOYMENT FAILED**
- **Project ID**: `prj_P3LZNZGHwhY1eXfp9xmvvvBVyAqD`
- **Project Name**: loomdev
- **Latest Deployment**: ERROR

**Issues Found:**
1. **Wrong Repository**: Deploying from `Legend1280/loomlite` instead of `Legend1280/loomdev`
2. **Framework Mismatch**: Detected as FastAPI (should be static frontend)
3. **Missing Entrypoint**: Looking for FastAPI files in root instead of frontend folder

### ⚠️ Railway Backend
- **Status**: ⚠️ **NOT VERIFIED**
- **Project**: LoomDev Backend (assumed created)
- **Endpoint**: Unknown (needs verification)

### ⚠️ n8n Workflows
- **Status**: ⚠️ **NOT VERIFIED**
- **Workspace**: LoomDev (assumed created)
- **Workflows**: Duplicated from LoomLite (needs endpoint updates)

---

## 🔧 Fixes Required

### Fix 1: Vercel Project Configuration

The Vercel project needs to be reconfigured to point to the correct repository and settings.

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Select the "loomdev" project
3. Go to Settings → Git
4. **Update Git Repository**:
   - Disconnect current repository
   - Connect to `Legend1280/loomdev`
   - Set branch to `main`
5. Go to Settings → General
6. **Update Build & Output Settings**:
   - Framework Preset: `Other`
   - Output Directory: `frontend`
   - Install Command: (leave empty)
   - Build Command: (leave empty)
7. Go to Settings → Environment Variables
8. **Add/Verify Variables**:
   - `VITE_API_URL` = Railway backend URL (to be determined)
   - `VITE_APP_NAME` = `LoomDev`
   - `VITE_VERSION` = `0.1.0`
9. Trigger a new deployment

**Option B: Via Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Link to the loomdev project
cd /path/to/loomdev
vercel link

# Deploy
vercel --prod
```

**Option C: Delete and Recreate**

If the above doesn't work, delete the existing project and create a new one:

1. Delete the "loomdev" project in Vercel dashboard
2. Create new project from GitHub
3. Select `Legend1280/loomdev` repository
4. Configure settings:
   - Framework: Other
   - Output Directory: `frontend`
   - Root Directory: `.` (leave as is)
5. Add environment variables
6. Deploy

---

### Fix 2: Railway Backend Configuration

**Step 1: Verify Railway Project Exists**

Check if the LoomDev backend project exists in Railway:
- Go to https://railway.app/dashboard
- Look for "LoomDev Backend" or similar project
- If not found, create a new project

**Step 2: Configure Railway Deployment**

If creating new:
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `Legend1280/loomdev`
4. Railway will auto-detect Python/FastAPI
5. Set root directory to `backend` (if needed)
6. Add environment variables:
   - `DATABASE_URL` = `sqlite:///loom_lite.db`
   - `OPENAI_API_KEY` = (your key)
   - `S3_BUCKET` = (your bucket)
   - `S3_ACCESS_KEY` = (your key)
   - `S3_SECRET_KEY` = (your key)
7. Deploy

If already exists:
1. Go to project settings
2. Verify it's connected to `Legend1280/loomdev`
3. Verify environment variables are set
4. Check deployment logs for errors
5. Note the public URL (e.g., `loomdev-backend.up.railway.app`)

**Step 3: Update Vercel with Railway URL**

Once you have the Railway backend URL:
1. Go to Vercel project settings
2. Add environment variable:
   - `VITE_API_URL` = `https://loomdev-backend.up.railway.app`
3. Redeploy frontend

---

### Fix 3: n8n Workflow Configuration

**Step 1: Verify n8n Workspace**

1. Log into n8n
2. Check if "LoomDev" workspace exists
3. Verify workflows are present

**Step 2: Update Workflow Endpoints**

For each workflow, update the Railway backend URLs:

**Workflow 1: Document Ingestion**
- HTTP Request nodes should point to:
  - `https://loomdev-backend.up.railway.app/api/ingest`
  - `https://loomdev-backend.up.railway.app/api/job/{id}`
  - `https://loomdev-backend.up.railway.app/doc/{id}/ontology`

**Workflow 2: LLM Extraction**
- HTTP Request node should point to:
  - `https://loomdev-backend.up.railway.app/api/extract`

**Workflow 3: Artifact Processing** (v0.1)
- HTTP Request node should point to:
  - `https://loomdev-backend.up.railway.app/api/artifact/upload`

**Step 3: Test Workflows**

1. Trigger each workflow manually
2. Check execution logs
3. Verify data flows to backend
4. Verify results appear in frontend

---

## 📋 Verification Checklist

Use this checklist to verify all connections are working:

### GitHub → Vercel
- [ ] Vercel project connected to `Legend1280/loomdev`
- [ ] Auto-deploy on push to main enabled
- [ ] Latest commit deployed successfully
- [ ] Frontend accessible at `loomdev.vercel.app` or similar
- [ ] Page loads without errors
- [ ] Browser console shows no errors

### GitHub → Railway
- [ ] Railway project connected to `Legend1280/loomdev`
- [ ] Auto-deploy on push to main enabled
- [ ] Backend deployed successfully
- [ ] Health endpoint returns 200 OK
- [ ] API documentation accessible at `/docs`

### Vercel → Railway
- [ ] Vercel has Railway backend URL in env vars
- [ ] Frontend can make API calls to backend
- [ ] CORS configured correctly
- [ ] API responses appear in browser network tab

### n8n → Railway
- [ ] n8n workflows have correct Railway URLs
- [ ] Webhooks can trigger successfully
- [ ] HTTP requests return 200 OK
- [ ] Data persists to database
- [ ] Results visible in frontend

### End-to-End
- [ ] Upload document via n8n webhook
- [ ] Document appears in Railway database
- [ ] Document visible in Vercel frontend
- [ ] Visualization renders correctly
- [ ] Search functionality works

---

## 🔗 Connection Map

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│              Legend1280/loomdev (main)                   │
└────────────┬──────────────────────────┬─────────────────┘
             │                          │
             │ Auto-Deploy              │ Auto-Deploy
             ▼                          ▼
┌─────────────────────┐      ┌─────────────────────────┐
│  Vercel Frontend    │      │   Railway Backend       │
│  loomdev.vercel.app │◄─────┤  loomdev-backend.up...  │
│                     │ API  │                         │
│  Status: ❌ ERROR   │      │  Status: ⚠️ UNKNOWN    │
└─────────────────────┘      └──────────▲──────────────┘
                                        │
                                        │ Webhook
                                        │ HTTP Requests
                             ┌──────────┴──────────┐
                             │   n8n Workflows     │
                             │   LoomDev Workspace │
                             │                     │
                             │  Status: ⚠️ UNKNOWN │
                             └─────────────────────┘
```

**Legend:**
- ✅ Working
- ❌ Error
- ⚠️ Unknown/Not Verified

---

## 🚀 Quick Fix Steps

### Immediate Actions (Do This Now)

1. **Fix Vercel Deployment**
   ```bash
   # Option 1: Via Dashboard
   # Go to vercel.com → loomdev project → Settings → Git
   # Update repository to Legend1280/loomdev
   
   # Option 2: Via CLI
   cd /path/to/loomdev
   vercel link --project=loomdev
   vercel --prod
   ```

2. **Verify Railway Backend**
   ```bash
   # Check if backend is running
   curl https://loomdev-backend.up.railway.app/system/status
   
   # If not found, note the correct URL from Railway dashboard
   ```

3. **Update Vercel Environment Variables**
   ```bash
   # Add Railway backend URL to Vercel
   # Via dashboard: Settings → Environment Variables
   # Add: VITE_API_URL = https://loomdev-backend.up.railway.app
   ```

4. **Test End-to-End**
   ```bash
   # Open frontend
   open https://loomdev.vercel.app
   
   # Check browser console for errors
   # Verify API calls work
   ```

---

## 📞 Next Steps

1. **Fix Vercel** - Update repository connection and redeploy
2. **Verify Railway** - Confirm backend is deployed and get URL
3. **Update n8n** - Point workflows to new Railway backend
4. **Test Integration** - Verify data flows end-to-end
5. **Document URLs** - Record all endpoints for reference

---

## 📝 URLs to Document

Once everything is working, document these URLs:

- **GitHub**: https://github.com/Legend1280/loomdev
- **Vercel Frontend**: https://loomdev.vercel.app (or similar)
- **Railway Backend**: https://loomdev-backend.up.railway.app (or similar)
- **Railway API Docs**: https://loomdev-backend.up.railway.app/docs
- **n8n Workspace**: (your n8n URL)

---

**Status**: 🔧 Fixes Required | 📋 Checklist Ready | 🎯 Next: Fix Vercel Deployment

**Last Updated**: October 27, 2025

