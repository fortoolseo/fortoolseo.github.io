const fs = require('fs');
const path = require('path');

// CONFIG: Sesuaikan dengan kebutuhan kamu
const ARTICLE_CONFIG = {
  title: "Cara Optimasi SEO On-Page untuk Pemula",
  category: "SEO",
  tags: ["seo", "on-page", "optimasi", "pemula", "tutorial"],
  date: new Date().toISOString().split('T')[0], // Tanggal hari ini
  author: "Admin FortoolSEO"
};

// Fungsi untuk generate slug dari judul
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

// Fungsi untuk generate filename
function generateFilename(title, date) {
  const slug = generateSlug(title);
  return `${date}-${slug}.html`;
}

// Template artikel lengkap
function generateArticleTemplate(config) {
  const { title, category, tags, date, author } = config;
  const slug = generateSlug(title);
  
  return `---
layout: default
title: "${title}"
date: ${date}
categories: ["${category}"]
tags: ${JSON.stringify(tags)}
author: "${author}"
excerpt: "Panduan lengkap tentang ${title}. Pelajari strategi, tips, dan implementasi praktis untuk pemula."
meta_description: "Artikel tutorial ${title}. Temukan cara optimasi website, tools gratis, dan tips SEO efektif."
---

<h1>${title}</h1>

<div class="article-meta">
  <span>📅 ${date}</span>
  <span>📂 ${category}</span>
  <span>👤 ${author}</span>
  <span>🏷️ ${tags.slice(0, 3).join(', ')}</span>
</div>

<div class="toc">
  <h3>📑 Daftar Isi</h3>
  <ul>
    <li><a href="#pengenalan">Apa Itu ${title.split('untuk')[0] || 'SEO On-Page'}?</a></li>
    <li><a href="#manfaat">Manfaat dan Keuntungan</a></li>
    <li><a href="#langkah">Langkah-langkah Implementasi</a></li>
    <li><a href="#tools">Tools Gratis yang Direkomendasikan</a></li>
    <li><a href="#tips">Tips & Trik Praktis</a></li>
    <li><a href="#kesimpulan">Kesimpulan</a></li>
  </ul>
</div>

<h2 id="pengenalan">📖 Apa Itu ${title.split('untuk')[0] || 'SEO On-Page'}?</h2>
<p>${title} adalah teknik optimasi yang dilakukan langsung pada halaman website untuk meningkatkan ranking di mesin pencari seperti Google.</p>

<h2 id="manfaat">🎯 Manfaat dan Keuntungan</h2>
<ul>
  <li><strong>Meningkatkan Organic Traffic:</strong> Website lebih mudah ditemukan di hasil pencarian</li>
  <li><strong>User Experience Lebih Baik:</strong> Struktur konten yang terorganisir</li>
  <li><strong>Conversion Rate Lebih Tinggi:</strong> Pengunjung lebih mudah melakukan action</li>
  <li><strong>Authority Building:</strong> Website dianggap lebih kredibel</li>
</ul>

<h2 id="langkah">🛠️ Langkah-langkah Implementasi</h2>

<h3>1. Analisis Kondisi Saat Ini</h3>
<p>Sebelum mulai optimasi, cek kondisi website saat ini menggunakan Google Search Console dan Analytics.</p>

<h3>2. Optimasi Title Tag & Meta Description</h3>
<p>Pastikan setiap halaman punya title tag unik dan meta description yang menarik.</p>

<h3>3. Struktur Heading yang Jelas</h3>
<p>Gunakan H1 untuk judul utama, H2 untuk subjudul, dan H3 untuk poin-poin penting.</p>

<h3>4. Optimasi Konten</h3>
<p>Buat konten yang relevan, informatif, dan menjawab kebutuhan pencari.</p>

<h3>5. Optimasi Gambar</h3>
<p>Kompres gambar, tambah alt text, dan gunakan nama file yang deskriptif.</p>

<h3>6. Internal Linking</h3>
<p>Tautkan artikel yang relevan untuk meningkatkan engagement.</p>

<h2 id="tools">🔧 Tools Gratis yang Direkomendasikan</h2>
<div class="tools-grid">
  <div class="tool-card">
    <h4>Google Search Console</h4>
    <p>Monitor performa website di Google Search</p>
  </div>
  <div class="tool-card">
    <h4>Google Analytics</h4>
    <p>Analisis traffic dan behavior pengunjung</p>
  </div>
  <div class="tool-card">
    <h4>Screaming Frog SEO Spider</h4>
    <p>Crawl website untuk audit teknis (500 URL gratis)</p>
  </div>
  <div class="tool-card">
    <h4>Ubersuggest</h4>
    <p>Keyword research dan competitor analysis</p>
  </div>
</div>

<h2 id="tips">💡 Tips & Trik Praktis</h2>
<div class="tips-container">
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Konsisten adalah Kunci</h4>
      <p>SEO bukan instan, butuh waktu 3-6 bulan untuk hasil signifikan.</p>
    </div>
  </div>
  
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Quality Over Quantity</h4>
      <p>Fokus pada kualitas konten, bukan jumlah kata.</p>
    </div>
  </div>
  
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Mobile First</h4>
      <p>Optimasi untuk pengguna mobile karena mayoritas traffic berasal dari HP.</p>
    </div>
  </div>
  
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Monitor Berkala</h4>
      <p>Cek progress mingguan dan lakukan adjustment jika perlu.</p>
    </div>
  </div>
</div>

<h2 id="kesimpulan">🎓 Kesimpulan</h2>
<p>${title} adalah investasi jangka panjang yang memberikan hasil berkelanjutan. Mulai dari optimasi dasar, implementasi bertahap, dan pantau hasil secara konsisten.</p>

<h2>❓ FAQ (Frequently Asked Questions)</h2>
<div class="faq-container">
  <div class="faq-item">
    <h3>1. Berapa lama hasil SEO On-Page terlihat?</h3>
    <p>Biasanya 3-6 bulan untuk keyword kompetitif, 1-3 bulan untuk keyword long-tail.</p>
  </div>
  
  <div class="faq-item">
    <h3>2. Apakah perlu pakai tools berbayar?</h3>
    <p>Tidak wajib. Tools gratis sudah cukup untuk pemula.</p>
  </div>
  
  <div class="faq-item">
    <h3>3. Bagaimana cara mulai optimasi?</h3>
    <p>Mulai dari audit website, perbaiki masalah teknis, lalu optimasi konten.</p>
  </div>
  
  <div class="faq-item">
    <h3>4. SEO On-Page vs Off-Page, mana lebih penting?</h3>
    <p>Keduanya penting. On-Page untuk optimasi internal, Off-Page untuk authority.</p>
  </div>
</div>

<!-- Related Posts akan otomatis di-generate oleh Jekyll -->
`;
}

