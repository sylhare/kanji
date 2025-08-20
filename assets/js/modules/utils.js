// ========================================
// GENERAL UTILITIES - PURE FUNCTIONS
// ========================================

// String formatting and manipulation
export function createKanjiLabel(kanjiData) {
  const { name, reading, meaning } = kanjiData;
  return `${name} - ${reading} - ${meaning}`;
}

export function formatKanjiTooltip(d) {
  return d.name.concat(" - ", d.reading, " - ", d.meaning);
}

export function createLabel(items, separator = " - ") {
  return items.filter(item => item != null && item !== "").join(separator);
}

export function formatDisplayName(name, additionalInfo = []) {
  const parts = [name, ...additionalInfo].filter(Boolean);
  return createLabel(parts);
}

// ========================================
// SORTING AND COMPARISON FUNCTIONS
// ========================================

export const frequencyAsc = (a, b) => a.dataset.frequency - b.dataset.frequency;
export const frequencyDsc = (a, b) => b.dataset.frequency - a.dataset.frequency;
export const numberAsc = (a, b) => a.dataset.value - b.dataset.value;
export const numberDsc = (a, b) => b.dataset.value - a.dataset.value;
export const categoryAsc = (a, b) => a.dataset.category.localeCompare(b.dataset.category);
export const categoryDsc = (a, b) => b.dataset.category.localeCompare(a.dataset.category);
export const readingAsc = (a, b) => a.dataset.reading.localeCompare(b.dataset.reading);
export const readingDsc = (a, b) => b.dataset.reading.localeCompare(a.dataset.reading);

export const setOrder = function (order, asc, dec) {
  return order === dec ? asc : dec;
};

export const createNumericComparator = (property, ascending = true) => {
  return ascending 
    ? (a, b) => a.dataset[property] - b.dataset[property]
    : (a, b) => b.dataset[property] - a.dataset[property];
};

export const createStringComparator = (property, ascending = true) => {
  return ascending
    ? (a, b) => a.dataset[property].localeCompare(b.dataset[property])
    : (a, b) => b.dataset[property].localeCompare(a.dataset[property]);
};

// ========================================
// THROTTLING AND PERFORMANCE UTILITIES
// ========================================

export function createThrottledFunction(fn, delay = 200) {
  let isActive = false;
  
  return function(...args) {
    if (!isActive) {
      isActive = true;
      setTimeout(() => {
        fn.apply(this, args);
        isActive = false;
      }, delay);
    }
  };
}

// ========================================
// VIEWPORT AND ELEMENT UTILITIES
// ========================================

export function isElementInViewport(rect, windowHeight = window.innerHeight) {
  return rect.top <= windowHeight && rect.bottom >= 0;
}

export function shouldLoadImage(element, windowHeight = window.innerHeight) {
  const rect = element.getBoundingClientRect();
  const isInViewport = isElementInViewport(rect, windowHeight);
  const isVisible = getComputedStyle(element).display !== "none";
  return isInViewport && isVisible;
}

export function getUpdatedImageAttributes(element) {
  return {
    src: element.dataset.src,
    srcset: element.dataset.srcset
  };
}

export function removeLoadedImage(images, loadedImage) {
  return images.filter(image => image !== loadedImage);
}

export function isLazyLoadingComplete(remainingImages) {
  return remainingImages.length === 0;
}
