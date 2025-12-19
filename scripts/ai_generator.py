#!/usr/bin/env python3
"""
AI ARTICLE GENERATOR - RUN IN CODESPACE
"""

import os
import random
from datetime import datetime

class SimpleGenerator:
    def __init__(self):
        self.categories = ["SEO", "Digital Marketing", "Website", "Content", "Analytics"]
        
        self.templates = {
            "SEO": [
                ("5 Latest SEO Tips 2024", """
## Why SEO Matters?
SEO helps your website appear on the first page of Google.

## Free Tools:
1. Google Search Console
2. Google Analytics
3. PageSpeed Insights

## Practical Tips:
- Research keywords with Google Trends
- Optimize page load speed
- Create high-quality content"""),
                
                ("Website Optimization Guide for Beginners", """
## Step 1: Technical SEO
- Ensure the website is mobile-friendly
- Use an SSL certificate
- Optimize images

## Step 2: Content
- Write long-form articles (1000+ words)
- Use H2 and H3 headings
- Add images and videos""")
            ],
            "Digital Marketing": [
                ("Social Media Strategy 2024", """
## Popular Platforms:
1. Instagram for visual content
2. TikTok for Gen Z
3. LinkedIn for B2B

## Content Ideas:
- Short tutorials
- Customer testimonials
- Behind the scenes"""),
            ],
        }
    
    def generate(self):
        """Generate one article"""

        # Choose a random category
        category = random.choice(self.categories)
        
        # Pilih template
        if category in self.templates:
            title, content = random.choice(self.templates[category])
        else:
            title = f"{category} Guide 2024"
            content = f"Article about {category} and practical implementation."
        
        # Buat konten lengkap
        full_content = self.create_article(title, category, content)
        
        # Simpan file
        filename = self.save_to_file(title, full_content, category)
        
        print(f"✅ Article created: {filename}")
        return filename
    
    def create_article(self, title, category, body):
        """Create article content with Jekyll front matter."""
        front_matter = (
            f"---\n"
            f"layout: post\n"
            f"title: \"{title}\"\n"
            f"date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} +0700\n"
            f"categories: [{category}]\n"
            f"tags: [{category.lower()}, tips, tutorial]\n"
            f"author: AI Generator\n"
            f"image: https://picsum.photos/1200/630?random={random.randint(1, 1000)}\n"
            f"description: \"{title}. Learn how to implement the strategies easily.\"\n"
            f"---\n\n"
        )

        article_body = (
            f"# {title}\n\n"
            f"{body}\n\n"
            "## Conclusion\n"
            f"By applying the strategies above, you can improve your {category.lower()} performance.\n\n"
            "---\n"
            f"*Article generated automatically in GitHub Codespace*\n"
            f"*Date: {datetime.now().strftime('%d %B %Y %H:%M')}*"
        )

        return front_matter + article_body
    
    def save_to_file(self, title, content, category):
        """Simpan ke file markdown"""
        
        # Buat slug dari judul
        slug = title.lower() \
            .replace(" ", "-") \
            .replace(",", "") \
            .replace(".", "") \
            .replace("?", "")[:40]
        
        # Nama file dengan tanggal
        date_str = datetime.now().strftime("%Y-%m-%d")
        filename = f"_posts/{date_str}-{slug}.md"
        
        # Pastikan folder _posts ada
        os.makedirs("_posts", exist_ok=True)
        
        # Tulis file
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return filename

# Test langsung di Codespace
if __name__ == "__main__":
    print("🚀 AI Generator in Codespace")
    print("=" * 50)
    
    generator = SimpleGenerator()
    
    # Generate beberapa artikel
    for i in range(3):
        print(f"\n📝 Creating article {i+1}/3...")
        generator.generate()
    
    print("\n" + "=" * 50)
    print("✅ All articles generated successfully!")
    print("📁 Check the _posts/ folder for results")
