const categoryMenu = document.getElementById("menu-category");

const hideCards = function () {
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

