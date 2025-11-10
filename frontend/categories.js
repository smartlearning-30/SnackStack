(() => {
// MOBILE NAVBAR HANDLER
const searchToggle = document.getElementById("searchToggle");
const mobileSearchBar = document.getElementById("mobileSearchBar");
const searchBoxMobile = document.getElementById("searchBoxMobile");
const navbarToggler = document.querySelector(".navbar-toggler");

navbarToggler.addEventListener("click", () => {
  mobileSearchBar.classList.remove("show");
  mobileSearchBar.style.display = "none";
});

searchToggle.addEventListener("click", () => {
  const willShow = !mobileSearchBar.classList.contains("show");

  mobileSearchBar.classList.toggle("show", willShow);
  searchToggle.setAttribute("aria-expanded", String(willShow));
  mobileSearchBar.style.display = willShow ? "block" : "none";

  if (willShow && searchBoxMobile) {
    requestAnimationFrame(() => searchBoxMobile.focus());
  }
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    mobileSearchBar.classList.remove("show");
    mobileSearchBar.style.display = "none";
    searchToggle.setAttribute("aria-expanded", "false");
  }
});

document.querySelectorAll(".offcanvas .nav-link, .offcanvas .dropdown-item").forEach(link => {
  link.addEventListener("click", e => {
    if (link.classList.contains("dropdown-toggle")) {
      e.stopPropagation();
      return;
    }
    const offcanvasElement = document.querySelector(".offcanvas.show");
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
    const skeletonContainer = document.createElement("div");
    skeletonContainer.className = "d-flex flex-wrap justify-content-center gap-3 mt-4";

    for (let i = 0; i < 8; i++) {
      skeletonContainer.innerHTML += `
        <div class="card shadow-sm border-0 placeholder-glow" style="width: 16rem;" aria-hidden="true">
          <div class="bg-secondary placeholder col-12 mb-2" style="height:180px; border-radius:12px;"></div>
          <div class="card-body text-center">
            <h5 class="card-title placeholder-glow mb-2">
              <span class="placeholder col-8"></span>
            </h5>
            <p class="card-text placeholder-glow mb-3">
              <span class="placeholder col-6"></span>
            </p>
            <a class="btn btn-warning disabled placeholder col-6"></a>
          </div>
        </div>
      `;
    }

    container.appendChild(skeletonContainer);
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    const data = await response.json();

    if (!data.meals) {
      container.innerHTML = `
        <h2 class="text-center mt-4">${category} Recipes</h2>
        <p class="text-center text-muted mt-3">No recipes found for ${category}.</p>
      `;
      return;
    }
    container.innerHTML = `<h2 class="text-center mt-4">${category} Recipes</h2>`;

    const meals = data.meals;
    let isSmallScreen = window.innerWidth < 1200;
    let currentPage = 1;

    function renderPage(page = 1) {
      container.innerHTML = `<h2 class="text-center mt-4">${category} Recipes</h2>`;
      const grid = document.createElement("div");
      grid.className = "d-flex flex-wrap justify-content-center gap-3 mt-4";

      if (!isSmallScreen) {
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

      const totalPages = Math.ceil(meals.length / itemsPerPage);
      if (totalPages > 1) {
        const navDiv = document.createElement("div");
        navDiv.className = "d-flex justify-content-center align-items-center gap-3 mt-3 flex-wrap";

        const prevBtn = document.createElement("button");
        prevBtn.className = "btn btn-outline-warning m-2";
        prevBtn.textContent = "⬅️ Previous";
        prevBtn.disabled = page === 1;
        prevBtn.addEventListener("click", () => renderPage(page - 1));

        const info = document.createElement("span");
        info.className = "text-muted small fw-semibold";
        info.textContent = `Page ${page} of ${totalPages}`;

        const nextBtn = document.createElement("button");
        nextBtn.className = "btn btn-warning m-2";
        nextBtn.textContent = "Next ➡️";
        nextBtn.disabled = page === totalPages;
        nextBtn.addEventListener("click", () => renderPage(page + 1));

        navDiv.appendChild(prevBtn);
        navDiv.appendChild(info);
        navDiv.appendChild(nextBtn);
        container.appendChild(navDiv);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    renderPage(currentPage);
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