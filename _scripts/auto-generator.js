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
const DELAY_BETWEEN_ARTICLES = 15000; // 15 detik jeda antara artikel

// API Keys (free tiers)
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''; // Get free at console.groq.com
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || ''; // Get free at pexels.com/api
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''; // optional
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || ''; // optional fallback

// ==================== UTILITY FUNCTIONS ====================

// Fungsi delay/pause
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

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

// ==================== DYNAMIC CATEGORY FUNCTIONS ====================

// Fungsi untuk menentukan kategori dinamis berdasarkan topik/judul
function getDynamicCategoryFromTopic(topic) {
  if (!topic) return 'SEO & Marketing'; // Default
  
  const topicLower = topic.toLowerCase();
  
  // Mapping keywords to categories
  const categoryMap = {
    // AI & Machine Learning
    'ai': 'AI & Machine Learning',
    'chatgpt': 'AI & Machine Learning',
    'gemini': 'AI & Machine Learning',
    'gpt': 'AI & Machine Learning',
    'artificial intelligence': 'AI & Machine Learning',
    'machine learning': 'AI & Machine Learning',
    'openai': 'AI & Machine Learning',
    'veo': 'AI & Machine Learning',
    
    // SEO & Marketing
    'seo': 'SEO & Marketing',
    'search': 'SEO & Marketing',
    'google': 'SEO & Marketing',
    'keyword': 'SEO & Marketing',
    'ranking': 'SEO & Marketing',
    'traffic': 'SEO & Marketing',
    'backlink': 'SEO & Marketing',
    'on-page': 'SEO & Marketing',
    'off-page': 'SEO & Marketing',
    'marketing': 'SEO & Marketing',
    'digital marketing': 'SEO & Marketing',
    
    // Content & Writing
    'content': 'Content & Writing',
    'writing': 'Content & Writing',
    'blog': 'Content & Writing',
    'article': 'Content & Writing',
    'copywriting': 'Content & Writing',
    'editorial': 'Content & Writing',
    
    // Tools & Software
    'tool': 'Tools & Software',
    'software': 'Tools & Software',
    'app': 'Tools & Software',
    'application': 'Tools & Software',
    'platform': 'Tools & Software',
    'system': 'Tools & Software',
    
    // Finance & Business
    'finance': 'Finance & Business',
    'money': 'Finance & Business',
    'investment': 'Finance & Business',
    'business': 'Finance & Business',
    'startup': 'Finance & Business',
    'entrepreneur': 'Finance & Business',
    'income': 'Finance & Business',
    'revenue': 'Finance & Business',
    
    // Productivity
    'productivity': 'Productivity',
    'efficiency': 'Productivity',
    'time management': 'Productivity',
    'workflow': 'Productivity',
    'automation': 'Productivity',
    'hack': 'Productivity',
    'tip': 'Productivity',
    'trick': 'Productivity',
    
    // Technology
    'tech': 'Technology',
    'technology': 'Technology',
    'digital': 'Technology',
    'web': 'Technology',
    'website': 'Technology',
    'online': 'Technology',
    'internet': 'Technology',
    
    // Data & Analytics
    'data': 'Data & Analytics',
    'analytics': 'Data & Analytics',
    'metric': 'Data & Analytics',
    'statistic': 'Data & Analytics',
    'analysis': 'Data & Analytics',
    'report': 'Data & Analytics'
  };
  
  // Cari kategori berdasarkan keyword
  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (topicLower.includes(keyword)) {
      return category;
    }
  }
  
  // Jika tidak ditemukan, pilih kategori secara random
  const defaultCategories = [
    'SEO & Marketing',
    'AI & Machine Learning', 
    'Content & Writing',
    'Tools & Software',
    'Finance & Business',
    'Productivity',
    'Technology',
    'Data & Analytics'
  ];
  
  // Gunakan hash dari topic untuk konsistensi (jika topic sama, category sama)
  let hash = 0;
  for (let i = 0; i < topicLower.length; i++) {
    hash = ((hash << 5) - hash) + topicLower.charCodeAt(i);
    hash = hash & hash;
  }
  const idx = Math.abs(hash) % defaultCategories.length;
  
  return defaultCategories[idx];
}

