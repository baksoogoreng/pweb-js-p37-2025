// Ambil nama pengguna dari localStorage
const firstName = localStorage.getItem('firstName');

// Tampilkan di navbar
const welcomeText = document.getElementById('welcomeText');
if (firstName) {
  welcomeText.textContent = `Welcome, ${firstName}!`;
} else {
  welcomeText.textContent = 'Welcome, Guest!';
}

// Tombol logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('firstName');
  alert('You have been logged out.');
  window.location.href = 'index.html';
});

// Variable untuk menyimpan data resep
let allRecipes = [];
let filteredRecipes = [];

// Fetch recipes dari API
async function fetchRecipes() {
  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  const recipeGrid = document.getElementById('recipeGrid');

  try {
    loadingState.style.display = 'block';
    errorState.style.display = 'none';
    recipeGrid.style.display = 'none';

    const response = await fetch('https://dummyjson.com/recipes');
    const data = await response.json();
    
    allRecipes = data.recipes;
    filteredRecipes = allRecipes;

    loadingState.style.display = 'none';
    recipeGrid.style.display = 'grid';

    populateCuisineDropdown();
    displayRecipes(filteredRecipes);
    updateRecipeCount();

  } catch (error) {
    loadingState.style.display = 'none';
    errorState.style.display = 'block';
    console.error('Error fetching recipes:', error);
  }
}

// Populate dropdown dengan cuisine unik
function populateCuisineDropdown() {
  const cuisineFilter = document.getElementById('cuisineFilter');
  const cuisines = [...new Set(allRecipes.map(recipe => recipe.cuisine))].sort();

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.value = cuisine;
    option.textContent = cuisine;
    cuisineFilter.appendChild(option);
  });
}

// Generate stars untuk rating
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let stars = '';

  for (let i = 0; i < fullStars; i++) {
    stars += '⭐';
  }
  if (halfStar) {
    stars += '⭐';
  }

  return stars;
}

// Tentukan difficulty level
function getDifficultyClass(difficulty) {
  return difficulty.toLowerCase() === 'easy' ? 'difficulty-easy' : 'difficulty-medium';
}

// Display recipes
function displayRecipes(recipes) {
  const recipeGrid = document.getElementById('recipeGrid');
  recipeGrid.innerHTML = '';

  if (recipes.length === 0) {
    recipeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #979797; padding: 40px;">No recipes found.</p>';
    return;
  }

  recipes.forEach(recipe => {
    const card = document.createElement('div');
    card.className = 'recipe-card';

    const ingredientsPreview = recipe.ingredients.slice(0, 3).join(', ') + 
                               (recipe.ingredients.length > 3 ? ` +${recipe.ingredients.length - 3} more` : '');

    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.name}" class="recipe-image">
      <div class="recipe-info">
        <h3 class="recipe-title">${recipe.name}</h3>
        <div class="recipe-meta">
          <span class="meta-item">⏱️ ${recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins</span>
          <span class="meta-item ${getDifficultyClass(recipe.difficulty)}">📊 ${recipe.difficulty}</span>
          <span class="meta-item">🍽️ ${recipe.cuisine}</span>
        </div>
        <p class="recipe-ingredients"><strong>Ingredients:</strong> ${ingredientsPreview}</p>
        <div class="recipe-rating">
          <span class="stars">${generateStars(recipe.rating)}</span>
          <span class="rating-value">(${recipe.rating})</span>
        </div>
        <button class="view-recipe-btn" onclick="viewRecipe(${recipe.id})">VIEW FULL RECIPE</button>
      </div>
    `;

    recipeGrid.appendChild(card);
  });
}

// View full recipe (bisa dikembangkan ke halaman detail)
function viewRecipe(id) {
  const recipe = allRecipes.find(r => r.id === id);
  if (recipe) {
    alert(`Recipe Details:\n\nName: ${recipe.name}\nCuisine: ${recipe.cuisine}\nDifficulty: ${recipe.difficulty}\nRating: ${recipe.rating}\n\nIngredients:\n${recipe.ingredients.join('\n')}\n\nInstructions:\n${recipe.instructions.join('\n')}`);
  }
}

// Update recipe count
function updateRecipeCount() {
  document.getElementById('recipeCount').textContent = filteredRecipes.length;
  document.getElementById('totalCount').textContent = allRecipes.length;
}

// Filter berdasarkan cuisine
document.getElementById('cuisineFilter').addEventListener('change', (e) => {
  const selectedCuisine = e.target.value;
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();

  if (selectedCuisine === '') {
    filteredRecipes = allRecipes;
  } else {
    filteredRecipes = allRecipes.filter(recipe => recipe.cuisine === selectedCuisine);
  }

  // Apply search filter juga
  if (searchTerm) {
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchTerm) ||
      recipe.cuisine.toLowerCase().includes(searchTerm) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm))
    );
  }

  displayRecipes(filteredRecipes);
  updateRecipeCount();
});

// Search functionality
document.getElementById('searchBtn').addEventListener('click', performSearch);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    performSearch();
  }
});

function performSearch() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const selectedCuisine = document.getElementById('cuisineFilter').value;

  filteredRecipes = allRecipes;

  // Filter by cuisine first
  if (selectedCuisine) {
    filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisine === selectedCuisine);
  }

  // Then filter by search term
  if (searchTerm) {
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchTerm) ||
      recipe.cuisine.toLowerCase().includes(searchTerm) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm))
    );
  }

  displayRecipes(filteredRecipes);
  updateRecipeCount();
}

// Load recipes saat halaman dimuat
fetchRecipes();