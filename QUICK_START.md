# 🚀 Quick Start AI Article Generator

## Setup (First Time Only - 5 menit)

### 1. Get Free API Keys

**Groq API** (AI Content)
```
1. Buka: https://console.groq.com/keys
2. Login/Register gratis
3. Copy API key
4. Paste ke .env file
```

**Pexels API** (Images)
```
1. Buka: https://www.pexels.com/api/
2. Login/Register gratis
3. Copy API key
4. Paste ke .env file
```

### 2. Setup Environment

```bash
# Edit .env dan paste API keys kamu
nano .env
```

Isi dengan:
```env
GROQ_API_KEY=your_key_here
PEXELS_API_KEY=your_key_here
CATEGORY=SEO
AUTHOR=Admin FortoolSEO
```

---

## Usage (Copy-Paste Commands)

### Generate 1 Artikel

```bash
node _scripts/auto-generator.js --category SEO --topic "SEO On-Page"
```

### Generate 5 Artikel Batch

```bash
node _scripts/auto-generator.js --category "Digital Marketing" --count 5 --topic "Social Media Tips"
```

### Generate & Auto Push ke GitHub

```bash
node _scripts/auto-generator.js \
  --category SEO \
  --count 3 \
  --topic "Keyword Research" \
  --commit true
```

### Generate Tanpa Auto-Commit

```bash
node _scripts/auto-generator.js --category SEO --count 2 --commit false
```

---

## Hasil Generate

Setiap artikel otomatis:
- ✅ Punya judul unik (dari topic)
- ✅ Konten AI-generated (1500+ kata)
- ✅ Gambar dari Pexels (auto)
- ✅ Tags & metadata SEO (auto)
- ✅ File: `_posts/YYYY-MM-DD-slug.html`
- ✅ Commit & push ke GitHub (opsional)

---

## Troubleshooting

| Problem | Solusi |
|---------|--------|
| API key not found | Check .env file (bukan .env.example) |
| No GROQ_API_KEY error | Use fallback template (tetap jalan) |
| Image fetch fail | Use placeholder (tetap jalan) |
| Git push fail | Gunakan `--commit false` dan push manual |

---

## Automation (Daily Generation)

### Linux/Mac Crontab
```bash
# Edit crontab
crontab -e

# Tambahkan (8 pagi generate 1 artikel)
0 8 * * * cd /workspaces/fortoolseo.github.io && node _scripts/auto-generator.js --category SEO --count 1
```

### GitHub Actions (Recommended)
1. Setup GitHub Secrets:
   - `GROQ_API_KEY`
   - `PEXELS_API_KEY`

2. Create `.github/workflows/auto-article.yml`:
```yaml
name: Auto Generate Articles
on:
  schedule:
    - cron: '0 8 * * *'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: |
          echo "GROQ_API_KEY=${{ secrets.GROQ_API_KEY }}" > .env
          echo "PEXELS_API_KEY=${{ secrets.PEXELS_API_KEY }}" >> .env
          node _scripts/auto-generator.js --category SEO --count 1
      - run: |
          git config user.name "AI Bot"
          git config user.email "bot@example.com"
          git commit -am "✨ Auto article" || true
          git push || true
```

---

## Parameters Reference

```
--category      Kategori artikel (default: SEO)
--topic         Topik/keyword (default: auto)
--count         Jumlah artikel (default: 1)
--commit        Auto git commit (default: true)
```

---

## Examples

```bash
# SEO category, 3 artikel tentang "Backlink"
node _scripts/auto-generator.js --category SEO --count 3 --topic Backlink

# Tools gratis, 1 artikel
node _scripts/auto-generator.js --category "Tools Gratis" --topic "SEO Tools"

# Digital Marketing, 5 artikel batch
node _scripts/auto-generator.js --category "Digital Marketing" --count 5 --topic Marketing

# Tanpa auto-push (manual later)
node _scripts/auto-generator.js --category SEO --commit false
```

---

**Ready to generate articles? 🚀**

```bash
node _scripts/auto-generator.js --category SEO --topic "Test Article"
```
