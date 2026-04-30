from flask import Flask, jsonify
import threading
import traceback
import firebase_admin
from firebase_admin import credentials, firestore
from scraper import scrape_product
from datetime import datetime

from flask_cors import CORS

# Flask App
app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# --- Update Logic ---
def update_all_products():
    try:
        products_ref = db.collection("products")
        docs = list(products_ref.stream())  # materialize the stream immediately

        if not docs:
            print("No products found in Firestore.")
            return

        print(f"Found {len(docs)} product(s) to update...")

        for doc in docs:
            product = doc.to_dict()
            product_id = doc.id
            url = product.get("link")
            name = product.get("name", "Unknown")

            if not url:
                print(f"Skipping '{name}' — no URL")
                continue

            print(f"Scraping '{name}'...")

            try:
                scraped = scrape_product(url)
            except Exception as e:
                print(f"Scraper error for '{name}': {e}")
                traceback.print_exc()
                continue

            if not scraped:
                print(f"Skipping '{name}' — scraper returned nothing")
                continue

            new_price = scraped.get('price') or product.get('price', 0)
            image_url = scraped.get('image') or product.get('image', '/spinner.gif')
            old_price = product.get('price', 0)

            # --- Get current priceHistory or initialize ---
            price_history = product.get("priceHistory", [])

            # Append new price entry with timestamp
            price_history.append({
                "price": new_price,
                "date": datetime.utcnow().strftime("%d %b")
            })

            # Update Firestore document
            products_ref.document(product_id).update({
                "price": new_price,
                "lastPrice": old_price,
                "image": image_url,
                "priceHistory": price_history
            })

            print(f"Updated '{name}' | {old_price} -> {new_price} | History: {len(price_history)} entries")

        print("All products updated successfully!")

    except Exception as e:
        print(f"Fatal error in update_all_products: {e}")
        traceback.print_exc()


# --- Flask Route ---
@app.route("/update-products", methods=["POST"])
def update_products():
    try:
        # Run update in a background thread (non-blocking)
        thread = threading.Thread(target=update_all_products)
        thread.start()

        return jsonify({
            "status": "started",
            "message": "Product update started successfully!"
        }), 200

    except Exception as e:
        print("Error triggering update:", e)
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


# --- Run Flask App ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
