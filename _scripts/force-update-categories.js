cat > fix-taxonomy.js << 'EOF'
const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing taxonomy pages...\n');

const postsDir = path.join(process.cwd(), '_posts');
const categoriesDir = path.join(process.cwd(), 'categories');
const tagsDir = path.join(process.cwd(), 'tags');

// Clear old directories
if (fs.existsSync(categoriesDir)) fs.rmSync(categoriesDir, { recursive: true });
if (fs.existsSync(tagsDir)) fs.rmSync(tagsDir, { recursive: true });

// Create fresh directories
fs.mkdirSync(categoriesDir, { recursive: true });
fs.mkdirSync(tagsDir, { recursive: true });

// Collect categories and tags
const categoriesSet = new Set();
const tagsSet = new Set();

const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.html'));

console.log(`📄 Scanning ${files.length} articles...\n`);

files.forEach(file => {
  try {
    const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
    
    // SIMPLE CATEGORY PARSING - handles "categories:\n  - Category Name"
    const lines = content.split('\n');
    let inCategories = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('categories:')) {
        inCategories = true;
        // Check next line for the actual category
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine.startsWith('-')) {
            const category = nextLine.replace(/^-\s*/, '').trim();
            if (category) {
              categoriesSet.add(category);
              console.log(`✅ Found category: ${category} (in ${file})`);
            }
          }
        }
        inCategories = false;
      }
      
      // SIMPLE TAG PARSING - handles "tags: ["tag1", "tag2"]"
      if (line.startsWith('tags: [')) {
        const tagMatch = line.match(/tags:\s*\[([^\]]+)\]/);
        if (tagMatch) {
          const tagsText = tagMatch[1];
          const tags = tagsText.split(',')
            .map(tag => tag.trim().replace(/["']/g, ''))
            .filter(tag => tag.length > 0);
          
          tags.forEach(tag => tagsSet.add(tag));
        }
      }
    }
  } catch (error) {
    console.log(`⚠️  Error reading ${file}: ${error.message}`);
  }
});

console.log(`\n📊 RESULTS:`);
console.log(`Found ${categoriesSet.size} unique categories:`);
console.log(Array.from(categoriesSet).map(c => `  • ${c}`).join('\n'));

console.log(`\nFound ${tagsSet.size} unique tags (first 20):`);
console.log(Array.from(tagsSet).slice(0, 20).map(t => `  • ${t}`).join('\n'));

// CREATE CATEGORY PAGES
console.log('\n📁 Creating category pages...');
categoriesSet.forEach(category => {
  const slug = category.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  const dir = path.join(categoriesDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  
  const indexPath = path.join(dir, 'index.html');
  const content = `---
layout: default
title: "${category}"
permalink: /categories/${slug}/
---

<section class="category-page">
  <h1>Category: ${category}</h1>
  <div class="posts-grid">
    {% assign posts = site.categories['${category}'] %}
    {% if posts %}
      {% for post in posts %}
        <article class="post-card">
          <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
          <small>{{ post.date | date: "%b %d, %Y" }}</small>
        </article>
      {% endfor %}
    {% else %}
      <p>No articles in this category yet.</p>
    {% endif %}
  </div>
</section>`;
  
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log(`✅ Created: categories/${slug}/index.html`);
});

// CREATE TAG PAGES
console.log('\n🔖 Creating tag pages...');
tagsSet.forEach(tag => {
  const slug = tag.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  const dir = path.join(tagsDir, slug);
  fs.mkdirSync(dir, { recursive: true });
  
  const indexPath = path.join(dir, 'index.html');
  const content = `---
layout: default
title: "${tag}"
permalink: /tags/${slug}/
---

<section class="tag-page">
  <h1>Tag: ${tag}</h1>
  <div class="posts-grid">
    {% assign posts = site.tags['${tag}'] %}
    {% if posts %}
      {% for post in posts %}
        <article class="post-card">
          <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
          <small>{{ post.date | date: "%b %d, %Y" }}</small>
        </article>
      {% endfor %}
    {% else %}
      <p>No articles with this tag yet.</p>
    {% endif %}
  </div>
</section>`;
  
  fs.writeFileSync(indexPath, content, 'utf8');
  console.log(`✅ Created: tags/${slug}/index.html`);
});

// CREATE MAIN INDEX PAGES
const categoriesIndex = `---
layout: default
title: "Categories"
permalink: /categories/
---

<section class="categories-index">
  <h1>All Categories</h1>
  <div class="categories-grid">
    {% for category in site.categories %}
      {% assign category_name = category[0] %}
      <div class="category-card">
        <h3><a href="/categories/{{ category_name | slugify }}/">{{ category_name }}</a></h3>
        <p>{{ category[1].size }} articles</p>
      </div>
    {% endfor %}
  </div>
</section>`;

const tagsIndex = `---
layout: default
title: "Tags"
permalink: /tags/
---

<section class="tags-index">
  <h1>All Tags</h1>
  <div class="tags-cloud">
    {% for tag in site.tags %}
      {% assign tag_name = tag[0] %}
      <a href="/tags/{{ tag_name | slugify }}/" class="tag-item">{{ tag_name }}</a>
    {% endfor %}
  </div>
</section>`;

fs.writeFileSync(path.join(categoriesDir, 'index.html'), categoriesIndex, 'utf8');
fs.writeFileSync(path.join(tagsDir, 'index.html'), tagsIndex, 'utf8');

console.log('\n' + '='.repeat(50));
console.log('🎉 TAXONOMY FIXED SUCCESSFULLY!');
console.log('='.repeat(50));
console.log(`📂 Created: ${categoriesSet.size} category pages`);
console.log(`🔖 Created: ${tagsSet.size} tag pages`);
console.log(`📄 Total: ${categoriesSet.size + tagsSet.size + 2} pages`);

console.log('\n🚀 To commit these changes:');
console.log('   git add categories/ tags/');
console.log('   git commit -m "🗂️🔖 Fix: Generate correct category pages"');
console.log('   git push origin master');
EOF