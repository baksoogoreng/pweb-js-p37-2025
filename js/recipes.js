const texts = [
  "No one is born a great cook, one learns by doing.",
  "Personne ne naît grand cuisinier, on le devient en pratiquant.",
  "Nessuno nasce grande cuoco, si impara facendolo.",
  "誰もが生まれながらの名料理人ではない、実践して学ぶものだ。",
  "Nadie nace siendo un gran cocinero, se aprende haciéndolo."
];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeText() {
  const typingElement = document.querySelector('.typing-animation');
  if (!typingElement) return;

  const currentText = texts[textIndex];

  if (isDeleting) {
    typingElement.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
    typingSpeed = 50;
  } else {
    typingElement.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
    typingSpeed = 100;
  }

  if (!isDeleting && charIndex === currentText.length) {
    isDeleting = true;
    typingSpeed = 2000; // Pause before deleting
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    textIndex = (textIndex + 1) % texts.length;
    typingSpeed = 500; // Pause before typing next
  }

  setTimeout(typeText, typingSpeed);
}

// Start typing animation when page loads
setTimeout(typeText, 500);

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Ambil nama pengguna dari localStorage
const firstName = localStorage.getItem('firstName');

// Tampilkan di navbar
const welcomeText = document.getElementById('welcomeText');
if (firstName) {
  welcomeText.textContent = `Welcome, ${firstName}!`;
} else {
  alert('Please login first!');
  window.location.href = 'index.html';
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
let displayedCount = 15; // Show 15 recipes initially
let currentPage = 1;

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
  const showMoreBtn = document.getElementById('showMoreBtn');
  
  // Calculate how many to show
  const recipesToShow = recipes.slice(0, displayedCount);
  
  recipeGrid.innerHTML = '';

  if (recipes.length === 0) {
    recipeGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--dark-gray-text); padding: 40px;">No recipes found.</p>';
    showMoreBtn.style.display = 'none';
    return;
  }

  recipesToShow.forEach((recipe, index) => {
    const card = document.createElement('div');
    card.className = 'recipe-card';
    card.style.setProperty('--card-index', index + 1);

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

  // Show/hide Show More button
  if (recipes.length > displayedCount) {
    showMoreBtn.style.display = 'flex';
  } else {
    showMoreBtn.style.display = 'none';
  }
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
  const showing = Math.min(displayedCount, filteredRecipes.length);
  document.getElementById('recipeCount').textContent = showing;
  document.getElementById('totalCount').textContent = filteredRecipes.length;
}

// Filter berdasarkan cuisine
document.getElementById('cuisineFilter').addEventListener('change', applyFilters);
document.getElementById('difficultyFilter').addEventListener('change', applyFilters);
document.getElementById('sortFilter').addEventListener('change', applyFilters);

function applyFilters() {
  const selectedCuisine = document.getElementById('cuisineFilter').value;
  const selectedDifficulty = document.getElementById('difficultyFilter').value;
  const selectedSort = document.getElementById('sortFilter').value;
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();

  // Reset to all recipes
  filteredRecipes = [...allRecipes];

  // Filter by cuisine
  if (selectedCuisine) {
    filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisine === selectedCuisine);
  }

  // Filter by difficulty
  if (selectedDifficulty) {
    filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === selectedDifficulty);
  }

  // Filter by search term
  if (searchTerm) {
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchTerm) ||
      recipe.cuisine.toLowerCase().includes(searchTerm) ||
      recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm))
    );
  }

  // Sort recipes
  if (selectedSort) {
    switch(selectedSort) {
      case 'rating-high':
        filteredRecipes.sort((a, b) => b.rating - a.rating);
        break;
      case 'rating-low':
        filteredRecipes.sort((a, b) => a.rating - b.rating);
        break;
      case 'time-short':
        filteredRecipes.sort((a, b) => 
          (a.prepTimeMinutes + a.cookTimeMinutes) - (b.prepTimeMinutes + b.cookTimeMinutes)
        );
        break;
      case 'time-long':
        filteredRecipes.sort((a, b) => 
          (b.prepTimeMinutes + b.cookTimeMinutes) - (a.prepTimeMinutes + a.cookTimeMinutes)
        );
        break;
    }
  }

  // Reset pagination
  displayedCount = 15;
  displayRecipes(filteredRecipes);
  updateRecipeCount();
}

// Search functionality
const debouncedSearch = debounce(applyFilters, 300);
document.getElementById('searchInput').addEventListener('input', debouncedSearch);

// Show More Button
document.getElementById('showMoreBtn').addEventListener('click', () => {
  displayedCount += 15;
  displayRecipes(filteredRecipes);
  updateRecipeCount();
  
  // Scroll to first new card
  setTimeout(() => {
    const cards = document.querySelectorAll('.recipe-card');
    if (cards.length > displayedCount - 15) {
      cards[displayedCount - 15].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
});

// Load recipes saat halaman dimuat
fetchRecipes();('keypress', (e) => {
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