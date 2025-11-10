const themeRoot = document.getElementById("themeRoot");
const themeToggles = [
  document.getElementById("themeChecked"),
  document.getElementById("themeCheckedSmall")
];


const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  themeRoot.setAttribute("data-bs-theme", savedTheme);
  if (savedTheme === "dark") document.body.classList.add("dark-mode");
  const isDark = savedTheme === "dark";
  themeToggles.forEach(toggle => toggle.checked = isDark);
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (prefersDark) {
    document.body.classList.add("dark-mode");
    themeRoot.setAttribute("data-bs-theme", "dark");
    themeToggles.forEach(toggle => toggle.checked = true);
  }
}

themeToggles.forEach(toggle => {
  toggle.addEventListener("change", () => {
    const isDark = toggle.checked;
    document.body.classList.toggle("dark-mode", isDark);
    themeRoot.setAttribute("data-bs-theme", isDark ? "dark" : "light");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggles.forEach(other => {
      if (other !== toggle) other.checked = isDark;
    });
  });
});


const params = new URLSearchParams(window.location.search);
const recipeId = params.get("id");

async function loadRecipe() {
  try {
    const response = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i="+recipeId);
    const data = await response.json();
    const meal = data.meals[0];

    const container = document.getElementById("recipeContainer");
    container.innerHTML = ""; 

    // Hero Section
    const heroDiv = document.createElement("div");
    heroDiv.classList.add("text-center");

    const mealImg = document.createElement("img");
    mealImg.src = meal.strMealThumb;
    mealImg.alt = meal.strMeal;
    mealImg.classList.add("recipe-image", "img-fluid");

    const mealTitle = document.createElement("h1");
    mealTitle.classList.add("mt-3");
    mealTitle.textContent = meal.strMeal;

    const mealCategoryArea = document.createElement("p");
    mealCategoryArea.classList.add("lead");
    mealCategoryArea.textContent = `${meal.strCategory} | ${meal.strArea}`;

    heroDiv.appendChild(mealImg);
    heroDiv.appendChild(mealTitle);
    heroDiv.appendChild(mealCategoryArea);
    container.appendChild(heroDiv);

    // Key Info
    const keyInfoDiv = document.createElement("div");
    keyInfoDiv.classList.add("d-flex", "justify-content-around", "my-4");

    const prepTime = document.createElement("div");
    prepTime.innerHTML = "<strong>Prep Time:</strong> ~20 min";

    const cookTime = document.createElement("div");
    cookTime.innerHTML = "<strong>Cook Time:</strong> ~30 min";

    const servings = document.createElement("div");
    servings.innerHTML = "<strong>Servings:</strong> 2-4";

    const calories = document.createElement("div");
    calories.innerHTML = "<strong>Calories:</strong> ~450";

    keyInfoDiv.append(prepTime, cookTime, servings, calories);
    container.appendChild(keyInfoDiv);

    // Main Content
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");

    // Ingredients
    const ingredientsCol = document.createElement("div");
    ingredientsCol.classList.add("col-md-4");

    const ingredientsHeading = document.createElement("h3");
    ingredientsHeading.innerHTML = `Ingredients(<span style="color:#0077b6; font-size:20px;">Hover Over Names</span>)`;


    const ingredientsList = document.createElement("ul");

    getIngredients(meal).forEach(ing => {
      const li = document.createElement("li");
      li.textContent = ing;
      li.style.cursor = "pointer";
      li.style.position = "relative";

      const index = getIngredients(meal).indexOf(ing) + 1;
      const rawIngredient = meal[`strIngredient${index}`];
      const ingredientName = rawIngredient ? rawIngredient.trim().toLowerCase() : "";

      const formattedName = encodeURIComponent(ingredientName);
      const imgURL = `https://www.themealdb.com/images/ingredients/${formattedName}-small.png`;

      const imgPreview = document.createElement("img");
      imgPreview.src = imgURL;
      imgPreview.alt = ingredientName;
      imgPreview.style.position = "absolute";
      imgPreview.style.left = "50%";
      imgPreview.style.top = "60%";
      imgPreview.style.transform = "translateY(-50%)";
      imgPreview.style.width = "50%";
      imgPreview.style.borderRadius = "10px";
      imgPreview.style.display = "none";
      imgPreview.style.boxShadow = "0 2px 6px rgba(0,0,0,0.25)";
      imgPreview.style.background = "#fff";
      imgPreview.style.transition = "opacity 0.3s ease";

      li.appendChild(imgPreview);

      li.addEventListener("mouseenter", () => {
        imgPreview.style.display = "block";
        setTimeout(() => {
          imgPreview.style.opacity = "1";
        }, 10);
      });

      li.addEventListener("mouseleave", () => {
        imgPreview.style.opacity = "0";
        setTimeout(() => {
          imgPreview.style.display = "none";
        }, 200);
      });

      ingredientsList.appendChild(li);
    });

    
    ingredientsCol.appendChild(ingredientsHeading);
    ingredientsCol.appendChild(ingredientsList);

    // Instructions
    const instructionsCol = document.createElement("div");
    instructionsCol.classList.add("col-md-8");

    const instructionsHeading = document.createElement("h3");
    instructionsHeading.textContent = "Instructions";

    const instructionsList = document.createElement("ol");
    meal.strInstructions.split(". ").forEach(step => {
      if (step.trim() !== "") {
        const li = document.createElement("li");
        li.textContent = step;
        instructionsList.appendChild(li);
      }
    });

    instructionsCol.appendChild(instructionsHeading);
    instructionsCol.appendChild(instructionsList);

    rowDiv.appendChild(ingredientsCol);
    rowDiv.appendChild(instructionsCol);
    container.appendChild(rowDiv);

    // Tips Section
    const tipsDiv = document.createElement("div");
    tipsDiv.classList.add("my-4", "p-3","rounded");

    const tipsHeading = document.createElement("h4");
    tipsHeading.textContent = "Tips & Notes";

    const tipsPara = document.createElement("p");
    tipsPara.textContent = "Try pairing this dish with a fresh salad or bread. Adjust spices to taste!";

    tipsDiv.appendChild(tipsHeading);
    tipsDiv.appendChild(tipsPara);
    container.appendChild(tipsDiv);

    // Related Recipes
    const relatedDiv = document.createElement("div");
    relatedDiv.classList.add("my-4");

    const relatedHeading = document.createElement("h4");
    relatedHeading.textContent = "Related Recipes";

    const relatedRow = document.createElement("div");
    relatedRow.classList.add("row");
    relatedRow.id = "relatedRecipes";

    relatedDiv.appendChild(relatedHeading);
    relatedDiv.appendChild(relatedRow);
    container.appendChild(relatedDiv);

    // Reviews
    const reviewsDiv = document.createElement("div");
    reviewsDiv.classList.add("my-4");

    const reviewsHeading = document.createElement("h4");
    reviewsHeading.textContent = "User Reviews";

    const reviewsPara = document.createElement("p");
    reviewsPara.innerHTML = "<em>No reviews yet. Be the first to comment!</em>";

    reviewsDiv.appendChild(reviewsHeading);
    reviewsDiv.appendChild(reviewsPara);
    container.appendChild(reviewsDiv);

    // Load related recipes
    loadRelatedRecipes(meal.strCategory);

  } catch (error) {
    console.error("Error loading recipe:", error);
  }
}

