const filterMenu = document.getElementById("filter-menu");
const number = document.getElementById('Number-filter');
const frequency = document.getElementById('Frequency-filter');
const category = document.getElementById('Category-filter');

const frequencyAsc = (a, b) => a.dataset.frequency - b.dataset.frequency;
const frequencyDsc = (a, b) => b.dataset.frequency - a.dataset.frequency;
const numberAsc = (a, b) => a.dataset.value - b.dataset.value;
const numberDsc = (a, b) => b.dataset.value - a.dataset.value;
const categoryAsc = (a, b) => a.dataset.category.localeCompare(b.dataset.category);
const categoryDsc = (a, b) => b.dataset.category.localeCompare(a.dataset.category);

let currentOrder;
let filterOrder = numberAsc;

number.addEventListener('click', () => {
  currentOrder = setOrder(filterOrder, numberAsc, numberDsc);
  order()
});

frequency.addEventListener('click', () => {
  currentOrder = setOrder(filterOrder, frequencyAsc, frequencyDsc);
  order()
});

category.addEventListener('click', () => {
  currentOrder = setOrder(filterOrder, categoryAsc, categoryDsc);
  order()
});

const setOrder = function (order, asc, dec) {
  return order === dec ? asc : dec;
};

const order = function () {
  filterOrder = currentOrder;
  const ordered = [...document.getElementsByClassName('card')].sort(currentOrder);
  ordered.forEach((elem, index) => {
    elem.style.order = index.toString()
  })
};

function showFilters() {
  filterMenu.style.display = filterMenu.style.display === "flex" ? "none" : "flex";
}