// Fungsi untuk menambahkan kategori ke tags jika belum ada
function enrichTagsWithCategory(tags, category) {
  const categorySlug = category.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  
  // Hapus kata umum dari kategori untuk dijadikan tag
  const categoryWords = category.split(/[&\s]+/).filter(word => 
    word.length > 3 && 
    !['and', 'the', 'for', 'with', 'from', 'that', 'this'].includes(word.toLowerCase())
  );
  
  const categoryTags = categoryWords.map(word => word.toLowerCase());
  
  // Gabungkan tags, tambahkan kategori jika belum ada
  const allTags = [...tags];
  categoryTags.forEach(tag => {
    if (!allTags.includes(tag)) {
      allTags.push(tag);
    }
  });
  
  // Tambahkan kategori utama sebagai tag
  if (!allTags.includes(categorySlug)) {
    allTags.push(categorySlug);
  }
  
  // Batasi maksimal 8 tags
  return allTags.slice(0, 8);
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
Bahasa: english
Format: Gunakan struktur HTML dengan heading h2 yang jelas dan h3 untuk subseksi.

Pastikan: Konten informatif, 1500+ kata, natural english.
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

CRITICAL: Output MUST be VALID HTML with proper tags.

Requirements:
- Language: Casual English (like talking to a friend, use contractions like "you're", "it's", "we're")
- Tone: Friendly, conversational, authentic—NOT formal or robotic
- Length: 800-1200 words
- Structure: Simple and clean—use 2-4 main sections with brief subsections

HTML FORMAT (MANDATORY):
- Wrap ALL paragraphs in <p></p> tags
- Use <h2>Section Title</h2> for main sections (NOT markdown ##)
- Use <h3>Subsection Title</h3> for subsections (NOT markdown ###)
- Use <ul><li>item</li></ul> for bullet lists
- Separate paragraphs with newlines
- NO markdown syntax (no ##, ###, **, -, etc) - ONLY HTML tags

SEO Requirements:
- Include main keyword naturally in first 100 words
- Use semantic headings, vary sentence length
- Personal insights, rhetorical questions
- Casual transitions: "Honestly," "Here's the thing," "The reality is..."

Sections Required:
<h2>Introduction</h2> - hook readers immediately
<h2>Why it Matters</h2> - explain importance
<h2>How to Do it</h2> - practical steps with <h3> subsections
<h2>Key Takeaways</h2> - summary points
<h2>Conclusion</h2> - wrap up

Additional:
- Include 1 external link in relevant context
- Bullet lists OK but wrap in proper HTML tags
- Never use emoji
- Make it feel like a real person wrote it, not an AI

Start directly with <h2>Introduction</h2>. Output ONLY HTML - NO YAML, NO <h1>.`;

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

// Fallback: Generate default article in English
function generateDefaultArticle(topic, category) {
  return `<h2 id="introduction">📖 Understanding ${topic} in a Practical Way</h2>
<p>
In the world of <strong>${category}</strong>, ${topic} is not just a theory.
It plays an important role in improving website quality, user experience,
and long-term online visibility.
</p>
<p>
If you are new to this topic, you may want to explore our beginner-friendly guide here:
<a href="{{internal_link_1}}">recommended related article</a>.
</p>

<h2 id="why-important">🎯 Why ${topic} Matters</h2>
<ul>
  <li><strong>Better Website Structure:</strong> Helps organize content and technical elements properly.</li>
  <li><strong>Improved User Experience:</strong> Visitors find relevant information faster and stay longer.</li>
  <li><strong>More Meaningful Traffic:</strong> Focuses on quality users, not just numbers.</li>
  <li><strong>Long-Term Growth:</strong> Supports sustainable performance instead of short-term tricks.</li>
</ul>

<h2 id="implementation">🛠️ How to Implement ${topic} Step by Step</h2>

<h3>1. Analyze Your Current Website</h3>
<p>
Start by reviewing your website performance, content quality, and technical setup.
This step helps you identify real problems instead of guessing.
</p>

<h3>2. Define Clear Priorities</h3>
<p>
Avoid changing everything at once.
Focus on areas that have the biggest impact based on your analysis.
</p>

<h3>3. Apply Changes Gradually</h3>
<p>
Implement improvements step by step and monitor the results carefully.
This approach makes it easier to evaluate what works.
</p>

<h3>4. Monitor and Optimize</h3>
<p>
Use data and feedback to refine your strategy.
Small improvements over time often lead to better long-term results.
</p>

<h3>5. Maintain Consistency</h3>
<p>
Document your progress and stay consistent.
Successful websites are built through continuous improvement, not instant results.
</p>

<h2 id="tools">🔧 Free Tools You Can Use</h2>
<div class="tools-grid">
  <div class="tool-card">
    <h4>Google Analytics 4</h4>
    <p>Analyze visitor behavior and understand how users interact with your pages.</p>
  </div>
  <div class="tool-card">
    <h4>Google Search Console</h4>
    <p>Track search performance and detect indexing or visibility issues.</p>
  </div>
  <div class="tool-card">
    <h4>PageSpeed Insights</h4>
    <p>Evaluate page speed and get practical performance recommendations.</p>
  </div>
</div>

<h2 id="practical-tips">💡 Practical Tips for Better Results</h2>
<div class="tips-container">
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Focus on Real Value</h4>
      <p>Create content that genuinely helps users, not just search engines.</p>
    </div>
  </div>
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Avoid Shortcuts</h4>
      <p>Sustainable growth comes from ethical and transparent practices.</p>
    </div>
  </div>
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Use Data Wisely</h4>
      <p>Base decisions on analytics instead of assumptions.</p>
    </div>
  </div>
  <div class="tip">
    <span class="tip-icon">✅</span>
    <div>
      <h4>Stay Informed</h4>
      <p>Industry updates can affect strategies, so keep learning regularly.</p>
    </div>
  </div>
</div>

<h2 id="conclusion">🎓 Conclusion</h2>
<p>
${topic} requires patience, consistency, and a clear strategy.
When applied correctly, it can significantly improve your website over time.
You can find more related insights on
<a href="{{internal_link_2}}">our main blog section</a>.
</p>
<p>
For official guidelines and best practices, refer to
<a href="https://developers.google.com/search/docs"
   target="_blank"
   rel="nofollow noopener">
Google Search Central documentation
</a>.
</p>

<h2>❓ Frequently Asked Questions</h2>
<div class="faq-container">
  <div class="faq-item">
    <h3>1. How long does it take to see results?</h3>
    <p>
    Results vary depending on competition and consistency,
    but initial improvements often appear within 1–3 months.
    </p>
  </div>
  <div class="faq-item">
    <h3>2. Do I need paid tools?</h3>
    <p>
    Not necessarily. Many free tools are sufficient for beginners and small websites.
    </p>
  </div>
  <div class="faq-item">
    <h3>3. What is the safest way to start?</h3>
    <p>
    Begin with a basic audit, then apply improvements gradually.
    </p>
  </div>
</div>

<p>
You may also find this related guide useful:
<a href="{{internal_link_3}}">additional recommended reading</a>.
</p>`;
}

// Generate tags dari title/category - simpler, more natural, without special chars
function generateTags(title, category) {
  const stopwords = ['article', 'guide', 'complete', 'ultimate', 'beginner', 'advanced', 'everything', 'professional', 'proven', 'methods', 'strategies', 'getting', 'started', 'tips', 'best', 'practices', 'know', 'about', 'for'];
  
  const baseTags = [
    'tips',
    'guide',
    '2025'
  ];
  
  // Extract 2-3 key words from title
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.includes(w))
    .slice(0, 3)
    .map(w => w.replace(/[^a-z0-9-]/g, ''));
  
  // Gabungkan semua tags
  let allTags = [...new Set([...baseTags, ...words])].filter(t => t.length > 0);
  
  // Enrich dengan kategori
  allTags = enrichTagsWithCategory(allTags, category);
  
  return allTags;
}

// Clean and fix content formatting (convert markdown remnants to proper HTML)
function cleanContentFormatting(content) {
  // If content doesn't start with <h2>, it likely has markdown artifacts
  if (!content.trim().startsWith('<h2')) {
    // Remove markdown heading syntax and convert to HTML
    content = content
      .replace(/^## /gm, '<h2>')
      .replace(/^### /gm, '<h3>')
      .replace(/(?<!<h[23]>)[\*]{2}([^*]+)[\*]{2}/g, '<strong>$1</strong>') // bold
      .replace(/(?<!<h[23]>)\_([^_]+)\_/g, '<em>$1</em>'); // italic
  }
  
  // Ensure all text content is wrapped in <p> tags (but preserve existing HTML)
  const lines = content.split('\n').map(line => {
    const trimmed = line.trim();
    // Skip if already HTML tag, empty, or bullet list
    if (!trimmed || trimmed.startsWith('<') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
      return line;
    }
    // Check if line looks like plain text paragraph
    if (!trimmed.startsWith('<h') && !trimmed.startsWith('</') && !trimmed.includes('</p>')) {
      // Check if it's a continuation or new paragraph
      if (trimmed.length > 20) { // Only wrap substantial text
        return `<p>${trimmed}</p>`;
      }
    }
    return line;
  });
  
  return lines.join('\n');
}

// Main template untuk artikel lengkap - modern blog style
async function generateArticleTemplate(config) {
  const { title, category, tags, date, author, imageUrl, content } = config;
  
  // Clean and fix content formatting (convert markdown remnants to proper HTML)
  const cleanedContent = cleanContentFormatting(content);
  
  // Generate engaging excerpt from content (first 150 chars)
  const excerpt = cleanedContent
    .replace(/<[^>]*>/g, '') // strip HTML
    .substring(0, 150)
    .trim() + '...';
  
  // Add image if available
  const imageHtml = imageUrl ? `<img src="${imageUrl}" alt="${title}" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin: 20px 0;">` : '';
  
  // Format date nicely
  const dateObj = new Date(date);
  const dateFormatted = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // Slugify category untuk URL
  const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
  
  return `---
layout: default
title: "${title}"
date: ${date}
categories:
  - ${category}
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
      <span class="category"><a href="/categories/${categorySlug}/">${category}</a></span>
      <span class="reading-time">5 min read</span>
    </div>
  </header>

  ${imageHtml}

  <div class="post-content">
    ${cleanedContent}
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

// ==================== TAXONOMY PAGES GENERATOR ====================

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

// ==================== UPDATE EXISTING ARTICLES ====================

// Fungsi baru: Update kategori artikel yang sudah ada
function updateExistingArticlesCategories() {
  console.log('🔄 Updating categories for existing articles...\n');
  
  const postsDir = path.join(process.cwd(), '_posts');
  if (!fs.existsSync(postsDir)) {
    console.log('❌ _posts directory not found');
    return;
  }
  
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.html'));
  let updatedCount = 0;
  
  files.forEach((file, index) => {
    try {
      const filePath = path.join(postsDir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Extract title
      const titleMatch = content.match(/title:\s*"([^"]+)"/);
      if (!titleMatch) return;
      
      const title = titleMatch[1];
      const dynamicCategory = getDynamicCategoryFromTopic(title);
      
      // Update kategori di frontmatter
      const oldCategoryMatch = content.match(/categories:\s*\n\s*-\s*([^\n]+)/);
      if (oldCategoryMatch) {
        const oldCategory = oldCategoryMatch[1].trim();
        
        // Only update if category is different
        if (oldCategory !== dynamicCategory && !dynamicCategory.includes(oldCategory)) {
          content = content.replace(
            /categories:\s*\n\s*-\s*[^\n]+/g,
            `categories:\n  - ${dynamicCategory}`
          );
          
          // Update tags untuk include new category
          const tagsMatch = content.match(/tags:\s*(\[[^\]]+\])/);
          if (tagsMatch) {
            try {
              const tags = JSON.parse(tagsMatch[1].replace(/'/g, '"'));
              const newTags = enrichTagsWithCategory(tags, dynamicCategory);
              content = content.replace(
                tagsMatch[0],
                `tags: ${JSON.stringify(newTags)}`
              );
            } catch (e) {
              // Skip tag update if parsing fails
            }
          }
          
          fs.writeFileSync(filePath, content, 'utf8');
          updatedCount++;
          console.log(`✅ Updated ${file}: ${oldCategory} → ${dynamicCategory}`);
        }
      }
      
    } catch (error) {
      console.error(`⚠️  Error updating ${file}:`, error.message);
    }
  });
  
  console.log(`\n🎯 Updated ${updatedCount} articles`);
  
  // Regenerate taxonomy pages setelah update
  if (updatedCount > 0) {
    console.log('\n🔄 Regenerating taxonomy pages...');
    generateTaxonomyPages();
    
    // Commit perubahan
    try {
      execSync('git add _posts/ categories/ tags/', { 
        stdio: 'pipe',
        cwd: '/workspaces/fortoolseo.github.io'
      });
      execSync('git commit -m "🔄 Update article categories with dynamic classification"', { 
        stdio: 'pipe',
        cwd: '/workspaces/fortoolseo.github.io'
      });
      execSync('git push origin master', { 
        stdio: 'pipe',
        cwd: '/workspaces/fortoolseo.github.io'
      });
      console.log('✅ Changes committed and pushed to GitHub');
    } catch (error) {
      console.log('⚠️  Git push failed (manual push needed)');
    }
  }
}

// ==================== MAIN PROCESS ====================

async function main() {
  console.log('🚀 FortoolSEO AI Article Generator\n');
  console.log(`📚 Default Category: ${CATEGORY}`);
  console.log(`📝 Count: ${COUNT}`);
  console.log(`🔑 Topic/Keyword: ${TOPIC || '(auto-generated)'}`);
  console.log(`⏱️  Delay between articles: ${DELAY_BETWEEN_ARTICLES / 1000} seconds\n`);
  
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
      const title = TOPIC ? await generateTitleFromTopic(TOPIC, CATEGORY, i) : `Artikel ${CATEGORY} #${i + 1}`;
      console.log(`📌 Title: ${title}`);
      
      // Tentukan kategori dinamis berdasarkan topik/judul
      const dynamicCategory = getDynamicCategoryFromTopic(TOPIC || title);
      console.log(`📂 Category: ${dynamicCategory}`);
      
      // Generate tags dengan kategori yang dynamic
      const tags = generateTags(title, dynamicCategory);
      console.log(`🏷️  Tags: ${tags.slice(0, 5).join(', ')}${tags.length > 5 ? '...' : ''}`);
      
      // Generate content dengan AI menggunakan kategori dinamis
      const content = await generateArticleWithAI(title, dynamicCategory, tags);
      
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
      
      // Create article dengan kategori dinamis
      const articleContent = await generateArticleTemplate({
        title,
        category: dynamicCategory, // Gunakan kategori dinamis
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
      
      // Timer jeda 15 detik sebelum membuat artikel berikutnya
      if (i < COUNT - 1) {
        console.log(`⏳ Waiting ${DELAY_BETWEEN_ARTICLES / 1000} seconds before next article...`);
        await sleep(DELAY_BETWEEN_ARTICLES);
      }
      
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

// ==================== CLI COMMAND HANDLER ====================

// Handle command line arguments untuk update categories
if (args.update || args['update-categories']) {
  updateExistingArticlesCategories();
  process.exit(0);
}

// Run
main();