import requests
from bs4 import BeautifulSoup
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36"
}

def scrape_product_requests(url):
    """Try scraping with requests + BeautifulSoup (fast)"""
    try:
        res = requests.get(url, headers=HEADERS)
        res.raise_for_status()
    except Exception as e:
        print(f"[requests] Error fetching {url}: {e}")
        return None

    soup = BeautifulSoup(res.text, 'html.parser')

    # --- PRICE ---
    price_tag = soup.find('span', {'class': 'a-price-whole'}) \
                or soup.find('span', {'id': 'priceblock_dealprice'}) \
                or soup.find('span', {'id': 'priceblock_ourprice'})

    price = None
    if price_tag:
        price_text = price_tag.text.strip().replace('₹', '').replace(',', '')
        try:
            price = float(price_text)
        except:
            price = None

    # --- IMAGE ---
    image_tag = soup.find('img', {'id': 'landingImage'})
    image_url = None

    if image_tag:
        image_url = image_tag.get('src') or image_tag.get('data-old-hires')
        if not image_url:
            dynamic_image = image_tag.get('data-a-dynamic-image')
            if dynamic_image:
                try:
                    dynamic_dict = json.loads(dynamic_image)
                    image_url = list(dynamic_dict.keys())[0]
                except:
                    image_url = None

    return {'price': price, 'image': image_url}

def scrape_product_selenium(url):
    """Fallback scraping using Selenium for JS-rendered pages"""
    options = Options()
    options.headless = True
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument(f"user-agent={HEADERS['User-Agent']}")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.get(url)
    time.sleep(3)  # wait for JS to load

    price = None
    image_url = None

    try:
        # Price
        price_elem = driver.find_element("css selector", "span.a-price-whole")
        price_text = price_elem.text.strip().replace('₹', '').replace(',', '')
        price = float(price_text) if price_text else None
    except:
        pass

    try:
        # Image
        img_elem = driver.find_element("css selector", "img#landingImage")
        image_url = img_elem.get_attribute("src") or img_elem.get_attribute("data-old-hires")
    except:
        pass

    driver.quit()
    return {'price': price, 'image': image_url}

def scrape_product(url):
    """Hybrid scraper: requests first, Selenium fallback"""
    result = scrape_product_requests(url)
    if result and (result['price'] is not None or result['image'] is not None):
        return result
    else:
        print("[Hybrid] Falling back to Selenium...")
        result = scrape_product_selenium(url)
        if not result['image']:
            result['image'] = "/default-product.png"
        return result

# --- Test ---
if __name__ == "__main__":
    test_url = "https://amzn.in/d/5xR3eLP"  # replace with real URL
    data = scrape_product(test_url)
    print(data)
