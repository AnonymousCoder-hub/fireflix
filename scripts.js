// FireFlix - Main JavaScript File
// ============================================

const apiKey = '7967738a03ec215c7d6d675faba9c973';

// DOM Elements - Updated selectors
const movieGrid = document.getElementById('movies-grid');
const tvShowGrid = document.getElementById('tvshows-grid');
const onTheAirGrid = document.getElementById('on-the-air-grid');
const airingTodayGrid = document.getElementById('airing-today-grid');
const upcomingMoviesGrid = document.getElementById('upcoming-movies-grid');
const continueWatchingGrid = document.getElementById('continue-watching-grid');
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');

// Featured Content
const featuredContent = [];
let currentIndex = 0;
let carouselInterval = null;

// Mobile Menu Toggle
const menuIcon = document.getElementById('menu-icon');
const mobileNav = document.getElementById('mobile-nav');

if (menuIcon) {
    menuIcon.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        menuIcon.classList.toggle('active');
    });
}

// Close mobile nav when clicking outside
document.addEventListener('click', (e) => {
    if (mobileNav && !mobileNav.contains(e.target) && !menuIcon.contains(e.target)) {
        mobileNav.classList.remove('active');
        menuIcon.classList.remove('active');
    }
});

// ============================================
// DATA FETCHING FUNCTIONS
// ============================================

async function fetchMovies() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`);
        const data = await response.json();
        if (data.results && data.results.length) {
            displayContent(data.results, movieGrid, 'movie');
        }
    } catch (error) {
        console.error("Error fetching trending movies: ", error);
    }
}

async function fetchTVShows() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}`);
        const data = await response.json();
        if (data.results && data.results.length) {
            displayContent(data.results, tvShowGrid, 'tv');
        }
    } catch (error) {
        console.error("Error fetching top-rated TV shows: ", error);
    }
}

async function fetchOnTheAir() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/on_the_air?api_key=${apiKey}`);
        const data = await response.json();
        if (data.results && data.results.length) {
            displayContent(data.results, onTheAirGrid, 'tv');
        }
    } catch (error) {
        console.error("Error fetching on the air TV shows: ", error);
    }
}

async function fetchAiringToday() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/airing_today?api_key=${apiKey}`);
        const data = await response.json();
        if (data.results && data.results.length) {
            displayContent(data.results, airingTodayGrid, 'tv');
        }
    } catch (error) {
        console.error("Error fetching TV shows airing today: ", error);
    }
}

async function fetchUpcomingMovies() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}`);
        const data = await response.json();
        if (data.results && data.results.length) {
            displayContent(data.results, upcomingMoviesGrid, 'movie');
        }
    } catch (error) {
        console.error("Error fetching upcoming movies: ", error);
    }
}

// ============================================
// CONTENT DISPLAY FUNCTIONS
// ============================================

function displayContent(items, container, type) {
    if (!container) return;

    container.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'grid-item';

        const img = document.createElement('img');
        img.src = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
        img.alt = item.title || item.name;
        img.loading = 'lazy';

        // Add rating overlay
        const ratingOverlay = document.createElement('div');
        ratingOverlay.className = 'rating-overlay';
        ratingOverlay.innerHTML = `<span>★</span> ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}`;

        div.appendChild(img);
        div.appendChild(ratingOverlay);

        div.addEventListener('click', async () => {
            const mediaType = item.media_type || type;
            const imdbId = await fetchIMDbID(item.id, mediaType);
            if (imdbId) {
                window.location.href = `movie.html?imdb_id=${imdbId}`;
            }
        });

        container.appendChild(div);
    });
}

async function fetchIMDbID(tmdbId, type) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${apiKey}`);
        const data = await response.json();
        return data.imdb_id || null;
    } catch (error) {
        console.error(`Error fetching IMDb ID for ${type} with TMDB ID ${tmdbId}: `, error);
        return null;
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

let searchTimeout = null;

async function searchContent(query) {
    clearTimeout(searchTimeout);

    if (query.length === 0) {
        searchResults.classList.remove('active');
        searchResults.innerHTML = '';
        return;
    }

    // Debounce search
    searchTimeout = setTimeout(async () => {
        try {
            const [movieResponse, tvResponse] = await Promise.all([
                fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`),
                fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}`)
            ]);

            const movieData = await movieResponse.json();
            const tvData = await tvResponse.json();

            const results = [...movieData.results, ...tvData.results].slice(0, 8);
            displaySearchResults(results);
        } catch (error) {
            console.error("Error searching content: ", error);
        }
    }, 300);
}

