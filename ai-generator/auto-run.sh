#!/bin/bash
# Script untuk auto generate artikel setiap hari

cd /path/to/fortoolseo/ai-generator
python3 generate.py --auto --count 1

# Auto commit ke GitHub
cd ..
git add .
git commit -m "Auto: Artikel harian $(date '+%Y-%m-%d')"
git push origin main
