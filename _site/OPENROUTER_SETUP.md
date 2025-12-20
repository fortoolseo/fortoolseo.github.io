# 🔧 FIX: Groq API Models Deprecated - Use OpenRouter Instead

## Problem
Model Groq yang digunakan sebelumnya sudah **deprecated** dan tidak bisa digunakan lagi:
- ❌ `mixtral-8x7b-32768` - decommissioned
- ❌ `llama-3.1-70b-versatile` - decommissioned
- ❌ `llama-3-70b-8192` - decommissioned
- ❌ `gemma-7b-it` - decommissioned

## Solution: Gunakan OpenRouter (Recommended ⭐)

OpenRouter lebih stabil karena:
- ✅ Models selalu tersedia dan updated
- ✅ Free tier: $5/month credit (generous untuk automation)
- ✅ Tidak perlu credit card untuk signup
- ✅ Always working fallback models

## Setup OpenRouter (3 Langkah)

### 1. Create OpenRouter Account
```
https://openrouter.ai/
```
- Signup gratis
- Tidak perlu credit card untuk free tier
- Dapatkan **$5 free monthly credit**

### 2. Get API Key
```
https://openrouter.ai/keys
```
- Copy API key

### 3. Update `.env` File
```env
OPENROUTER_API_KEY=sk-or-YOUR_KEY_HERE
GROQ_API_KEY=  # Kosongkan atau hapus
PEXELS_API_KEY=your_pexels_key
```

## Test OpenRouter
```bash
node _scripts/auto-generator.js --category SEO --topic "Test" --count 1
```

Output seharusnya:
```
✅ Using OpenRouter API
✅ Created: 2025-12-19-xxx.html
```

---

## Alternatif: Tetap Gunakan Groq

Jika ingin tetap Groq (dengan caveat model bisa berubah):
1. Check model terbaru: https://console.groq.com/docs/models
2. Update model name di `.env.example` dan `_scripts/auto-generator.js`
3. System sudah punya fallback chain untuk auto-try multiple models

---

## Generator Improvements

Script sudah di-update dengan:
- ✅ **Dual API Support**: Groq + OpenRouter (auto fallback)
- ✅ **Smart Model Fallback**: Coba multiple models otomatis
- ✅ **Template Fallback**: Jika semua API fail, tetap generate artikel dengan template
- ✅ **Better Error Logging**: Error message lebih jelas

---

## Free Tier Limits

### OpenRouter
- **Cost**: $5 free/month
- **Enough for**: ~250 artikel dengan model sedang
- **Models**: Always available

### Groq
- **Cost**: 100% gratis
- **Limit**: 30 requests/minute
- **Models**: Sering berubah/deprecated

### Pexels
- **Cost**: Unlimited free
- **Limit**: 50 req/jam tanpa register, unlimited dengan register

---

## Recommended Setup

```bash
# Best: OpenRouter + Pexels
OPENROUTER_API_KEY=sk-or-xxx
PEXELS_API_KEY=xxx
GROQ_API_KEY=  # optional fallback

# Budget: Groq + Pexels
GROQ_API_KEY=gsk-xxx
PEXELS_API_KEY=xxx
OPENROUTER_API_KEY=  # optional

# Minimal (No images, AI only)
OPENROUTER_API_KEY=sk-or-xxx
# Articles tetap generate, hanya no images
```

---

## Next: Setup & Generate

```bash
# 1. Update .env dengan OpenRouter key
nano .env

# 2. Test single artikel
node _scripts/auto-generator.js --category SEO --topic "Test"

# 3. Generate batch
node _scripts/auto-generator.js --category SEO --count 5 --topic "Keyword Research"

# 4. Push ke GitHub
git add -A && git commit -m "📝 Generated articles" && git push
```

✅ **Done!** Sekarang semua artikel akan ter-generate dengan AI content yang proper.
