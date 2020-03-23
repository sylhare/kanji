const categoryMenu = document.getElementById("menu-category");
const footer = document.getElementsByClassName("footer");
const categories = document.querySelectorAll('.category-filter');

const hideCards = function () {
  footer[0].style.marginTop = "100%";
  cards.forEach((elem) => {
    elem.style.display = "none"
  })
};

function showCategories() {
  sortMenu.style.display = "none";
  categoryMenu.style.display = categoryMenu.style.display === "flex" ? "none" : "flex";
  hideCards();
  currentOrder = numberAsc;
  order();
}

const show = function (category) {
  [...document.getElementsByClassName('card')].filter(card => card.dataset.category === category).forEach((elem) => {
    elem.style.display = elem.style.display === "none" ? "inline" : "none";
  });
};

function showAll() {
  footer[0].style.marginTop = "";
  categoryMenu.style.display = "none";
  [...document.getElementsByClassName('card')].forEach((elem) => {
    currentOrder = numberAsc;
    order();
    elem.style.display = "flex";
  });
}

const uncheckAll = function () {
  categories.forEach(function (item) {
    item.checked = false
  })
};
