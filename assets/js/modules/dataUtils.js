// ========================================
// DATA MANIPULATION UTILITIES - PURE FUNCTIONS
// ========================================

// Graph size calculation constants and functions
export const defaultSize = 12;

let categoryCounts = {};

export function initializeCategoryCounts(nodes) {
    categoryCounts = {};
    nodes.forEach(node => {
        const category = node.group;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
}

export function getCategoryCount(category) {
    return categoryCounts[category] || 0;
}

export const frequencySizeAsc = (d) => d.frequency / 60;
export const frequencySizeDsc = (d) => 130 / d.frequency > 50 ? 50 : 130 / d.frequency;
export const numberSizeAsc = (d) => d.number / 10;
export const numberSizeDsc = (d) => (215 - d.number) / 10;
function countSyllables(reading) {
    if (!reading || typeof reading !== 'string') return 1;
    
    const text = reading.toLowerCase().trim();
    if (text.length === 0) return 1;
    
    // Count vowel groups - each group typically represents a syllable in Japanese
    const vowelPattern = /[aeiou]+/g;
    const vowelGroups = text.match(vowelPattern) || [];
    let syllables = vowelGroups.length;
    
    // Handle special case: 'n' at the end (ん) can be a syllable
    if (text.endsWith('n') && text.length > 1 && !/[aeiou]n$/.test(text)) {
        syllables += 1;
    }
    
    return Math.max(syllables, 1);
}

export const readingSizeAsc = (d) => {
    const syllables = countSyllables(d.reading);
    return Math.min(syllables * 2, 28); // Scale syllables moderately, max size of 28
};

export const readingSizeDsc = (d) => {
    const syllables = countSyllables(d.reading);
    const maxSyllables = 8; // Reasonable max for Japanese words
    return Math.min((maxSyllables - syllables + 1) * 2, 28);
};

export const categorySizeAsc = (d) => {
    const count = getCategoryCount(d.group);
    return Math.min(count, 50); // Scale category count more dramatically, max size of 50
};
export const categorySizeDsc = (d) => {
    const count = getCategoryCount(d.group);
    const maxCount = Math.max(...Object.values(categoryCounts));
    return Math.min((maxCount - count + 1), 50); // Reverse scale more dramatically, max size of 50
};

// ========================================
// SIZE FUNCTION FACTORIES
// ========================================

export function createSizeFunction(sizeCalculator) {
    return function (baseSize) {
        return function (d) {
            return baseSize + sizeCalculator(d);
        };
    };
}

// ========================================
// DATA FILTERING AND MANIPULATION
// ========================================

export function filterNodesByCategories(nodes, filterList) {
    return nodes.map(node => ({
        ...node,
        isFilteredOut: filterList.includes(node.group)
    })).filter(node => !node.isFilteredOut);
}

export function toggleCategoryInFilter(category, filterList) {
    if (filterList.includes(category)) {
        return filterList.filter(item => item !== category);
    } else {
        return [...filterList, category];
    }
}

export function restoreFilteredNodes(originalNodes, currentNodes, filterList) {
    const restoredNodes = [...currentNodes];

    originalNodes.forEach(function (n) {
        // Add back filtered items to the graph
        if (n.isFilteredOut && !filterList.includes(n.group)) {
            n.isFilteredOut = false;
            restoredNodes.push(Object.assign({}, {}, n));
        }
        // mark filtered items
        n.isFilteredOut = filterList.includes(n.group);
    });

    return originalNodes.filter((n) => !n.isFilteredOut);
}

// ========================================
// ARRAY AND COLLECTION UTILITIES
// ========================================

export function deepClone(obj) {
    return Object.assign({}, {}, obj);
}

export function markFilteredItems(nodes, filterList) {
    return nodes.map(node => ({
        ...node,
        isFilteredOut: filterList.includes(node.group)
    }));
}

export function getVisibleNodes(nodes) {
    return nodes.filter(node => !node.isFilteredOut);
}

// ========================================
// GRAPH DATA TRANSFORMATION
// ========================================

export function prepareGraphData(rawData) {
    if (!rawData || typeof rawData !== 'object') {
        return {
            nodes: [],
            links: []
        };
    }

    return {
        nodes: rawData.nodes || [],
        links: rawData.links || []
    };
}

export function updateNodeVisibility(nodes, category, shouldShow) {
    return nodes.map(node => {
        if (node.group === category) {
            return {...node, isFilteredOut: !shouldShow};
        }
        return node;
    });
}

// ========================================
// CATEGORY COUNT UTILITIES
// ========================================

export function getAllCategoryCounts() {
    return categoryCounts;
}

export function getCategoryCountsSorted(ascending = true) {
    const entries = Object.entries(categoryCounts);
    return entries.sort((a, b) => ascending ? a[1] - b[1] : b[1] - a[1]);
}

// ========================================
// READING SYLLABLE UTILITIES
// ========================================

export function getSyllableCount(reading) {
    return countSyllables(reading);
}
