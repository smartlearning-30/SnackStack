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



// Card Append Dynamically

let cardappend=document.getElementById("cardAppend");

function appendcarddynamically(recipevalue){
    let divelement=document.createElement("div");
    divelement.classList.add("col-12","col-md-6","col-lg-3");
    let divelement2=document.createElement("div");
    divelement2.classList.add("shadow","p-3","mb-4","recipe-item-card");
    let imgelement=document.createElement("img");
    imgelement.src=recipevalue[0].strMealThumb;
    imgelement.classList.add("w-100","recipe-item-image");
    let h1element=document.createElement("h1");
    h1element.textContent=recipevalue[0].strMeal;
    h1element.className="recipe-card-title";
    const aelement = document.createElement("a");
    aelement.href = "";
    aelement.className = "recipe-item-link";
    aelement.id= recipevalue[0].idMeal;
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

    aelement.addEventListener("click",function(event){
      event.preventDefault();
      window.location.href = `recipe.html?id=${this.id}`;
    });
}


let value; 
window.addEventListener("load", () => {
    let viewportWidth = window.innerWidth;
    console.log(window.innerWidth);
    if (viewportWidth >1200) {
        value = 12;
    } else if (viewportWidth >= 992) {
        value = 8;
    } else {
        value = 4;
    }
    for(let i=0;i<value;i++)
      {
        // fetch("https://www.themealdb.com/api/json/v1/1/random.php")
        // .then((response)=>response.json())
        // .then((data)=> appendcarddynamically(data.meals))
      }
});


const randomRecipe = document.querySelectorAll(".randomRecipe"); 

randomRecipe.forEach(link => {
    link.addEventListener("click", function(event) {
    event.preventDefault(); 
    fetch("https://www.themealdb.com/api/json/v1/1/random.php")
        .then(response => response.json())
        .then(data => {
            let randomvalue = data.meals[0].idMeal;
            window.location.href = `recipe.html?id=${randomvalue}`;
        });
    });
});


const inputs = document.querySelectorAll(".searchInput");
const buttons = document.querySelectorAll(".searchbtn");

let toastmessage=document.getElementById("toast-message");
const toastEl = document.getElementById('myToast');
const toast = new bootstrap.Toast(toastEl, { delay: 3000 }); 


//Pagination Recipe Items
function createRecipeCard(meal) {
  return `
    <div class="card mb-3" style="width: 18rem;">
      <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
      <div class="card-body">
        <h5 class="card-title">${meal.strMeal}</h5>
        <p class="card-text">${meal.strArea} | ${meal.strCategory}</p>
        <a href="recipe.html?id=${meal.idMeal}" class="btn btn-primary">View Recipe</a>
      </div>
    </div>
  `;
}

// Render both results & pagination inside one box
function renderResultsWithPagination(meals, page, itemsPerPage, resultsBox, onPageClick) {
  resultsBox.style.display = "block";
  resultsBox.innerHTML = ""; 

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.style.cssText = "margin-left: 17px; margin-top: 3px;";
  closeBtn.className = "btn-close position-absolute top-0 end-0";
  closeBtn.setAttribute("aria-label", "Close");

  closeBtn.addEventListener("click", () => {
    resultsBox.style.display = "none";
  });

  resultsBox.appendChild(closeBtn);

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedMeals = meals.slice(start, end);

  // Create a grid container for recipe cards
  const cardsContainer = document.createElement("div");
  cardsContainer.className = "d-flex flex-row gap-3 overflow-auto p-2";
  cardsContainer.style.scrollBehavior = "smooth";
  cardsContainer.style.whiteSpace = "nowrap";
  cardsContainer.style.scrollbarWidth = "thin";
  cardsContainer.style.maxWidth = "100%";
  cardsContainer.style.overflowY = "hidden";

  paginatedMeals.forEach(meal => {
    cardsContainer.innerHTML += createRecipeCard(meal);
  });

  resultsBox.appendChild(cardsContainer);

  // Add Bootstrap pagination (limited buttons)
  const totalPages = Math.ceil(meals.length / itemsPerPage);
  if (totalPages > 1) {
    const paginationWrapper = document.createElement("nav");
    paginationWrapper.setAttribute("aria-label", "Recipe Pagination");

    const paginationUl = document.createElement("ul");
    paginationUl.className = "pagination justify-content-center flex-nowrap overflow-auto mt-3";
    paginationUl.style.scrollbarWidth = "thin";
    paginationUl.style.WebkitOverflowScrolling = "touch";

    // Previous button
    const prevLi = document.createElement("li");
    prevLi.className = "page-item" + (page === 1 ? " disabled" : "");
    prevLi.innerHTML = `<button class="page-link">Previous</button>`;
    if (page > 1) prevLi.querySelector("button").addEventListener("click", () => onPageClick(page - 1));
    paginationUl.appendChild(prevLi);

    // Limited pagination logic (Google-style)
    const maxButtons = window.innerWidth < 768 ? 1 : 2; 
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    if (page < startPage) startPage = page;
    if (page > endPage) endPage = page;

    // Show first page + leading dots if needed
    if (startPage > 1) {
      const firstLi = document.createElement("li");
      firstLi.className = "page-item";
      firstLi.innerHTML = `<button class="page-link">1</button>`;
      firstLi.querySelector("button").addEventListener("click", () => onPageClick(1));
      paginationUl.appendChild(firstLi);

      const dotsLi = document.createElement("li");
      dotsLi.className = "page-item disabled";
      dotsLi.innerHTML = `<span class="page-link">...</span>`;
      paginationUl.appendChild(dotsLi);
    }

    // Visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      const li = document.createElement("li");
      li.className = "page-item" + (i === page ? " active" : "");
      li.innerHTML = `<button class="page-link">${i}</button>`;
      li.querySelector("button").addEventListener("click", () => onPageClick(i));
      paginationUl.appendChild(li);
    }

    // Show trailing dots + last page if needed
    if (endPage < totalPages) {
      const dotsLi = document.createElement("li");
      dotsLi.className = "page-item disabled";
      dotsLi.innerHTML = `<span class="page-link">...</span>`;
      paginationUl.appendChild(dotsLi);

      const lastLi = document.createElement("li");
      lastLi.className = "page-item";
      lastLi.innerHTML = `<button class="page-link">${totalPages}</button>`;
      lastLi.querySelector("button").addEventListener("click", () => onPageClick(totalPages));
      paginationUl.appendChild(lastLi);
    }

    // Next button
    const nextLi = document.createElement("li");
    nextLi.className = "page-item" + (page === totalPages ? " disabled" : "");
    nextLi.innerHTML = `<button class="page-link">Next</button>`;
    if (page < totalPages) nextLi.querySelector("button").addEventListener("click", () => onPageClick(page + 1));
    paginationUl.appendChild(nextLi);

    paginationWrapper.appendChild(paginationUl);
    resultsBox.appendChild(paginationWrapper);
  }
}



