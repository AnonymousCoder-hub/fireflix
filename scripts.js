const apiKey = '7967738a03ec215c7d6d675faba9c973';
const movieGrid = document.querySelector('#movies .grid');
const tvShowGrid = document.querySelector('#tvshows .grid');
const onTheAirGrid = document.querySelector('#on-the-air .grid');
const airingTodayGrid = document.querySelector('#airing-today .grid');
const upcomingMoviesGrid = document.querySelector('#upcoming-movies .grid');
const continueWatchingGrid = document.querySelector('#continue-watching-grid'); // Added for continue watching section
const searchBar = document.getElementById('search-bar');
const searchButton = document.getElementById('search-button');
const searchResults = document.getElementById('search-results');
const seasonList = document.getElementById('season-list');
const episodeList = document.getElementById('episode-list');
const episodeSection = document.querySelector('#episodes');
let currentSeason = 1;
let currentEpisode = 1;
const featuredContent = [];
let currentIndex = 0;

document.getElementById('menu-icon').addEventListener('click', () => {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

async function fetchMovies() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`);
        const data = await response.json();
        if (data.results.length) displayContent(data.results, movieGrid, 'movie');
        else console.error("No trending movies available.");
    } catch (error) {
        console.error("Error fetching trending movies: ", error);
    }
}

async function fetchTVShows() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/top_rated?api_key=${apiKey}`);
        const data = await response.json();
        if (data.results.length) displayContent(data.results, tvShowGrid, 'tv');
        else console.error("No top-rated TV shows available.");
    } catch (error) {
        console.error("Error fetching top-rated TV shows: ", error);
    }
}

async function fetchOnTheAir() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/on_the_air?api_key=${apiKey}`);
        const data = await response.json();
        if (data.results.length) displayContent(data.results, onTheAirGrid, 'tv');
        else console.error("No on the air TV shows available.");
    } catch (error) {
        console.error("Error fetching on the air TV shows: ", error);
    }
}

async function fetchAiringToday() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/airing_today?api_key=${apiKey}`);
        const data = await response.json();
        if (data.results.length) displayContent(data.results, airingTodayGrid, 'tv');
        else console.error("No TV shows airing today available.");
    } catch (error) {
        console.error("Error fetching TV shows airing today: ", error);
    }
}

async function fetchUpcomingMovies() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}`);
        const data = await response.json();
        if (data.results.length) displayContent(data.results, upcomingMoviesGrid, 'movie');
        else console.error("No upcoming movies available.");
    } catch (error) {
        console.error("Error fetching upcoming movies: ", error);
    }
}

function displayContent(items, container, type) {
    container.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        const img = document.createElement('img');
        img.src = `https://image.tmdb.org/t/p/w500${item.poster_path || item.backdrop_path}`;
        img.alt = item.title || item.name;
        div.appendChild(img);

        div.addEventListener('click', async () => {
            const imdbId = await fetchIMDbID(item.id, type);
            if (imdbId) {
                window.location.href = `movie.html?imdb_id=${imdbId}&type=${type}`;
            } else {
                console.error("IMDb ID not found.");
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

async function searchContent(query) {
    if (query.length === 0) {
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
        return;
    }
    searchResults.style.display = 'block';
    searchResults.innerHTML = '';

    try {
        const [movieResponse, tvResponse] = await Promise.all([
            fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`),
            fetch(`https://api.themoviedb.org/3/search/tv?api_key=${apiKey}&query=${query}`)
        ]);

        const movieData = await movieResponse.json();
        const tvData = await tvResponse.json();

        const results = [...movieData.results, ...tvData.results];
        displaySearchResults(results);
    } catch (error) {
        console.error("Error searching content: ", error);
    }
}

function displaySearchResults(items) {
    searchResults.innerHTML = '';
    items.forEach(item => {
        if (!item.poster_path && !item.backdrop_path) return; // Skip items without images

        const searchItem = document.createElement('div');
        searchItem.classList.add('search-item');

        const img = document.createElement('img');
        img.src = `https://image.tmdb.org/t/p/w500${item.poster_path || item.backdrop_path}`;
        img.alt = item.title || item.name;

        const title = document.createElement('h3');
        title.textContent = item.title || item.name;

        searchItem.appendChild(img);
        searchItem.appendChild(title);
        searchResults.appendChild(searchItem);

        const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
        searchItem.addEventListener('click', async () => {
            const imdbId = await fetchIMDbID(item.id, type);
            if (imdbId) {
                window.location.href = `movie.html?imdb_id=${imdbId}&type=${type}`;
            } else {
                console.error("IMDb ID not found.");
            }
        });
    });
}

searchButton.addEventListener('click', () => {
    const query = searchBar.value.trim();
    if (query) {
        window.location.href = `search.html?query=${query}`;
    }
});

searchBar.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    searchContent(query);
});

// Functions for handling TV shows and episodes
async function fetchSeasons(tvId) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=${apiKey}`);
        const data = await response.json();
        displaySeasons(data.seasons, tvId);
    } catch (error) {
        console.error("Error fetching seasons: ", error);
    }
}

function displaySeasons(seasons, tvId) {
    seasonList.innerHTML = '';
    seasons.forEach(season => {
        const button = document.createElement('button');
        button.textContent = `Season ${season.season_number}`;
        button.classList.add('season-item');
        button.addEventListener('click', () => {
            currentSeason = season.season_number;
            setActiveSeasonButton(button);
            fetchEpisodes(tvId, season.season_number);
        });
        seasonList.appendChild(button);
    });
    setActiveSeasonButton(seasonList.firstChild);
}

async function fetchEpisodes(tvId, seasonNumber) {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNumber}?api_key=${apiKey}`);
        const data = await response.json();
        displayEpisodes(data.episodes);
    } catch (error) {
        console.error("Error fetching episodes: ", error);
    }
}

