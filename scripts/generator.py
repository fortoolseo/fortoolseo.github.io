#!/usr/bin/env python3
"""
AI Article Generator 100% GRATIS tanpa API
Menggunakan template + scraping data publik
"""

import os
import json
import random
from datetime import datetime
import requests
from bs4 import BeautifulSoup
import time

class NoAPIGenerator:
    def __init__(self):
        self.session = requests.Session()
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
    def load_categories(self):
        """Load kategori dari file JSON"""
        with open('scripts/categories.json', 'r') as f:
            return json.load(f)
    
    def get_random_title(self, category):
        """Ambil judul dari Google Trends/berita"""
        try:
            # Scrape judul dari website berita Indonesia
            sources = [
                f"https://www.google.com/search?q={category}+terbaru+2024&gl=id",
                "https://www.detik.com/tag/seo",
                "https://tekno.kompas.com/search/{category}"
            ]
            
            # Template judul lokal
            templates = {
                "SEO": [
                    f"5 Tips {category} Terbaru yang Wajib Dicoba",
                    f"Cara {category} yang Benar untuk Pemula",
                    f"{category} Terbaru: Update Algorithm Google 2024",
                    f"Rahasia {category} Website E-commerce",
                    f"{category} Lokal: Dominasi Pasar Indonesia"
                ],
                "Digital Marketing": [
                    f"Strategi {category} di Media Sosial 2024",
                    f"{category} untuk UMKM dengan Budget Terbatas",
                    f"Trend {category} di Indonesia Tahun Ini",
                    f"Cara {category} yang Efektif Tanpa Iklan Berbayar"
                ],
                "Website Development": [
                    f"Teknologi {category} Paling Dicari 2024",
                    f"Framework {category} Terbaik untuk Startup",
                    f"{category} Responsive: Mobile First Approach",
                    f"Keamanan {category}: Tips Penting untuk Developer"
                ]
            }
            
            return random.choice(templates.get(category, templates["SEO"]))
            
        except:
            return f"Panduan Lengkap {category} di Tahun 2024"
    
    def scrape_content(self, keyword):
        """Scrape konten dari website publik"""
        try:
            # Wikipedia Indonesia (sumber terbuka)
            url = f"https://id.wikipedia.org/wiki/{keyword.replace(' ', '_')}"
            response = self.session.get(url, headers=self.headers, timeout=10)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                content_div = soup.find('div', {'class': 'mw-parser-output'})
                
                if content_div:
                    # Ambil beberapa paragraf pertama
                    paragraphs = content_div.find_all('p', limit=5)
                    content = '\n\n'.join([p.get_text() for p in paragraphs if p.get_text()])
                    return content[:2000]  # Batasi panjang
        except:
            pass
        
        return None
    
    def generate_article_content(self, title, category):
        """Generate artikel dari template + data scraped"""
        
        # Template artikel yang sudah SEO optimized
        templates = {
            "SEO": f"""# {title}

**{category}** adalah strategi penting untuk meningkatkan visibilitas website di mesin pencari seperti Google. Di era digital saat ini, memiliki website yang teroptimasi dengan baik adalah suatu keharusan.

## Kenapa {category} Penting untuk Bisnis Online?

Banyak pebisnis online di Indonesia yang masih mengabaikan pentingnya {category}. Padahal, dengan {category} yang tepat, Anda bisa:

1. **Meningkatkan traffic organik** tanpa perlu bayar iklan
2. **Mendapatkan leads berkualitas** yang memang mencari produk/jasa Anda
3. **Membangun brand authority** di industri Anda
4. **Meningkatkan conversion rate** hingga 300%

## Teknik {category} yang Masih Efektif di 2024

### 1. Optimasi Konten
Konten adalah raja. Buat konten yang:
- Relevan dengan kebutuhan audiens
- Menggunakan kata kunci yang tepat
- Mudah dibaca dan dipahami
- Dilengkapi dengan gambar/video

### 2. Technical SEO
Pastikan website Anda:
- Loading cepat (under 3 detik)
- Mobile friendly
- Struktur URL yang clean
- Sitemap dan robots.txt terkonfigurasi

### 3. Backlink Berkualitas
Dapatkan backlink dari:
- Website pemerintah (.go.id)
- Media online terpercaya
- Forum dan komunitas relevan
- Guest posting di blog authority

## Tools {category} Gratis yang Bisa Anda Gunakan

Berikut beberapa tools gratis untuk membantu {category} Anda:

1. **Google Search Console** - Pantau performa website
2. **Google Analytics** - Analisis traffic pengunjung
3. **Ahrefs Webmaster Tools** - Analisis backlink gratis
4. **PageSpeed Insights** - Cek kecepatan website
5. **MOZ Bar** - Extension Chrome untuk analisis SEO

## Kesimpulan

{category} bukanlah sesuatu yang instan, tetapi dengan konsistensi dan teknik yang tepat, hasilnya akan sangat worth it. Mulailah dengan optimasi dasar, pelajari data analytics, dan terus tingkatkan strategi Anda.

**Tips terakhir**: Selalu ikuti update terbaru dari Google, karena algoritma terus berubah. Bergabunglah dengan komunitas {category} Indonesia untuk sharing knowledge.

---
*Artikel ini dibuat otomatis untuk membantu Anda memahami {category} lebih dalam.*""",
            
            "Digital Marketing": f"""# {title}

**Digital Marketing** telah menjadi tulang punggung bisnis modern. Di Indonesia, pertumbuhan pengguna internet yang pesat membuka peluang besar untuk pemasaran digital.

## Tren Digital Marketing 2024

Tahun 2024 membawa beberapa tren baru dalam digital marketing:

### 1. Video Content Dominance
- Short-form video (TikTok, Reels, Shorts)
- Live streaming e-commerce
- Video tutorial dan review produk

### 2. Personalization
- Chatbot dengan AI
- Email marketing terpersonalisasi
- Rekomendasi produk berdasarkan behavior

### 3. Sustainability Marketing
- Brand yang ramah lingkungan
- Produk eco-friendly
- CSR digital campaigns

## Platform Digital Marketing Terpopuler di Indonesia

### 1. Instagram
- 89% marketer Indonesia aktif di Instagram
- Fitur Reels untuk reach lebih luas
- Instagram Shopping untuk direct selling

### 2. TikTok
- Pertumbuhan pengguna tercepat
- TikTok Shop integrated
- Content viral potential

### 3. WhatsApp Business
- Personal touch dengan customer
- Broadcast messages untuk promo
- Customer service langsung

## Budget Digital Marketing untuk Pemula

Anda bisa mulai dengan budget kecil:

**Budget Rp 500.000 - 1.000.000/bulan:**
- Content creation: Rp 300.000
- Boost post: Rp 200.000
- Tools subscription: Rp 100.000
- Analytics tools: Gratis

## Studi Kasus: Sukses Digital Marketing UMKM

**Kisah Sukses "Keripik Maicih":**
- Mulai dari Instagram hanya dengan 100 followers
- User-generated content strategy
- Collaboration dengan micro-influencers
- Sekarang memiliki 10 outlet offline

## Action Plan 30 Hari

**Minggu 1-2:** 
- Riset target audience
- Setup social media profiles
- Content planning

**Minggu 3-4:**
- Content production
- Community engagement
- Analytics setup

**Tools Recommended:**
- Canva (design)
- Buffer/Hootsuite (scheduling)
- Google Trends (riset)
- Ubersuggest (keyword)

## Kesimpulan

Digital marketing adalah kebutuhan, bukan pilihan. Mulailah dari yang kecil, konsisten, dan terus belajar. Fokus pada value yang diberikan ke customer, bukan hanya penjualan.

**Quote inspirasi:** "Digital marketing bukan tentang tools, tapi tentang memahami manusia di balik screen."

---
*Artikel ini membantu Anda memulai journey digital marketing dengan tepat.*"""
        }
        
        # Pilih template berdasarkan kategori
        article_template = templates.get(category, templates["SEO"])
        
        # Ganti placeholder dengan judul aktual
        content = article_template.replace("{title}", title)
        content = content.replace("{category}", category)
        
        # Tambahkan data real-time (tanggal)
        current_date = datetime.now().strftime("%d %B %Y")
        content = content.replace("2024", current_date)
        
        return content
    
    def get_free_image(self, keyword):
        """Dapatkan gambar gratis dari public APIs"""
        try:
            # Picsum Photos (gratis, no API needed)
            width, height = 1200, 630
            image_url = f"https://picsum.photos/{width}/{height}?random={int(time.time())}"
            
            # Cek apakah URL valid
            response = self.session.head(image_url, timeout=5)
            if response.status_code == 200:
                return image_url
                
        except:
            pass
        
        # Fallback ke placeholder
        return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop"
    
    def create_markdown_file(self, title, content, category, image_url):
        """Buat file markdown untuk Jekyll/GitHub Pages"""
        
        # Generate slug untuk filename
        slug = title.lower() \
            .replace(" ", "-") \
            .replace(",", "") \
            .replace(".", "") \
            .replace(":", "") \
            .replace("?", "")[:50]
        
        date_str = datetime.now().strftime("%Y-%m-%d")
        filename = f"_posts/{date_str}-{slug}.md"
        
        # Front matter untuk Jekyll
        front_matter = f"""---
layout: post
title: "{title}"
date: {date_str} {datetime.now().strftime("%H:%M:%S")} +0700
categories: [{category.lower()}]
tags: [{category.lower()}, indonesia, tutorial, tips]
image: {image_url}
author: AI Generator
description: "{title}. Pelajari strategi dan tips terbaru di tahun {datetime.now().strftime('%Y')}."
---

"""
        
        # Gabungkan dengan konten
        full_content = front_matter + content
        
        # Buat folder _posts jika belum ada
        os.makedirs("_posts", exist_ok=True)
        
        # Tulis file
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(full_content)
        
        print(f"✅ File created: {filename}")
        return filename
    
    def run(self, auto_mode=False):
        """Main function to generate article"""
        
        print("🤖 AI Article Generator (NO API VERSION)")
        print("=" * 50)
        
        # Load categories
        categories_data = self.load_categories()
        categories = list(categories_data.keys())
        
        # Pilih kategori random
        category = random.choice(categories)
        print(f"📂 Selected category: {category}")
        
        # Generate title
        title = self.get_random_title(category)
        print(f"📌 Title: {title}")
        
        # Generate content
        print("⏳ Generating content...")
        content = self.generate_article_content(title, category)
        
        # Get image
        print("⏳ Getting image...")
        image_url = self.get_free_image(category)
        print(f"🖼️  Image URL: {image_url}")
        
        # Create markdown file
        print("⏳ Creating markdown file...")
        filename = self.create_markdown_file(title, content, category, image_url)
        
        print("\n" + "=" * 50)
        print(f"🎉 ARTICLE GENERATED SUCCESSFULLY!")
        print(f"📁 File: {filename}")
        print(f"📖 Title: {title}")
        print(f"🏷️  Category: {category}")
        print(f"📊 Length: {len(content)} characters")
        print("=" * 50)
        
        return filename

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='AI Article Generator (No API)')
    parser.add_argument('--auto', action='store_true', help='Auto mode without interaction')
    
    args = parser.parse_args()
    
    generator = NoAPIGenerator()
    
    if args.auto:
        # Auto mode untuk GitHub Actions
        generator.run(auto_mode=True)
    else:
        # Interactive mode
        print("\n" + "=" * 50)
        print("AI ARTICLE GENERATOR - NO API NEEDED")
        print("=" * 50)
        
        categories = list(generator.load_categories().keys())
        print("\nAvailable categories:")
        for i, cat in enumerate(categories, 1):
            print(f"{i}. {cat}")
        
        choice = input("\nChoose category (number) or Enter for random: ")
        
        if choice.isdigit() and 1 <= int(choice) <= len(categories):
            category = categories[int(choice)-1]
        else:
            category = random.choice(categories)
        
        generator.run()

if __name__ == "__main__":
    main()
