import os
import time
import requests
from bs4 import BeautifulSoup

def clean_text(text):
    return " ".join(text.replace("[edit]", "").split())

def save_article(source, slug, title, text):
    os.makedirs("data/processed", exist_ok=True)
    filename = f"{source}_{slug}.txt"
    filepath = os.path.join("data/processed", filename)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"{clean_text(title)}\n\n{text}")
    print(f"Saved: {filename}")

def scrape_medlineplus(url, slug):
    res = requests.get(url)
    if res.status_code != 200: return
    soup = BeautifulSoup(res.text, "html.parser")
    
    title_tag = soup.find("h1")
    title = title_tag.get_text() if title_tag else slug
    
    content = []
    for section in soup.select("div.section-body"):
        for p in section.find_all("p"):
            content.append(clean_text(p.get_text()))
            
    save_article("medlineplus", slug, title, "\n".join(content))

def scrape_cdc(url, slug):
    res = requests.get(url)
    if res.status_code != 200: return
    soup = BeautifulSoup(res.text, "html.parser")
    
    title_tag = soup.find("h1")
    title = title_tag.get_text() if title_tag else slug
    
    content = []
    main_div = soup.find("main") or soup.find(id="main-content")
    if main_div:
        for tag in main_div.find_all(["p", "li"]):
            content.append(clean_text(tag.get_text()))
            
    save_article("cdc", slug, title, "\n".join(content))

def main():
    medline_urls = [
        ("https://medlineplus.gov/exerciseandphysicalfitness.html", "fitness"),
        ("https://medlineplus.gov/nutrition.html", "nutrition"),
        ("https://medlineplus.gov/sleepproblems.html", "sleep")
    ]
    
    for url, slug in medline_urls:
        scrape_medlineplus(url, slug)
        time.sleep(2)
        
    scrape_cdc("https://www.cdc.gov/physical-activity-basics/guidelines/adults.html", "activity_guidelines")

if __name__ == "__main__":
    main()