// Fungsi utama
function main() {
  console.log('🚀 Starting Auto Article Generator...\n');
  
  // Generate filename
  const filename = generateFilename(ARTICLE_CONFIG.title, ARTICLE_CONFIG.date);
  const filepath = path.join('_posts', filename);
  
  // Generate konten
  const articleContent = generateArticleTemplate(ARTICLE_CONFIG);
  
  // Cek apakah folder _posts ada
  if (!fs.existsSync('_posts')) {
    console.log('📁 Creating _posts folder...');
    fs.mkdirSync('_posts', { recursive: true });
  }
  
  // Cek apakah file sudah ada
  if (fs.existsSync(filepath)) {
    console.log(`⚠️  File already exists: ${filename}`);
    console.log('🔄 Generating with new date...');
    
    // Tambah 1 hari
    const tomorrow = new Date(ARTICLE_CONFIG.date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    ARTICLE_CONFIG.date = tomorrow.toISOString().split('T')[0];
    
    const newFilename = generateFilename(ARTICLE_CONFIG.title, ARTICLE_CONFIG.date);
    const newFilepath = path.join('_posts', newFilename);
    
    fs.writeFileSync(newFilepath, articleContent, 'utf8');
    console.log(`✅ Article created: ${newFilename}`);
    console.log(`📂 Location: ${newFilepath}`);
  } else {
    // Buat file baru
    fs.writeFileSync(filepath, articleContent, 'utf8');
    console.log(`✅ Article created: ${filename}`);
    console.log(`📂 Location: ${filepath}`);
  }
  
  // Tampilkan info
  console.log('\n📊 ARTICLE INFO:');
  console.log(`Title: ${ARTICLE_CONFIG.title}`);
  console.log(`Date: ${ARTICLE_CONFIG.date}`);
  console.log(`Category: ${ARTICLE_CONFIG.category}`);
  console.log(`Tags: ${ARTICLE_CONFIG.tags.join(', ')}`);
  console.log(`\n🎉 Done! File sudah siap di folder _posts/`);
}

// Run generator
main();
