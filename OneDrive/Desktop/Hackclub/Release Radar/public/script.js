let currentMovies = [];
let selectedGenre = '28';
AOS.init();

function getCountdown(releaseDate) {
    const now = new Date();
    const release = new Date(releaseDate);
    const diff = release - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Released';
    if (days === 0) return 'Releasing today!';
    return `${days} days until release`;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

async function fetchMovies() {
    try {
        const response = await fetch('/api/upcoming');
        const data = await response.json();
        currentMovies = data.results;
        createMovieBackground(currentMovies);
        displayMovies(currentMovies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        const moviesContainer = document.getElementById('movies-container');
        moviesContainer.innerHTML = `
        <p style="color: var(--neon-pink); text-align: center; padding: 2rem;">
        Failed to load movies. Please try again later.<br>
        <small style="color: var(--neon-blue);">${error.message}</small>
        </p>`;
    }
}

function getTimeRemaining(endtime) {
    const total = Date.parse(endtime) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor((total / (1000 * 60 * 60 * 24)) % 30);
    const months = Math.floor(total / (1000 * 60 * 60 * 24 * 30));
    return {
        total,
        months,
        days,
        hours,
        minutes,
        seconds};
}

function updateMainCountdown() {
    const deadline = 'February 14, 2025 00:00:00';
    const t = getTimeRemaining(deadline);
    document.getElementById('months').innerHTML = t.months.toString().padStart(2, '0');
    document.getElementById('days').innerHTML = t.days.toString().padStart(2, '0');
    document.getElementById('hours').innerHTML = t.hours.toString().padStart(2, '0');
}

function autoScrollToContent() {
    setTimeout(() => {
        window.scrollTo({
            top: window.innerHeight / 2,
            behavior: 'smooth'
        });
    }, 5000); 
}

document.addEventListener('DOMContentLoaded', () => {
    fetchMovies();
    updateMainCountdown();
    setInterval(updateMainCountdown, 1000);

    const genreTabs = document.querySelectorAll('.genre-tab');
    genreTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            genreTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            selectedGenre = tab.dataset.genre;
            displayMovies(currentMovies);
        });
    });

    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const genreTabsSection = document.querySelector('.genre-tabs');
            if (genreTabsSection) {
                genreTabsSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    setTimeout(() => {
        window.scrollTo({
            top: window.innerHeight / 2,
            behavior: 'smooth'
        });
    }, 5000);
});

function displayMovies(movies) {
    const moviesContainer = document.getElementById('movies-container');
    moviesContainer.innerHTML = '';
    
    if (!movies || !Array.isArray(movies)) {
        moviesContainer.innerHTML = `
            <p style="color: var(--neon-pink); text-align: center; padding: 2rem; grid-column: 1/-1;">
                No movies available.
            </p>`;
        return;
    }

    const filteredMovies = selectedGenre === 'all' 
        ? movies 
        : movies.filter(movie => 
            movie.genre_ids && 
            Array.isArray(movie.genre_ids) && 
            movie.genre_ids.includes(Number(selectedGenre))
        );

    if (filteredMovies.length === 0) {
        moviesContainer.innerHTML = `
            <p style="color: var(--neon-pink); text-align: center; padding: 2rem; grid-column: 1/-1;">
                No movies found for this genre.
            </p>`;
        return;
    }

    filteredMovies.forEach((movie, index) => {
        if (movie.poster_path) {
            const movieCard = document.createElement('div');
            movieCard.className = 'movie-card';
            movieCard.setAttribute('data-aos', 'fade-up');
            movieCard.setAttribute('data-aos-delay', `${index * 100}`);
            
            movieCard.innerHTML = `
                <img class="movie-image" 
                     src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                     alt="${movie.title}"
                     onerror="this.src='https://via.placeholder.com/500x750?text=No+Poster'">
                <div class="movie-info">
                    <h3 class="movie-title">${movie.title}</h3>
                    <p class="release-date">${formatDate(movie.release_date)}</p>
                    <p class="countdown">${getCountdown(movie.release_date)}</p>
                </div>
            `;
            
            moviesContainer.appendChild(movieCard);
        }
    });
}

function createMovieBackground(movies) {
    const backgroundContainer = document.querySelector('.movie-background');
    if (!backgroundContainer || !movies) return;

    backgroundContainer.innerHTML = '';

    const moviesWithPosters = movies
        .filter(movie => movie.poster_path)
        .sort(() => Math.random() - 0.5)
        .slice(0, 18);

    moviesWithPosters.forEach(movie => {
        const img = document.createElement('img');
        img.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
        img.alt = movie.title;
        img.loading = 'lazy';
        backgroundContainer.appendChild(img);
    });
}
   