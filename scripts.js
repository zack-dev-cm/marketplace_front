// ===== scripts.js =====

// Global variables
let currentImageIndex = 0;
let products = [];
let relatedProducts = [];
let predictions = [];
let reviewsLoaded = 0;
const reviewsPerLoad = 3;

// Fetch products and predictions from the backend
async function fetchData() {
    try {
        const [productsResponse, predictionsResponse] = await Promise.all([
            fetch('/api/products'),
            fetch('/api/predictions')
        ]);
        const productsData = await productsResponse.json();
        const predictionsData = await predictionsResponse.json();
        products = productsData;
        predictions = predictionsData;

        // Determine the current page
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);

        if (page === 'marketplace.html') {
            displayMarketplaceProducts();
            displayThumbnails();
            if (products.length > 0) {
                displayProduct(products[0]);
                displayRelatedProducts(products[0]);
                displayIngredients(products[0]);
                initializeParallax();
            }
        } else if (page === 'index.html' || page === '') { // Handle root as index.html
            displayPredictionsChart();
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// --------------------------
// Home Page Functionality
// --------------------------

// Display Realtime Predictions using Chart.js on Home Page
function displayPredictionsChart() {
    const ctx = document.getElementById('predictionsChart');
    if (!ctx) return; // Exit if canvas doesn't exist

    // Prepare data for the chart
    const labels = predictions.map(pred => pred['Product Name']);
    const popularityScores = predictions.map(pred => pred['Predicted Popularity Score']);
    const startSales = predictions.map(pred => pred['Predicted Start Sales Window']);
    const endSales = predictions.map(pred => pred['Predicted End Sales Window']);

    // Create the chart
    const predictionsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Прогнозируемый Рейтинг Популярности',
                data: popularityScores,
                backgroundColor: 'rgba(106, 13, 173, 0.6)',
                borderColor: 'rgba(106, 13, 173, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        afterBody: function(context) {
                            const index = context[0].dataIndex;
                            return `Период продаж: ${startSales[index]} - ${endSales[index]}`;
                        }
                    }
                },
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Рейтинг Популярности Лидерских Товаров'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Рейтинг Популярности'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Товары'
                    }
                }
            }
        }
    });
}

// --------------------------
// Marketplace Page Functionality
// --------------------------

