# 🔒 Security & Data Protection Guide

## Overview
This guide explains how to keep your FortoolSEO repository and article data safe.

## 🚨 CRITICAL: API Key Rotation (DO THIS NOW)

Your API keys were exposed in git history. **Rotate them immediately:**

### 1. Groq API
1. Go to: https://console.groq.com/keys
2. Delete any old API keys
3. Create a new API key
4. Copy to your local `.env` file: `GROQ_API_KEY=your_new_key`

### 2. Pexels API
1. Go to: https://www.pexels.com/api/
2. Delete any old API keys
3. Create a new API key
4. Copy to your local `.env` file: `PEXELS_API_KEY=your_new_key`

### 3. HuggingFace API
1. Go to: https://huggingface.co/settings/tokens
2. Delete any old access tokens
3. Create a new access token
4. Copy to your local `.env` file: `HUGGINGFACE_API_KEY=your_new_token`

**⚠️ IMPORTANT:** Never include actual API keys in documentation or commits. Keys shown above are EXAMPLES ONLY.

---

## 🔐 Repository Security Setup

### Step 1: Make Repository Private
1. Go to: https://github.com/fortoolseo/fortoolseo.github.io/settings
2. Scroll to "Danger zone"
3. Click "Change repository visibility"
4. Select "Private"
5. Confirm

**Result:**
- ✅ Only authorized users can clone
- ✅ Source code is protected
- ✅ GitHub Pages still builds and deploys publicly (if enabled)

### Step 2: Set Up Local .env File
```bash
# Local machine only (NOT committed to git)
cp .env.example .env

# Edit .env with your NEW API keys
nano .env  # or use your favorite editor
```

### Step 3: Verify .gitignore
The `.gitignore` file now includes:
- `.env` - Never committed
- `.env.local` - Local overrides
- `*.key`, `*.pem` - Certificate files
- `node_modules/` - Dependencies
- `_site/` - Build output
- `.DS_Store`, `Thumbs.db` - OS files

---

## 📋 File Protection

### .htaccess (Web Server Protection)
- Blocks direct access to `.env`, `.git`, `.gitignore`
- Prevents directory listing
- Adds security headers:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: SAMEORIGIN`
  - `X-XSS-Protection: 1; mode=block`

### robots.txt (Bot Protection)
- Allows public indexing of blog posts
- Blocks indexing of private folders (`_layouts/`, `_includes/`)
- Controls crawl delays to prevent abuse

---

## 🛡️ Best Practices

### DO ✅
- Keep API keys in `.env` (local only)
- Use `.env.example` as template
- Rotate keys regularly
- Review GitHub access logs
- Enable 2FA on GitHub account
- Keep dependencies updated

### DON'T ❌
- Commit `.env` to git
- Share API keys via email
- Use same keys across projects
- Commit passwords or tokens
- Push to public repo without reviewing
- Keep old keys after rotation

---

## 🔄 Clean Git History (Optional)

If you want to remove `.env` from git history:

**WARNING: This rewrites history!**

```bash
# Using git-filter-branch (built-in)
git filter-branch --tree-filter 'rm -f .env' -f -- --all

# Then force push (careful!)
git push origin --all --force
```

**Safer approach:** Just rotate keys and move forward. The old keys are already exposed, so cleaning history is less important than rotating.

---

## 📚 Deployment with Private Repository

### GitHub Pages with Private Repo
- Repository is **Private** (code protected)
- GitHub Pages website remains **Public** (or you can make it private too)
- Only HTML output is published, not source code

### GitHub Secrets (For CI/CD)
If using GitHub Actions:
1. Go to Repository Settings → Secrets
2. Add secrets: `GROQ_API_KEY`, `PEXELS_API_KEY`, etc.
3. Reference in workflows: `${{ secrets.GROQ_API_KEY }}`

---

## 🚀 Secure Workflow

### For Development
```bash
# 1. Clone private repo (with access)
git clone https://github.com/fortoolseo/fortoolseo.github.io.git

# 2. Create local .env (from template)
cp .env.example .env
# Edit with your keys

# 3. Work normally
node _scripts/auto-generator.js --topic "Your Topic" --count 5

# 4. Commit (but NOT .env)
git add -A
git commit -m "Add article"
git push origin master
```

### For Team Members
1. Request access to private repo
2. Clone repository
3. Create own `.env` file with their keys
4. Never share `.env` or keys

---

## ✅ Checklist

- [ ] Rotated Groq API key
- [ ] Rotated Pexels API key
- [ ] Rotated HuggingFace API token
- [ ] Made repository Private on GitHub
- [ ] Created local `.env` with new keys
- [ ] Verified `.gitignore` is working
- [ ] Tested article generation with new keys
- [ ] Enabled 2FA on GitHub account
- [ ] Reviewed recent commits for exposed data

---

## 📞 Support

If you need to regenerate keys or have security questions:
- **Groq**: https://console.groq.com/docs/rate-limits
- **Pexels**: https://www.pexels.com/api/documentation/
- **HuggingFace**: https://huggingface.co/docs/hub/security

---

**Last Updated:** December 20, 2025
**Status:** ✅ Security measures implemented
