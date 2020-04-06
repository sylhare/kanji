const categoryMenu = document.getElementById("menu-category");
const categories = document.querySelectorAll('.category-filter');
const footer = document.getElementsByClassName("footer")[0];

const hideCards = function () {
  footer.style.marginTop = "100%";
  cards.forEach((elem) => {
    elem.style.display = "none"
  })
};

function showCategories() {
  uncheckAll();
  sortMenu.style.display = "none";
  categoryMenu.style.display = categoryMenu.style.display === "flex" ? "none" : "flex";
  hideCards();
  currentOrder = numberAsc;
  sort();
}

const show = function (category) {
  cards.filter(card => card.dataset.category === category).forEach((elem) => {
    elem.style.display = elem.style.display === "none" ? "inline" : "none";
  });
};

function showAll() {
  footer.style.marginTop = "";
  categoryMenu.style.display = "none";
  cards.forEach((elem) => {
    currentOrder = numberAsc;
    sort();
    elem.style.display = "flex";
  });
}

const uncheckAll = function () {
  categories.forEach(function (item) {
    item.checked = false
  });
};