function displayEpisodes(episodes) {
    episodeList.innerHTML = '';
    episodes.forEach((episode, index) => {
        const div = document.createElement('div');
        div.classList.add('episode-item');
        const img = document.createElement('img');
        img.src = `https://image.tmdb.org/t/p/w500${episode.still_path}`;
        img.alt = episode.name;
        const title = document.createElement('p');
        title.textContent = episode.name;
        div.appendChild(img);
        div.appendChild(title);
        div.addEventListener('click', () => {
            currentEpisode = episode.episode_number;
        });
        episodeList.appendChild(div);
        if (index === 0 && currentSeason === 1) {
        }
    });
}

// Function to set active season button
function setActiveSeasonButton(button) {
    const buttons = document.querySelectorAll('.season-item');
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

// Check URL parameters to determine if the selected item is a movie or TV show
const urlParams = new URLSearchParams(window.location.search);
const mediaType = urlParams.get('type');

if (mediaType === 'movie') {
    episodeSection.style.display = 'none';
} else if (mediaType === 'tv') {
    episodeSection.style.display = 'block';
    const imdbId = urlParams.get('imdb_id');
    fetchSeasons(imdbId);
}

// Fetch the content for the sections
fetchMovies();
fetchTVShows();
fetchOnTheAir();
fetchAiringToday();
fetchUpcomingMovies();

// Featured Content Section
async function fetchFeaturedContent() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}`);
        const data = await response.json();
        featuredContent.push(...data.results.slice(0, 4)); // Only get the top 4 trending items

        displayFeaturedContent();
        setInterval(nextFeaturedContent, 5000); // Change every 5 seconds
    } catch (error) {
        console.error("Error fetching featured content: ", error);
    }
}

function displayFeaturedContent() {
    const carousel = document.getElementById('carousel');
    carousel.innerHTML = ''; // Clear existing carousel items

    featuredContent.forEach(async item => {
        const div = document.createElement('div');
        div.classList.add('featured-item');
        div.style.backgroundImage = `url(https://image.tmdb.org/t/p/w1280${item.backdrop_path || item.poster_path})`;

        const fadeDiv = document.createElement('div');
        fadeDiv.classList.add('fade-bottom');

        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('featured-details');

        const title = document.createElement('h2');
        title.textContent = item.title || item.name;

        const ratingDiv = document.createElement('div');
        ratingDiv.classList.add('rating');
        const ratingImg = document.createElement('img');
        ratingImg.src = 'imdblogo.png';
        ratingImg.alt = 'IMDb Logo';
        const ratingSpan = document.createElement('span');
        ratingSpan.textContent = item.vote_average || 'N/A';

        ratingDiv.appendChild(ratingImg);
        ratingDiv.appendChild(ratingSpan);

        const description = document.createElement('p');
        description.textContent = item.overview;

        detailsDiv.appendChild(title);
        detailsDiv.appendChild(ratingDiv);
        detailsDiv.appendChild(description);

        div.appendChild(fadeDiv);
        div.appendChild(detailsDiv);

        div.addEventListener('click', async () => {
            const imdbId = await fetchIMDbID(item.id, item.media_type || (item.first_air_date ? 'tv' : 'movie'));
            if (imdbId) {
                window.location.href = `movie.html?imdb_id=${imdbId}&type=${item.media_type || (item.first_air_date ? 'tv' : 'movie')}`;
            } else {
                console.error("IMDb ID not found.");
            }
        });

        carousel.appendChild(div);
    });

    // Initialize first item as active
    document.querySelector('.featured-item').classList.add('active');
    carousel.style.animation = 'none'; // Disable animation to allow manual control
    setTimeout(() => {
        carousel.style.animation = '';
    }, 10);
}

