// Image Sources Array
const imageSources = [
    'images/img1.jpg',
    'images/img2.jpg',
    'images/img3.jpg',
    'images/img4.jpg',
    'images/img5.jpg',
    'images/img6.jpg',
    'images/img7.jpg',
    'images/img8.jpg',
    'images/img9.jpg',
    'images/img10.jpg'
];

// Set initial image index
let currentImageIndex = 0;

// Function to change main image on thumbnail hover
function changeImage(index) {
    currentImageIndex = index;
    const mainImage = document.getElementById('currentImage');
    mainImage.src = imageSources[index];
}

// Add event listeners to thumbnails
const thumbnails = document.querySelectorAll('.thumbnails img');
thumbnails.forEach((thumb, index) => {
    thumb.addEventListener('mouseover', () => {
        changeImage(index);
    });
    thumb.addEventListener('click', () => {
        openModal(index);
    });
});

// Parallax Effect on Main Image
const mainImageContainer = document.getElementById('mainImageContainer');
mainImageContainer.addEventListener('mousemove', (e) => {
    const image = document.getElementById('currentImage');
    const rect = mainImageContainer.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.
    const moveX = (x / rect.width - 0.5) * 30; // Increased multiplier for more pronounced effect
    const moveY = (y / rect.height - 0.5) * 30; // Increased multiplier for more pronounced effect
    image.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`;
});

mainImageContainer.addEventListener('mouseleave', () => {
    const image = document.getElementById('currentImage');
    image.style.transform = 'scale(1.05) translate(0px, 0px)';
});

// Toggle Favorite Button
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
    overlay.classList.toggle('open');
    detailsLink.classList.toggle('active');
}

// Modal Functionality for Image Carousel
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const closeModalBtn = document.querySelector('.close');
const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.prev');

// Function to open modal with specific image index
function openModal(index) {
    currentImageIndex = index;
    modal.style.display = "block";
    modalImg.src = imageSources[currentImageIndex];
    updateArrows();
}

// Function to close modal
function closeModal() {
    modal.style.display = "none";
}

// Function to show next image
function showNextImage() {
    currentImageIndex = (currentImageIndex + 1) % imageSources.length;
    modalImg.src = imageSources[currentImageIndex];
    updateArrows();
}

// Function to show previous image
function showPrevImage() {
    currentImageIndex = (currentImageIndex - 1 + imageSources.length) % imageSources.length;
    modalImg.src = imageSources[currentImageIndex];
    updateArrows();
}

// Function to update arrows visibility
function updateArrows() {
    // Optional: If you want to hide arrows at the ends, uncomment below
    /*
    if (currentImageIndex === 0) {
        prevBtn.style.display = "none";
    } else {
        prevBtn.style.display = "block";
    }

    if (currentImageIndex === imageSources.length - 1) {
        nextBtn.style.display = "none";
    } else {
        nextBtn.style.display = "block";
    }
    */
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
                    img.onclick = () => openModal(imageSources.indexOf(mediaUrl));
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
    loadReviews();

    // Initialize detailed description as collapsed
    const overlay = document.getElementById('detailsOverlay');
    overlay.classList.remove('open');
};

// Load More Reviews
function loadMoreReviews() {
    loadReviews();
}

// Sort Reviews
function sortReviews(criteria) {
    if (criteria === 'highest') {
        reviews.sort((a, b) => b.rating - a.rating);
    } else if (criteria === 'lowest') {
        reviews.sort((a, b) => a.rating - b.rating);
    } else if (criteria === 'newest') {
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (criteria === 'oldest') {
        reviews.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
        // Default sorting if needed
        reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Reset and Reload Reviews
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = '';
    reviewsLoaded = 0;
    loadReviews();

    // Show Load More button if hidden
    document.querySelector('.load-more-btn').style.display = 'block';
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
