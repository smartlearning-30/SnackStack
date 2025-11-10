// THEME TOGGLE HANDLER
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
  themeToggles.forEach(toggle => (toggle.checked = isDark));
} else {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) {
    document.body.classList.add("dark-mode");
    themeRoot.setAttribute("data-bs-theme", "dark");
    themeToggles.forEach(toggle => (toggle.checked = true));
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

// CARD APPEND DYNAMICALLY
let cardappend = document.getElementById("cardAppend");

function appendcarddynamically(recipevalue) {
  let divelement = document.createElement("div");
  divelement.classList.add("col-12", "col-md-6", "col-lg-3");

  let divelement2 = document.createElement("div");
  divelement2.classList.add("shadow", "p-3", "mb-4", "recipe-item-card");

  let imgelement = document.createElement("img");
  imgelement.src = recipevalue[0].strMealThumb;
  imgelement.classList.add("w-100", "recipe-item-image");
  imgelement.loading = "lazy";

  imgelement.style.opacity = "0";
  imgelement.style.background =
    "linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)";
  imgelement.style.backgroundSize = "200% 100%";
  imgelement.style.animation = "shimmer 1.5s infinite";

  imgelement.addEventListener("load", () => {
    imgelement.style.animation = "none";
    imgelement.style.background = "none";
    imgelement.style.opacity = "1";
    imgelement.style.transition = "opacity 0.4s ease";
  });

  let h1element = document.createElement("h1");
  h1element.textContent = recipevalue[0].strMeal;
  h1element.className = "recipe-card-title";

  const aelement = document.createElement("a");
  aelement.href = "";
  aelement.className = "recipe-item-link";
  aelement.id = recipevalue[0].idMeal;
  aelement.innerHTML = `
    View Recipe
    <svg width="16px" height="16px" viewBox="0 0 16 16" class="bi bi-arrow-right-short" fill="#d0b200" xmlns="http://www.w3.org/2000/svg">
      <path
        fill-rule="evenodd"
        d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8z"
      />
    </svg>
  `;

  cardappend.appendChild(divelement);
  divelement.appendChild(divelement2);
  divelement2.appendChild(imgelement);
  divelement2.appendChild(h1element);
  divelement2.appendChild(aelement);

  aelement.addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = `recipe.html?id=${this.id}`;
  });
}