// Items Per Page
function getItemsPerPage() {
  const w = window.innerWidth;
  if (w > 1200) return 4;      
  if (w >= 992) return 3;    
  return 2;                   
}


function debounce(fn, delay = 150) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}


// SEARCH FUNCTION 
buttons.forEach((btn, index) => {
  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    const inputval = inputs[index].value.trim();

    if (inputval) {
      const spinner = btn.querySelector(".spinner-border");
      const buttonText = btn.querySelector(".button-text");

      btn.disabled = true;
      if (buttonText) buttonText.textContent = "Searching...";
      if (spinner) spinner.classList.remove("d-none");

      try {
        const response = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + inputval);
        const data = await response.json();
        if (!data.meals) {
          toastmessage.textContent = "No recipes found for " + inputval;
          toast.show();
        } else {
          const meals = data.meals;
          
          let currentPage = 1;
          const resultsBoxDesktop = document.getElementById("resultsBoxDesktop");
          const resultsBoxMobile = document.getElementById("resultsBoxMobile");

            function updatePage(page) {
              currentPage = page;
              itemsPerPage = getItemsPerPage();
              renderResultsWithPagination(meals, currentPage, itemsPerPage, resultsBoxDesktop, updatePage);
              renderResultsWithPagination(meals, currentPage, itemsPerPage, resultsBoxMobile, updatePage);
              window.scrollTo({ top: 0, behavior: "smooth" }); 
          }
         updatePage(currentPage);

         // Items Per Page Handler
         window.addEventListener("resize", debounce(() => {
            const newItems = getItemsPerPage();
            if (newItems !== itemsPerPage) {
              itemsPerPage = newItems;
              updatePage(1);
            }
          }, 150));
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        if (spinner) spinner.classList.add("d-none");
        if (buttonText) buttonText.textContent = "Search";
        btn.disabled = false;
      }
    } else {
      inputs[index].value = "";
      toastmessage.textContent = "Please Enter the Recipe Name";
      toast.show();
    }
  });
});


//Result Modal Close Button
const closeBtnDesktop = document.getElementById("closeResultsDesktop");
const resultsBoxDesktop = document.getElementById("resultsBoxDesktop");

if (closeBtnDesktop && resultsBoxDesktop) {
  closeBtnDesktop.addEventListener("click", () => {
    resultsBoxDesktop.style.display = "none";
  });
}

//Email Response System


emailjs.init("aplkpXHm-fnwl1UIP");

document.getElementById("contactForm").addEventListener("submit", function(event) {
  event.preventDefault();
  const sendBtn = document.getElementById("sendBtn");
  const sendBtnText = document.getElementById("sendBtnText");
  const sendBtnIcon = document.getElementById("sendBtnIcon");
  sendBtn.classList.add("sending");
  sendBtn.disabled = true;
  sendBtnText.textContent = "Sending...";
  sendBtnIcon.classList.add("fly");
  setTimeout(() => {
    sendBtnIcon.classList.remove("fly");
  }, 600);

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

  }, (error) => {
      toastmessage.textContent = "❌ Failed to send message. Please try again later.";
      toast.show();
      console.error("EmailJS Error:", error);
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