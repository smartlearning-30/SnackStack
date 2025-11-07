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
  link.addEventListener('click', (e) => {
    if (link.classList.contains('dropdown-toggle')) {
      e.stopPropagation();
      return;
    }
    const offcanvasElement = document.querySelector('.offcanvas.show');
    if (offcanvasElement) {
      const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
      offcanvas.hide();
    }
  });
});


// CATEGORY HANDLER
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

    const meals = data.meals;
    let isSmallScreen = window.innerWidth < 1200;
    let currentPage = 1;

    function renderPage(page = 1) {
      container.innerHTML = `<h2 class="text-center mt-4">${category} Recipes</h2>`;
      const grid = document.createElement("div");
      grid.className = "d-flex flex-wrap justify-content-center gap-3 mt-4";

      if (!isSmallScreen) {
        //Large screen - show all
        meals.forEach(meal => {
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
        return;
      }

      const itemsPerPage = 4;
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedMeals = meals.slice(start, end);

      paginatedMeals.forEach(meal => {
        grid.innerHTML += `
          <div class="card" style="width: 16rem; cursor:pointer;" onclick="window.location.href='recipe.html?id=${meal.idMeal}'">
            <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
            <div class="card-body text-center">
              <h6 class="card-title mb-0">${meal.strMeal}</h6>
            </div>
          </div>
        `;
      });

      container.appendChild(grid);

      // Pagination setup
      const totalPages = Math.ceil(meals.length / itemsPerPage);
      if (totalPages > 1) {
        const paginationNav = document.createElement("nav");
        paginationNav.className = "mt-3";

        const paginationUl = document.createElement("ul");
        paginationUl.className = "pagination justify-content-center flex-nowrap overflow-auto";
        paginationUl.style.scrollbarWidth = "thin"; 
        paginationUl.style.WebkitOverflowScrolling = "touch"; 

        // Prev button
        const prevLi = document.createElement("li");
        prevLi.className = `page-item ${page === 1 ? "disabled" : ""}`;
        prevLi.innerHTML = `<button class="page-link">Previous</button>`;
        if (page > 1) prevLi.querySelector("button").addEventListener("click", () => renderPage(page - 1));
        paginationUl.appendChild(prevLi);

        const maxButtons = 1;
        let start = Math.max(1, page - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);

        if (end - start < maxButtons - 1) {
          start = Math.max(1, end - maxButtons + 1);
        }
        if (page < start) start = page;
        if (page > end) end = page;



        if (start > 1) {
          const firstLi = document.createElement("li");
          firstLi.className = "page-item";
          firstLi.innerHTML = `<button class="page-link">1</button>`;
          firstLi.querySelector("button").addEventListener("click", () => renderPage(1));
          paginationUl.appendChild(firstLi);

          const dotsLi = document.createElement("li");
          dotsLi.className = "page-item disabled";
          dotsLi.innerHTML = `<span class="page-link">...</span>`;
          paginationUl.appendChild(dotsLi);
        }


        for (let i = start; i <= end; i++) {
          const li = document.createElement("li");
          li.className = `page-item ${i === page ? "active" : ""}`;
          li.innerHTML = `<button class="page-link">${i}</button>`;
          li.querySelector("button").addEventListener("click", () => renderPage(i));
          paginationUl.appendChild(li);
        }

        if (end < totalPages) {
          const dotsLi = document.createElement("li");
          dotsLi.className = "page-item disabled";
          dotsLi.innerHTML = `<span class="page-link">...</span>`;
          paginationUl.appendChild(dotsLi);

          const lastLi = document.createElement("li");
          lastLi.className = "page-item";
          lastLi.innerHTML = `<button class="page-link">${totalPages}</button>`;
          lastLi.querySelector("button").addEventListener("click", () => renderPage(totalPages));
          paginationUl.appendChild(lastLi);
        }

        // Next button
        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${page === totalPages ? "disabled" : ""}`;
        nextLi.innerHTML = `<button class="page-link">Next</button>`;
        if (page < totalPages) nextLi.querySelector("button").addEventListener("click", () => renderPage(page + 1));
        paginationUl.appendChild(nextLi);
        paginationNav.appendChild(paginationUl);
        container.appendChild(paginationNav);
      }
    }
    renderPage(currentPage);
    // 🌀 Auto toggle pagination when resizing
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newSmallScreen = window.innerWidth < 992;
        if (newSmallScreen !== isSmallScreen) {
          isSmallScreen = newSmallScreen;
          currentPage = 1;
          renderPage(currentPage);
        }
      }, 200);
    });

  } catch (err) {
    console.error("Error loading category recipes:", err);
  }
}
})();