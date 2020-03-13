const sortMenu = document.getElementById("sort-menu");
const categoryMenu = document.getElementById("category-menu");
const number = document.getElementById('Number-sort');
const frequency = document.getElementById('Frequency-sort');
const category = document.getElementById('Category-sort');
const reading = document.getElementById('Reading-sort');

const frequencyAsc = (a, b) => a.dataset.frequency - b.dataset.frequency;
const frequencyDsc = (a, b) => b.dataset.frequency - a.dataset.frequency;
const numberAsc = (a, b) => a.dataset.value - b.dataset.value;
const numberDsc = (a, b) => b.dataset.value - a.dataset.value;
const categoryAsc = (a, b) => a.dataset.category.localeCompare(b.dataset.category);
const categoryDsc = (a, b) => b.dataset.category.localeCompare(a.dataset.category);
const readingAsc = (a, b) => a.dataset.reading.localeCompare(b.dataset.reading);
const readingDsc = (a, b) => b.dataset.reading.localeCompare(a.dataset.reading);

let currentOrder;
let sortOrder = numberAsc;

number.addEventListener('click', () => {
  currentOrder = sortOrder === setOrder(sortOrder, numberAsc, numberDsc);
  order()
});

frequency.addEventListener('click', () => {
  currentOrder = setOrder(sortOrder, frequencyAsc, frequencyDsc);
  order()
});

category.addEventListener('click', () => {
  currentOrder = setOrder(sortOrder, categoryDsc, categoryAsc);
  order()
});

reading.addEventListener('click', () => {
  currentOrder = setOrder(sortOrder, readingDsc, readingAsc);
  order()
});

const setOrder = function (order, asc, dec) {
  return order === dec ? asc : dec;
};

const order = function () {
  sortOrder = currentOrder;
  const ordered = [...document.getElementsByClassName('card')].sort(currentOrder);
  ordered.forEach((elem, index) => {
    elem.style.order = index.toString()
  })
};

function showSorts() {
  sortMenu.style.display = sortMenu.style.display === "flex" ? "none" : "flex";
}

function showCategories() {
  categoryMenu.style.display = categoryMenu.style.display === "flex" ? "none" : "flex";
}


