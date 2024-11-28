# ===== backend/app.py =====

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import json  # Added import for json module
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__, static_folder='../', static_url_path='/')
CORS(app)  # Enable CORS for all routes

DATABASE = 'products.db'
IMAGE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../images')

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/products', methods=['GET'])
def get_products():
    try:
        conn = get_db_connection()
        products = conn.execute('SELECT * FROM products').fetchall()
        conn.close()
        product_list = [dict(product) for product in products]
        # Modify image paths to include '/images/' prefix and deserialize JSON fields
        for product in product_list:
            product['Image'] = f"/images/{product['Image']}"
            product['is_leader'] = bool(product['is_leader'])
            # Deserialize JSON fields
            if 'Specs' in product:
                product['Specs'] = json.loads(product['Specs'])
            if 'Feedbacks' in product:
                product['Feedbacks'] = json.loads(product['Feedbacks'])
            if 'Images' in product:
                product['Images'] = json.loads(product['Images'])
                # Modify image paths in Images
                product['Images'] = [f"/images/{img}" for img in product['Images']]
        return jsonify(product_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    try:
        conn = get_db_connection()
        predictions = conn.execute('SELECT * FROM predictions').fetchall()
        conn.close()
        prediction_list = [dict(pred) for pred in predictions]
        return jsonify(prediction_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# New endpoint to fetch best products
@app.route('/api/best-products', methods=['GET'])
def get_best_products():
    try:
        conn = get_db_connection()
        best_products = conn.execute('SELECT * FROM products WHERE is_leader = 1').fetchall()
        conn.close()
        best_product_list = [dict(product) for product in best_products]
        # Modify image paths and deserialize JSON fields
        for product in best_product_list:
            product['Image'] = f"/images/{product['Image']}"
            product['is_leader'] = bool(product['is_leader'])
            # Deserialize JSON fields
            if 'Specs' in product:
                product['Specs'] = json.loads(product['Specs'])
            if 'Feedbacks' in product:
                product['Feedbacks'] = json.loads(product['Feedbacks'])
            if 'Images' in product:
                product['Images'] = json.loads(product['Images'])
                # Modify image paths in Images
                product['Images'] = [f"/images/{img}" for img in product['Images']]
        return jsonify(best_product_list)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve images
@app.route('/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(IMAGE_FOLDER, filename)

# Serve the frontend
@app.route('/')
def serve_index():
    return send_from_directory('../', 'index.html')

@app.route('/marketplace.html')
def serve_marketplace():
    return send_from_directory('../', 'marketplace.html')

def generate_synthetic_data():
    from create_database import create_database
    create_database()
    print("Synthetic data generated and database updated.")

if __name__ == '__main__':
    scheduler = BackgroundScheduler()
    scheduler.add_job(func=generate_synthetic_data, trigger='interval', minutes=2)
    scheduler.start()
    try:
        app.run(debug=True, use_reloader=False)
    except (KeyboardInterrupt, SystemExit):
        pass
    finally:
        scheduler.shutdown()
