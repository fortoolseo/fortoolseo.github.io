const fs = require('fs');
const path = require('path');
const axios = require('axios');

// List topik SEO untuk blog kamu
const TOPICS = [
  "Cara Optimasi SEO On-Page untuk Pemula",
  "Tools Google Gratis untuk Analisis Website",
  "Strategi Backlink Building 2024",
  "Panduan Google Search Console Lengkap",
  "Technical SEO Checklist untuk Website",
  "Keyword Research yang Efektif",
  "Local SEO untuk Bisnis Lokal",
  "Mobile SEO Optimization",
  "Content Marketing untuk Ranking Tinggi",
  "SEO Audit Website Gratis"
];

// Pilih topik random
function getRandomTopic() {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

// Generate slug dari judul
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

// Format tanggal untuk Jekyll
function getCurrentDate() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Generate konten sederhana (fallback jika AI gagal)
function generateSimpleContent(topic, category) {
  return `
<h2>Apa Itu ${topic}?</h2>
<p>${topic} adalah salah satu aspek penting dalam digital marketing dan SEO.</p>

<h2>Manfaat ${topic}</h2>
<p>Dengan menerapkan ${topic}, kamu dapat meningkatkan visibilitas website di mesin pencari.</p>

<h2>Langkah-Langkah ${topic}</h2>
<ol>
  <li>Lakukan riset dan persiapan</li>
  <li>Implementasi strategi</li>
  <li>Monitoring hasil</li>
  <li>Optimasi berkelanjutan</li>
</ol>

<h2>Tools yang Direkomendasikan</h2>
<ul>
  <li>Google Analytics</li>
  <li>Google Search Console</li>
  <li>SEMrush / Ahrefs</li>
  <li>Screaming Frog SEO Spider</li>
</ul>

<h2>Kesimpulan</h2>
<p>${topic} membutuhkan konsistensi dan pemahaman yang baik untuk hasil optimal.</p>
`;
}

// Generate artikel dengan AI (OpenAI)
async function generateWithAI(topic, category) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️ API Key tidak ditemukan, menggunakan konten simple');
    return generateSimpleContent(topic, category);
  }
  
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Kamu adalah ahli SEO dan content writer profesional. Buat artikel blog dalam bahasa Indonesia."
          },
          {
            role: "user",
            content: `Buat artikel blog tentang "${topic}" untuk kategori ${category}. 
            Format HTML dengan struktur: judul H1, pendahuluan, 3-4 section dengan H2, kesimpulan. 
            Gunakan bahasa Indonesia yang profesional.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data.choices[0].message.content;
    
  } catch (error) {
    console.error('❌ Error AI:', error.message);
    return generateSimpleContent(topic, category);
  }
}

// Main function
async function main() {
  console.log('🚀 Memulai AI Blog Writer...');
  
  const topic = getRandomTopic();
  const category = "SEO"; // Default category
  const slug = generateSlug(topic);
  const date = getCurrentDate();
  const filename = `${date}-${slug}.html`;
  const filepath = path.join('_posts', filename);
  
  console.log(`📝 Topic: ${topic}`);
  console.log(`📁 Category: ${category}`);
  console.log(`📅 Date: ${date}`);
  console.log(`💾 File: ${filename}`);
  
  // Generate konten
  const content = await generateWithAI(topic, category);
  
  // Front Matter untuk Jekyll
  const frontMatter = `---
layout: default
title: "${topic}"
date: ${date}
categories: ["${category}"]
tags: ["seo", "${category.toLowerCase()}", "tutorial"]
excerpt: "Artikel tentang ${topic} untuk meningkatkan ranking website."
---

${content}
`;
  
  // Pastikan folder _posts ada
  if (!fs.existsSync('_posts')) {
    fs.mkdirSync('_posts');
  }
  
  // Tulis file
  fs.writeFileSync(filepath, frontMatter, 'utf8');
  console.log(`✅ Artikel berhasil dibuat: ${filepath}`);
  console.log(`📊 Panjang konten: ${content.length} karakter`);
}

// Run
main().catch(console.error);
