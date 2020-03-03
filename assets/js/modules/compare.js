const filterMenu = document.getElementById("filter-menu");
const number = document.getElementById('number');

const ascendingByValue = (a, b) => a.dataset.value - b.dataset.value;
const descendingByValue = (a, b) => b.dataset.value - a.dataset.value;

let currentOrder;
let numberOrder = ascendingByValue;

number.addEventListener('click', () => {
  currentOrder = setOrder(numberOrder, ascendingByValue, descendingByValue);
  numberOrder = currentOrder;
  order()
});

const setOrder = function (order, asc, dec) {
  return order === dec ? asc : dec;
};

const order = function () {
  const ordered = [...document.getElementsByClassName('card')].sort(currentOrder);
  ordered.forEach((elem, index) => {
    elem.style.order = index
  })
};

function showFilters() {
  filterMenu.style.display = filterMenu.style.display === "flex" ? "none" : "flex";
}


