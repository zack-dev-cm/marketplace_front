# ===== backend/app.py =====

from flask import Flask, jsonify, send_from_directory, request
import sqlite3
import os

app = Flask(__name__, static_folder='../', static_url_path='/')

DATABASE = 'products.db'
IMAGE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../images')

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM products').fetchall()
    conn.close()
    product_list = []
    for product in products:
        product_dict = {
            'Category': product['Category'],
            'Niche Score': product['Niche Score'],
            'Market Volume (₽)': product['Market Volume (₽)'],
            'Price Segment (₽)': product['Price Segment (₽)'],
            'Average Check (₽)': product['Average Check (₽)'],
            'Items with Sales (%)': product['Items with Sales (%)'],
            'Growth (%)': product['Growth (%)'],
            'Units Sold': product['Units Sold'],
            'Top Product ACP (₽)': product['Top Product ACP (₽)'],
            'Top Product Units Sold': product['Top Product Units Sold'],
            'Top Product Price (₽)': product['Top Product Price (₽)'],
            'Remarks': product['Remarks'],
            'Article Number': product['Article Number'],
            'Image': f"/images/{product['Image']}",
            'is_leader': bool(product['is_leader'])
        }
        product_list.append(product_dict)
    return jsonify(product_list)

@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    conn = get_db_connection()
    predictions = conn.execute('SELECT * FROM predictions').fetchall()
    conn.close()
    prediction_list = []
    for pred in predictions:
        pred_dict = {
            'Product ID': pred['Product ID'],
            'Product Name': pred['Product Name'],
            'Predicted Popularity Score': pred['Predicted Popularity Score'],
            'Predicted Start Sales Window': pred['Predicted Start Sales Window'],
            'Predicted End Sales Window': pred['Predicted End Sales Window']
        }
        prediction_list.append(pred_dict)
    return jsonify(prediction_list)

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

if __name__ == '__main__':
    app.run(debug=True)