function displaySearchResults(items) {
    if (!searchResults) return;

    searchResults.innerHTML = '';

    if (items.length === 0) {
        searchResults.innerHTML = '<div class="no-search-results">No results found</div>';
        searchResults.classList.add('active');
        return;
    }

    items.forEach(item => {
        if (!item.poster_path) return;

        const searchItem = document.createElement('div');
        searchItem.className = 'search-item';

        const img = document.createElement('img');
        img.src = `https://image.tmdb.org/t/p/w200${item.poster_path}`;
        img.alt = item.title || item.name;

        const info = document.createElement('div');
        info.className = 'search-item-info';

        const title = document.createElement('h3');
        title.textContent = item.title || item.name;

        const meta = document.createElement('div');
        meta.className = 'search-item-meta';

        const type = item.media_type || (item.first_air_date ? 'TV Show' : 'Movie');
        const year = (item.release_date || item.first_air_date || '').split('-')[0];

        meta.innerHTML = `
            <span class="search-type">${type}</span>
            ${year ? `<span class="search-year">${year}</span>` : ''}
        `;

        const rating = document.createElement('div');
        rating.className = 'search-item-rating';
        rating.innerHTML = `<span>★</span> ${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}`;

        info.appendChild(title);
        info.appendChild(meta);
        info.appendChild(rating);

        searchItem.appendChild(img);
        searchItem.appendChild(info);
        searchResults.appendChild(searchItem);

        const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        searchItem.addEventListener('click', async () => {
            const imdbId = await fetchIMDbID(item.id, mediaType);
            if (imdbId) {
                window.location.href = `movie.html?imdb_id=${imdbId}`;
                searchResults.classList.remove('active');
                searchBar.value = '';
            }
        });
    });

    searchResults.classList.add('active');
}

searchButton.addEventListener('click', () => {
    const query = searchBar.value.trim();
    if (query) {
        window.location.href = `search.html?query=${encodeURIComponent(query)}`;
    }
});

searchBar.addEventListener('input', (e) => {
    searchContent(e.target.value.trim());
});

// Close search dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!searchResults.contains(e.target) && !searchBar.contains(e.target) && !searchButton.contains(e.target)) {
        searchResults.classList.remove('active');
    }
});

// ============================================
// FEATURED CONTENT / CAROUSEL
// ============================================

async function fetchFeaturedContent() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`);
        const data = await response.json();
        featuredContent.push(...data.results.slice(0, 5));

        displayFeaturedContent();
        startCarouselAutoPlay();
    } catch (error) {
        console.error("Error fetching featured content: ", error);
    }
}

function displayFeaturedContent() {
    const carousel = document.getElementById('carousel');
    const indicatorsContainer = document.getElementById('carousel-indicators');

    if (!carousel) return;

    carousel.innerHTML = '';
    if (indicatorsContainer) indicatorsContainer.innerHTML = '';

    featuredContent.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'featured-item';
        div.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${item.backdrop_path || item.poster_path})`;

        const fadeDiv = document.createElement('div');
        fadeDiv.className = 'fade-bottom';

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'featured-details';

        const title = document.createElement('h2');
        title.textContent = item.title || item.name;

        const ratingDiv = document.createElement('div');
        ratingDiv.className = 'rating';
        ratingDiv.innerHTML = `
            <span class="rating-star">★</span>
            <span>${item.vote_average ? item.vote_average.toFixed(1) : 'N/A'}</span>
        `;

        const overview = document.createElement('p');
        overview.textContent = item.overview || 'No description available.';

        const watchButton = document.createElement('button');
        watchButton.className = 'featured-watch-btn';
        watchButton.innerHTML = 'Watch Now →';

        detailsDiv.appendChild(title);
        detailsDiv.appendChild(ratingDiv);
        detailsDiv.appendChild(overview);
        detailsDiv.appendChild(watchButton);

        div.appendChild(fadeDiv);
        div.appendChild(detailsDiv);

        // Add click handler to item
        div.addEventListener('click', async () => {
            const mediaType = item.media_type || (item.first_air_date ? 'tv' : 'movie');
            const imdbId = await fetchIMDbID(item.id, mediaType);
            if (imdbId) {
                window.location.href = `movie.html?imdb_id=${imdbId}`;
            }
        });

        carousel.appendChild(div);

        // Create indicator
        if (indicatorsContainer) {
            const indicator = document.createElement('button');
            indicator.className = 'indicator';
            indicator.setAttribute('data-index', index);
            indicator.addEventListener('click', () => {
                goToSlide(index);
            });
            indicatorsContainer.appendChild(indicator);
        }
    });

    // Set first item and indicator as active
    const firstItem = carousel.querySelector('.featured-item');
    if (firstItem) firstItem.classList.add('active');

    const firstIndicator = indicatorsContainer?.querySelector('.indicator');
    if (firstIndicator) firstIndicator.classList.add('active');
}

