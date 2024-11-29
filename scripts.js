// ===== scripts.js =====

// Global variables
let products = [];
let predictions = [];
let bestProduct = null;  // Best product data
let chart; // Chart instance
let currentImageIndex = 0;
let relatedProducts = [];
let reviewsLoaded = 0;
const reviewsPerLoad = 3;

// Fetch products and predictions from the backend
async function fetchData() {
    try {
        const [productsResponse, predictionsResponse, bestProductResponse] = await Promise.all([
            fetch('/api/products'),
            fetch('/api/predictions'),
            fetch('/api/best-products')
        ]);
        products = await productsResponse.json();
        predictions = await predictionsResponse.json();
        const bestProducts = await bestProductResponse.json();
        bestProduct = bestProducts[0];  // Assuming at least one best product

        // Determine the current page
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);

        if (page === 'marketplace.html') {
            displayThumbnails();
            if (bestProduct) {
                displayProduct(bestProduct);
                displayRelatedProducts(bestProduct);
                displayIngredients(bestProduct);
                initializeParallax();
                loadReviews();  // Load reviews after bestProduct is loaded
            }
        } else if (page === 'index.html' || page === '') { // Handle root as index.html
            displayPredictionsChart();
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Display Thumbnails
function displayThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnailsContainer');
    if (!thumbnailsContainer || !bestProduct) return; // Exit if container doesn't exist or bestProduct is null

    thumbnailsContainer.innerHTML = ''; // Clear existing thumbnails

    // Assuming bestProduct has multiple images in the 'Images' field
    const images = bestProduct.Images;  // Should be an array of image URLs

    images.forEach((imgUrl, index) => {
        const thumb = document.createElement('img');
        thumb.src = imgUrl;
        thumb.alt = `Изображение товара ${index + 1}`;
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

    // Initially set the first thumbnail as active
    if (images.length > 0) {
        thumbnailsContainer.children[0].classList.add('active');
    }
}

// Change Main Image on Thumbnail Hover
function changeImage(index) {
    currentImageIndex = index;
    const mainImageContainer = document.getElementById('mainImageContainer');
    if (!mainImageContainer || !bestProduct) return; // Exit if element doesn't exist or bestProduct is null
    mainImageContainer.style.backgroundImage = `url(${bestProduct.Images[index]})`;

    // Highlight active thumbnail
    const thumbnails = document.querySelectorAll('#thumbnailsContainer img');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    const activeThumb = thumbnails[index];
    if (activeThumb) activeThumb.classList.add('active');
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
            <p><strong>Вес:</strong> ${product.Specs.Weight}</p>
            <p><strong>Цвет:</strong> ${product.Specs.Color}</p>
            <p><strong>Размер:</strong> ${product.Specs.Dimensions}</p>
        </div>
        <a href="javascript:void(0);" class="details-link" onclick="toggleDetails()">Показать подробности <i class="fas fa-chevron-down"></i></a>
    `;

    // Set the main image
    const mainImageContainer = document.getElementById('mainImageContainer');
    if (mainImageContainer) {
        mainImageContainer.style.backgroundImage = `url(${product.Images[0]})`;  // Set the first image as default
    }
}

// Display Related Products
function displayRelatedProducts(currentProduct) {
    const relatedProductsContainer = document.getElementById('relatedProductsContainer');
    if (!relatedProductsContainer) return; // Exit if container doesn't exist

    relatedProductsContainer.innerHTML = ''; // Clear existing

    // Select related products - here, simply other products except the bestProduct
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
    const starCount = growth ? Math.min(Math.round(growth / 60), 5) : 3; // Adjust divisor as needed
    let stars = '';
    for (let i = 0; i < starCount; i++) {
        stars += '★';
    }
    for (let i = starCount; i < 5; i++) {
        stars += '☆';
    }
    return stars;
}

// Display Ingredients and Composition
function displayIngredients(product) {
    const productIngredients = document.getElementById('productIngredients');
    if (!productIngredients) return; // Exit if container doesn't exist

    productIngredients.innerHTML = `
        <p><strong>Ингредиенты:</strong> ${product.Specs.Material}</p>
        <p><strong>Состав:</strong> ${product.Specs.Color}, ${product.Specs.Weight}, ${product.Specs.Dimensions}</p>
        <p><strong>Производство:</strong> ${product.Specs['Country of Origin']}</p>
    `;
}

// Reviews Data
let reviews = [];  // Start as empty array

// Load Reviews
function loadReviews() {
    if (!bestProduct || !bestProduct.Feedbacks) return;

    reviews = bestProduct.Feedbacks;  // Use bestProduct's feedbacks

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
        stars.textContent = generateStarsFromRating(review.rating);

        // Review Content
        const reviewContent = document.createElement('p');
        reviewContent.classList.add('review-content');
        reviewContent.textContent = review.content;

        // Review Media (if any)
        let reviewMedia = null;
        if (review.media && review.media.length > 0) {
            reviewMedia = document.createElement('div');
            reviewMedia.classList.add('review-media');
            review.media.forEach(mediaUrl => {
                // Assuming media files are in '/images/' directory
                const mediaElement = document.createElement(mediaUrl.endsWith('.mp4') ? 'video' : 'img');
                mediaElement.src = `/images/${mediaUrl}`;
                mediaElement.alt = 'Отзыв товара';
                mediaElement.loading = 'lazy';
                if (mediaUrl.endsWith('.mp4')) {
                    mediaElement.controls = true;
                } else {
                    mediaElement.onclick = () => openModal(products.findIndex(p => p.Images.includes(mediaUrl)));
                }
                reviewMedia.appendChild(mediaElement);
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

function generateStarsFromRating(rating) {
    let stars = '';
    for (let i = 0; i < rating; i++) {
        stars += '★';
    }
    for (let i = rating; i < 5; i++) {
        stars += '☆';
    }
    return stars;
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
            alert('Пожалуйста, введите все обязательные поля.');
            return;
        }

        // Process media files (Mock functionality)
        const mediaUrls = [];
        for (let i = 0; i < mediaFiles.length; i++) {
            const file = mediaFiles[i];
            if (file.type.startsWith('image/')) {
                mediaUrls.push(file.name);  // Assuming the image is uploaded to /images/
            } else if (file.type.startsWith('video/')) {
                mediaUrls.push(file.name);  // Assuming the video is uploaded to /images/
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

        alert('Ваш отзыв был успешно отправлен!');
    });
}

// Load More Reviews
function loadMoreReviews() {
    loadReviews();
}

// Language Selector Functionality
function handleLanguageSelection() {
    const languageSelector = document.querySelector('.language-selector select');
    if (!languageSelector) return; // Exit if selector doesn't exist

    languageSelector.addEventListener('change', function() {
        alert('Функционал выбора языка пока не реализован.');
    });
}

// Demo Notification for Non-Functional Buttons
function notifyDemo() {
    alert('Эта функция пока не реализована.');
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

// Modal Functionality for Image Carousel
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
    modalImg.src = bestProduct.Images[currentImageIndex];
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
    if (bestProduct.Images.length === 0) return; // Prevent division by zero

    currentImageIndex = (currentImageIndex + 1) % bestProduct.Images.length;
    if (modalImg) {
        modalImg.src = bestProduct.Images[currentImageIndex];
    }
}

// Function to show previous image
function showPrevImage() {
    if (bestProduct.Images.length === 0) return; // Prevent division by zero

    currentImageIndex = (currentImageIndex - 1 + bestProduct.Images.length) % bestProduct.Images.length;
    if (modalImg) {
        modalImg.src = bestProduct.Images[currentImageIndex];
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

// Display Realtime Predictions using Chart.js on Home Page
function displayPredictionsChart() {
    const ctx = document.getElementById('predictionsChart');
    if (!ctx) return; // Exit if canvas doesn't exist

    // Prepare data for the chart
    const labels = predictions.map(pred => pred['Product Name']);
    const data = predictions.map(pred => pred['Predicted Popularity Score']);

    if (chart) {
        chart.data.labels = labels;
        chart.data.datasets[0].data = data;
        chart.update();
    } else {
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Прогноз популярности товаров',
                    data: data,
                    backgroundColor: 'rgba(106, 13, 173, 0.2)',
                    borderColor: 'rgba(106, 13, 173, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            afterBody: function(context) {
                                const index = context[0].dataIndex;
                                const start = predictions[index]['Predicted Start Sales Window'];
                                const end = predictions[index]['Predicted End Sales Window'];
                                return `Период: ${start} по: ${end}`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Прогноз популярности товаров по категориям'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Популярность (баллы)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Категории'
                        }
                    }
                }
            }
        });
    }
}

// Initialize All Functionalities
window.onload = function() {
    fetchData();
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