// Display Marketplace Products
function displayMarketplaceProducts() {
    const marketplaceContainer = document.getElementById('marketplaceContainer');
    if (!marketplaceContainer) return; // Exit if container doesn't exist

    marketplaceContainer.innerHTML = ''; // Clear existing products

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');
        if (product.is_leader) {
            productCard.classList.add('leader-product');
        }

        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.Image}" alt="${product.Category}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${product.Category}</h3>
                <div class="product-rating">
                    <span class="stars">${generateStars(product['Growth (%)'])}</span>
                    <span class="rating-number">4.5</span>
                </div>
                <div class="product-price">
                    <span class="price">₽${product['Top Product ACP (₽)']}</span>
                    <span class="discount">10% скидка</span>
                </div>
            </div>
            <button class="add-to-cart demo-btn" aria-label="Добавить в корзину">Добавить в корзину</button>
            ${product.is_leader ? '<div class="leader-badge">Лидер продаж</div>' : ''}
        `;
        marketplaceContainer.appendChild(productCard);
    });
}

// Display Thumbnails
function displayThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnailsContainer');
    if (!thumbnailsContainer) return; // Exit if container doesn't exist

    thumbnailsContainer.innerHTML = ''; // Clear existing thumbnails

    products.forEach((prod, index) => {
        const thumb = document.createElement('img');
        thumb.src = prod.Image;
        thumb.alt = `Изображение продукта ${index + 1}`;
        thumb.setAttribute('data-index', index);
        thumb.loading = 'lazy';
        thumb.addEventListener('mouseover', () => {
            currentImageIndex = index;
            changeImage(index);
        });
        thumb.addEventListener('click', () => {
            openModal(index);
        });
        thumbnailsContainer.appendChild(thumb);
    });
}

// Change Main Image on Thumbnail Hover
function changeImage(index) {
    currentImageIndex = index;
    const mainImageContainer = document.getElementById('mainImageContainer');
    if (!mainImageContainer) return; // Exit if element doesn't exist
    mainImageContainer.style.backgroundImage = `url(${products[index].Image})`;
}

// Display Detailed Product Information
function displayProduct(product) {
    const productInfo = document.getElementById('productInfo');
    if (!productInfo) return; // Exit if container doesn't exist

    productInfo.innerHTML = `
        <h1 class="product-name">${product.Category}</h1>
        <div class="short-info">
            <p><strong>Цена:</strong> ₽${product['Average Check (₽)']}</p>
            <p><strong>Наличие:</strong> ${product['Items with Sales (%)']}%</p>
            <p><strong>Вес:</strong> ${product['Top Product Units Sold'] || 'N/A'}</p>
            <p><strong>Цвет:</strong> ${product['Remarks']}</p>
            <p><strong>Размеры:</strong> ${product['Top Product Price (₽)'] || 'N/A'}</p>
        </div>
        <a href="javascript:void(0);" class="details-link" onclick="toggleDetails()">Подробнее о продукте <i class="fas fa-chevron-down"></i></a>
    `;
}

// Display Related Products
function displayRelatedProducts(currentProduct) {
    const relatedProductsContainer = document.getElementById('relatedProductsContainer');
    if (!relatedProductsContainer) return; // Exit if container doesn't exist

    relatedProductsContainer.innerHTML = ''; // Clear existing

    // Select related products - here, simply other products in different categories or random
    relatedProducts = products.filter(prod => prod.Category !== currentProduct.Category).slice(0, 4); // Take first 4 different products

    relatedProducts.forEach(prod => {
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        productCard.innerHTML = `
            <div class="product-image">
                <img src="${prod.Image}" alt="${prod.Category}" loading="lazy">
            </div>
            <div class="product-info">
                <h3>${prod.Category}</h3>
                <div class="product-rating">
                    <span class="stars">${generateStars(prod['Growth (%)'])}</span>
                    <span class="rating-number">4.5</span>
                </div>
                <div class="product-price">
                    <span class="price">₽${prod['Top Product ACP (₽)']}</span>
                    <span class="discount">10% скидка</span>
                </div>
            </div>
            <button class="add-to-cart demo-btn" aria-label="Добавить в корзину">Добавить в корзину</button>
        `;
        relatedProductsContainer.appendChild(productCard);
    });
}

// Generate Star Ratings Based on Growth Percentage
function generateStars(growth) {
    const starCount = growth ? Math.min(Math.round(growth / 10), 5) : 3;
    return '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
}

// Display Ingredients and Composition
function displayIngredients(product) {
    const productIngredients = document.getElementById('productIngredients');
    if (!productIngredients) return; // Exit if container doesn't exist

    productIngredients.innerHTML = `
        <p><strong>Ингредиенты:</strong> Полиэстер</p>
        <p><strong>Состав:</strong> Высококачественный материал</p>
        <p><strong>Размеры:</strong> 30x40 см</p>
    `;
}

// Toggle Favorite Button
function toggleFavorite(button) {
    button.classList.toggle('favorited');
    if (button.classList.contains('favorited')) {
        button.innerHTML = '<i class="fas fa-heart"></i> В избранном';
        alert('Товар добавлен в избранное!');
    } else {
        button.innerHTML = '<i class="fas fa-heart"></i> В избранном';
        alert('Товар удален из избранного!');
    }
}

// Toggle Detailed Description Overlay
function toggleDetails() {
    const overlay = document.getElementById('detailsOverlay');
    const detailsLink = document.querySelector('.details-link');
    if (!overlay || !detailsLink) return; // Exit if elements don't exist

    const isOpen = overlay.classList.contains('open');

    if (isOpen) {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        detailsLink.classList.remove('active');
    } else {
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        detailsLink.classList.add('active');
    }
}

// --------------------------
// Modal Functionality for Image Carousel
// --------------------------

const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const closeModalBtn = document.querySelector('.modal .close');
const nextBtn = document.querySelector('.modal .next');
const prevBtn = document.querySelector('.modal .prev');

// Function to open modal with specific image index
function openModal(index) {
    currentImageIndex = index;
    if (!modal || !modalImg) return; // Exit if elements don't exist

    modal.style.display = "block";
    modalImg.src = products[currentImageIndex].Image;
    modal.setAttribute('aria-hidden', 'false');
}

// Function to close modal
function closeModal() {
    if (!modal) return; // Exit if modal doesn't exist

    modal.style.display = "none";
    modal.setAttribute('aria-hidden', 'true');
}

// Function to show next image
function showNextImage() {
    if (products.length === 0) return; // Prevent division by zero

    currentImageIndex = (currentImageIndex + 1) % products.length;
    if (modalImg) {
        modalImg.src = products[currentImageIndex].Image;
    }
}

// Function to show previous image
function showPrevImage() {
    if (products.length === 0) return; // Prevent division by zero

    currentImageIndex = (currentImageIndex - 1 + products.length) % products.length;
    if (modalImg) {
        modalImg.src = products[currentImageIndex].Image;
    }
}

// Event listeners for modal navigation
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (nextBtn) nextBtn.addEventListener('click', showNextImage);
if (prevBtn) prevBtn.addEventListener('click', showPrevImage);

// Close modal when clicking outside the image
window.addEventListener('click', (e) => {
    if (modal && e.target == modal) {
        closeModal();
    }
});

// Image Pan (Parallax) Effect Initialization
function initializeParallax() {
    const mainImageContainer = document.getElementById('mainImageContainer');
    if (!mainImageContainer) return; // Exit if element doesn't exist

    mainImageContainer.addEventListener('mousemove', (e) => {
        const rect = mainImageContainer.getBoundingClientRect();
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        // Adjust background position based on cursor position
        mainImageContainer.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
    });

    mainImageContainer.addEventListener('mouseleave', () => {
        mainImageContainer.style.backgroundPosition = 'center center';
    });
}

// --------------------------
// User Reviews Functionality
// --------------------------

// Reviews Data (Mock)
let reviews = [
    {
        name: 'Иван Иванов',
        date: '2024-04-12',
        rating: 5,
        content: 'Отличный продукт! Высокое качество и удобство использования.',
        media: []
    },
    {
        name: 'Мария Петрова',
        date: '2024-03-28',
        rating: 4,
        content: 'Хорошее качество, но доставка заняла немного больше времени.',
        media: ['images/img2.jpg']
    },
    {
        name: 'Анна Смирнова',
        date: '2024-02-15',
        rating: 5,
        content: 'Превосходный выбор! Рекомендую всем.',
        media: ['images/img3.jpg']
    },
    {
        name: 'Сергей Кузнецов',
        date: '2024-01-10',
        rating: 3,
        content: 'Нормально, но есть некоторые недостатки.',
        media: []
    },
    {
        name: 'Елена Васильева',
        date: '2023-12-05',
        rating: 4,
        content: 'Хороший продукт, соответствующий описанию.',
        media: []
    },
    // Add more mock reviews as needed
];

// Load Reviews
function loadReviews() {
    const container = document.getElementById('reviewsContainer');
    if (!container) return; // Exit if container doesn't exist

    const nextReviews = reviews.slice(reviewsLoaded, reviewsLoaded + reviewsPerLoad);
    nextReviews.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.classList.add('review-card');

        // Review Header
        const reviewHeader = document.createElement('div');
        reviewHeader.classList.add('review-header');

        const reviewerName = document.createElement('span');
        reviewerName.classList.add('reviewer-name');
        reviewerName.textContent = review.name;

        const reviewDate = document.createElement('span');
        reviewDate.classList.add('review-date');
        const date = new Date(review.date);
        reviewDate.textContent = date.toLocaleDateString('ru-RU');

        reviewHeader.appendChild(reviewerName);
        reviewHeader.appendChild(reviewDate);

        // Star Rating
        const stars = document.createElement('span');
        stars.classList.add('stars');
        stars.textContent = '★★★★★'.substring(0, review.rating) + '☆☆☆☆☆'.substring(0, 5 - review.rating);

        // Review Content
        const reviewContent = document.createElement('p');
        reviewContent.classList.add('review-content');
        reviewContent.textContent = review.content;

        // Review Media
        let reviewMedia = null;
        if (review.media.length > 0) {
            reviewMedia = document.createElement('div');
            reviewMedia.classList.add('review-media');
            review.media.forEach(mediaUrl => {
                if (mediaUrl.endsWith('.mp4')) {
                    const video = document.createElement('video');
                    video.src = mediaUrl;
                    video.controls = true;
                    reviewMedia.appendChild(video);
                } else {
                    const img = document.createElement('img');
                    img.src = mediaUrl;
                    img.alt = 'Отзыв товара';
                    img.loading = 'lazy';
                    img.onclick = () => openModal(products.findIndex(p => p.Image === mediaUrl));
                    reviewMedia.appendChild(img);
                }
            });
        }

        // Assemble Review Card
        reviewCard.appendChild(reviewHeader);
        reviewCard.appendChild(stars);
        reviewCard.appendChild(reviewContent);
        if (reviewMedia) {
            reviewCard.appendChild(reviewMedia);
        }

        container.appendChild(reviewCard);
    });
    reviewsLoaded += reviewsPerLoad;

    // Hide Load More button if all reviews are loaded
    const loadMoreBtn = document.querySelector('.load-more-btn');
    if (reviewsLoaded >= reviews.length && loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
}

// Submit Review (Mock)
function handleReviewSubmission() {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return; // Exit if form doesn't exist

    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('reviewerName').value.trim();
        const rating = document.getElementById('reviewRating').value;
        const content = document.getElementById('reviewContent').value.trim();
        const mediaFiles = document.getElementById('reviewMedia').files;

        if (name === '' || rating === '' || content === '') {
            alert('Пожалуйста, заполните все обязательные поля.');
            return;
        }

        // Process media files (Mock functionality)
        const mediaUrls = [];
        for (let i = 0; i < mediaFiles.length; i++) {
            const file = mediaFiles[i];
            if (file.type.startsWith('image/')) {
                mediaUrls.push(URL.createObjectURL(file));
            } else if (file.type.startsWith('video/')) {
                mediaUrls.push(URL.createObjectURL(file));
            }
        }

        // Add new review to the beginning of the reviews array
        reviews.unshift({
            name: name,
            date: new Date().toISOString().split('T')[0],
            rating: parseInt(rating),
            content: content,
            media: mediaUrls
        });

        // Reset form
        reviewForm.reset();

        // Reload reviews
        const container = document.getElementById('reviewsContainer');
        if (container) {
            container.innerHTML = '';
        }
        reviewsLoaded = 0;
        loadReviews();

        // Show Load More button if hidden
        const loadMoreBtn = document.querySelector('.load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'block';
        }

        alert('Спасибо за ваш отзыв!');
    });
}

// --------------------------
// Language Selector Functionality
// --------------------------

function handleLanguageSelection() {
    const languageSelector = document.querySelector('.language-selector select');
    if (!languageSelector) return; // Exit if selector doesn't exist

    languageSelector.addEventListener('change', function() {
        alert('Функционал выбора языка в разработке.');
    });
}

// --------------------------
// Demo Notification for Non-Functional Buttons
// --------------------------

function notifyDemo() {
    alert('Эта функция пока недоступна.');
}

function handleDemoButtons() {
    const demoButtons = document.querySelectorAll('.demo-btn');
    demoButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default action
            notifyDemo();
        });
    });
}

// --------------------------
// Initialize All Functionalities
// --------------------------

window.onload = function() {
    fetchData();
    loadReviews();
    handleReviewSubmission();
    handleLanguageSelection();
    handleDemoButtons();

    // Initialize detailed description as collapsed (if exists)
    const overlay = document.getElementById('detailsOverlay');
    const detailsLink = document.querySelector('.details-link');
    if (overlay && detailsLink) {
        overlay.classList.remove('open');
    }
};
