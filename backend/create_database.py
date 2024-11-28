# ===== backend/create_database.py =====

import pandas as pd
import sqlite3

# Sample data based on the provided dataset
data = {
    'Category': [
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
    ],
    'Niche Score': [12, 13, 12, 14, 10, 14, 13, 11, 15, 9, 14, 10, 13, 12, 14],
    'Market Volume (₽)': [9804448, 30749510, 71137895, 31132723, 7695256, 20995930, 45051719, 12000000, 8500000, 5000000, 20000000, 7500000, 6000000, 4000000, 18000000],
    'Price Segment (₽)': [
        '289-388', '1794-2452', '998-1145', '789-1903', '1024-2972',
        '1473-1885', '1151-2332', '500-1200', '800-1500', '300-700',
        '1000-2000', '400-900', '350-800', '700-1300', '600-1600'
    ],
    'Average Check (₽)': [327, 2113, 999, 2216, 2150, 2505, 2988, 1200, 1500, 500, 1600, 650, 700, 900, 1100],
    'Items with Sales (%)': [56, 61, 57, 68, 59, 69, 50, 62, 55, 45, 70, 60, 58, 52, 65],
    'Growth (%)': [67.0, 298.0, None, 181.0, 106.0, 27.0, 37.0, 150.0, 80.0, 40.0, 90.0, 75.0, 65.0, 55.0, 85.0],
    'Units Sold': [
        35700.0, 16111.0, None, 4695.0, 6526.0, 5288.0, 7123.0, 15000.0,
        8000.0, 4000.0, 18000.0, 7000.0, 6000.0, 5000.0, 12000.0
    ],
    'Top Product ACP (₽)': [
        1599.0, 3358.0, None, 1881.0, 1374.0, 1877.0, 2010.0, 1600.0,
        1300.0, 600.0, 1900.0, 800.0, 700.0, 1000.0, 1200.0
    ],
    'Top Product Units Sold': [
        3752.0, 1745.0, None, 1734.0, 1592.0, 757.0, 1694.0, 1600.0,
        1300.0, 600.0, 1900.0, 800.0, 700.0, 1000.0, 1200.0
    ],
    'Top Product Price (₽)': [
        345.0, 1125.0, None, 1125.0, 2153.0, 4553.0, 1971.0, 1500.0,
        1300.0, 600.0, 1900.0, 800.0, 700.0, 1000.0, 1200.0
    ],
    'Remarks': [
        'Emerging niche with steady growth',
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
    ],
    'Article Number': [
        260364469, 262496013, 123456789, 545258711, 892988125,
        563553097, 821452766, 300112233, 400223344, 500334455,
        600445566, 700556677, 800667788, 900778899, 100889900
    ]
}

# Create DataFrame
df = pd.DataFrame(data)

# Add image paths (assuming images are named as img1.jpg to img15.jpg)
image_mapping = {
    'Candy Bags for School': 'img1.jpg',
    'Midi Sequin Skirts': 'img2.jpg',
    'Winter Hats for Boys': 'img3.jpg',
    'Running Shoes': 'img4.jpg',
    'Casual Jackets': 'img5.jpg',
    'Smart Watches': 'img6.jpg',
    'Backpacks': 'img7.jpg',
    'Sports T-Shirts': 'img8.jpg',
    'LED Makeup Mirrors': 'img9.jpg',
    'Eco-friendly Water Bottles': 'img10.jpg',
    'Wireless Earbuds': 'img11.jpg',
    'Yoga Mats': 'img12.jpg',
    'Sunglasses': 'img13.jpg',
    'Leather Wallets': 'img14.jpg',
    'Portable Chargers': 'img15.jpg'
}

df['Image'] = df['Category'].map(image_mapping)

# Handle missing values by filling with default images or None
df['Image'] = df['Image'].fillna('default.jpg')

# Add 'is_leader' field, default to False
df['is_leader'] = False

# Create Predictions DataFrame
predictions_data = {
    'Product ID': [11, 6, 4, 10, 12],  # Assuming Product IDs match the 'Article Number'
    'Product Name': [
        'Wireless Earbuds',
        'Smart Watches',
        'Running Shoes',
        'Eco-friendly Water Bottles',
        'Yoga Mats'
    ],
    'Predicted Popularity Score': [95, 90, 85, 80, 75],
    'Predicted Start Sales Window': ['2024-12-01', '2024-11-15', '2024-12-05', '2024-11-20', '2024-12-10'],
    'Predicted End Sales Window': ['2024-12-31', '2024-12-15', '2025-01-05', '2024-12-20', '2025-01-10']
}

df_predictions = pd.DataFrame(predictions_data)

# Connect to SQLite and create tables
conn = sqlite3.connect('products.db')
cursor = conn.cursor()

# Create 'products' table with 'is_leader' field
cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        Category TEXT,
        "Niche Score" INTEGER,
        "Market Volume (₽)" INTEGER,
        "Price Segment (₽)" TEXT,
        "Average Check (₽)" INTEGER,
        "Items with Sales (%)" INTEGER,
        "Growth (%)" REAL,
        "Units Sold" REAL,
        "Top Product ACP (₽)" REAL,
        "Top Product Units Sold" REAL,
        "Top Product Price (₽)" REAL,
        Remarks TEXT,
        "Article Number" INTEGER PRIMARY KEY,
        Image TEXT,
        is_leader BOOLEAN
    )
''')

# Insert data into 'products' table
df.to_sql('products', conn, if_exists='replace', index=False)

# Update 'is_leader' for predicted products
for _, row in df_predictions.iterrows():
    cursor.execute('''
        UPDATE products
        SET is_leader = 1
        WHERE "Article Number" = ?
    ''', (row['Product ID'],))

# Create 'predictions' table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS predictions (
        "Product ID" INTEGER,
        "Product Name" TEXT,
        "Predicted Popularity Score" INTEGER,
        "Predicted Start Sales Window" TEXT,
        "Predicted End Sales Window" TEXT,
        FOREIGN KEY("Product ID") REFERENCES products("Article Number")
    )
''')

# Insert data into 'predictions' table
df_predictions.to_sql('predictions', conn, if_exists='replace', index=False)

# Commit and close
conn.commit()
conn.close()

print("SQLite database 'products.db' created and populated successfully.")
