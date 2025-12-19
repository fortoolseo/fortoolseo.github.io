const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');
require('dotenv').config();

// Parse CLI arguments
const args = require('minimist')(process.argv.slice(2));

// CONFIG
const CATEGORY = args.category || process.env.CATEGORY || 'SEO';
const COUNT = parseInt(args.count || 1);
const TOPIC = args.topic || process.env.TOPIC || '';
const AUTHOR = process.env.AUTHOR || 'Admin FortoolSEO';
const AUTO_COMMIT = args.commit !== 'false';

// API Keys (free tiers)
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''; // Get free at console.groq.com
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || ''; // Get free at pexels.com/api

// ==================== UTILITY FUNCTIONS ====================

// Slug generation
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

// Filename generation
function generateFilename(title, date) {
  const slug = generateSlug(title);
  return `${date}-${slug}.html`;
}

// HTTP Request helper
function makeRequest(url, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// ==================== AI CONTENT GENERATION ====================

// Generate artikel dengan Groq API (free)
async function generateArticleWithGroq(topic, category) {
  if (!GROQ_API_KEY) {
    console.log('⚠️  No GROQ_API_KEY found. Using template...');
    return generateDefaultArticle(topic, category);
  }

  try {
    const prompt = `Buatkan artikel SEO blog yang berkualitas tinggi tentang: "${topic}"
    
Kategori: ${category}
Bahasa: Indonesian
Format: Gunakan struktur HTML dengan heading h2 yang jelas dan h3 untuk subseksi.

Struktur yang diinginkan:
1. Pengenalan (h2 id="pengenalan")
2. Manfaat (h2 id="manfaat") - minimal 4 poin
3. Langkah-langkah Implementasi (h2 id="langkah") - minimal 5 langkah dengan h3
4. Tools Gratis Rekomendasi (h2 id="tools") - minimal 3 tools
5. Tips & Trik Praktis (h2 id="tips") - minimal 4 tips
6. Kesimpulan (h2 id="kesimpulan")

Pastikan:
- Konten informatif dan SEO-friendly
- Minimal 1500+ kata
- Include internal linking suggestions
- Gunakan emoji untuk visual appeal (📖 ✅ 🎯 🛠️ 💡 🎓)
- Natural Indonesian, hindari bahasa formal yang kaku

Output hanya HTML content (tanpa YAML frontmatter), mulai dari h2 pertama.`;

    const response = await makeRequest('https://api.groq.com/openai/v1/chat/completions', 'POST', {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    }, {
      model: 'mixtral-8x7b-32768',
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 4000,
      temperature: 0.7
    });

    if (response.status === 200 && response.data.choices) {
      return response.data.choices[0].message.content;
    } else {
      console.log('⚠️  Groq API error, using template...');
      return generateDefaultArticle(topic, category);
    }
  } catch (error) {
    console.log('⚠️  Groq connection error:', error.message);
    return generateDefaultArticle(topic, category);
  }
}

// Fallback: Generate default article dari template
function generateDefaultArticle(topic, category) {
  return `<h2 id="pengenalan">📖 Apa Itu ${topic}?</h2>
<p>${topic} adalah topik penting dalam dunia ${category}. Pelajari secara mendalam bagaimana implementasinya dapat meningkatkan performa website Anda.</p>

<h2 id="manfaat">🎯 Manfaat dan Keuntungan</h2>
<ul>
  <li><strong>Meningkatkan Performa:</strong> Optimasi yang tepat memberikan hasil signifikan</li>
  <li><strong>User Experience Lebih Baik:</strong> Pengunjung mendapat nilai tambah</li>
  <li><strong>Conversion Rate Lebih Tinggi:</strong> Efisiensi marketing meningkat</li>
  <li><strong>Authority Building:</strong> Brand menjadi lebih dipercaya di industri</li>
</ul>

<h2 id="langkah">🛠️ Langkah-langkah Implementasi</h2>
<h3>1. Analisis dan Audit Awal</h3>
<p>Mulai dengan pemahaman mendalam tentang kondisi saat ini dan area yang perlu improvement.</p>

<h3>2. Perencanaan Strategis</h3>
<p>Buat roadmap jangka panjang dengan KPI yang terukur dan realistis.</p>

<h3>3. Implementasi Bertahap</h3>
<p>Jalankan perubahan secara sistematis, test dan monitor hasilnya.</p>

<h3>4. Optimasi Berkelanjutan</h3>
<p>Lakukan refinement berdasarkan data dan feedback dari audience.</p>

<h3>5. Dokumentasi dan Knowledge Sharing</h3>
<p>Catat setiap pembelajaran untuk referensi di masa depan.</p>

<h2 id="tools">🔧 Tools Gratis yang Direkomendasikan</h2>
<div class="tools-grid">
  <div class="tool-card">
    <h4>Google Analytics 4</h4>
    <p>Analisis traffic dan behavior pengunjung secara real-time</p>
  </div>
  <div class="tool-card">
    <h4>Google Search Console</h4>
    <p>Monitor performa di Google Search dan debug issues</p>
  </div>
  <div class="tool-card">
    <h4>Google PageSpeed Insights</h4>
    <p>Audit performa website dan rekomendasi perbaikan</p>
  </div>
</div>

<h2 id="tips">💡 Tips & Trik Praktis</h2>
<div class="tips-container">
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Fokus pada Value</h4>
      <p>Berikan konten berkualitas yang benar-benar membantu audience Anda.</p>
    </div>
  </div>
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Konsisten adalah Kunci</h4>
      <p>Hasil terbaik datang dari usaha konsisten dalam jangka panjang.</p>
    </div>
  </div>
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Data-Driven Decisions</h4>
      <p>Gunakan analytics untuk membuat keputusan yang informed.</p>
    </div>
  </div>
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Stay Updated</h4>
      <p>Ikuti perkembangan terbaru di industri untuk tetap relevan.</p>
    </div>
  </div>
</div>

<h2 id="kesimpulan">🎓 Kesimpulan</h2>
<p>${topic} memerlukan pemahaman menyeluruh dan eksekusi yang tepat. Mulai hari ini dengan langkah pertama, dan terus belajar dari setiap pengalaman untuk hasil maksimal.</p>

<h2>❓ FAQ</h2>
<div class="faq-container">
  <div class="faq-item">
    <h3>1. Berapa lama hasil terlihat?</h3>
    <p>Tergantung pada kompetisi dan strategi yang dijalankan, umumnya 1-3 bulan untuk hasil awal.</p>
  </div>
  <div class="faq-item">
    <h3>2. Apakah perlu budget besar?</h3>
    <p>Tidak, banyak tools gratis yang dapat digunakan untuk memulai.</p>
  </div>
  <div class="faq-item">
    <h3>3. Bagaimana cara memulai?</h3>
    <p>Mulai dari audit dasar, identifikasi opportunity, dan implementasi strategi.</p>
  </div>
</div>`;
}

// ==================== IMAGE GENERATION ====================

// Get gambar dari Pexels (free unlimited)
async function getImageFromPexels(query) {
  if (!PEXELS_API_KEY) {
    console.log('⚠️  No PEXELS_API_KEY, image skipped');
    return null;
  }

  try {
    const searchQuery = query.split(' ').slice(0, 3).join(' ');
    const response = await makeRequest(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=1`,
      'GET',
      { 'Authorization': PEXELS_API_KEY }
    );

    if (response.status === 200 && response.data.photos && response.data.photos.length > 0) {
      return response.data.photos[0].src.medium;
    }
  } catch (error) {
    console.log('⚠️  Pexels API error:', error.message);
  }

  return null;
}

// Fallback placeholder image
function getPlaceholderImage() {
  return 'https://via.placeholder.com/800x400?text=FortoolSEO+Article';
}

// ==================== ARTICLE GENERATION ====================

async function generateArticleWithAI(title, category, tags) {
  console.log(`🤖 Generating content dengan AI untuk: "${title}"`);
  
  const content = await generateArticleWithGroq(title, category);
  
  return content;
}

// Generate judul dari topic/keyword
async function generateTitleFromTopic(topic, category) {
  // Jika ada AI, bisa generate title yang lebih creative
  // Fallback: Generate dari topic
  const subtopics = [
    'Panduan Lengkap',
    'Cara Optimasi',
    'Tips & Trik',
    'Tutorial Untuk Pemula',
    'Strategi Terbaik',
    'Best Practices'
  ];
  
  const random = subtopics[Math.floor(Math.random() * subtopics.length)];
  return `${random} ${topic}`;
}

// Generate tags dari title/category
function generateTags(title, category) {
  const baseTags = [
    category.toLowerCase(),
    'tutorial',
    'gratis',
    'panduan'
  ];
  
  const words = title
    .toLowerCase()
    .split(' ')
    .filter(w => w.length > 4)
    .slice(0, 3);
  
  return [...baseTags, ...words];
}

// Main template untuk artikel lengkap
async function generateArticleTemplate(config) {
  const { title, category, tags, date, author, imageUrl, content } = config;
  
  // Add image ke content di awal
  const imageHtml = imageUrl ? `<img src="${imageUrl}" alt="${title}" loading="lazy" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">` : '';
  
  return `---
layout: default
title: "${title}"
date: ${date}
categories: ["${category}"]
tags: ${JSON.stringify(tags)}
author: "${author}"
excerpt: "Pelajari tentang ${title}. Panduan lengkap dengan tips praktis dan tools gratis untuk implementasi ${category}."
meta_description: "Tutorial ${title}. Dapatkan panduan komprehensif, tips, dan tools gratis untuk sukses di ${category}."
---

<h1>${title}</h1>

<div class="article-meta">
  <span>📅 ${date}</span>
  <span>📂 ${category}</span>
  <span>👤 ${author}</span>
  <span>🏷️ ${tags.slice(0, 3).join(', ')}</span>
</div>

${imageHtml}

<div class="toc">
  <h3>📑 Daftar Isi</h3>
  <ul>
    <li><a href="#pengenalan">Pengenalan</a></li>
    <li><a href="#manfaat">Manfaat</a></li>
    <li><a href="#langkah">Implementasi</a></li>
    <li><a href="#tools">Tools Gratis</a></li>
    <li><a href="#tips">Tips & Trik</a></li>
    <li><a href="#kesimpulan">Kesimpulan</a></li>
  </ul>
</div>

${content}
`;
}

// ==================== GIT AUTO-PUBLISH ====================

function commitAndPush(filenames) {
  if (!AUTO_COMMIT) {
    console.log('⏭️  Skipping auto commit (--commit=false)');
    return;
  }

  try {
    console.log('📤 Auto committing ke GitHub...');
    
    // Add files
    execSync(`git add ${filenames.map(f => `_posts/${f}`).join(' ')}`, { 
      stdio: 'pipe',
      cwd: '/workspaces/fortoolseo.github.io'
    });
    
    // Commit
    const message = filenames.length === 1 
      ? `✨ Add article: ${filenames[0]}`
      : `✨ Add ${filenames.length} articles: ${filenames.join(', ')}`;
    
    execSync(`git commit -m "${message}"`, { 
      stdio: 'pipe',
      cwd: '/workspaces/fortoolseo.github.io'
    });
    
    // Push
    execSync('git push origin master', { 
      stdio: 'pipe',
      cwd: '/workspaces/fortoolseo.github.io'
    });
    
    console.log('✅ Pushed to GitHub!');
  } catch (error) {
    console.log('⚠️  Git push failed (manual push needed)');
    console.log('Run: git push origin master');
  }
}

// ==================== MAIN PROCESS ====================

async function main() {
  console.log('🚀 FortoolSEO AI Article Generator\n');
  console.log(`📚 Category: ${CATEGORY}`);
  console.log(`📝 Count: ${COUNT}`);
  console.log(`🔑 Topic/Keyword: ${TOPIC || '(auto-generated)'}\n`);
  
  // Validasi
  if (!TOPIC && COUNT > 1) {
    console.log('⚠️  Untuk batch generate, gunakan --topic "keyword"');
    process.exit(1);
  }

  const createdFiles = [];

  for (let i = 0; i < COUNT; i++) {
    try {
      console.log(`\n━━━ Artikel ${i + 1}/${COUNT} ━━━`);
      
      // Generate title
      const title = TOPIC ? await generateTitleFromTopic(TOPIC, CATEGORY) : `Artikel ${CATEGORY} #${i + 1}`;
      console.log(`📌 Title: ${title}`);
      
      // Generate tags
      const tags = generateTags(title, CATEGORY);
      
      // Generate content dengan AI
      const content = await generateArticleWithAI(title, CATEGORY, tags);
      
      // Get image
      console.log('🖼️  Fetching image...');
      const imageUrl = await getImageFromPexels(TOPIC || title);
      
      // Generate date (increment untuk multiple articles)
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Create article
      const articleContent = await generateArticleTemplate({
        title,
        category: CATEGORY,
        tags,
        date: dateStr,
        author: AUTHOR,
        imageUrl: imageUrl || getPlaceholderImage(),
        content
      });
      
      // Write file
      const filename = generateFilename(title, dateStr);
      const filepath = path.join('/workspaces/fortoolseo.github.io/_posts', filename);
      
      if (!fs.existsSync(path.dirname(filepath))) {
        fs.mkdirSync(path.dirname(filepath), { recursive: true });
      }
      
      fs.writeFileSync(filepath, articleContent, 'utf8');
      console.log(`✅ Created: ${filename}`);
      
      createdFiles.push(filename);
      
    } catch (error) {
      console.error(`❌ Error generating article ${i + 1}:`, error.message);
    }
  }

  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✨ Generated ${createdFiles.length} artikel\n`);
  
  createdFiles.forEach(f => {
    console.log(`  📄 ${f}`);
  });

  // Auto commit & push
  if (createdFiles.length > 0) {
    console.log('\n' + '━'.repeat(30));
    commitAndPush(createdFiles);
  }

  console.log('\n✅ Done! Artikel siap di publish.');
}

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Error:', reason);
  process.exit(1);
});

// Run
main();

