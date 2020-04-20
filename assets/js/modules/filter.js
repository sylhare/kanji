const categoryMenu = document.getElementById("menu-category");
const categories = document.querySelectorAll(".category-filter");
const footer = document.getElementsByClassName("footer")[0];

function toggleFooter() {
  footer.style.display = footer.style.display !== "none" ? "none" : "block";
}

const hideCards = function () {
  cards.forEach((elem) => {
    elem.style.display = "none"
  })
};

function showCategories() {
  toggleFooter();
  uncheckAll();
  sortMenu.style.display = "none";
  categoryMenu.style.display = categoryMenu.style.display === "flex" ? "none" : "flex";
  hideCards();
  currentOrder = numberAsc;
  sort();
}

const show = function (category) {
  filterGraph(category);
  cards.filter(card => card.dataset.category === category).forEach((elem) => {
    elem.style.display = elem.style.display === "none" ? "inline" : "none";
  });
};

function showAll() {
  footer.style.display = "block";
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
  graphFilterList = []
};