function goToSlide(index) {
    const carousel = document.getElementById('carousel');
    const indicators = document.querySelectorAll('.indicator');

    currentIndex = index;
    const newTransform = -100 * currentIndex;

    if (carousel) {
        carousel.style.transform = `translateX(${newTransform}%)`;
    }

    // Update indicators
    indicators.forEach((ind, i) => {
        ind.classList.toggle('active', i === currentIndex);
    });
}

function nextSlide() {
    const newIndex = (currentIndex + 1) % featuredContent.length;
    goToSlide(newIndex);
}

function prevSlide() {
    const newIndex = (currentIndex - 1 + featuredContent.length) % featuredContent.length;
    goToSlide(newIndex);
}

function startCarouselAutoPlay() {
    if (carouselInterval) clearInterval(carouselInterval);
    carouselInterval = setInterval(nextSlide, 5000);
}

function stopCarouselAutoPlay() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

// Carousel navigation buttons
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        stopCarouselAutoPlay();
        prevSlide();
        startCarouselAutoPlay();
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        stopCarouselAutoPlay();
        nextSlide();
        startCarouselAutoPlay();
    });
}

// ============================================
// SCROLL BUTTONS FUNCTIONALITY
// ============================================

document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const scrollAmount = 600;
            if (btn.classList.contains('scroll-left')) {
                targetElement.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else if (btn.classList.contains('scroll-right')) {
                targetElement.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    });
});

// ============================================
// CONTINUE WATCHING SECTION
// ============================================

async function fetchContinueWatching() {
    let continueWatching = JSON.parse(localStorage.getItem('continueWatching')) || [];
    const continueWatchingSection = document.getElementById('continue-watching');

    if (!continueWatchingGrid || !continueWatchingSection) return;

    // Hide section if no items
    if (continueWatching.length === 0) {
        continueWatchingSection.style.display = 'none';
        return;
    }

    continueWatchingSection.style.display = 'block';
    continueWatchingGrid.innerHTML = '';

    for (const imdbId of continueWatching.slice(0, 10)) {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`);
            const data = await response.json();

            if (data.movie_results.length || data.tv_results.length) {
                const movie = data.movie_results[0] || data.tv_results[0];
                const mediaType = data.movie_results.length ? 'movie' : 'tv';
                displayContinueWatchingItem(movie, imdbId, mediaType);
            }
        } catch (error) {
            console.error("Error fetching continue watching item: ", error);
        }
    }
}

function displayContinueWatchingItem(movie, imdbId, type) {
    if (!continueWatchingGrid) return;

    const div = document.createElement('div');
    div.className = 'grid-item continue-item';
    div.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title || movie.name}">
        <button class="cross-button">×</button>
        <div class="movie-details">
            <span class="position">Resume</span>
        </div>
        <div class="rating-overlay">
            <span>★</span> ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
        </div>
    `;

    div.querySelector('.cross-button').addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromContinueWatching(imdbId);
        div.remove();

        // Hide section if no items left
        let continueWatching = JSON.parse(localStorage.getItem('continueWatching')) || [];
        if (continueWatching.length === 0) {
            document.getElementById('continue-watching').style.display = 'none';
        }
    });

    div.addEventListener('click', () => {
        moveToTop(imdbId);
        window.location.href = `player.html?imdb_id=${imdbId}`;
    });

    continueWatchingGrid.appendChild(div);
}

function addNewContent(imdbId) {
    let continueWatching = JSON.parse(localStorage.getItem('continueWatching')) || [];
    continueWatching = [imdbId, ...continueWatching.filter(id => id !== imdbId)];
    localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
    fetchContinueWatching();
}

function moveToTop(imdbId) {
    let continueWatching = JSON.parse(localStorage.getItem('continueWatching')) || [];
    continueWatching = [imdbId, ...continueWatching.filter(id => id !== imdbId)];
    localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
}

function removeFromContinueWatching(imdbId) {
    let continueWatching = JSON.parse(localStorage.getItem('continueWatching')) || [];
    continueWatching = continueWatching.filter(id => id !== imdbId);
    localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
}

// ============================================
// INITIALIZE
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Fetch all content
    fetchMovies();
    fetchTVShows();
    fetchOnTheAir();
    fetchAiringToday();
    fetchUpcomingMovies();
    fetchContinueWatching();

    // Fetch featured content
    fetchFeaturedContent();

    // Header scroll effect
    const header = document.querySelector('.modern-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
