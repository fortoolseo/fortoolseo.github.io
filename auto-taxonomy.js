// auto-taxonomy.js - FIXED VERSION
const fs = require('fs');
const path = require('path');

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
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
          val = val.slice(1, -1)
            .split(',')
            .map(s => s.replace(/["']/g, '').trim())
            .filter(s => s.length > 0);
        }
      } else if (key === 'categories') {
        val = [val];
      } else {
        val = val.replace(/^["']|["']$/g, '');
      }
      
      fm[key] = val;
    }
  }
  
  return fm;
}

function generateTaxonomy() {
  console.log('🚀 Starting taxonomy pages generation...\n');
  
  const postsDir = path.join(process.cwd(), '_posts');
  const categoriesDir = path.join(process.cwd(), 'categories');
  const tagsDir = path.join(process.cwd(), 'tags');
  
  if (!fs.existsSync(postsDir)) {
    console.error('❌ Error: _posts directory not found!');
    process.exit(1);
  }
  
  if (!fs.existsSync(categoriesDir)) {
    fs.mkdirSync(categoriesDir, { recursive: true });
    console.log('📁 Created categories directory');
  }
  
  if (!fs.existsSync(tagsDir)) {
    fs.mkdirSync(tagsDir, { recursive: true });
    console.log('📁 Created tags directory');
  }
  
  const categoriesSet = new Set();
  const tagsSet = new Set();
  
  const files = fs.readdirSync(postsDir)
    .filter(f => f.endsWith('.html') || f.endsWith('.md'));
  
  console.log(`📄 Scanning ${files.length} posts...`);
  
  files.forEach((file, index) => {
    try {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      const fm = parseFrontMatter(content);
      
      if (fm.categories) {
        if (Array.isArray(fm.categories)) {
          fm.categories.forEach(cat => {
            if (cat && typeof cat === 'string') {
              categoriesSet.add(cat.trim());
            }
          });
        } else if (typeof fm.categories === 'string') {
          categoriesSet.add(fm.categories.trim());
        }
      }
      
      if (fm.tags) {
        if (Array.isArray(fm.tags)) {
          fm.tags.forEach(tag => {
            if (tag && typeof tag === 'string') {
              tagsSet.add(tag.trim());
            }
          });
        } else if (typeof fm.tags === 'string') {
          fm.tags.split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0)
            .forEach(tag => tagsSet.add(tag));
        }
      }
      
      if ((index + 1) % 10 === 0 || index === files.length - 1) {
        process.stdout.write(`\r✅ Processed ${index + 1}/${files.length} posts...`);
      }
    } catch (error) {
      console.error(`\n⚠️  Error processing ${file}: ${error.message}`);
    }
  });
  
  console.log('\n');
  console.log(`📊 Found ${categoriesSet.size} unique categories`);
  console.log(`📊 Found ${tagsSet.size} unique tags`);
  
  // Generate category pages
  categoriesSet.forEach(cat => {
    const slug = slugify(cat);
    const catDir = path.join(categoriesDir, slug);
    
    if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }
    
    const indexPath = path.join(catDir, 'index.html');
    const content = `---
layout: default
title: "${cat}"
permalink: /categories/${slug}/
---

<section class="category-page">
  <h1>Category: ${cat}</h1>
  
  <div class="category-description">
    <p>Browse all articles in the ${cat} category.</p>
  </div>
  
  <div class="posts-grid">
    {% assign posts = site.categories['${cat}'] %}
    {% if posts %}
      {% for post in posts %}
        <article class="post-card">
          <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
          <div class="post-meta">
            <small>{{ post.date | date: "%b %d, %Y" }}</small>
            {% if post.tags %}
              <div class="post-tags">
                {% for tag in post.tags %}
                  <a href="/tags/{{ tag | slugify }}/" class="tag">#{{ tag }}</a>
                {% endfor %}
              </div>
            {% endif %}
          </div>
          {% if post.excerpt %}
            <p class="post-excerpt">{{ post.excerpt | truncate: 150 }}</p>
          {% endif %}
        </article>
      {% endfor %}
    {% else %}
      <div class="no-posts">
        <p>No articles in this category yet.</p>
        <a href="/" class="btn">Browse all articles</a>
      </div>
    {% endif %}
  </div>
</section>`;
    
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log(`✅ Created: categories/${slug}/index.html`);
  });
  
  // Generate tag pages - FIXED VERSION
  tagsSet.forEach(tag => {
    const slug = slugify(tag);
    const tagDir = path.join(tagsDir, slug);
    
    if (!fs.existsSync(tagDir)) {
      fs.mkdirSync(tagDir, { recursive: true });
    }
    
    const indexPath = path.join(tagDir, 'index.html');
    // PERBAIKAN DI SINI: Ganti ${category} dengan template Liquid yang benar
    const content = `---
layout: default
title: "${tag}"
permalink: /tags/${slug}/
---

<section class="tag-page">
  <h1>Tag: ${tag}</h1>
  
  <div class="tag-description">
    <p>Browse all articles tagged with "${tag}".</p>
  </div>
  
  <div class="posts-grid">
    {% assign posts = site.tags['${tag}'] %}
    {% if posts %}
      {% for post in posts %}
        <article class="post-card">
          <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
          <div class="post-meta">
            <small>{{ post.date | date: "%b %d, %Y" }}</small>
            {% if post.categories %}
              <div class="post-categories">
                {% for category in post.categories %}
                  <a href="/categories/{{ category | slugify }}/" class="category">{{ category }}</a>
                {% endfor %}
              </div>
            {% endif %}
          </div>
          {% if post.excerpt %}
            <p class="post-excerpt">{{ post.excerpt | truncate: 150 }}</p>
          {% endif %}
        </article>
      {% endfor %}
    {% else %}
      <div class="no-posts">
        <p>No articles with this tag yet.</p>
        <a href="/" class="btn">Browse all articles</a>
      </div>
    {% endif %}
  </div>
</section>`;
    
    fs.writeFileSync(indexPath, content, 'utf8');
    console.log(`✅ Created: tags/${slug}/index.html`);
  });
  
  // Create main categories index page
  const categoriesIndexPath = path.join(categoriesDir, 'index.html');
  const categoriesIndexContent = `---
layout: default
title: "Categories"
permalink: /categories/
---

<section class="categories-index">
  <h1>All Categories</h1>
  
  <div class="categories-grid">
    {% for category in site.categories %}
      {% assign category_name = category[0] %}
      {% assign posts_count = category[1].size %}
      <div class="category-card">
        <h3>
          <a href="/categories/{{ category_name | slugify }}/">
            {{ category_name }}
          </a>
        </h3>
        <p class="post-count">{{ posts_count }} article{% if posts_count != 1 %}s{% endif %}</p>
        <div class="recent-posts">
          {% for post in category[1] limit:3 %}
            <div class="recent-post">
              <a href="{{ post.url }}">{{ post.title | truncate: 40 }}</a>
              <small>{{ post.date | date: "%b %d" }}</small>
            </div>
          {% endfor %}
        </div>
      </div>
    {% endfor %}
  </div>
</section>`;
  
  fs.writeFileSync(categoriesIndexPath, categoriesIndexContent, 'utf8');
  console.log(`✅ Created: categories/index.html`);
  
  // Create main tags index page
  const tagsIndexPath = path.join(tagsDir, 'index.html');
  const tagsIndexContent = `---
layout: default
title: "Tags"
permalink: /tags/
---

<section class="tags-index">
  <h1>All Tags</h1>
  
  <div class="tags-cloud">
    {% for tag in site.tags %}
      {% assign tag_name = tag[0] %}
      {% assign posts_count = tag[1].size %}
      {% assign font_size = 14 %}
      {% if posts_count > 5 %}{% assign font_size = 18 %}{% endif %}
      {% if posts_count > 10 %}{% assign font_size = 22 %}{% endif %}
      {% if posts_count > 20 %}{% assign font_size = 26 %}{% endif %}
      
      <a href="/tags/{{ tag_name | slugify }}/" 
         class="tag-cloud-item" 
         style="font-size: {{ font_size }}px;"
         title="{{ posts_count }} articles">
        {{ tag_name }} ({{ posts_count }})
      </a>
    {% endfor %}
  </div>
</section>`;
  
  fs.writeFileSync(tagsIndexPath, tagsIndexContent, 'utf8');
  console.log(`✅ Created: tags/index.html`);
  
  console.log('\n' + '='.repeat(50));
  console.log('🎉 TAXONOMY GENERATION COMPLETE!');
  console.log('='.repeat(50));
  console.log(`📂 Created: ${categoriesSet.size} category pages`);
  console.log(`🔖 Created: ${tagsSet.size} tag pages`);
  console.log(`📄 Total: ${categoriesSet.size + tagsSet.size + 2} pages generated`);
  console.log('\n🚀 Next steps:');
  console.log('1. git add categories/ tags/');
  console.log('2. git commit -m "🗂️🔖 Add taxonomy pages"');
  console.log('3. git push origin master');
}

// Run the script
generateTaxonomy();