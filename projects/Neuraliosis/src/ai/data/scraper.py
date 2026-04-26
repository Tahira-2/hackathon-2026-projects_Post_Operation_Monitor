# HOW TO RUN:
# 1. pip install requests beautifulsoup4 lxml
# 2. Place your knowledge_base.json in data/raw/
# 3. python data/scraper.py
# 4. Check data/processed/ for output files
# 5. Then run: python rag/ingest.py

import os
import json
import time
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; HealthBot/1.0)"
}

def clean_text(text):
    text = text.replace("[edit]", "")
    lines = [line.strip() for line in text.split('\n')]
    clean_lines = [line for line in lines if line]
    return " ".join(clean_lines)

def save_raw_html(source, slug, html_content):
    os.makedirs("data/raw", exist_ok=True)
    filepath = f"data/raw/{source}_{slug}.html"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(html_content)

def save_clean_text(source, slug, text):
    os.makedirs("data/processed", exist_ok=True)
    filename = f"{source}_{slug}.txt"
    filepath = f"data/processed/{filename}"
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Saved: {filename}")

def fetch_url(url):
    try:
        res = requests.get(url, headers=HEADERS, timeout=10)
        time.sleep(2)
        if res.status_code != 200:
            print(f"Failed: {url} - Status code {res.status_code}")
            return None
        return res.text
    except Exception as e:
        print(f"Failed: {url} - {e}")
        time.sleep(2)
        return None

def scrape_medlineplus():
    urls = [
        "https://medlineplus.gov/exerciseandphysicalfitness.html",
        "https://medlineplus.gov/nutrition.html",
        "https://medlineplus.gov/sleepproblems.html",
        "https://medlineplus.gov/heartdiseases.html",
        "https://medlineplus.gov/anxiety.html",
        "https://medlineplus.gov/pain.html"
    ]
    for url in urls:
        slug = url.split("/")[-1].replace(".html", "")
        html = fetch_url(url)
        if not html: continue
        save_raw_html("medlineplus", slug, html)
        
        soup = BeautifulSoup(html, "lxml")
        title_tag = soup.find("h1")
        title = title_tag.get_text().strip() if title_tag else slug
        
        content = []
        for section in soup.find_all("div", class_="section-body"):
            for tag in section.find_all(["p", "li"]):
                content.append(clean_text(tag.get_text()))
                
        prefix = f"Source: MedlinePlus\nTopic: {title}\n\n"
        final_text = prefix + "\n".join(content)
        save_clean_text("medlineplus", slug, final_text)

def scrape_cdc():
    urls = [
        "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html",
        "https://www.cdc.gov/physical-activity-basics/benefits/index.html",
        "https://www.cdc.gov/healthy-weight-growth/healthy-eating/index.html"
    ]
    for url in urls:
        parts = [p for p in url.split("/") if p and p != "index.html"]
        slug = parts[-1].replace(".html", "") if parts else "cdc_page"
        
        html = fetch_url(url)
        if not html: continue
        save_raw_html("cdc", slug, html)
        
        soup = BeautifulSoup(html, "lxml")
        title_tag = soup.find("h1")
        title = title_tag.get_text().strip() if title_tag else slug
        
        content = []
        main_div = soup.find("main") or soup.find("div", class_="content")
        if main_div:
            for tag in main_div.find_all(["p", "li", "h2", "h3"]):
                content.append(clean_text(tag.get_text()))
                
        prefix = f"Source: CDC\nTopic: {title}\n\n"
        final_text = prefix + "\n".join(content)
        save_clean_text("cdc", slug, final_text)

def scrape_nih_magazine():
    urls = [
        "https://magazine.medlineplus.gov/article/how-much-sleep-do-you-need",
        "https://magazine.medlineplus.gov/article/the-facts-about-heart-disease",
        "https://magazine.medlineplus.gov/article/eating-right-doesnt-have-to-be-boring",
        "https://magazine.medlineplus.gov/article/rethinking-drinking"
    ]
    for url in urls:
        slug = url.split("/")[-1]
        html = fetch_url(url)
        if not html: continue
        save_raw_html("nih", slug, html)
        
        soup = BeautifulSoup(html, "lxml")
        title_tag = soup.find("h1")
        title = title_tag.get_text().strip() if title_tag else slug
        
        content = []
        article_div = soup.find("article") or soup.find("div", class_="article-body")
        if article_div:
            for p in article_div.find_all("p"):
                content.append(clean_text(p.get_text()))
                
        prefix = f"Source: NIH Magazine\nTopic: {title}\n\n"
        final_text = prefix + "\n".join(content)
        save_clean_text("nih", slug, final_text)

def convert_existing_json():
    json_path = "data/raw/knowledge_base.json"
    if not os.path.exists(json_path):
        print(f"Failed: JSON file not found at {json_path}")
        return
        
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    kb = data.get("medical_knowledge_base", [])
    for item in kb:
        title = item.get("title", "")
        category = item.get("category", "")
        symptoms = ", ".join(item.get("symptoms", []))
        causes = ", ".join(item.get("causes", []))
        guidance = item.get("guidance", "")
        prevention = item.get("prevention", "")
        when_to_see_doctor = item.get("when_to_see_doctor", "")
        
        text = (
            f"Title: {title}\n"
            f"Category: {category}\n"
            f"Symptoms: {symptoms}\n"
            f"Causes: {causes}\n"
            f"Guidance: {guidance}\n"
            f"Prevention: {prevention}\n"
            f"When to see doctor: {when_to_see_doctor}\n"
        )
        save_clean_text("kb", item["id"], text)

def validate_output():
    processed_dir = "data/processed"
    if not os.path.exists(processed_dir):
        print("No processed directory found.")
        return
        
    total_files = 0
    total_chars = 0
    
    for filename in os.listdir(processed_dir):
        if not filename.endswith(".txt"): continue
        filepath = os.path.join(processed_dir, filename)
        
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        char_count = len(content)
        total_files += 1
        total_chars += char_count
        
        if char_count < 100:
            print(f"WARNING: {filename} seems too short")
            
    print("\n--- Scraping complete ---")
    print(f"Total files: {total_files}")
    print(f"Total characters: {total_chars}")
    print(f"Estimated chunks for RAG: {total_chars // 450}")

if __name__ == "__main__":
    scrape_medlineplus()
    scrape_cdc()
    scrape_nih_magazine()
    convert_existing_json()
    validate_output()
