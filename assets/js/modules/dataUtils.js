// ========================================
// DATA MANIPULATION UTILITIES - PURE FUNCTIONS
// ========================================

// Graph size calculation constants and functions
export const defaultSize = 12;

export const frequencySizeAsc = (d) => d.frequency / 60;
export const frequencySizeDsc = (d) => 130 / d.frequency > 50 ? 50 : 130 / d.frequency;
export const numberSizeAsc = (d) => d.number / 10;
export const numberSizeDsc = (d) => (215 - d.number) / 10;
export const readingSizeAsc = (d) => 10;
export const readingSizeDsc = (d) => 10;
export const categorySizeAsc = (d) => 10;
export const categorySizeDsc = (d) => 10;

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
