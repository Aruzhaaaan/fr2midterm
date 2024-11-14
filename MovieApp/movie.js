const apiKey = "9d285295190f97a2e9672771e256cbef";
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("results");
const movieModal = document.getElementById("movieModal");
const movieModalBody = document.getElementById("movieModalBody");
const closeModal = document.getElementById("closeModal");

let moviesData = [];

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) fetchMovies(query);
});

closeModal.addEventListener("click", () => {
    movieModal.style.display = "none";
});

window.onclick = (event) => {
    if (event.target === movieModal) movieModal.style.display = "none";
};

function fetchMovies(query) {
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`;
    
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            moviesData = data.results;
            displayMovies(moviesData);
        })
        .catch((error) => console.error("Error fetching movies:", error));
}

function displayMovies(movies) {
    resultsContainer.innerHTML = movies.map(movie => `
        <div class="card">
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="Movie Poster">
            <h5>${movie.title}</h5>
            <p>Release Date: ${movie.release_date}</p>
            <button onclick="showMovieDetails(${movie.id})">View Details</button>
            <button onclick="addToWatchlist(${movie.id})">Add to Watchlist</button>
        </div>
    `).join("");
}

function showMovieDetails(movieID) {
    const url = `https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKey}&append_to_response=credits,reviews,videos`;
    
    fetch(url)
        .then((response) => response.json())
        .then((movie) => {
            const cast = movie.credits.cast.slice(0, 5).map(actor => actor.name).join(", ");
            const video = movie.videos.results[0] ? movie.videos.results[0].key : null;

            movieModalBody.innerHTML = `
                <h2>${movie.title}</h2>
                <p><strong>Overview:</strong> ${movie.overview}</p>
                <p><strong>Rating:</strong> ${movie.vote_average} / 10</p>
                <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
                <p><strong>Cast:</strong> ${cast}</p>
                ${video ? `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${video}" frameborder="0" allowfullscreen></iframe>` : ""}
            `;

            movieModal.style.display = "block";
        })
        .catch((error) => console.error("Error fetching movie details:", error));
}






function addToWatchlist(movieID) {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    if (!watchlist.includes(movieID)) {
        watchlist.push(movieID);
        localStorage.setItem("watchlist", JSON.stringify(watchlist));
        alert("Movie added to watchlist!");
    } else {
        alert("Movie is already in your watchlist.");
    }
}


function showWatchlist() {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
    
    if (watchlist.length === 0) {
        alert("Your watchlist is empty.");
        return;
    }

    resultsContainer.innerHTML = ""; 

    watchlist.forEach(movieID => {
        const url = `https://api.themoviedb.org/3/movie/${movieID}?api_key=${apiKey}`;

        fetch(url)
            .then(response => response.json())
            .then(movie => {
                resultsContainer.innerHTML += `
                    <div class="card">
                        <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="Movie Poster">
                        <h5>${movie.title}</h5>
                        <p>Release Date: ${movie.release_date}</p>
                        <button onclick="showMovieDetails(${movie.id})">View Details</button>
                    </div>
                `;
            })
            .catch(error => console.error("Error fetching watchlist movie details:", error));
    });
}


function sortMovies(sortBy) {
    const sortedMovies = [...moviesData].sort((a, b) => {
        if (sortBy === "popularity") return b.popularity - a.popularity;
        if (sortBy === "release_date") return new Date(b.release_date) - new Date(a.release_date);
        if (sortBy === "vote_average") return b.vote_average - a.vote_average;
    });
    displayMovies(sortedMovies);
}

