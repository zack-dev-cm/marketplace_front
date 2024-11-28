// ===== scripts.js =====

// Global variables
let currentImageIndex = 0;
let products = [];
let relatedProducts = [];

// Fetch products from the backend
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        const data = await response.json();
        products = data;
        if (products.length > 0) {
            displayProduct(products[0]);
            displayThumbnails();
            displayRelatedProducts(products[0]);
            displayIngredients(products[0]);
            initializeParallax();
        }
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Display main product information
function displayProduct(product) {
    const productInfo = document.getElementById('productInfo');
    productInfo.innerHTML = `
        <h1 class="product-name">${product.Category}</h1>
        <div class="short-info">
            <p><strong>Артикул:</strong> ${product['Article Number']}</p>
            <p><strong>Степень пилотажа:</strong> ${product['Niche Score']}</p>
            <p><strong>Количество продуктов в упаковке:</strong> ${product['Units Sold'] || 'N/A'}</p>
            <p><strong>Питание:</strong> ${product['Price Segment (₽)']}</p>
            <p><strong>Тип питания:</strong> ${product['Remarks']}</p>
            <p><strong>Количество лампы:</strong> ${product['Top Product Units Sold'] || 'N/A'}</p>
            <p><strong>Тип лампы:</strong> ${product['Growth (%)'] || 'N/A'}</p>
        </div>
        <a href="javascript:void(0);" class="details-link" onclick="toggleDetails()">Всё характеристики и описание <i class="fas fa-chevron-down"></i></a>
    `;

    // Set the main image background
    const mainImageContainer = document.getElementById('mainImageContainer');
    mainImageContainer.style.backgroundImage = `url(${product.Image})`;
}