function nextFeaturedContent() {
    const carousel = document.getElementById('carousel');
    currentIndex = (currentIndex + 1) % featuredContent.length;
    const newTransform = -100 * currentIndex;
    carousel.style.transform = `translateX(${newTransform}%)`;
}

function prevFeaturedContent() {
    const carousel = document.getElementById('carousel');
    currentIndex = (currentIndex - 1 + featuredContent.length) % featuredContent.length;
    const newTransform = -100 * currentIndex;
    carousel.style.transform = `translateX(${newTransform}%)`;
}

document.getElementById('prevBtn').addEventListener('click', () => {
    prevFeaturedContent();
    carousel.style.animation = 'none'; // Disable animation to allow manual control
    setTimeout(() => {
        carousel.style.animation = '';
    }, 10);
});

document.getElementById('nextBtn').addEventListener('click', () => {
    nextFeaturedContent();
    carousel.style.animation = 'none'; // Disable animation to allow manual control
    setTimeout(() => {
        carousel.style.animation = '';
    }, 10);
});

document.addEventListener('DOMContentLoaded', fetchFeaturedContent);

// Continue Watching Section
// Function to add new content to the top of the list
function addNewContent(imdbId) {
    let continueWatching = JSON.parse(localStorage.getItem('continueWatching')) || [];
    continueWatching = [imdbId, ...continueWatching.filter(id => id !== imdbId)]; // Add new content at the top and remove if already exists
    localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
    fetchContinueWatching(); // Refresh the list
}

// Function to move selected content to the top of the list
function moveToTop(imdbId) {
    let continueWatching = JSON.parse(localStorage.getItem('continueWatching')) || [];
    continueWatching = [imdbId, ...continueWatching.filter(id => id !== imdbId)]; // Move selected content to the top
    localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
    fetchContinueWatching(); // Refresh the list
}

// Function to save the reordered list (already handled by addNewContent and moveToTop)

// Modified displayContinueWatching function to use moveToTop on click
function displayContinueWatching(movie, imdbId) {
    const container = document.getElementById('continue-watching-grid');
    const div = document.createElement('div');
    div.className = 'grid-item';
    div.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <button class="cross-button">&times;</button>
        <div class="movie-details">
            <span class="position">Resume watching</span>
        </div>
    `;
    div.querySelector('.cross-button').addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromContinueWatching(imdbId);
        div.remove();
    });
    div.addEventListener('click', () => {
        moveToTop(imdbId); // Move to top when clicked
        window.location.href = `player.html?imdb_id=${imdbId}`;
    });

    container.appendChild(div);
}
async function fetchContinueWatching() {
    let continueWatching = JSON.parse(localStorage.getItem('continueWatching')) || [];
    const continueWatchingSection = document.getElementById('continue-watching');

    // Hide the section if there are no items
    if (continueWatching.length === 0) {
        continueWatchingSection.style.display = 'none';
        return; // Exit function if no items
    }

    continueWatching.forEach(async imdbId => {
        try {
            const response = await fetch(`https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`);
            const data = await response.json();
            const movie = data.movie_results[0] || data.tv_results[0];
            displayContinueWatching(movie, imdbId);
        } catch (error) {
            console.error('Error fetching movie details:', error);
        }
    });
}

function displayContinueWatching(movie, imdbId) {
    const container = document.getElementById('continue-watching-grid');
    const div = document.createElement('div');
    div.className = 'grid-item';
    div.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <button class="cross-button">&times;</button>
        <div class="movie-details">
            <span class="position">Resume watching</span>
        </div>
    `;
    div.querySelector('.cross-button').addEventListener('click', (e) => {
        e.stopPropagation();
        removeFromContinueWatching(imdbId);
        div.remove();
    });
    div.addEventListener('click', () => {
        window.location.href = `player.html?imdb_id=${imdbId}`;
    });

    container.appendChild(div);
}

function removeFromContinueWatching(imdbId) {
    let continueWatching = JSON.parse(localStorage.getItem('continueWatching')) || [];
    console.log("Before removal:", continueWatching); // Debug log
    continueWatching = continueWatching.filter(id => id !== imdbId);
    localStorage.setItem('continueWatching', JSON.stringify(continueWatching));
    console.log("After removal:", continueWatching); // Debug log
}

// Call this function on page load to populate the "Continue Watching" section
document.addEventListener('DOMContentLoaded', () => {
    fetchContinueWatching();
});