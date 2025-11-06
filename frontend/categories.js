(() => {

// MOBILE NAVBAR HANDLER
const searchToggle = document.getElementById('searchToggle');
const mobileSearchBar = document.getElementById('mobileSearchBar');
const searchBoxMobile = document.getElementById('searchBoxMobile');
const resultsBoxMobile = document.getElementById('resultsBoxMobile'); 

searchToggle.addEventListener('click', () => {
  const willShow = !mobileSearchBar.classList.contains('show');
  mobileSearchBar.classList.toggle('show', willShow);
  searchToggle.setAttribute('aria-expanded', String(willShow));

  if (!willShow) {
    resultsBoxMobile.style.display = 'none'; 
  }
  if (willShow && searchBoxMobile) {
    requestAnimationFrame(() => searchBoxMobile.focus());
  }
});

document.addEventListener('keydown', (e) => {
if (e.key === 'Escape') {
    mobileSearchBar.classList.remove('show');
    searchToggle.setAttribute('aria-expanded', 'false');
    resultsBoxMobile.style.display = 'none'; 
  }
});

document.querySelectorAll('.offcanvas .nav-link, .offcanvas .dropdown-item').forEach((link) => {
  link.addEventListener('click', () => {
    const offcanvasElement = document.querySelector('.offcanvas.show');
    if (offcanvasElement) {
      const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
      offcanvas.hide();
    }
  });
});

const urlParams = new URLSearchParams(window.location.search);
const categoryName = urlParams.get("category");

document.addEventListener("DOMContentLoaded", () => {
  if (categoryName) {
    loadCategoryRecipes(categoryName);
  }
});

async function loadCategoryRecipes(category) {
  try {
    const container = document.getElementById("recipeContainer");
    container.innerHTML = `<h2 class="text-center mt-4">${category} Recipes</h2>`;

    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    const data = await response.json();

    if (!data.meals) {
      container.innerHTML += `<p class="text-center text-muted mt-3">No recipes found for ${category}.</p>`;
      return;
    }

    const grid = document.createElement("div");
    grid.className = "d-flex flex-wrap justify-content-center gap-3 mt-4";

    data.meals.forEach(meal => {
      grid.innerHTML += `
        <div class="card" style="width: 18rem; cursor:pointer;" onclick="window.location.href='recipe.html?id=${meal.idMeal}'">
          <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
          <div class="card-body text-center">
            <h5 class="card-title">${meal.strMeal}</h5>
          </div>
        </div>
      `;
    });

    container.appendChild(grid);
  } catch (err) {
    console.error("Error loading category recipes:", err);
  }
}

})();