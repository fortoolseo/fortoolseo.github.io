const fs = require('fs');
const path = require('path');

function slugify(name) {
  return name.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
}

function readPosts(dir) {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') || f.endsWith('.md'));
  return files.map(f => ({
    filename: f,
    content: fs.readFileSync(path.join(dir, f), 'utf8')
  }));
}

function parseFrontMatter(content) {
  const fm = {};
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return fm;
  const body = m[1];
  body.split('\n').forEach(line => {
    const kv = line.split(':');
    if (!kv[0]) return;
    const key = kv[0].trim();
    const rest = kv.slice(1).join(':').trim();
    if (rest.startsWith('[')) {
      try { fm[key] = JSON.parse(rest.replace(/'/g, '"')); } catch (e) { fm[key] = []; }
    } else {
      fm[key] = rest.replace(/^"|"$/g, '');
    }
  });
  return fm;
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function writeCategoryPage(name, outputDir) {
  const slug = slugify(name);
  const dir = path.join(outputDir, slug);
  ensureDir(dir);
  const file = path.join(dir, 'index.html');
  const content = `---\nlayout: default\ntitle: "${name}"\n---\n\n<p>Articles in the ${name} category will appear below.</p>`;
  fs.writeFileSync(file, content, 'utf8');
  console.log('Wrote', file);
}

function writeTagPage(name, outputDir) {
  const slug = slugify(name);
  const dir = path.join(outputDir, slug);
  ensureDir(dir);
  const file = path.join(dir, 'index.html');
  const content = `---\nlayout: default\ntitle: "${name}"\n---\n\n<p>Articles with the ${name} tag will appear below.</p>`;
  fs.writeFileSync(file, content, 'utf8');
  console.log('Wrote', file);
}

function main() {
  const postsDir = path.join(__dirname, '..', '_posts');
  const posts = readPosts(postsDir);
  const categories = new Set();
  const tags = new Set();
  posts.forEach(p => {
    const fm = parseFrontMatter(p.content);
    if (fm.categories && Array.isArray(fm.categories)) fm.categories.forEach(c => categories.add(c));
    if (fm.tags && Array.isArray(fm.tags)) fm.tags.forEach(t => tags.add(t));
  });
  const categoriesOut = path.join(__dirname, '..', 'categories');
  const tagsOut = path.join(__dirname, '..', 'tags');
  ensureDir(categoriesOut);
  ensureDir(tagsOut);
  categories.forEach(c => writeCategoryPage(c, categoriesOut));
  tags.forEach(t => writeTagPage(t, tagsOut));
  console.log('Done generating taxonomy pages.');
}

main();
