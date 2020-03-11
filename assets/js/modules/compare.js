const filterMenu = document.getElementById("filter-menu");
const number = document.getElementById('Number-filter');
const frequency = document.getElementById('Frequency-filter');

const frequencyAsc = (a, b) => a.dataset.frequency - b.dataset.frequency;
const frequencyDsc = (a, b) => b.dataset.frequency - a.dataset.frequency;
const numberAsc = (a, b) => a.dataset.value - b.dataset.value;
const numberDsc = (a, b) => b.dataset.value - a.dataset.value;

let currentOrder;
let filterOrder = numberAsc;

number.addEventListener('click', () => {
  currentOrder = setOrder(filterOrder, numberAsc, numberDsc);
  filterOrder = currentOrder;
  order()
});

frequency.addEventListener('click', () => {
  currentOrder = setOrder(filterOrder, frequencyAsc, frequencyDsc);
  filterOrder = currentOrder;
  order()
});

const setOrder = function (order, asc, dec) {
  return order === dec ? asc : dec;
};

const order = function () {
  const ordered = [...document.getElementsByClassName('card')].sort(currentOrder);
  ordered.forEach((elem, index) => {
    elem.style.order = index.toString()
  })
};

function showFilters() {
  filterMenu.style.display = filterMenu.style.display === "flex" ? "none" : "flex";
}