// Display thumbnails
function displayThumbnails() {
    const thumbnailsContainer = document.getElementById('thumbnailsContainer');
    thumbnailsContainer.innerHTML = ''; // Clear existing thumbnails

    products.forEach((prod, index) => {
        const thumb = document.createElement('img');
        thumb.src = prod.Image;
        thumb.alt = `Изображение ${index + 1}`;
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

// Change main image on thumbnail hover
function changeImage(index) {
    currentImageIndex = index;
    const mainImageContainer = document.getElementById('mainImageContainer');
    mainImageContainer.style.backgroundImage = `url(${products[index].Image})`;
}

// Display related products (for simplicity, display other products)
function displayRelatedProducts(currentProduct) {
    const relatedProductsContainer = document.getElementById('relatedProductsContainer');
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
            <button class="add-to-cart demo-btn" aria-label="Добавить в корзину">В корзину</button>
        `;
        relatedProductsContainer.appendChild(productCard);
    });
}

// Generate star ratings based on growth percentage
function generateStars(growth) {
    const starCount = growth ? Math.min(Math.round(growth / 10), 5) : 3;
    return '★'.repeat(starCount) + '☆'.repeat(5 - starCount);
}

// Display ingredients
function displayIngredients(product) {
    const productIngredients = document.getElementById('productIngredients');
    productIngredients.innerHTML = `
        <p><strong>Ингредиенты:</strong> Восковой порошок, пигменты, минеральные...</p>
        <p><strong>Срок производства:</strong> 2 года</p>
        <p><strong>Срок годности:</strong> 20 шт.</p>
    `;
}

// Toggle Favorite Button (updated to handle dynamic content)
function toggleFavorite(button) {
    button.classList.toggle('favorited');
    if (button.classList.contains('favorited')) {
        button.innerHTML = '<i class="fas fa-heart"></i> В избранном';
        alert('Товар добавлен в избранное!');
    } else {
        button.innerHTML = '<i class="fas fa-heart"></i> В избранное';
        alert('Товар удален из избранного!');
    }
}

// Toggle Detailed Description Overlay
function toggleDetails() {
    const overlay = document.getElementById('detailsOverlay');
    const detailsLink = document.querySelector('.details-link');
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

// Modal Functionality for Image Carousel
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const closeModalBtn = document.querySelector('.modal .close');
const nextBtn = document.querySelector('.modal .next');
const prevBtn = document.querySelector('.modal .prev');

// Function to open modal with specific image index
function openModal(index) {
    currentImageIndex = index;
    modal.style.display = "block";
    modalImg.src = products[currentImageIndex].Image;
    modal.setAttribute('aria-hidden', 'false');
}

// Function to close modal
function closeModal() {
    modal.style.display = "none";
    modal.setAttribute('aria-hidden', 'true');
}

// Function to show next image
function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % products.length;
    modalImg.src = products[currentImageIndex].Image;
}

// Function to show previous image
function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + products.length) % products.length;
    modalImg.src = products[currentImageIndex].Image;
}

// Event listeners for modal navigation
closeModalBtn.addEventListener('click', closeModal);
nextBtn.addEventListener('click', showNextImage);
prevBtn.addEventListener('click', showPrevImage);

// Close modal when clicking outside the image
window.addEventListener('click', (e) => {
    if (e.target == modal) {
        closeModal();
    }
});

// Image Pan (Parallax) Effect Initialization
function initializeParallax() {
    const mainImageContainer = document.getElementById('mainImageContainer');
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

// Reviews Data (Mock)
let reviews = [
    {
        name: 'Иван Иванов',
        date: '2024-04-12',
        rating: 5,
        content: 'Отличная палитра! Цвета насыщенные и долго держатся.',
        media: []
    },
    {
        name: 'Мария Петрова',
        date: '2024-03-28',
        rating: 4,
        content: 'Хорошее качество, но немного дороговато.',
        media: ['images/img2.jpg']
    },
    {
        name: 'Анна Смирнова',
        date: '2024-02-15',
        rating: 5,
        content: 'Прекрасный продукт! Легко наносится и выглядит красиво.',
        media: ['images/img3.jpg']
    },
    {
        name: 'Сергей Кузнецов',
        date: '2024-01-10',
        rating: 3,
        content: 'Нормально, но ожидал большего.',
        media: []
    },
    {
        name: 'Елена Васильева',
        date: '2023-12-05',
        rating: 4,
        content: 'Хорошие цвета, но упаковка могла быть лучше.',
        media: []
    },
    // Add more mock reviews as needed
];

// Load Reviews
let reviewsLoaded = 0;
const reviewsPerLoad = 3;

function loadReviews() {
    const container = document.getElementById('reviewsContainer');
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
        stars.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

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
                    img.alt = 'Отзыв пользователя';
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
    if (reviewsLoaded >= reviews.length) {
        document.querySelector('.load-more-btn').style.display = 'none';
    }
}

// Initial Load
window.onload = function() {
    fetchProducts();
    loadReviews();

    // Initialize detailed description as collapsed
    const overlay = document.getElementById('detailsOverlay');
    overlay.classList.remove('open');
};

// Load More Reviews
function loadMoreReviews() {
    loadReviews();
}

// Submit Review (Mock)
const reviewForm = document.getElementById('reviewForm');
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
    container.innerHTML = '';
    reviewsLoaded = 0;
    loadReviews();

    // Show Load More button if hidden
    document.querySelector('.load-more-btn').style.display = 'block';

    alert('Спасибо за ваш отзыв!');
});

// Language Selector (Mock)
const languageSelector = document.querySelector('.language-selector select');
languageSelector.addEventListener('change', function() {
    alert('Функция смены языка еще не реализована.');
});

// Demo Notification for Non-Functional Buttons
function notifyDemo() {
    alert('Эта функция пока доступна только для демонстрационных целей.');
}

// Add event listeners to all buttons and links with class 'demo-btn'
const demoButtons = document.querySelectorAll('.demo-btn');
demoButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default action
        notifyDemo();
    });
});
