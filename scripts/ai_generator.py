#!/usr/bin/env python3
"""
AI ARTICLE GENERATOR - 100% FREE NO API
Untuk GitHub Pages Jekyll
"""

import os
import json
import random
from datetime import datetime
import requests
from bs4 import BeautifulSoup

class ArticleGenerator:
    def __init__(self):
        # Template artikel dalam bahasa Indonesia
        self.templates = {
            "SEO": {
                "judul": [
                    "5 Tips {category} Terbaru 2024 untuk Pemula",
                    "Cara {category} Website dengan Benar",
                    "Rahasia {category} yang Jarang Diketahui",
                    "Tools {category} Gratis Terbaik",
                    "Strategi {category} untuk E-commerce"
                ],
                "konten": """# {judul}

**{category}** adalah kunci sukses website di mesin pencari. Di Indonesia, kompetisi semakin ketat sehingga perlu strategi yang tepat.

## Mengapa {category} Penting?

1. **Meningkatkan traffic organik** tanpa biaya iklan
2. **Memperkuat brand awareness** di pasar Indonesia
3. **Meningkatkan konversi** dan penjualan
4. **Membangun kepercayaan** dengan ranking tinggi di Google

## Langkah-langkah Implementasi {category}

### 1. Riset Keyword
- Gunakan Google Trends Indonesia
- Analisis keyword kompetitor
- Fokus pada long-tail keyword

### 2. Optimasi On-Page
- Title tag yang menarik
- Meta description yang jelas
- URL structure yang clean
- Konten berkualitas tinggi

### 3. Technical {category}
- Kecepatan loading < 3 detik
- Mobile-friendly design
- Sitemap dan robots.txt
- SSL certificate aktif

## Tools {category} Gratis

| Tool | Fungsi | Link |
|------|--------|------|
| Google Search Console | Monitor performa | [Link](https://search.google.com) |
| Google Analytics | Analisis traffic | [Link](https://analytics.google.com) |
| PageSpeed Insights | Cek kecepatan | [Link](https://pagespeed.web.dev) |
| Ubersuggest | Riset keyword | [Link](https://neilpatel.com/ubersuggest) |

## Studi Kasus: Sukses {category} di Indonesia

**Contoh: TokoOnline.com**
- Sebelum: 100 visitor/hari
- Setelah optimasi {category}: 1,000+ visitor/hari
- Waktu: 6 bulan konsisten
- Investasi: Hanya waktu, tanpa biaya

## Kesimpulan

{category} bukan magic, tapi butuh konsistensi. Mulai dari hal kecil, pantau hasil, dan terus tingkatkan.

> **Tips**: Bergabunglah dengan komunitas {category} Indonesia di Facebook atau Discord untuk sharing knowledge.

---
*Artikel dibuat otomatis pada {tanggal}*
*Sumber: Pengalaman praktisi {category} Indonesia*"""
            },
            "Digital Marketing": {
                "judul": [
                    "Strategi {category} di Media Sosial 2024",
                    "{category} untuk UMKM dengan Budget Minim",
                    "Trend {category} di Indonesia Terbaru",
                    "Cara {category} yang Efektif Tanpa Iklan Berbayar"
                ],
                "konten": """# {judul}

**{category}** telah mengubah cara bisnis beroperasi di Indonesia. Dengan 200 juta+ pengguna internet, peluang sangat besar.

## Platform {category} Populer di Indonesia

### 1. Instagram (@indonesia)
- 89% marketer aktif di sini
- Fitur Reels untuk reach maksimal
- Instagram Shopping untuk jualan langsung

### 2. TikTok (#indonesia)
- Viral potential sangat tinggi
- TikTok Shop terintegrasi
- Audience usia muda (16-30 tahun)

### 3. WhatsApp Business
- Personal touch dengan customer
- Tingkat respons tinggi
- Cocok untuk customer service

## Budget {category} untuk Pemula

**Paket Starter (Rp 500.000/bulan):**
- Content creation: Rp 300.000
- Boost post: Rp 150.000
- Tools subscription: Rp 50.000

**Paket Professional (Rp 2.000.000/bulan):**
- Content creator: Rp 1.000.000
- Ads budget: Rp 800.000
- Analytics tools: Rp 200.000

## Case Study: Warung Kopi Digital

**"KopiTani"** di Bandung:
- Mulai dari Instagram 100 followers
- User-generated content strategy
- Collaboration dengan micro-influencers lokal
- Sekarang: 10.000 followers, 50 order/hari

## Action Plan 30 Hari

**Minggu 1-2:** Riset & Planning
- Analisis kompetitor
- Buat content calendar
- Setup social media profiles

**Minggu 3-4:** Execution
- Produksi konten (foto/video)
- Posting konsisten
- Engagement dengan audience

## Tools Gratis yang Wajib Dicoba

1. **Canva** - Desain grafis mudah
2. **CapCut** - Edit video mobile
3. **Buffer** - Scheduling post
4. **Google Trends** - Riset trend

## Kesimpulan

{category} adalah tentang konsistensi, bukan kesempurnaan. Mulai sekarang, ukur hasil, dan terus improve.

> **Quote**: "Digital marketing bukan tentang tools mahal, tapi tentang kreativitas dan konsistensi."

---
*Artikel dibuat untuk membantu pelaku bisnis Indonesia*
*Tanggal: {tanggal}*"""
            }
        }
        
        # Kategori tersedia
        self.categories = ["SEO", "Digital Marketing", "Website Development", "Content Writing", "Analytics"]
    
    def get_trending_topic(self):
        """Ambil topik trending dari Google Trends (simulasi)"""
        topics = [
            "SEO untuk website pemerintah",
            "Digital marketing UMKM pasca pandemi",
            "Optimasi website toko online",
            "Content strategy media sosial",
            "Analytics untuk startup"
        ]
        return random.choice(topics)
    
    def generate_article(self):
        """Generate satu artikel lengkap"""
        
        # 1. Pilih kategori random
        category = random.choice(self.categories)
        
        # 2. Generate judul
        if category in self.templates:
            judul_template = random.choice(self.templates[category]["judul"])
            judul = judul_template.format(category=category)
            konten_template = self.templates[category]["konten"]
        else:
            # Fallback untuk kategori lain
            judul = f"Panduan Lengkap {category} 2024"
            konten_template = self.templates["SEO"]["konten"]
        
        # 3. Generate konten
        tanggal = datetime.now().strftime("%d %B %Y")
        konten = konten_template.format(
            judul=judul,
            category=category,
            tanggal=tanggal
        )
        
        # 4. Generate slug untuk filename
        slug = judul.lower() \
            .replace(" ", "-") \
            .replace(",", "") \
            .replace(".", "") \
            .replace(":", "") \
            .replace("?", "") \
            .replace("!", "")[:50]
        
        # 5. Buat filename dengan tanggal
        date_str = datetime.now().strftime("%Y-%m-%d")
        filename = f"_posts/{date_str}-{slug}.md"
        
        # 6. Generate gambar dari Picsum Photos
        image_url = f"https://picsum.photos/1200/630?random={random.randint(1, 1000)}"
        
        # 7. Buat front matter untuk Jekyll
        front_matter = f"""---
layout: post
title: "{judul}"
date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} +0700
categories: [{category}]
tags: [{category.lower()}, indonesia, tutorial, tips]
image: {image_url}
author: AI Generator
description: "{judul}. Pelajari strategi dan implementasi praktis untuk bisnis Anda."
---
"""
        
        # 8. Gabungkan semua
        full_content = front_matter + konten
        
        # 9. Buat folder _posts jika belum ada
        os.makedirs("_posts", exist_ok=True)
        
        # 10. Tulis file
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(full_content)
        
        print("=" * 60)
        print("🤖 AI ARTICLE GENERATOR - SUCCESS!")
        print("=" * 60)
        print(f"📁 File: {filename}")
        print(f"📌 Judul: {judul}")
        print(f"🏷️  Kategori: {category}")
        print(f"📊 Panjang: {len(full_content)} karakter")
        print(f"🖼️  Gambar: {image_url}")
        print("=" * 60)
        
        return filename

def main():
    """Main function"""
    print("🚀 Starting AI Article Generator...")
    
    # Buat folder scripts jika belum ada
    os.makedirs("scripts", exist_ok=True)
    
    # Jalankan generator
    generator = ArticleGenerator()
    
    # Generate artikel
    filename = generator.generate_article()
    
    # Generate multiple? (optional)
    generate_more = input("\nGenerate artikel lagi? (y/n): ").lower()
    if generate_more == 'y':
        count = int(input("Berapa artikel? (1-5): "))
        for i in range(count):
            print(f"\n📄 Generating article {i+1}/{count}...")
            generator.generate_article()

if __name__ == "__main__":
    main()
