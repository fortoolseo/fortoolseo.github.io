#!/usr/bin/env python3
"""
AI Article Generator 100% Gratis
Menggunakan Hugging Face & Unsplash API
"""

import os
import json
import requests
import random
from datetime import datetime
import markdown
import time

# ========== KONFIGURASI ==========
API_TOKEN = ""  # Kosong karena gratis
UNSPLASH_ACCESS_KEY = "YOUR_UNSPLASH_KEY"  # Daftar gratis di unsplash.com
CATEGORIES_FILE = "categories.json"
POSTS_DIR = "../_posts/"
IMAGES_DIR = "../assets/images/generated/"

# Model Hugging Face GRATIS
TEXT_MODELS = {
    "article": "microsoft/DialoGPT-medium",
    "title": "distilgpt2",
    "summarize": "facebook/bart-large-cnn"
}

# ========== FUNGSI UTAMA ==========

class FreeAIGenerator:
    def __init__(self):
        self.session = requests.Session()
        self.categories = self.load_categories()
        
    def load_categories(self):
        """Load kategori dari file JSON"""
        with open(CATEGORIES_FILE, 'r') as f:
            return json.load(f)
    
    def generate_title(self, category):
        """Generate judul menggunakan GPT-2 gratis"""
        try:
            # API Hugging Face Inference (GRATIS)
            API_URL = f"https://api-inference.huggingface.co/models/{TEXT_MODELS['title']}"
            headers = {"Authorization": f"Bearer {API_TOKEN}"}
            
            prompt = f"Judul artikel SEO tentang {category}:"
            payload = {
                "inputs": prompt,
                "parameters": {
                    "max_length": 60,
                    "temperature": 0.8,
                    "do_sample": True
                }
            }
            
            response = self.session.post(API_URL, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                title = result[0]['generated_text'].replace(prompt, "").strip()
                # Bersihkan judul
                title = title.split('\n')[0].strip('"').strip()
                if not title.endswith('.'):
                    title = title + '.'
                return title
        except Exception as e:
            print(f"Error generate title: {e}")
        
        # Fallback: judul acak
        fallback_titles = [
            f"Tips {category} Terbaru untuk Pemula",
            f"Cara Mudah {category} di 2024",
            f"Rahasia {category} yang Jarang Diketahui"
        ]
        return random.choice(fallback_titles)
    
    def generate_content(self, title, category):
        """Generate konten artikel"""
        try:
            # Gunakan API alternatif GRATIS
            API_URL = "https://api.openai.com/v1/chat/completions"
            
            # Template prompt untuk artikel SEO
            prompt = f"""Buat artikel SEO tentang "{title}" dengan kategori {category}.

Struktur:
1. Pendahuluan (3-4 paragraf)
2. Poin utama 1 (subjudul H2, 3 paragraf)
3. Poin utama 2 (subjudul H2, 3 paragraf)
4. Poin utama 3 (subjudul H2, 3 paragraf)
5. Kesimpulan (2-3 paragraf)

Format dalam Markdown dengan **bold** untuk kata kunci."""

            # Simulasi response (ganti dengan API gratis sebenarnya)
            articles = {
                "SEO": f"""# {title}

**SEO (Search Engine Optimization)** adalah praktik optimasi website untuk meningkatkan ranking di mesin pencari.

## Mengapa {category} Penting?
{category} membantu website mendapatkan traffic organik yang berkualitas. Dengan teknik yang tepat, Anda bisa mendominasi hasil pencarian Google.

## Teknik {category} Terbaru 2024
1. **Optimasi Core Web Vitals**
2. **Content Clustering**
3. **E-A-T Optimization**

## Tools {category} Gratis
- Google Search Console
- SEMrush (versi gratis)
- Ahrefs Webmaster Tools

Dengan menerapkan {category} secara konsisten, website Anda akan lebih mudah ditemukan di Google.""",

                "Digital Marketing": f"""# {title}

**Digital Marketing** adalah strategi pemasaran menggunakan media digital untuk menjangkau audiens.

## Strategi {category} Efektif
{category} berkembang sangat cepat. Berikut strategi yang masih efektif di 2024:

## Platform Terbaik untuk {category}
1. **Instagram** untuk visual content
2. **TikTok** untuk generasi muda
3. **LinkedIn** untuk B2B

## Budget {category} untuk Pemula
Anda bisa mulai dengan budget Rp 500.000/bulan. Fokus pada content marketing dulu.

Kesimpulannya, {category} wajib dikuasai oleh pelaku bisnis modern.""",

                "Website Development": f"""# {title}

**Website Development** adalah proses pembuatan dan pengembangan website.

## Trend {category} 2024
Tahun 2024 membawa banyak perubahan dalam {category}:

## Framework Populer
1. **React.js** untuk frontend
2. **Laravel** untuk backend PHP
3. **Next.js** untuk SEO friendly

## Tips Optimasi Website
- Gunakan CDN
- Kompres gambar
- Minimize CSS/JS

Dengan pengembangan yang tepat, website bisa loading dalam 2 detik."""
            }
            
            return articles.get(category, articles["SEO"])
            
        except Exception as e:
            print(f"Error generate content: {e}")
            return self.fallback_content(title, category)
    
    def fallback_content(self, title, category):
        """Konten fallback jika API error"""
        return f"""# {title}

Artikel ini membahas tentang **{category}** dan implementasinya dalam dunia digital.

## Pengertian {category}
{category} adalah salah satu aspek penting dalam pengembangan online. Banyak pebisnis yang sukses berkat menguasai {category}.

## Manfaat {category}
1. Meningkatkan visibilitas
2. Menjangkau audiens lebih luas
3. Meningkatkan konversi

## Cara Memulai {category}
Mulailah dengan mempelajari dasar-dasarnya. Ikuti tutorial online atau bergabung dengan komunitas.

**Tips**: Konsistensi adalah kunci sukses dalam {category}.

## Kesimpulan
Dengan memahami {category}, Anda bisa mengoptimalkan performa online dengan lebih baik.

---
*Artikel ini dibuat secara otomatis oleh AI Generator.*"""
    
    def generate_image(self, title):
        """Generate gambar dari Unsplash (gratis)"""
        try:
            # API Unsplash (gratis dengan limit)
            url = "https://api.unsplash.com/photos/random"
            headers = {
                "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}",
                "Accept-Version": "v1"
            }
            
            # Cari berdasarkan keyword dari judul
            keywords = title.split()[:2]
            query = "+".join(keywords)
            
            params = {
                "query": query + ",digital,technology",
                "orientation": "landscape"
            }
            
            response = self.session.get(url, headers=headers, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                image_url = data['urls']['regular']
                
                # Download gambar
                img_response = self.session.get(image_url, timeout=10)
                
                # Simpan gambar
                os.makedirs(IMAGES_DIR, exist_ok=True)
                filename = f"article_{int(time.time())}.jpg"
                filepath = os.path.join(IMAGES_DIR, filename)
                
                with open(filepath, 'wb') as f:
                    f.write(img_response.content)
                
                return f"/assets/images/generated/{filename}"
                
        except Exception as e:
            print(f"Error generate image: {e}")
        
        # Fallback: gambar placeholder
        return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop"
    
    def create_jekyll_post(self, title, content, category, image_url):
        """Buat file markdown untuk Jekyll"""
        # Format filename
        date = datetime.now().strftime("%Y-%m-%d")
        slug = title.lower().replace(" ", "-").replace(".", "").replace(",", "")[:50]
        filename = f"{date}-{slug}.md"
        filepath = os.path.join(POSTS_DIR, filename)
        
        # Front Matter Jekyll
        front_matter = f"""---
layout: default
title: "{title}"
date: {date}
categories: [{category}]
tags: [{category}, seo, digital marketing]
image: {image_url}
author: AI Generator
description: "Artikel tentang {title}. Pelajari tips dan trik terbaru."
---

"""
        
        # Gabungkan front matter dengan konten
        full_content = front_matter + content
        
        # Simpan file
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(full_content)
        
        print(f"✅ Artikel berhasil dibuat: {filepath}")
        return filepath
    
    def auto_publish(self, filepath):
        """Auto commit dan push ke GitHub (jika menggunakan GitHub Pages)"""
        try:
            # Otomatis commit ke git
            os.chdir("..")  # Ke root project
            
            commands = [
                "git add .",
                f'git commit -m "Auto publish: {os.path.basename(filepath)}"',
                "git push origin main"
            ]
            
            for cmd in commands:
                os.system(cmd)
                time.sleep(1)
            
            print("🚀 Artikel berhasil dipublish ke GitHub!")
            
        except Exception as e:
            print(f"Error auto publish: {e}")
            print("⚠️ Artikel dibuat lokal, publish manual dengan git push")
    
    def generate_article(self, category=None):
        """Generate satu artikel lengkap"""
        if not category:
            category = random.choice(list(self.categories.keys()))
        
        print(f"📝 Membuat artikel tentang: {category}")
        
        # 1. Generate judul
        print("⏳ Generating title...")
        title = self.generate_title(category)
        print(f"📌 Judul: {title}")
        
        # 2. Generate konten
        print("⏳ Generating content...")
        content = self.generate_content(title, category)
        
        # 3. Generate gambar
        print("⏳ Generating image...")
        image_url = self.generate_image(title)
        print(f"🖼️  Gambar: {image_url}")
        
        # 4. Buat file Jekyll
        print("⏳ Creating Jekyll post...")
        post_file = self.create_jekyll_post(title, content, category, image_url)
        
        # 5. Auto publish (optional)
        publish = input("🚀 Publish ke GitHub? (y/n): ").lower()
        if publish == 'y':
            self.auto_publish(post_file)
        
        return post_file
    
    def batch_generate(self, count=3):
        """Generate multiple articles"""
        categories = list(self.categories.keys())
        
        for i in range(count):
            print(f"\n📄 Artikel {i+1}/{count}")
            category = random.choice(categories)
            self.generate_article(category)
            time.sleep(2)  # Delay untuk menghindari rate limit

# ========== MENU UTAMA ==========

def main():
    print("""
    🤖 FREE AI ARTICLE GENERATOR
    =============================
    1. Generate satu artikel
    2. Generate batch (3 artikel)
    3. Pilih kategori spesifik
    4. Exit
    """)
    
    generator = FreeAIGenerator()
    
    while True:
        choice = input("\nPilih menu (1-4): ").strip()
        
        if choice == "1":
            generator.generate_article()
        
        elif choice == "2":
            generator.batch_generate(3)
        
        elif choice == "3":
            print("\n📂 Kategori tersedia:")
            for cat in generator.categories:
                print(f"  - {cat}")
            category = input("\nMasukkan kategori: ").strip()
            if category in generator.categories:
                generator.generate_article(category)
            else:
                print("❌ Kategori tidak ditemukan")
        
        elif choice == "4":
            print("👋 Terima kasih!")
            break
        
        else:
            print("❌ Pilihan tidak valid")

if __name__ == "__main__":
    # Buat folder jika belum ada
    os.makedirs("ai-generator", exist_ok=True)
    os.makedirs(POSTS_DIR, exist_ok=True)
    os.makedirs(IMAGES_DIR, exist_ok=True)
    
    main()
