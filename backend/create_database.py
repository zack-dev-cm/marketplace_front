# ===== backend/create_database.py =====
import pandas as pd
import sqlite3
import os
import cv2
import numpy as np
import random
import string
from datetime import datetime, timedelta
import json 

def generate_random_image(image_path):
    # Generate a random image and save it
    img = np.random.randint(0, 255, (500, 500, 3), dtype=np.uint8)
    cv2.imwrite(image_path, img)

def generate_product_description(category):
    # Generate a random placeholder description
    adjectives = ['Amazing', 'Innovative', 'Durable', 'Stylish', 'Compact', 'Eco-friendly', 'Premium', 'Affordable']
    features = ['high-quality materials', 'cutting-edge technology', 'user-friendly design', 'long-lasting performance', 'sleek appearance']
    benefits = ['enhances your daily life', 'provides exceptional comfort', 'offers unparalleled convenience', 'ensures maximum efficiency', 'delivers outstanding results']
    
    description = f"{random.choice(adjectives)} {category} with {random.choice(features)}, {random.choice(features)} that {random.choice(benefits)}."
    return description

def generate_random_specs():
    # Generate random specifications
    specs = {
        'Material': random.choice(['Polyester', 'Cotton', 'Leather', 'Plastic', 'Metal']),
        'Weight': f"{random.randint(100, 1000)}g",
        'Dimensions': f"{random.randint(10, 100)}x{random.randint(10, 100)}x{random.randint(1, 50)} cm",
        'Color': random.choice(['Red', 'Blue', 'Green', 'Black', 'White']),
        'Country of Origin': random.choice(['USA', 'China', 'Germany', 'India', 'Brazil']),
    }
    return specs

def generate_feedbacks():
    # Generate synthetic feedbacks
    feedbacks = []
    for _ in range(random.randint(5, 15)):
        feedback = {
            'name': ''.join(random.choices(string.ascii_uppercase, k=5)),
            'date': (datetime.now() - timedelta(days=random.randint(1, 365))).strftime('%Y-%m-%d'),
            'rating': random.randint(1, 5),
            'content': random.choice([
                'Excellent product! Highly recommend.',
                'Good quality, but a bit pricey.',
                'Average performance, could be better.',
                'Loved it! Will buy again.',
                'Not satisfied with the quality.',
                'Great value for the price.',
                'Works as expected.',
                'Exceeded my expectations!',
                'Would not purchase again.',
                'Five stars!'
            ]),
            'media': []  # Empty list for now; can be populated with image/video filenames if needed
        }
        feedbacks.append(feedback)
    return feedbacks

def create_database():
    # Generate synthetic data
    categories = [
        'Candy Bags for School',
        'Midi Sequin Skirts',
        'Winter Hats for Boys',
        'Running Shoes',
        'Casual Jackets',
        'Smart Watches',
        'Backpacks',
        'Sports T-Shirts',
        'LED Makeup Mirrors',
        'Eco-friendly Water Bottles',
        'Wireless Earbuds',
        'Yoga Mats',
        'Sunglasses',
        'Leather Wallets',
        'Portable Chargers'
    ]
    article_numbers = [random.randint(100000000, 999999999) for _ in categories]
    data = {
        'Category': categories,
        'Niche Score': [random.randint(10, 15) for _ in categories],
        'Market Volume (₽)': [random.randint(5000000, 80000000) for _ in categories],
        'Price Segment (₽)': [
            f"{random.randint(300, 2000)}-{random.randint(2001, 5000)}" for _ in categories
        ],
        'Average Check (₽)': [random.randint(500, 3000) for _ in categories],
        'Items with Sales (%)': [random.randint(40, 70) for _ in categories],
        'Growth (%)': [round(random.uniform(20.0, 300.0), 2) for _ in categories],
        'Units Sold': [random.randint(1000, 50000) for _ in categories],
        'Top Product ACP (₽)': [random.randint(500, 5000) for _ in categories],
        'Top Product Units Sold': [random.randint(500, 5000) for _ in categories],
        'Top Product Price (₽)': [random.randint(300, 5000) for _ in categories],
        'Remarks': [random.choice([
            'Emerging niche with potential',
            'Strong growth, higher price point',
            'Large market volume, steady sales',
            'Growing niche with stable demand',
            'Seasonal spikes, high profitability',
            'Steady growth, tech-related demand',
            'Popular among younger demographics',
            'Highly competitive, requires unique selling proposition',
            'High demand in urban areas',
            'Eco-conscious consumers increasing',
            'High-tech features attracting buyers',
            'Well-received in fitness communities',
            'Fashionable and trendy',
            'Classic style with modern appeal',
            'Essential for mobile lifestyles'
        ]) for _ in categories],
        'Article Number': article_numbers
    }

    df = pd.DataFrame(data)

    # Generate images and descriptions
    images_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../images')
    os.makedirs(images_folder, exist_ok=True)
    image_paths = []
    images_list = []
    descriptions = []
    specs_list = []
    feedbacks_list = []

    for category in df['Category']:
        image_filenames = []
        for i in range(3):  # Generate 3 images per product
            image_filename = f"{category.replace(' ', '_')}_{i}.jpg"
            image_path = os.path.join(images_folder, image_filename)
            generate_random_image(image_path)
            image_filenames.append(image_filename)
        images_list.append(image_filenames)
        image_paths.append(image_filenames[0])  # Use the first image as the main image

        description = generate_product_description(category)
        descriptions.append(description)

        specs = generate_random_specs()
        specs_list.append(specs)

        feedbacks = generate_feedbacks()
        feedbacks_list.append(feedbacks)

    df['Image'] = image_paths
    df['Images'] = images_list  # List of images
    df['Description'] = descriptions
    df['Specs'] = specs_list
    df['Feedbacks'] = feedbacks_list
    df['is_leader'] = [False] * len(df)

    # Serialize 'Specs', 'Feedbacks', 'Images' to JSON strings
    df['Specs'] = df['Specs'].apply(json.dumps)
    df['Feedbacks'] = df['Feedbacks'].apply(json.dumps)
    df['Images'] = df['Images'].apply(json.dumps)

    # Generate predictions
    predictions_count = 5
    predictions_indices = random.sample(range(len(df)), predictions_count)
    predictions_data = {
        'Product ID': df.iloc[predictions_indices]['Article Number'].tolist(),
        'Product Name': df.iloc[predictions_indices]['Category'].tolist(),
        'Predicted Popularity Score': [random.randint(70, 100) for _ in range(predictions_count)],
        'Predicted Start Sales Window': [
            (datetime.now()).strftime('%Y-%m-%d') for _ in range(predictions_count)
        ],
        'Predicted End Sales Window': [
            (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d') for _ in range(predictions_count)
        ]
    }
    df_predictions = pd.DataFrame(predictions_data)

    # Update 'is_leader' for predicted products
    df.loc[predictions_indices, 'is_leader'] = True

    # Connect to SQLite and create tables
    conn = sqlite3.connect('products.db')
    cursor = conn.cursor()

    # Create 'products' table
    cursor.execute('DROP TABLE IF EXISTS products')
    df.to_sql('products', conn, if_exists='replace', index=False)

    # Create 'predictions' table
    cursor.execute('DROP TABLE IF EXISTS predictions')
    df_predictions.to_sql('predictions', conn, if_exists='replace', index=False)

    # Commit and close
    conn.commit()
    conn.close()

    print("SQLite database 'products.db' created and populated successfully.")

if __name__ == '__main__':
    create_database()