// Extract ingredients measures
function getIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      ingredients.push(`${measure} ${ingredient}`);
    }
  }
  return ingredients;
}
// Load related recipes by category with clickable redirect
async function loadRelatedRecipes(category) {
  try {
    const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
    const data = await response.json();
    const related = data.meals.slice(0, 4);

    const relatedContainer = document.getElementById("relatedRecipes");
    relatedContainer.innerHTML = "";

    related.forEach(meal => {
      const colDiv = document.createElement("div");
      colDiv.classList.add("col-md-3", "text-center", "mb-3");
      colDiv.style.cursor = "pointer";

      const img = document.createElement("img");
      img.src = meal.strMealThumb;
      img.alt = meal.strMeal;
      img.classList.add("img-fluid", "rounded");

      const namePara = document.createElement("p");
      namePara.textContent = meal.strMeal;

      colDiv.appendChild(img);
      colDiv.appendChild(namePara);


      colDiv.addEventListener("click", () => {
        window.location.href = `${window.location.pathname}?id=${meal.idMeal}`;
      });

      relatedContainer.appendChild(colDiv);
    });
  } catch (error) {
    console.error("Error loading related recipes:", error);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  if (recipeId) {
    loadRecipe();
  }
});

// RANDOM RECIPE BUTTON
const randomRecipe = document.querySelectorAll(".randomRecipe");

