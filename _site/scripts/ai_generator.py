#!/usr/bin/env python3
"""
AI ARTICLE GENERATOR - English output, SEO-friendly titles, unique slugs
"""

import os
import random
import re
import time
from datetime import datetime


class SimpleGenerator:
    def __init__(self):
        self.categories = ["SEO", "Digital Marketing", "Website", "Content", "Analytics"]

        # English templates with distinct structure and sections
        self.templates = {
            "SEO": [
                (
                    "10 Proven SEO Tactics for 2025",
                    """
Introduction
Search engines still reward quality and relevance.

Benefits
- Increase organic traffic
- Improve click-through rate

Step-by-step
1. Audit existing pages
2. Optimize titles and meta descriptions
3. Build internal links

Tools
- Google Search Console
- Ahrefs / Semrush

Tips
- Focus on user intent
- Use structured data when relevant
""",
                ),
                (
                    "The Ultimate On-Page SEO Checklist",
                    """
Introduction
On-page SEO is the foundation of search visibility.

Checklist
- Title tags and headings
- Optimized images
- Fast loading pages

Conclusion
Follow this checklist to improve page relevance.
""",
                ),
            ],
            "Digital Marketing": [
                (
                    "Social Media Content Strategy: A Practical Guide",
                    """
Introduction
A consistent content plan improves engagement and conversions.

Key Platforms
1. Instagram
2. TikTok
3. LinkedIn

Plan
- Define audience personas
- Create a posting calendar
- Measure with analytics

Conclusion
Iterate based on performance data.
""",
                ),
            ],
            "Website": [
                (
                    "Website Performance Optimization: Quick Wins",
                    """
Introduction
Speed and usability affect both SEO and conversions.

Quick Wins
- Compress images
- Use caching
- Minimize JavaScript

Conclusion
Start with low-effort, high-impact fixes.
""",
                ),
            ],
        }

    def seo_title(self, base_title):
        """Ensure title feels SEO-oriented — add power words if needed."""
        # If title already contains a number or 'guide'/'checklist' keep it
        lowered = base_title.lower()
        if any(x in lowered for x in ["guide", "checklist", "proven", "ultimate", "202"]):
            return base_title
        # otherwise prepend a power phrase
        prefix = random.choice(["Ultimate Guide:", "How to", "Top Tips:", "Proven:"])
        return f"{prefix} {base_title}"

    def slugify(self, title):
        s = title.lower()
        s = re.sub(r"[^a-z0-9\s-]", "", s)
        s = re.sub(r"\s+", "-", s).strip("-")
        s = s[:60]
        # append a short unique suffix to avoid collisions
        suffix = f"{int(time.time()) % 10000}-{random.randint(100,999)}"
        return f"{s}-{suffix}"

    def generate(self):
        """Generate one article and save it as an HTML post file in _posts/"""
        category = random.choice(self.categories)

        if category in self.templates:
            base_title, body = random.choice(self.templates[category])
        else:
            base_title = f"{category} Best Practices"
            body = f"An overview of best practices for {category}."

        title = self.seo_title(base_title)

        full_content = self.create_article(title, category, body)
        filename = self.save_to_file(title, full_content, category)

        print(f"✅ Article created: {filename}")
        return filename

    def create_article(self, title, category, body):
        """Create article content with Jekyll front matter and HTML body."""
        date_iso = datetime.now().strftime("%Y-%m-%d")
        excerpt = " ".join(body.split())[:150]
        meta_description = (excerpt + "...") if len(excerpt) > 0 else f"{title} - actionable tips and examples."

        front_matter = (
            f"---\n"
            f"layout: default\n"
            f"title: \"{title}\"\n"
            f"date: {date_iso}\n"
            f"categories: [\"{category}\"]\n"
            f"tags: [\"{category.lower()}\", \"tips\", \"guide\"]\n"
            f"author: Admin FortoolSEO\n"
            f"excerpt: \"{excerpt}\"\n"
            f"meta_description: \"{meta_description}\"\n"
            f"lang: en\n"
            f"---\n\n"
        )

        # Build an HTML article following the project's conventions
        html_body = (
            f"<h1>{title}</h1>\n"
            f"<div class=\"article-meta\">📅 {date_iso} 📂 {category} 👤 AI Generator</div>\n"
            f"<div class=\"toc\">\n<ul>\n"
        )

        # create simple sections from the body text (split by blank lines)
        sections = [s.strip() for s in body.strip().split('\n\n') if s.strip()]
        for i, sec in enumerate(sections, start=1):
            heading = sec.split('\n', 1)[0][:50]
            anchor = f"section-{i}"
            html_body += f"<li><a href=\"#{anchor}\">{heading}</a></li>\n"

        html_body += "</ul>\n</div>\n\n"

        # Append sections as H2 blocks
        for i, sec in enumerate(sections, start=1):
            anchor = f"section-{i}"
            # replace newlines in section with paragraphs
            paras = [p.strip() for p in sec.split('\n') if p.strip()]
            html_body += f"<h2 id=\"{anchor}\">{paras[0]}</h2>\n"
            for p in paras[1:]:
                html_body += f"<p>{p}</p>\n"

        html_body += (
            f"<h2 id=\"conclusion\">Conclusion</h2>\n"
            f"<p>Apply these recommendations to improve your {category.lower()} outcomes.</p>\n"
            "\n<hr/>\n"
            f"<p><em>Article generated automatically by AI generator on {datetime.now().strftime('%d %B %Y %H:%M')}</em></p>\n"
        )

        return front_matter + html_body

    def save_to_file(self, title, content, category):
        """Save as an HTML file in _posts with unique slug and filename."""
        slug = self.slugify(title)
        date_str = datetime.now().strftime("%Y-%m-%d")
        filename = f"_posts/{date_str}-{slug}.html"

        os.makedirs("_posts", exist_ok=True)

        # avoid accidental overwrite (very unlikely due to timestamp suffix)
        if os.path.exists(filename):
            base, ext = os.path.splitext(filename)
            filename = f"{base}-{random.randint(100,999)}{ext}"

        with open(filename, "w", encoding="utf-8") as f:
            f.write(content)

        return filename


# Run generator
if __name__ == "__main__":
    print("🚀 AI Generator (English) — generating sample posts")
    gen = SimpleGenerator()
    for i in range(3):
        print(f"\n📝 Creating article {i+1}/3...")
        gen.generate()

    print("\n✅ Done. Check the _posts/ folder for new English posts.")
