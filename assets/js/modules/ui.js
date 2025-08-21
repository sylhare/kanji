// ========================================
// UI INTERACTIONS - DOM DEPENDENT FUNCTIONS
// ========================================

import {
    categoryAsc,
    categoryDsc,
    frequencyAsc,
    frequencyDsc,
    numberAsc,
    numberDsc,
    readingAsc,
    readingDsc,
    setOrder
} from './utils.js';

// ========================================
// SORTING UI FUNCTIONALITY
// ========================================

const cards = [...document.getElementsByClassName('card')];
const sortMenu = document.getElementById("menu-sort");
const number = document.getElementById('Number-sort');
const frequency = document.getElementById('Frequency-sort');
const category = document.getElementById('Category-sort');
const reading = document.getElementById('Reading-sort');

let currentOrder = numberAsc;

// Sort event handlers
number.addEventListener('click', () => {
    sortHandler(numberDsc, numberAsc);
});

frequency.addEventListener('click', () => {
    sortHandler(frequencyAsc, frequencyDsc);
});

category.addEventListener('click', () => {
    sortHandler(categoryDsc, categoryAsc);
});

reading.addEventListener('click', () => {
    sortHandler(readingDsc, readingAsc);
});

export const sort = function () {
    cards.sort(currentOrder).forEach((elem, index) => {
        elem.style.order = index.toString()
    })
};

export function sortHandler(sortDsc, sortAsc) {
    currentOrder = setOrder(currentOrder, sortDsc, sortAsc);
    sort()
}

export function showSorts() {
    categoryMenu.style.display = "none";
    sortMenu.style.display = sortMenu.style.display === "flex" ? "none" : "flex";
}

// ========================================
// FILTERING UI FUNCTIONALITY
// ========================================

const categoryMenu = document.getElementById("menu-category");
const categories = document.querySelectorAll(".category-filter");
const footer = document.getElementsByClassName("footer")[0];

export function toggleFooter() {
    footer.style.display = footer.style.display !== "none" ? "none" : "block";
}

export const hideCards = function () {
    cards.forEach((elem) => {
        elem.style.display = "none"
    })
};

export function showCategories() {
    toggleFooter();
    uncheckAll();
    sortMenu.style.display = "none";
    categoryMenu.style.display = categoryMenu.style.display === "flex" ? "none" : "flex";
    hideCards();
    currentOrder = numberAsc;
    sort();
}

export const show = function (category) {
    // Note: filterGraph is imported from visualization.js
    if (typeof filterGraph === 'function') {
        filterGraph(category);
    }
    cards.filter(card => card.dataset.category === category).forEach((elem) => {
        elem.style.display = elem.style.display === "none" ? "inline" : "none";
    });
};

export function showAll() {
    footer.style.display = "block";
    categoryMenu.style.display = "none";
    cards.forEach((elem) => {
        currentOrder = numberAsc;
        sort();
        elem.style.display = "flex";
    });
}

export const uncheckAll = function () {
    categories.forEach(function (item) {
        item.checked = false
    });
    // Note: graphFilterList is managed in visualization.js
    if (typeof window.graphFilterList !== 'undefined') {
        window.graphFilterList = [];
    }
};

// ========================================
// MODAL UI FUNCTIONALITY
// ========================================

// Utility function for finding closest element
function closestEl(el, selector) {
    var doc = el.document || el.ownerDocument;
    var matches = doc.querySelectorAll(selector);
    var i;
    while (el) {
        i = matches.length - 1;
        while (i >= 0) {
            if (matches.item(i) === el) {
                return el;
            }
            i -= 1;
        }
        el = el.parentElement;
    }
    return el;
}

// Modal functionality - IIFE for immediate execution
export const initModals = (function modal() {
    "use strict";

    var modalBtns = document.querySelectorAll(".modal-button");
    modalBtns.forEach(function addBtnClickEvent(btn) {
        btn.onclick = function showModal() {
            console.log("modal");
            var modal = btn.getAttribute("data-modal");
            document.getElementById(modal).style.display = "block";
        };
    });

    var closeBtns = document.querySelectorAll(".close");
    closeBtns.forEach(function addCloseClickEvent(btn) {
        btn.onclick = function closeModal() {
            console.log("close");
            var modal = closestEl(btn, ".modal");
            modal.style.display = "none";
        };
    });

    window.onclick = function closeOnClick(event) {
        if (event.target.className === "modal") {
            console.log("other");
            event.target.style.display = "none";
        }
    };
})();

// ========================================
// EXPORTS FOR EXTERNAL USE
// ========================================

export {currentOrder, cards, sortMenu, categoryMenu};

// ========================================
// GLOBAL EXPORTS FOR CYPRESS COMPATIBILITY
// ========================================

// Expose functions globally for tests and legacy compatibility
if (typeof window !== 'undefined') {
    window.showSorts = showSorts;
    window.showCategories = showCategories;
    window.show = show;
    window.showAll = showAll;
}