const randomLoader = document.createElement("div");
randomLoader.id = "randomLoaderOverlay";
randomLoader.innerHTML = `
  <div class="loader-overlay-content">
    <div class="spinner-border text-warning" style="width: 4rem; height: 4rem;" role="status"></div>
    <h5 class="mt-3 text-light fw-semibold">Fetching a Random Recipe...</h5>
  </div>
`;
document.body.appendChild(randomLoader);

randomRecipe.forEach(link => {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    randomLoader.classList.add("show");
    document.body.style.overflow = "hidden";

    fetch("https://www.themealdb.com/api/json/v1/1/random.php")
      .then(response => response.json())
      .then(data => {
        let randomvalue = data.meals[0].idMeal;
        setTimeout(() => {
          randomLoader.classList.remove("show");
          document.body.style.overflow = "auto";
          window.location.href = `recipe.html?id=${randomvalue}`;
        }, 1200);
      })
      .catch(error => {
        console.error("Error fetching random recipe:", error);
        toastmessage.textContent = "❌ Failed to load random recipe.";
        toast.show();
        randomLoader.classList.remove("show");
        document.body.style.overflow = "auto";
      });
  });
});



// TOAST MESSAGE
const inputs = document.querySelectorAll(".searchInput");
const buttons = document.querySelectorAll(".searchbtn");

let toastmessage = document.getElementById("toast-message");
const toastEl = document.getElementById("myToast");
const toast = new bootstrap.Toast(toastEl, { delay: 3000 });

// FULLSCREEN SEARCH 
const searchOverlay = document.getElementById("searchOverlay");
const searchResultsContainer = document.getElementById("searchResultsContainer");
const overlayClose = document.querySelector(".overlay-close");

function showSearchResults(meals) {
  searchResultsContainer.innerHTML = "";
  meals.forEach(meal => {
    const card = `
      <div class="card bg-body text-center border-0 shadow-sm" style="border-radius: 12px;">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-100" style="height: 180px; object-fit: cover; border-top-left-radius: 12px; border-top-right-radius: 12px;">
        <div class="card-body">
          <h5 class="card-title fw-semibold">${meal.strMeal}</h5>
          <p class="text-muted small mb-2">${meal.strArea} | ${meal.strCategory}</p>
          <a href="recipe.html?id=${meal.idMeal}" class="btn btn-warning btn-sm">View</a>
        </div>
      </div>
    `;
    searchResultsContainer.innerHTML += card;
  });
  searchOverlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

// Close overlay
overlayClose.addEventListener("click", () => {
  searchOverlay.classList.remove("show");
  document.body.style.overflow = "auto";
});

// ESC key close
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    searchOverlay.classList.remove("show");
    document.body.style.overflow = "auto";
  }
});

// SEARCH FUNCTION
buttons.forEach((btn, index) => {
  btn.addEventListener("click", async event => {
    event.preventDefault();
    const inputval = inputs[index].value.trim();

    if (inputval) {
      const spinner = btn.querySelector(".spinner-border");
      const buttonText = btn.querySelector(".button-text");

      btn.disabled = true;
      if (buttonText) buttonText.textContent = "Searching...";
      if (spinner) spinner.classList.remove("d-none");

      try {
        searchResultsContainer.innerHTML = `
          ${Array.from({ length: 8 })
            .map(
              () => `
                <div class="card shadow-sm border-0 placeholder-glow" aria-hidden="true">
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
              `
            )
            .join("")}
        `;
        searchOverlay.classList.add("show");
        document.body.style.overflow = "hidden";


        const response = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + inputval);
        const data = await response.json();

        if (!data.meals) {
          toastmessage.textContent = "No recipes found for " + inputval;
          toast.show();
          searchOverlay.classList.remove("show");
          document.body.style.overflow = "auto";
        } else {
          showSearchResults(data.meals);


          setTimeout(() => {
            document.querySelectorAll(".card").forEach(card =>
              card.classList.add("fade", "show")
            );
          }, 50);
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
        toastmessage.textContent = "❌ Failed to load recipes.";
        toast.show();
      } finally {
        if (spinner) spinner.classList.add("d-none");
        if (buttonText) buttonText.textContent = "Search";
        btn.disabled = false;
      }
    } else {
      toastmessage.textContent = "Please enter a recipe name!";
      toast.show();
    }
  });
});

// Dropdown Categories handler
document.addEventListener("DOMContentLoaded", () => {
  const categoryLinks = document.querySelectorAll(".dropdown-menu .dropdown-item");

  categoryLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const category = link.textContent.trim();
      window.location.href = `recipe.html?category=${encodeURIComponent(category)}`;
    });
  });
});