
const myApiKey = "5e9dbe64d4934b03b55501cbfcb3ed0b";


const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const resultsSection = document.getElementById("results");
const favoritesContainer = document.getElementById("favorites");
const toggleFavoritesBtn = document.getElementById("toggleFavoritesBtn");
const favoritesSection = document.getElementById("favoritesSection");


let favoriteRecipes = JSON.parse(localStorage.getItem("favorites")) || [];


form.addEventListener("submit", (event) => {
    event.preventDefault();
    const searchQuery = input.value.trim();
    if (searchQuery) {
        getRecipes(searchQuery);
    }
});


toggleFavoritesBtn.addEventListener("click", () => {
    if (favoritesSection.style.display === "none" || !favoritesSection.style.display) {
        showFavorites();
        favoritesSection.style.display = "block";
        toggleFavoritesBtn.textContent = "Hide Favorites";
    } else {
        favoritesSection.style.display = "none";
        toggleFavoritesBtn.textContent = "Show Favorites";
    }
});


function getRecipes(query) {
    const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${myApiKey}&query=${query}&number=10`;

    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            showRecipes(data.results);
        })
        .catch((err) => console.error("Error fetching recipes:", err));
}

function showRecipes(recipeList) {
    let htmlOutput = "";

    recipeList.forEach((recipeItem) => {
        const isFavorite = favoriteRecipes.includes(recipeItem.id); 
        const buttonText = isFavorite ? "Remove from Favorites" : "Add to Favorites";
        const buttonClass = isFavorite ? "btn-danger" : "btn-secondary"; 

        const cardHtml = `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${recipeItem.image}" class="card-img-top" alt="Recipe Image">
                    <div class="card-body">
                        <h5 class="card-title">${recipeItem.title}</h5>
                        <button class="btn btn-primary view-details" data-id="${recipeItem.id}" data-toggle="modal" data-target="#recipeModal">View Recipe</button>
                        <button class="btn ${buttonClass} favorite-btn" data-id="${recipeItem.id}">${buttonText}</button>
                    </div>
                </div>   
            </div>
        `;
        htmlOutput += cardHtml;
    });

    resultsSection.innerHTML = htmlOutput;

    
    document.querySelectorAll(".view-details").forEach((button) => {
        button.addEventListener("click", () => {
            const recipeID = button.dataset.id;
            getRecipeDetails(recipeID);
        });
    });

    document.querySelectorAll(".favorite-btn").forEach((button) => {
        button.addEventListener("click", () => {
            const recipeID = parseInt(button.dataset.id);
            toggleFavorite(recipeID, button);
        });
    });
}

function toggleFavorite(recipeId, button) {
    const isFavorite = favoriteRecipes.includes(recipeId);

    if (isFavorite) {
        
        favoriteRecipes = favoriteRecipes.filter(id => id !== recipeId);
        button.textContent = "Add to Favorites";
        button.classList.remove("btn-danger");
        button.classList.add("btn-secondary");
    } else {
       
        favoriteRecipes.push(recipeId);
        button.textContent = "Remove from Favorites";
        button.classList.remove("btn-secondary");
        button.classList.add("btn-danger");
    }

    
    localStorage.setItem("favorites", JSON.stringify(favoriteRecipes));
}


function showFavorites() {
   
    favoritesContainer.innerHTML = "";

    if (favoriteRecipes.length === 0) {
        favoritesContainer.innerHTML = "<p class='text-center'>No favorites yet.</p>";
        return;
    }

  
    favoriteRecipes.forEach((recipeId) => {
        fetchRecipeDetails(recipeId).then(recipeData => {
            const recipeHtml = `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <img src="${recipeData.image}" class="card-img-top" alt="Recipe Image">
                        <div class="card-body">
                            <h5 class="card-title">${recipeData.title}</h5>
                            <button class="btn btn-primary" onclick="getRecipeDetails(${recipeData.id})" data-toggle="modal" data-target="#recipeModal">View Recipe</button>
                            <button class="btn btn-danger" onclick="removeFromFavorites(${recipeData.id})">Remove from Favorites</button>
                        </div>
                    </div>   
                </div>
            `;
            favoritesContainer.insertAdjacentHTML("beforeend", recipeHtml);
        }).catch((err) => console.error("Error fetching favorite recipe details:", err));
    });
}


function fetchRecipeDetails(recipeId) {
    const detailsUrl = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${myApiKey}`;
    return fetch(detailsUrl).then(response => response.json());
}


function getRecipeDetails(id) {
    fetchRecipeDetails(id).then(showRecipeDetails).catch((err) => console.error("Error fetching recipe details:", err));
}


function showRecipeDetails(recipeData) {
    const modalContent = document.getElementById("recipeModalBody");
    const detailHtml = `
        <h3>${recipeData.title}</h3>
        <img src="${recipeData.image}" alt="Recipe Image" class="img-fluid mb-3">
        <h5>Ingredients:</h5>
        <ul>${recipeData.extendedIngredients.map((ing) => `<li>${ing.original}</li>`).join("")}</ul>
        <h5>Instructions:</h5>
        <p>${recipeData.instructions || "Instructions not available."}</p>
    `;
    modalContent.innerHTML = detailHtml;
}


function removeFromFavorites(recipeId) {
    favoriteRecipes = favoriteRecipes.filter(id => id !== recipeId);
    localStorage.setItem("favorites", JSON.stringify(favoriteRecipes));
    showFavorites(); 
}
