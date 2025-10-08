// teks typing (tetap dari versi awal)
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

// Elements for modal ( ! tambahan )
const modalRoot = document.getElementById('recipeModal');
const modalTitle = document.getElementById('modalTitle');
const modalImage = document.getElementById('modalImage');
const modalPrep = document.getElementById('modalPrep');
const modalCook = document.getElementById('modalCook');
const modalServings = document.getElementById('modalServings');
const modalDifficulty = document.getElementById('modalDifficulty');
const modalCuisine = document.getElementById('modalCuisine');
const modalCalories = document.getElementById('modalCalories');
const modalRating = document.getElementById('modalRating');
const modalTags = document.getElementById('modalTags');
const modalIngredientList = document.getElementById('modalIngredientList');
const modalInstructionList = document.getElementById('modalInstructionList');
const modalMissingList = document.getElementById('modalMissingList');
const modalAllSetMsg = document.getElementById('modalAllSetMsg');
const modalCloseBtn = document.getElementById('modalClose');
const modalOverlay = document.getElementById('modalOverlay');
// ! Ini tambahan akhir

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
  const totalStars = 5;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  let stars = '';

  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }
  if (halfStar) {
    stars += '⯪';
  }

  const emptyStars = totalStars - fullStars - (halfStar ? 1 : 0);
  for(let i = 0; i < emptyStars; i++) {
    stars += '☆';
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
          <span class="meta-item">⏰ ${recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins</span>
          <span class="meta-item ${getDifficultyClass(recipe.difficulty)}">📊 ${recipe.difficulty}</span>
          <span class="meta-item">🍳 ${recipe.cuisine}</span>
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

// ! Ini tambahan (ubah viewRecipe agar buka modal, bukan alert)
function viewRecipe(id) {
  // cari objek resep dari allRecipes (sudah dit-fetch)
  const recipe = allRecipes.find(r => r.id === id);
  if (!recipe) {
    alert('Recipe not found.');
    return;
  }

  // isi modal
  modalTitle.textContent = recipe.name;
  modalImage.src = recipe.image || '';
  modalImage.alt = recipe.name;
  modalPrep.textContent = `${recipe.prepTimeMinutes} Mins`;
  modalCook.textContent = `${recipe.cookTimeMinutes} Mins`;
  modalServings.textContent = recipe.servings ?? '-';
  modalDifficulty.textContent = recipe.difficulty ?? '-';
  modalCuisine.textContent = recipe.cuisine ?? '-';
  modalCalories.textContent = (recipe.caloriesPerServing ? recipe.caloriesPerServing + ' Cal/serving' : '-');
  modalRating.textContent = `${generateStars(recipe.rating)} (${recipe.rating})`;

  modalTags.innerHTML = (recipe.tags || []).map(t => `<span class="tag">${t}</span>`).join(' ');

  // ingredients (buat checkbox tiap item)
  modalIngredientList.innerHTML = '';
  modalMissingList.innerHTML = '';
  modalAllSetMsg.classList.add('hidden');

  (recipe.ingredients || []).forEach((ing, i) => {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `ing-${id}-${i}`;
    checkbox.dataset.ingredient = ing;
    checkbox.addEventListener('change', () => updateMissingList());
    const label = document.createElement('label');
    label.setAttribute('for', checkbox.id);
    label.textContent = ing;

    li.appendChild(checkbox);
    li.appendChild(label);

    modalIngredientList.appendChild(li);
  });

  // instructions
  modalInstructionList.innerHTML = (recipe.instructions || []).map(step => `<li>${step}</li>`).join('');

  // show missing (initially all ingredients are missing)
  updateMissingList();

  // show modal
  modalRoot.classList.remove('hidden');
  modalRoot.setAttribute('aria-hidden', 'false');

  // focus management (simple)
  modalCloseBtn.focus();
}
// ! Ini tambahan akhir

// Update missing ingredient list based on checked boxes
function updateMissingList() {
  const checkboxes = modalIngredientList.querySelectorAll('input[type="checkbox"]');
  const missing = [];
  let allChecked = true;
  checkboxes.forEach(cb => {
    if (!cb.checked) {
      missing.push(cb.dataset.ingredient);
      allChecked = false;
    }
  });

  if (allChecked && checkboxes.length > 0) {
    modalMissingList.innerHTML = '';
    modalAllSetMsg.classList.remove('hidden');
  } else {
    modalAllSetMsg.classList.add('hidden');
    modalMissingList.innerHTML = missing.map(m => `<li>${m}</li>`).join('') || '<li>All ingredients are checked</li>';
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

// close modal handlers ( ! tambahan )
modalCloseBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

// close by ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modalRoot.classList.contains('hidden')) {
    closeModal();
  }
});

function closeModal() {
  modalRoot.classList.add('hidden');
  modalRoot.setAttribute('aria-hidden', 'true');
  // clear modal content to avoid stale images
  modalImage.src = '';
}
// ! Ini tambahan akhir

// load recipes saat halaman dimuat
fetchRecipes();