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
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''; // optional
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''; // optional fallback

// ==================== UTILITY FUNCTIONS ====================

// Slug generation
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

// Simple fallback title generator with randomization for uniqueness in batch generation
async function generateTitleFromTopic(topic, category, index = 0) {
  const trimmed = (topic || '').trim();
  if (!trimmed) return `${category} Guide #${index}`;

  // Create multiple SEO-friendly title variants
  const templates = [
    `${trimmed}: A Complete Guide`,
    `Top Tips for ${trimmed}`,
    `How to Master ${trimmed}`,
    `The Beginner's Guide to ${trimmed}`,
    `${trimmed}: Best Practices & Tips`,
    `Advanced Strategies for ${trimmed}`,
    `Everything You Need to Know About ${trimmed}`,
    `Proven Methods for ${trimmed}`,
    `${trimmed} 101: Getting Started`,
    `Professional Tips for ${trimmed}`,
    `Why ${trimmed} Matter in 2025`,
    `${trimmed}: Insider Secrets Revealed`,
    `The Ultimate ${trimmed} Handbook`,
    `How to Get Started with ${trimmed}`,
    `${trimmed} Success Stories & Tips`
  ];

  // Randomize based on index + timestamp to ensure variety even in rapid generation
  const seed = index + Math.floor(Date.now() / 1000);
  const idx = (seed * 7919) % templates.length; // Use prime multiplier for better distribution
  return templates[idx];
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

// Generate artikel dengan Groq API (free) atau fallback to HF/OpenRouter
// Does NOT fallback to template (caller will skip article if null)
async function generateArticleWithGroq(topic, category) {
  // Try Groq first
  if (GROQ_API_KEY) {
    const result = await tryGroqAPI(topic, category);
    if (result) return result;
  }

  // Try Hugging Face as fallback
  if (HUGGINGFACE_API_KEY) {
    const result = await tryHuggingFaceAPI(topic, category);
    if (result) return result;
  }

  // Optional: try OpenRouter if configured
  if (OPENROUTER_API_KEY) {
    const result = await tryOpenRouterAPI(topic, category);
    if (result) return result;
  }

  // No AI provider worked; return null (no template fallback)
  console.log('⚠️  No working AI API - skipping article.');
  return null;
}

// Unified AI generation wrapper used by main flow
// Returns null if all AI providers fail (no template fallback)
async function generateArticleWithAI(title, category, tags = []) {
  // Try AI providers: Groq first, then HuggingFace, then OpenRouter
  try {
    const result = await generateArticleWithGroq(title, category);
    if (result) return result;
  } catch (e) {
    // continue to next provider
  }

  // If all AI fails, return null (caller will skip article)
  return null;
}

// Try OpenRouter API (free tier available)
async function tryOpenRouterAPI(topic, category) {
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

Pastikan: Konten informatif, 1500+ kata, natural Indonesian.
Output hanya HTML content (tanpa YAML frontmatter), mulai dari h2 pertama.`;

    const response = await makeRequest('https://openrouter.ai/api/v1/chat/completions', 'POST', {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://fortoolseo.github.io'
    }, {
      model: 'meta-llama/llama-2-70b-chat',
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 4000
    });

    if (response.status === 200 && response.data.choices) {
      console.log('✅ Using OpenRouter API');
      return response.data.choices[0].message.content;
    }
  } catch (error) {
    // Silent fail, try next
  }
  return null;
}

// Try Groq API dengan model fallback
async function tryGroqAPI(topic, category) {
  try {
    const prompt = `Write a casual, modern blog post about: "${topic}".

Requirements:
- Language: Casual English (like talking to a friend, use contractions like "you're", "it's", "we're")
- Tone: Friendly, conversational, authentic—NOT formal or robotic
- Length: 800-1200 words
- Structure: Simple and clean—use 2-4 main sections with brief subsections
- SEO: Include the main keyword naturally in the first 100 words and throughout, use semantic headings
- Anti-AI feel: Vary sentence length, use personal insights, ask rhetorical questions, include casual transitions like "Honestly," "Here's the thing," "The reality is..."
- Sections: Use only these h2 headings: introduction, why it matters, how to do it, key takeaways, conclusion
- Links: Include 1 external link to a relevant resource
- Output: ONLY HTML from <h2> onward (no YAML frontmatter, no <h1>)
- Never use emoji, bullet lists are OK but keep them short
- Make it feel like a real person wrote it, not an AI

Example tone: "So here's the deal with [topic]... Most people get it wrong because..."`;


    const models = [
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'llama-2-70b-4096'
    ];

    for (const model of models) {
      try {
        const response = await makeRequest('https://api.groq.com/openai/v1/chat/completions', 'POST', {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }, {
          model: model,
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 4000,
          temperature: 0.7
        });

        if (response.status === 200 && response.data.choices) {
          console.log(`✅ Using Groq API (model: ${model})`);
          return response.data.choices[0].message.content;
        }
      } catch (e) {
        // Try next model
      }
    }
  } catch (error) {
    // Silent fail
  }
  return null;
}

// Try Hugging Face Inference API as fallback
async function tryHuggingFaceAPI(topic, category) {
  try {
    const prompt = `Create a high-quality SEO blog article about: "${topic}".\n\nRequirements:\n- Language: English\n- Tone: Informative, original, human-like\n- Length: between 700 and 1500 words (choose a random length in this range)\n- SEO: include the main keyword in the first 100 words, use semantic headings, and natural keyword variations\n- Anti-duplicate: write unique content, avoid copying known sources\n- Anti-AI-detector: vary sentence length, use idiomatic phrases and human-like structure\n- Include sections in HTML with h2/h3 IDs: pengenalan, manfaat, langkah, tools, tips, kesimpulan\n- Add suggested categories/tags such as: tips, tricks, how-to, life-hack, online-business, airdrop, crypto, gaming, android, ios\n- Where relevant, include 1-2 external links (e.g., official app store links or reputable sources) and at least one link back to the blog homepage (https://fortoolseo.github.io)\n- For apps mention platform and provide Play Store or App Store link if available\n- Output: only the article HTML starting from the first h2 tag; do NOT include YAML frontmatter.`;

    // Try a larger, more capable model (Mistral or similar)
    const hfUrl = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1';
    const response = await makeRequest(hfUrl, 'POST', {
      'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json'
    }, {
      inputs: prompt,
      parameters: {
        max_new_tokens: 1500,
        temperature: 0.7,
        return_full_text: false
      }
    });

    if (response.status === 200 && response.data && (response.data.generated_text || (Array.isArray(response.data) && response.data.length > 0))) {
      console.log('✅ Using Hugging Face API');
      if (response.data.generated_text) return response.data.generated_text;
      if (Array.isArray(response.data) && response.data.length > 0) {
        if (response.data[0].generated_text) return response.data[0].generated_text;
      }
      // Some models return plain text
      if (typeof response.data === 'string' && response.data.length > 100) return response.data;
    } else {
      console.log('⚠️  Hugging Face API returned:', response.status, response.data ? Object.keys(response.data)[0] : 'no data');
    }
  } catch (e) {
    // fail silently
  }
  return null;
}

// Try fetch image from Pexels (safe fallback)
async function getImageFromPexels(query) {
  try {
    if (!PEXELS_API_KEY) return null;
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
    const response = await makeRequest(url, 'GET', {
      'Authorization': PEXELS_API_KEY,
      'Content-Type': 'application/json'
    });

    if (response && response.status === 200 && response.data && response.data.photos && response.data.photos.length > 0) {
      const photo = response.data.photos[0];
      // prefer large or original
      return (photo.src && (photo.src.large || photo.src.original)) || null;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function getPlaceholderImage() {
  return `https://picsum.photos/1200/630?random=${Math.floor(Math.random() * 1000)}`;
}

// Fallback: Generate default article dari template
function generateDefaultArticle(topic, category) {
// Fallback: Generate default article in English
function generateDefaultArticle(topic, category) {
  return `<h2 id="pengenalan">📖 What is ${topic}?</h2>
<p>${topic} is a crucial topic in the world of ${category}. Learn in-depth how implementing these strategies can improve your website performance and boost your online presence.</p>

<h2 id="manfaat">🎯 Benefits and Advantages</h2>
<ul>
  <li><strong>Improved Performance:</strong> Proper optimization delivers significant results and measurable improvements.</li>
  <li><strong>Better User Experience:</strong> Visitors receive genuine value and stay longer on your site.</li>
  <li><strong>Higher Conversion Rates:</strong> Efficient marketing strategies lead to more conversions and sales.</li>
  <li><strong>Authority Building:</strong> Your brand becomes more trusted and recognized in the industry.</li>
</ul>

<h2 id="langkah">🛠️ Implementation Steps</h2>
<h3>1. Initial Analysis and Audit</h3>
<p>Start with a deep understanding of your current situation and identify areas that need improvement.</p>

<h3>2. Strategic Planning</h3>
<p>Create a long-term roadmap with measurable KPIs and realistic goals.</p>

<h3>3. Phased Implementation</h3>
<p>Execute changes systematically, test thoroughly, and monitor results consistently.</p>

<h3>4. Continuous Optimization</h3>
<p>Make refinements based on data insights and feedback from your audience.</p>

<h3>5. Documentation and Knowledge Sharing</h3>
<p>Record your learnings for future reference and share best practices with your team.</p>

<h2 id="tools">🔧 Recommended Free Tools</h2>
<div class="tools-grid">
  <div class="tool-card">
    <h4>Google Analytics 4</h4>
    <p>Track visitor traffic and behavior in real-time with comprehensive analytics.</p>
  </div>
  <div class="tool-card">
    <h4>Google Search Console</h4>
    <p>Monitor your search performance and identify issues affecting your rankings.</p>
  </div>
  <div class="tool-card">
    <h4>Google PageSpeed Insights</h4>
    <p>Audit your website performance and receive actionable improvement recommendations.</p>
  </div>
</div>

<h2 id="tips">💡 Practical Tips and Tricks</h2>
<div class="tips-container">
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Focus on Value</h4>
      <p>Provide high-quality content that genuinely helps your audience solve real problems.</p>
    </div>
  </div>
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Consistency is Key</h4>
      <p>The best results come from consistent effort over a long period of time.</p>
    </div>
  </div>
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Data-Driven Decisions</h4>
      <p>Use analytics and data to make informed decisions and avoid guesswork.</p>
    </div>
  </div>
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Stay Updated</h4>
      <p>Follow industry trends and updates to remain competitive and relevant.</p>
    </div>
  </div>
</div>

<h2 id="kesimpulan">🎓 Conclusion</h2>
<p>${topic} requires thorough understanding and proper execution. Start today with the first step, and continuously learn from your experiences to achieve maximum results. Visit our blog at <a href="https://fortoolseo.github.io">FortoolSEO</a> for more insights.</p>

<h2>❓ Frequently Asked Questions</h2>
<div class="faq-container">
  <div class="faq-item">
    <h3>1. How long until I see results?</h3>
    <p>Results vary based on competition and strategy, but most see initial improvements within 1-3 months of consistent implementation.</p>
  </div>
  <div class="faq-item">
    <h3>2. Do I need a large budget?</h3>
    <p>No, many excellent free tools are available to get started without significant investment.</p>
  </div>
  <div class="faq-item">
    <h3>3. How do I begin?</h3>
    <p>Start with a basic audit, identify your opportunities, and implement your strategy step by step.</p>
  </div>
</div>`;
} // Fallback: Generate dari topic
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

// Generate tags dari title/category - simpler, more natural, without special chars
function generateTags(title, category) {
  const stopwords = ['article', 'guide', 'complete', 'ultimate', 'beginner', 'advanced', 'everything', 'professional', 'proven', 'methods', 'strategies', 'getting', 'started', 'tips', 'best', 'practices', 'know', 'about', 'for'];
  
  const baseTags = [
    category.toLowerCase().replace(/[^a-z0-9-]/g, ''),
    'tips',
    'guide'
  ];
  
  // Extract 1-2 key words from title - clean special chars
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ') // remove special chars (colons, commas, etc)
    .split(/\s+/)
    .filter(w => w.length > 4 && !stopwords.includes(w))
    .slice(0, 2)
    .map(w => w.replace(/[^a-z0-9-]/g, '')); // final cleanup
  
  // Remove any empty or duplicate tags
  return [...new Set([...baseTags, ...words])].filter(t => t.length > 0);
}

// Main template untuk artikel lengkap - modern blog style
async function generateArticleTemplate(config) {
  const { title, category, tags, date, author, imageUrl, content } = config;
  
  // Generate engaging excerpt from content (first 150 chars)
  const excerpt = content
    .replace(/<[^>]*>/g, '') // strip HTML
    .substring(0, 150)
    .trim() + '...';
  
  // Add image if available
  const imageHtml = imageUrl ? `<img src="${imageUrl}" alt="${title}" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin: 20px 0;">` : '';
  
  // Format date nicely
  const dateObj = new Date(date);
  const dateFormatted = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `---
layout: default
title: "${title}"
date: ${date}
categories: ["${category}"]
tags: ${JSON.stringify(tags)}
author: "${author}"
excerpt: "${excerpt}"
meta_description: "${title} - learn modern tips and insights."
---

<article class="blog-post">
  <header class="post-header">
    <h1>${title}</h1>
    <div class="post-meta">
      <span class="date">${dateFormatted}</span>
      <span class="category"><a href="/categories/${category.toLowerCase()}/">${category}</a></span>
      <span class="reading-time">5 min read</span>
    </div>
  </header>

  ${imageHtml}

  <div class="post-content">
    ${content}
  </div>

  <footer class="post-footer">
    <div class="tags">
      ${tags.map(tag => `<a href="/tags/${tag.toLowerCase()}/" class="tag">#${tag}</a>`).join(' ')}
    </div>
  </footer>
</article>
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
      
      // Generate title - pass index to ensure variety in batch mode
      const title = TOPIC ? await generateTitleFromTopic(TOPIC, CATEGORY, i) : `Artikel ${CATEGORY} #${i + 1}`;
      console.log(`📌 Title: ${title}`);
      
      // Generate tags
      const tags = generateTags(title, CATEGORY);
      
      // Generate content dengan AI (NO FALLBACK: return null if all AI fails)
      const content = await generateArticleWithAI(title, CATEGORY, tags);
      
      // If AI generation failed, skip this article entirely
      if (!content) {
        console.log(`⏭️  Skipped: No AI content generated for "${title}"`);
        continue;
      }
      
      // Get image (only if AI succeeded)
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
    // Generate category & tag pages so /categories/{slug}/ and /tags/{slug}/ exist
    try {
      generateTaxonomyPages();
    } catch (e) {
      console.log('⚠️  Failed to generate taxonomy pages:', e.message);
    }

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
// ================= TAXONOMY PAGES GENERATOR =================

function slugify(text) {
  return text.toString().toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
}

function parseFrontMatter(content) {
  const fm = {};
  const match = content.match(/---([\s\S]*?)---/);
  if (!match) return fm;
  const body = match[1];
  const lines = body.split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*(\w+):\s*(.*)$/);
    if (m) {
      const key = m[1].trim();
      let val = m[2].trim();
      if (val.startsWith('[') && val.endsWith(']')) {
        try {
          val = JSON.parse(val.replace(/'/g, '"'));
        } catch (e) {
          val = val.slice(1, -1).split(',').map(s => s.replace(/"|'/g, '').trim());
        }
      } else {
        val = val.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      }
      fm[key] = val;
    }
  }
  return fm;
}

function generateTaxonomyPages() {
  const postsDir = path.join(process.cwd(), '_posts');
  if (!fs.existsSync(postsDir)) return;

  const categoriesSet = new Set();
  const tagsSet = new Set();

  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.html') || f.endsWith('.md'));
  for (const file of files) {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    const fm = parseFrontMatter(content);
    if (fm.categories) {
      if (Array.isArray(fm.categories)) fm.categories.forEach(c => categoriesSet.add(c));
      else categoriesSet.add(fm.categories);
    }
    if (fm.tags) {
      if (Array.isArray(fm.tags)) fm.tags.forEach(t => tagsSet.add(t));
      else tagsSet.add(fm.tags);
    }
  }

  // Ensure directories
  const categoriesDir = path.join(process.cwd(), 'categories');
  const tagsDir = path.join(process.cwd(), 'tags');
  if (!fs.existsSync(categoriesDir)) fs.mkdirSync(categoriesDir, { recursive: true });
  if (!fs.existsSync(tagsDir)) fs.mkdirSync(tagsDir, { recursive: true });

  // Write category pages
  categoriesSet.forEach(cat => {
    const slug = slugify(cat);
    const dir = path.join(categoriesDir, slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, 'index.html');
    const content = `---\nlayout: default\ntitle: "${cat}"\n---\n\n<section class="category-page">\n  <h1>Category: ${cat}</h1>\n  <div class="posts-grid">\n    {% raw %}{% assign posts = site.categories['${cat}'] %}{% endraw %}\n    {% raw %}{% if posts %}{% endraw %}\n    {% raw %}{% for post in posts %}{% endraw %}\n      <article class="post-card">\n        <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>\n        <small>{{ post.date | date: "%b %d, %Y" }}</small>\n      </article>\n    {% raw %}{% endfor %}{% endraw %}\n    {% raw %}{% else %}{% endraw %}\n    <p>No articles in this category yet.</p>\n    {% raw %}{% endif %}{% endraw %}\n  </div>\n</section>\n`;
    fs.writeFileSync(filePath, content, 'utf8');
  });

  // Write tag pages
  tagsSet.forEach(tag => {
    const slug = slugify(tag);
    const dir = path.join(tagsDir, slug);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = path.join(dir, 'index.html');
    const content = `---\nlayout: default\ntitle: "${tag}"\n---\n\n<section class="tag-page">\n  <h1>Tag: ${tag}</h1>\n  <div class="posts-grid">\n    {% raw %}{% assign posts = site.tags['${tag}'] %}{% endraw %}\n    {% raw %}{% if posts %}{% endraw %}\n    {% raw %}{% for post in posts %}{% endraw %}\n      <article class="post-card">\n        <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>\n        <small>{{ post.date | date: "%b %d, %Y" }}</small>\n      </article>\n    {% raw %}{% endfor %}{% endraw %}\n    {% raw %}{% else %}{% endraw %}\n    <p>No articles with this tag yet.</p>\n    {% raw %}{% endif %}{% endraw %}\n  </div>\n</section>\n`;
    fs.writeFileSync(filePath, content, 'utf8');
  });

  console.log(`✅ Generated ${categoriesSet.size} category pages and ${tagsSet.size} tag pages.`);
}

// Run
main();

