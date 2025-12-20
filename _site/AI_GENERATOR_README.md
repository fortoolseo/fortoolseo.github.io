# 🤖 FortoolSEO AI Article Generator

Sistem otomatis untuk generate artikel AI 100% gratis dengan judul, konten, dan gambar otomatis langsung ter-publish ke GitHub.

## ✨ Features

- ✅ **AI Content Generation** - Groq API (free, tanpa credit card)
- ✅ **Auto Image** - Pexels API (free unlimited)
- ✅ **Batch Generation** - Generate multiple artikel sekaligus
- ✅ **Auto Publish** - Git commit + push otomatis ke GitHub
- ✅ **CLI Arguments** - Kontrol penuh dari command line
- ✅ **100% Gratis** - Semua service berbasis free tier

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Clone repo dan masuk folder
cd /workspaces/fortoolseo.github.io

# Install dependencies
npm install dotenv minimist

# Copy environment template
cp .env.example .env

# Edit .env dengan API keys kamu
nano .env
```

### 2. Setup API Keys (Gratis!)

#### Groq API (Free)
1. Buka: https://console.groq.com/keys
2. Login/Sign up (gratis)
3. Copy API key ke `.env` (GROQ_API_KEY)
4. **Limit**: 30 requests/minute (generous untuk automation)

#### Pexels API (Free)
1. Buka: https://www.pexels.com/api/
2. Click "Register" atau login
3. Buat API key
4. Copy ke `.env` (PEXELS_API_KEY)
5. **Limit**: Unlimited (50/hour jika tidak register)

### 3. Install Dependencies

```bash
npm install
# atau jika sudah ada package.json
npm install dotenv minimist
```

## 📝 Usage

### Generate 1 Artikel

```bash
node _scripts/auto-generator.js --category SEO --topic "keyword SEO"
```

### Generate 5 Artikel Batch

```bash
node _scripts/auto-generator.js --category "Digital Marketing" --count 5 --topic "Social Media Marketing"
```

### Custom Author & Auto Commit

```bash
node _scripts/auto-generator.js \
  --category SEO \
  --count 3 \
  --topic "On-Page SEO" \
  --commit true
```

### Skip Auto Commit (Manual Push Later)

```bash
node _scripts/auto-generator.js --category SEO --topic "Keyword Research" --commit false
```

## 📋 Command Line Options

| Option | Default | Deskripsi |
|--------|---------|-----------|
| `--category` | SEO | Kategori artikel |
| `--topic` | (auto) | Topik/keyword artikel |
| `--count` | 1 | Jumlah artikel yang di-generate |
| `--commit` | true | Auto git commit & push |

### Contoh Kompleks

```bash
# Generate 10 artikel kategori "Tools Gratis" dengan topic "SEO Tools"
node _scripts/auto-generator.js \
  --category "Tools Gratis" \
  --topic "Free SEO Tools" \
  --count 10 \
  --commit true
```

## 🔍 Cara Kerja

```
Input: --category SEO --count 3 --topic "On-Page Optimization"
    ↓
┌─────────────────────────────────────────┐
│ 1. Generate Title dari Topic             │
│    "Tips & Trik On-Page Optimization"   │
│    "Cara Optimasi On-Page SEO"          │
│    "Tutorial On-Page Optimization"      │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 2. AI Content Generation (Groq API)     │
│    - Prompt: Generate artikel SEO       │
│    - 1500+ kata, structured HTML        │
│    - Include tools, tips, FAQ           │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 3. Fetch Image (Pexels API)             │
│    - Search: "on-page optimization"     │
│    - Get: medium quality (free)         │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 4. Generate HTML Post                   │
│    - YAML frontmatter                   │
│    - H1 title, article-meta, TOC        │
│    - AI content + image                 │
│    - File: YYYY-MM-DD-slug-title.html   │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ 5. Git Auto-Publish                     │
│    - git add _posts/*.html              │
│    - git commit -m "✨ Add articles"    │
│    - git push origin master             │
└─────────────────────────────────────────┘
    ↓
✅ Artikel published di GitHub Pages!
```

## 📊 Output Structure

```
_posts/
├── 2025-12-19-tips-trik-on-page-optimization.html
├── 2025-12-20-cara-optimasi-on-page-seo.html
└── 2025-12-21-tutorial-on-page-optimization.html
```

Setiap file memiliki:
- YAML frontmatter (title, date, category, tags, excerpt, meta_description)
- H1 title
- Article metadata (date, category, author, tags)
- Table of contents
- Featured image
- AI-generated content (h2-structured)

## ⚙️ Configuration File (.env)

```env
# AI
GROQ_API_KEY=gsk_your_key_here

# Images
PEXELS_API_KEY=your_pexels_key

# Default
CATEGORY=SEO
AUTHOR=Admin FortoolSEO
TOPIC=

# Git
AUTO_COMMIT=true
```

## 🐛 Troubleshooting

### Error: "No GROQ_API_KEY found"
- Solusi: Setup API key di `.env` atau set via env variable
- Fallback: Generator akan gunakan template default

### Error: "Pexels API error"
- Solusi: Check PEXELS_API_KEY di `.env`
- Fallback: Gunakan placeholder image

### Error: Git push failed
- Solusi: 
  ```bash
  # Manual push
  git push origin master
  
  # Atau gunakan --commit false untuk skip auto-push
  node _scripts/auto-generator.js --category SEO --commit false
  ```

### Node modules not found
```bash
npm install dotenv minimist
```

## 📈 Workflow Rekomendasi

### Daily Auto-Generation (Cron/Scheduler)

**Linux (crontab):**
```bash
# Generate 1 artikel SEO setiap hari jam 8 pagi
0 8 * * * cd /workspaces/fortoolseo.github.io && node _scripts/auto-generator.js --category SEO --topic "SEO Tips" --count 1
```

**Windows (Task Scheduler):**
```batch
node C:\path\to\auto-generator.js --category SEO --count 1
```

**GitHub Actions (CI/CD):**
```yaml
# .github/workflows/auto-article.yml
name: Auto Generate Articles
on:
  schedule:
    - cron: '0 8 * * *'  # Daily 8 AM

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
          git config user.email "bot@fortoolseo.com"
          git push origin master || true
```

## 🔗 API Documentation

### Groq API
- Docs: https://console.groq.com/docs/speech-text
- Models: mixtral-8x7b-32768, llama-3.1-70b (free)
- Limits: 30 req/min (ample untuk automation)

### Pexels API
- Docs: https://www.pexels.com/api/documentation/
- Free: Unlimited requests (atau 50/jam tanpa register)
- Search format: `/search?query=keyword&per_page=1`

## 📝 Notes

- AI content fallback ke template jika API error
- Image fallback ke placeholder jika API down
- Setiap artikel auto-increment date untuk batch generation
- Tags auto-generated dari title + category
- Excerpt dan meta_description auto-generated untuk SEO
- Git auto-commit bisa di-disable dengan `--commit false`

## 🎯 Next Steps

1. Setup API keys (5 menit)
2. Test single article: `node _scripts/auto-generator.js --category SEO --topic "Test"`
3. Setup batch generation dengan kategori favorit
4. Configure scheduler (cron/GitHub Actions) untuk daily automation
5. Monitor hasil dan adjust prompts jika perlu

---

Happy automated article generation! 🚀