// RECIPE CARDS 
let value;
window.addEventListener("load", async () => {
  let viewportWidth = window.innerWidth;
  if (viewportWidth > 1200) value = 12;
  else if (viewportWidth >= 992) value = 8;
  else value = 4;


  cardappend.innerHTML = `
    <div class="col-12">
      <h1 class="mainHeading">RECIPES</h1>
    </div>
  `;
  for (let i = 0; i < value; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "col-12 col-md-6 col-lg-3";
    skeleton.innerHTML = `
      <div class="card shadow p-3 mb-4" aria-hidden="true">
        <div class="placeholder-glow">
          <div class="card-img-top bg-secondary placeholder col-12 mb-2" style="height:180px;"></div>
          <h5 class="card-title placeholder-glow">
            <span class="placeholder col-8"></span>
          </h5>
          <p class="card-text placeholder-glow">
            <span class="placeholder col-6"></span>
          </p>
          <a class="btn btn-warning disabled placeholder col-6"></a>
        </div>
      </div>
    `;
    cardappend.appendChild(skeleton);
  }

  try {

    const requests = Array.from({ length: value }, () =>
      fetch("https://www.themealdb.com/api/json/v1/1/random.php").then(res => res.json())
    );

    const results = await Promise.all(requests);
    const allMeals = results.map(r => r.meals);


    cardappend.innerHTML = `
      <div class="col-12">
        <h1 class="mainHeading">RECIPES</h1>
      </div>
    `;

    allMeals.forEach(meal => appendcarddynamically(meal));

    setTimeout(() => {
      document.querySelectorAll(".recipe-item-card").forEach(card =>
        card.classList.add("fade", "show")
      );
    }, 50);
  } catch (error) {
    console.error("Error fetching meals:", error);
    cardappend.innerHTML = `
      <div class="col-12 text-center py-5 text-danger fw-bold">
        ⚠️ Failed to load recipes. Please try again later.
      </div>`;
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


// FULLSCREEN SEARCH OVERLAY
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


// EMAILJS CONTACT FORM
emailjs.init("aplkpXHm-fnwl1UIP");

document.getElementById("contactForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const sendBtn = document.getElementById("sendBtn");
  const sendBtnText = document.getElementById("sendBtnText");
  const sendBtnIcon = document.getElementById("sendBtnIcon");

  sendBtn.classList.add("sending");
  sendBtn.disabled = true;
  sendBtnText.textContent = "Sending...";
  sendBtnIcon.classList.add("fly");

  setTimeout(() => sendBtnIcon.classList.remove("fly"), 600);

  const templateParams = {
    from_name: document.getElementById("name").value,
    from_email: document.getElementById("email").value,
    message: document.getElementById("message").value,
    date: new Date().toLocaleString()
  };

  emailjs.send("snackstack", "template_87i67lt", templateParams)
    .then(() => {
      toastmessage.textContent = "✅ Message sent successfully!";
      toast.show();
      sendBtnText.textContent = "Sent! ✅";
      sendBtnIcon.classList.replace("bi-send-fill", "bi-check-circle-fill");
      setTimeout(() => {
        sendBtn.disabled = false;
        sendBtn.classList.remove("sending");
        sendBtnText.textContent = "Send Message";
        sendBtnIcon.classList.replace("bi-check-circle-fill", "bi-send-fill");
      }, 2000);
      this.reset();
    })
    .catch(error => {
      console.error("EmailJS Error:", error);
      toastmessage.textContent = "❌ Failed to send message. Please try again later.";
      toast.show();
      sendBtnText.textContent = "Failed!";
      sendBtnIcon.classList.replace("bi-send-fill", "bi-x-circle-fill");
      setTimeout(() => {
        sendBtn.disabled = false;
        sendBtn.classList.remove("sending");
        sendBtnText.textContent = "Send Message";
        sendBtnIcon.classList.replace("bi-x-circle-fill", "bi-send-fill");
      }, 2000);
    });
});


// DROPDOWN CATEGORY HANDLER

document.addEventListener("DOMContentLoaded", () => {
  const categoryLinks = document.querySelectorAll(".dropdown-menu .dropdown-item");
  categoryLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const category = link.textContent.trim();
      window.location.href = `recipe.html?category=${encodeURIComponent(category)}`;
    });
  });
});



// document.getElementById("contactForm").addEventListener("submit", async function(event) {
//   event.preventDefault();
//   const sendBtn = document.getElementById("sendBtn");
//   const sendBtnText = document.getElementById("sendBtnText");
//   const sendBtnIcon = document.getElementById("sendBtnIcon");

//   sendBtn.classList.add("sending");
//   sendBtn.disabled = true;
//   sendBtnText.textContent = "Sending...";
//   sendBtnIcon.classList.add("fly");

//   setTimeout(() => sendBtnIcon.classList.remove("fly"), 600);

//   // Collect form data
//   const from_name = document.getElementById("name").value;
//   const from_email = document.getElementById("email").value;
//   const message = document.getElementById("message").value;

//   try {
//     const response = await fetch("https://snackstack-qoie.onrender.com/api/contact", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ from_name, from_email, message }),
//     });

//     const data = await response.json();

//     if (data.success) {
//       toastmessage.textContent = "✅ Message sent successfully!";
//       toast.show();

//       sendBtnText.textContent = "Sent! ✅";
//       sendBtnIcon.classList.replace("bi-send-fill", "bi-check-circle-fill");

//       setTimeout(() => {
//         sendBtn.disabled = false;
//         sendBtn.classList.remove("sending");
//         sendBtnText.textContent = "Send Message";
//         sendBtnIcon.classList.replace("bi-check-circle-fill", "bi-send-fill");
//       }, 2000);

//       this.reset();
//     } else {
//       throw new Error(data.message || "Unknown error");
//     }
//   } catch (error) {
//     console.error("Error sending message:", error);
//     toastmessage.textContent = "❌ Failed to send message. Please try again later.";
//     toast.show();

//     sendBtnText.textContent = "Failed!";
//     sendBtnIcon.classList.replace("bi-send-fill", "bi-x-circle-fill");

//     setTimeout(() => {
//       sendBtn.disabled = false;
//       sendBtn.classList.remove("sending");
//       sendBtnText.textContent = "Send Message";
//       sendBtnIcon.classList.replace("bi-x-circle-fill", "bi-send-fill");
//     }, 2000);
//   }
// });