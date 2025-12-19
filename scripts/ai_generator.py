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
                ("5 Tips SEO Terbaru 2024", """
## Kenapa SEO Penting?
SEO membantu website muncul di halaman pertama Google.

## Tools Gratis:
1. Google Search Console
2. Google Analytics
3. PageSpeed Insights

## Tips Praktis:
- Riset keyword dengan Google Trends
- Optimasi kecepatan loading
- Buat konten berkualitas"""),
                
                ("Cara Optimasi Website untuk Pemula", """
## Langkah 1: Technical SEO
- Pastikan website mobile friendly
- Gunakan SSL certificate
- Optimasi gambar

## Langkah 2: Konten
- Buat artikel panjang (1000+ kata)
- Gunakan heading H2, H3
- Tambah gambar dan video""")
            ],
            "Digital Marketing": [
                ("Strategi Social Media 2024", """
## Platform Populer:
1. Instagram untuk visual
2. TikTok untuk gen Z  
3. LinkedIn untuk B2B

## Content Ideas:
- Tutorial singkat
- Testimoni customer
- Behind the scenes""")
            ]
        }
    
    def generate(self):
        """Generate satu artikel"""
        
        # Pilih kategori random
        category = random.choice(self.categories)
        
        # Pilih template
        if category in self.templates:
            title, content = random.choice(self.templates[category])
        else:
            title = f"Panduan {category} 2024"
            content = f"Artikel tentang {category} dan implementasinya."
        
        # Buat konten lengkap
        full_content = self.create_article(title, category, content)
        
        # Simpan file
        filename = self.save_to_file(title, full_content, category)
        
        print(f"✅ Artikel berhasil dibuat: {filename}")
        return filename
    
    def create_article(self, title, category, body):
        """Buat artikel dengan front matter"""
        
        # Front matter untuk Jekyll
        front_matter = f"""---
layout: post
title: "{title}"
date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} +0700
categories: [{category}]
tags: [{category.lower()}, tips, tutorial]
author: AI Generator
image: https://picsum.photos/1200/630?random={random.randint(1, 1000)}
description: "{title}. Pelajari cara implementasi dengan mudah."
---

"""
        
        # Body artikel
        article_body = f"""# {title}

{body}

## Kesimpulan
Dengan menerapkan strategi di atas, Anda bisa meningkatkan performa {category.lower()}.

---
*Artikel dibuat otomatis di GitHub Codespace*
*Tanggal: {datetime.now().strftime('%d %B %Y %H:%M')}*"""
        
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
    print("🚀 AI Generator di Codespace")
    print("=" * 50)
    
    generator = SimpleGenerator()
    
    # Generate beberapa artikel
    for i in range(3):
        print(f"\n📝 Membuat artikel {i+1}/3...")
        generator.generate()
    
    print("\n" + "=" * 50)
    print("✅ Semua artikel berhasil dibuat!")
    print("📁 Cek folder _posts/ untuk hasilnya")
