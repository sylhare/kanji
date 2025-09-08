import {describe, it, expect} from 'vitest';
import {
    // Constants
    defaultSize,
    // Size calculation functions
    frequencySizeAsc,
    frequencySizeDsc,
    numberSizeAsc,
    numberSizeDsc,
    readingSizeAsc,
    readingSizeDsc,
    categorySizeAsc,
    categorySizeDsc,
    // Category count functions
    initializeCategoryCounts,
    getCategoryCount,
    getAllCategoryCounts,
    getCategoryCountsSorted,
    getSyllableCount,
    // Size function factories
    createSizeFunction,
    // Data filtering and manipulation
    filterNodesByCategories,
    toggleCategoryInFilter,
    restoreFilteredNodes,
    // Array and collection utilities
    deepClone,
    markFilteredItems,
    getVisibleNodes,
    // Graph data transformation
    prepareGraphData,
    updateNodeVisibility
} from '../../assets/js/modules/dataUtils.js';

describe('Constants', () => {
    describe('defaultSize', () => {
        it('should have correct default value', () => {
            expect(defaultSize).toBe(12);
        });

        it('should be a number', () => {
            expect(typeof defaultSize).toBe('number');
        });
    });
});

describe('Size Calculation Functions', () => {
    describe('frequencySizeAsc', () => {
        it('should calculate size based on frequency (ascending)', () => {
            expect(frequencySizeAsc({frequency: 60})).toBe(1);
            expect(frequencySizeAsc({frequency: 120})).toBe(2);
            expect(frequencySizeAsc({frequency: 30})).toBe(0.5);
        });

        it('should handle zero frequency', () => {
            expect(frequencySizeAsc({frequency: 0})).toBe(0);
        });
    });

    describe('frequencySizeDsc', () => {
        it('should calculate size based on frequency (descending)', () => {
            expect(frequencySizeDsc({frequency: 130})).toBe(1);
            expect(frequencySizeDsc({frequency: 65})).toBe(2);
            expect(frequencySizeDsc({frequency: 260})).toBe(0.5);
        });

        it('should cap at maximum value of 50', () => {
            expect(frequencySizeDsc({frequency: 1})).toBe(50);
            expect(frequencySizeDsc({frequency: 2})).toBe(50);
            expect(frequencySizeDsc({frequency: 2.5})).toBe(50);
        });

        it('should not cap when under threshold', () => {
            expect(frequencySizeDsc({frequency: 3})).toBeCloseTo(43.33, 2);
            expect(frequencySizeDsc({frequency: 10})).toBe(13);
        });
    });

    describe('numberSizeAsc', () => {
        it('should calculate size based on number (ascending)', () => {
            expect(numberSizeAsc({number: 10})).toBe(1);
            expect(numberSizeAsc({number: 50})).toBe(5);
            expect(numberSizeAsc({number: 100})).toBe(10);
        });

        it('should handle zero', () => {
            expect(numberSizeAsc({number: 0})).toBe(0);
        });
    });

    describe('numberSizeDsc', () => {
        it('should calculate size based on number (descending)', () => {
            expect(numberSizeDsc({number: 215})).toBe(0);
            expect(numberSizeDsc({number: 205})).toBe(1);
            expect(numberSizeDsc({number: 195})).toBe(2);
            expect(numberSizeDsc({number: 1})).toBe(21.4);
        });

        it('should handle edge cases', () => {
            expect(numberSizeDsc({number: 214})).toBe(0.1);
            expect(numberSizeDsc({number: 0})).toBe(21.5);
        });
    });

    describe('readingSizeAsc', () => {
        it('should calculate size based on syllable count (ascending)', () => {
            expect(readingSizeAsc({reading: 'no'})).toBe(2); // 1 syllable * 2 = 2
            expect(readingSizeAsc({reading: 'ichi'})).toBe(4); // 2 syllables * 2 = 4
            expect(readingSizeAsc({reading: 'tatebou'})).toBe(6); // 3 syllables * 2 = 6
            expect(readingSizeAsc({reading: 'nabebuta'})).toBe(8); // 4 syllables * 2 = 8
        });

        it('should handle edge cases', () => {
            expect(readingSizeAsc({reading: ''})).toBe(2); // Empty string = 1 syllable
            expect(readingSizeAsc({})).toBe(2); // Missing reading = 1 syllable
            expect(readingSizeAsc({reading: null})).toBe(2); // Null reading = 1 syllable
        });

        it('should calculate size for long readings', () => {
            // Very long reading: 8 syllables * 2 = 16
            expect(readingSizeAsc({reading: 'verylongreadingwithmanysyllables'})).toBe(16);
        });
    });

    describe('readingSizeDsc', () => {
        it('should calculate size based on syllable count (descending)', () => {
            expect(readingSizeDsc({reading: 'no'})).toBe(16); // (8-1+1) * 2 = 16
            expect(readingSizeDsc({reading: 'ichi'})).toBe(14); // (8-2+1) * 2 = 14
            expect(readingSizeDsc({reading: 'tatebou'})).toBe(12); // (8-3+1) * 2 = 12
            expect(readingSizeDsc({reading: 'nabebuta'})).toBe(10); // (8-4+1) * 2 = 10
        });

        it('should handle edge cases', () => {
            expect(readingSizeDsc({reading: ''})).toBe(16); // Empty = 1 syllable
            expect(readingSizeDsc({})).toBe(16); // Missing = 1 syllable
        });

        it('should calculate size for long readings', () => {
            // Very long reading: (8-8+1) * 2 = 2
            expect(readingSizeDsc({reading: 'verylongreadingwithmanysyllables'})).toBe(2);
        });
    });

    describe('categorySizeAsc', () => {
        beforeEach(() => {
            // Initialize category counts for testing
            const testNodes = [
                {group: 'Nature'}, {group: 'Nature'}, {group: 'Nature'}, // 3 items
                {group: 'Body'}, {group: 'Body'}, // 2 items
                {group: 'Food'}, // 1 item
            ];
            initializeCategoryCounts(testNodes);
        });

        it('should calculate size based on category count (ascending)', () => {
            expect(categorySizeAsc({group: 'Nature'})).toBe(3); // 3 items * 1 = 3
            expect(categorySizeAsc({group: 'Body'})).toBe(2); // 2 items * 1 = 2
            expect(categorySizeAsc({group: 'Food'})).toBe(1); // 1 item * 1 = 1
        });

        it('should handle unknown categories', () => {
            expect(categorySizeAsc({group: 'Unknown'})).toBe(0); // 0 items * 1 = 0
        });

        it('should cap at maximum size of 50', () => {
            // Create a category with many items
            const manyNodes = Array(60).fill({group: 'Large'});
            initializeCategoryCounts(manyNodes);
            expect(categorySizeAsc({group: 'Large'})).toBe(50); // Should cap at 50
        });
    });

    describe('categorySizeDsc', () => {
        beforeEach(() => {
            // Initialize category counts for testing
            const testNodes = [
                {group: 'Nature'}, {group: 'Nature'}, {group: 'Nature'}, // 3 items
                {group: 'Body'}, {group: 'Body'}, // 2 items
                {group: 'Food'}, // 1 item
            ];
            initializeCategoryCounts(testNodes);
        });

        it('should calculate size based on category count (descending)', () => {
            expect(categorySizeDsc({group: 'Nature'})).toBe(1); // (3-3+1) * 1 = 1
            expect(categorySizeDsc({group: 'Body'})).toBe(2); // (3-2+1) * 1 = 2
            expect(categorySizeDsc({group: 'Food'})).toBe(3); // (3-1+1) * 1 = 3
        });

        it('should handle unknown categories', () => {
            expect(categorySizeDsc({group: 'Unknown'})).toBe(4); // (3-0+1) * 1 = 4
        });

        it('should cap at maximum size of 50', () => {
            // Create a category with many items where reverse scale would exceed 50
            const testNodes = Array(60).fill({group: 'Small'});
            testNodes.push({group: 'Large'});
            initializeCategoryCounts(testNodes);
            expect(categorySizeDsc({group: 'Small'})).toBe(1); // (60-60+1) * 1 = 1
            expect(categorySizeDsc({group: 'Large'})).toBe(50); // (60-1+1) = 60 which caps at 50
        });
    });
});

describe('Syllable Counting Functions', () => {
    describe('getSyllableCount', () => {
        it('should count syllables in simple readings', () => {
            expect(getSyllableCount('no')).toBe(1);
            expect(getSyllableCount('ichi')).toBe(2);
            expect(getSyllableCount('tatebou')).toBe(3);
            expect(getSyllableCount('nabebuta')).toBe(4);
        });

        it('should handle readings with final n', () => {
            expect(getSyllableCount('hon')).toBe(1); // ho-n counted as single vowel group
            expect(getSyllableCount('sen')).toBe(1); // se-n counted as single vowel group
        });

        it('should not count final n after vowels', () => {
            expect(getSyllableCount('an')).toBe(1); // an (not a-n)
            expect(getSyllableCount('on')).toBe(1); // on (not o-n)
        });

        it('should handle edge cases', () => {
            expect(getSyllableCount('')).toBe(1); // Empty string
            expect(getSyllableCount(null)).toBe(1); // Null
            expect(getSyllableCount(undefined)).toBe(1); // Undefined
        });

        it('should handle complex readings', () => {
            expect(getSyllableCount('kusakanmuri')).toBe(5); // ku-sa-kan-mu-ri
            expect(getSyllableCount('hitoashi')).toBe(3); // hi-to-ashi
        });
    });
});

describe('Category Count Functions', () => {
    describe('initializeCategoryCounts', () => {
        it('should initialize category counts from nodes', () => {
            const nodes = [
                {group: 'Nature'}, {group: 'Nature'}, {group: 'Nature'},
                {group: 'Body'}, {group: 'Body'},
                {group: 'Food'}
            ];
            
            initializeCategoryCounts(nodes);
            const counts = getAllCategoryCounts();
            
            expect(counts['Nature']).toBe(3);
            expect(counts['Body']).toBe(2);
            expect(counts['Food']).toBe(1);
        });

        it('should handle empty nodes array', () => {
            initializeCategoryCounts([]);
            const counts = getAllCategoryCounts();
            expect(counts).toEqual({});
        });

        it('should reset counts on re-initialization', () => {
            // First initialization
            initializeCategoryCounts([{group: 'Nature'}]);
            expect(getCategoryCount('Nature')).toBe(1);

            // Second initialization should reset
            initializeCategoryCounts([{group: 'Body'}, {group: 'Body'}]);
            expect(getCategoryCount('Nature')).toBe(0);
            expect(getCategoryCount('Body')).toBe(2);
        });
    });

    describe('getCategoryCount', () => {
        beforeEach(() => {
            const nodes = [
                {group: 'Nature'}, {group: 'Nature'},
                {group: 'Body'}
            ];
            initializeCategoryCounts(nodes);
        });

        it('should return correct count for existing categories', () => {
            expect(getCategoryCount('Nature')).toBe(2);
            expect(getCategoryCount('Body')).toBe(1);
        });

        it('should return 0 for non-existing categories', () => {
            expect(getCategoryCount('Unknown')).toBe(0);
        });
    });

    describe('getCategoryCountsSorted', () => {
        beforeEach(() => {
            const nodes = [
                {group: 'Nature'}, {group: 'Nature'}, {group: 'Nature'},
                {group: 'Body'}, {group: 'Body'},
                {group: 'Food'}
            ];
            initializeCategoryCounts(nodes);
        });

        it('should return sorted entries in ascending order', () => {
            const sorted = getCategoryCountsSorted(true);
            expect(sorted).toEqual([
                ['Food', 1],
                ['Body', 2],
                ['Nature', 3]
            ]);
        });

        it('should return sorted entries in descending order', () => {
            const sorted = getCategoryCountsSorted(false);
            expect(sorted).toEqual([
                ['Nature', 3],
                ['Body', 2],
                ['Food', 1]
            ]);
        });
    });
});

describe('Size Function Factories', () => {
    describe('createSizeFunction', () => {
        it('should create a size function that applies base size', () => {
            const mockCalculator = (d) => d.value * 2;
            const sizeFunction = createSizeFunction(mockCalculator);
            const actualSizeFunction = sizeFunction(10);

            const result = actualSizeFunction({value: 5});
            expect(result).toBe(20); // 10 (base) + 10 (5 * 2)
        });

        it('should handle zero base size', () => {
            const mockCalculator = (d) => d.value;
            const sizeFunction = createSizeFunction(mockCalculator);
            const actualSizeFunction = sizeFunction(0);

            const result = actualSizeFunction({value: 15});
            expect(result).toBe(15); // 0 (base) + 15
        });

        it('should handle negative calculator results', () => {
            const mockCalculator = () => -5;
            const sizeFunction = createSizeFunction(mockCalculator);
            const actualSizeFunction = sizeFunction(10);

            const result = actualSizeFunction({});
            expect(result).toBe(5); // 10 (base) + (-5)
        });
    });
});

describe('Data Filtering and Manipulation', () => {
    describe('filterNodesByCategories', () => {
        it('should filter out nodes in filter list', () => {
            const nodes = [
                {id: 1, group: 'category1', name: 'node1'},
                {id: 2, group: 'category2', name: 'node2'},
                {id: 3, group: 'category1', name: 'node3'}
            ];
            const filterList = ['category1'];

            const result = filterNodesByCategories(nodes, filterList);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(2);
            expect(result[0].isFilteredOut).toBe(false);
        });

        it('should mark filtered items correctly', () => {
            const nodes = [
                {id: 1, group: 'category1'},
                {id: 2, group: 'category2'}
            ];
            const filterList = ['category1'];

            const result = filterNodesByCategories(nodes, filterList);

            expect(result).toHaveLength(1);
            expect(result[0].group).toBe('category2');
        });

        it('should handle empty filter list', () => {
            const nodes = [
                {id: 1, group: 'category1'},
                {id: 2, group: 'category2'}
            ];
            const filterList = [];

            const result = filterNodesByCategories(nodes, filterList);

            expect(result).toHaveLength(2);
            result.forEach(node => {
                expect(node.isFilteredOut).toBe(false);
            });
        });

        it('should handle empty nodes array', () => {
            const result = filterNodesByCategories([], ['category1']);
            expect(result).toEqual([]);
        });
    });

    describe('toggleCategoryInFilter', () => {
        it('should add category when not present', () => {
            const filterList = ['category1', 'category2'];
            const result = toggleCategoryInFilter('category3', filterList);

            expect(result).toEqual(['category1', 'category2', 'category3']);
            expect(result).toHaveLength(3);
        });

        it('should remove category when present', () => {
            const filterList = ['category1', 'category2', 'category3'];
            const result = toggleCategoryInFilter('category2', filterList);

            expect(result).toEqual(['category1', 'category3']);
            expect(result).toHaveLength(2);
        });

        it('should handle empty filter list', () => {
            const result = toggleCategoryInFilter('category1', []);
            expect(result).toEqual(['category1']);
        });

        it('should not mutate original array', () => {
            const originalFilter = ['category1', 'category2'];
            const result = toggleCategoryInFilter('category3', originalFilter);

            expect(originalFilter).toEqual(['category1', 'category2']);
            expect(result).not.toBe(originalFilter);
        });

        it('should handle removing the only item', () => {
            const filterList = ['category1'];
            const result = toggleCategoryInFilter('category1', filterList);

            expect(result).toEqual([]);
        });
    });

    describe('restoreFilteredNodes', () => {
        it('should restore nodes that are no longer filtered', () => {
            const originalNodes = [
                {id: 1, group: 'category1', isFilteredOut: true},
                {id: 2, group: 'category2', isFilteredOut: false},
                {id: 3, group: 'category3', isFilteredOut: true}
            ];
            const currentNodes = [
                {id: 2, group: 'category2', isFilteredOut: false}
            ];
            const filterList = ['category3']; // only category3 should remain filtered

            const result = restoreFilteredNodes(originalNodes, currentNodes, filterList);

            // Should filter out category3 but include category1 and category2
            expect(result).toHaveLength(2);
            expect(result.some(n => n.group === 'category1')).toBe(true);
            expect(result.some(n => n.group === 'category2')).toBe(true);
            expect(result.some(n => n.group === 'category3')).toBe(false);
        });

        it('should handle empty filter list', () => {
            const originalNodes = [
                {id: 1, group: 'category1', isFilteredOut: true},
                {id: 2, group: 'category2', isFilteredOut: false}
            ];
            const currentNodes = [];
            const filterList = [];

            const result = restoreFilteredNodes(originalNodes, currentNodes, filterList);

            expect(result).toHaveLength(2);
            originalNodes.forEach(node => {
                expect(node.isFilteredOut).toBe(false);
            });
        });
    });
});

describe('Array and Collection Utilities', () => {
    describe('deepClone', () => {
        it('should create a deep clone of object', () => {
            const original = {a: 1, b: {c: 2}};
            const cloned = deepClone(original);

            expect(cloned).toEqual(original);
            expect(cloned).not.toBe(original);
        });

        it('should handle null and undefined', () => {
            expect(deepClone(null)).toEqual({});
            expect(deepClone(undefined)).toEqual({});
        });
    });

    describe('markFilteredItems', () => {
        it('should mark items as filtered based on filter list', () => {
            const nodes = [
                {id: 1, group: 'category1'},
                {id: 2, group: 'category2'},
                {id: 3, group: 'category1'}
            ];
            const filterList = ['category1'];

            const result = markFilteredItems(nodes, filterList);

            expect(result[0].isFilteredOut).toBe(true);
            expect(result[1].isFilteredOut).toBe(false);
            expect(result[2].isFilteredOut).toBe(true);
        });

        it('should not mutate original nodes', () => {
            const nodes = [{id: 1, group: 'category1'}];
            const filterList = ['category1'];

            const result = markFilteredItems(nodes, filterList);

            expect(nodes[0]).not.toHaveProperty('isFilteredOut');
            expect(result[0]).toHaveProperty('isFilteredOut');
        });

        it('should handle empty filter list', () => {
            const nodes = [{id: 1, group: 'category1'}];
            const result = markFilteredItems(nodes, []);

            expect(result[0].isFilteredOut).toBe(false);
        });
    });

    describe('getVisibleNodes', () => {
        it('should return only non-filtered nodes', () => {
            const nodes = [
                {id: 1, isFilteredOut: false},
                {id: 2, isFilteredOut: true},
                {id: 3, isFilteredOut: false},
                {id: 4, isFilteredOut: true}
            ];

            const result = getVisibleNodes(nodes);

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(1);
            expect(result[1].id).toBe(3);
        });

        it('should handle all filtered nodes', () => {
            const nodes = [
                {id: 1, isFilteredOut: true},
                {id: 2, isFilteredOut: true}
            ];

            const result = getVisibleNodes(nodes);
            expect(result).toHaveLength(0);
        });

        it('should handle all visible nodes', () => {
            const nodes = [
                {id: 1, isFilteredOut: false},
                {id: 2, isFilteredOut: false}
            ];

            const result = getVisibleNodes(nodes);
            expect(result).toHaveLength(2);
        });

        it('should handle empty array', () => {
            const result = getVisibleNodes([]);
            expect(result).toEqual([]);
        });
    });
});

describe('Graph Data Transformation', () => {
    describe('prepareGraphData', () => {
        it('should return well-formed graph data structure', () => {
            const rawData = {
                nodes: [{id: 1}, {id: 2}],
                links: [{source: 1, target: 2}],
                otherProperty: 'ignored'
            };

            const result = prepareGraphData(rawData);

            expect(result).toEqual({
                nodes: [{id: 1}, {id: 2}],
                links: [{source: 1, target: 2}]
            });
        });

        it('should handle missing nodes property', () => {
            const rawData = {
                links: [{source: 1, target: 2}]
            };

            const result = prepareGraphData(rawData);

            expect(result).toEqual({
                nodes: [],
                links: [{source: 1, target: 2}]
            });
        });

        it('should handle missing links property', () => {
            const rawData = {
                nodes: [{id: 1}]
            };

            const result = prepareGraphData(rawData);

            expect(result).toEqual({
                nodes: [{id: 1}],
                links: []
            });
        });

        it('should handle empty object', () => {
            const result = prepareGraphData({});

            expect(result).toEqual({
                nodes: [],
                links: []
            });
        });

        it('should handle null input', () => {
            const result = prepareGraphData(null);

            expect(result).toEqual({
                nodes: [],
                links: []
            });
        });
    });

    describe('updateNodeVisibility', () => {
        it('should update visibility for matching category', () => {
            const nodes = [
                {id: 1, group: 'category1', isFilteredOut: false},
                {id: 2, group: 'category2', isFilteredOut: false},
                {id: 3, group: 'category1', isFilteredOut: false}
            ];

            const result = updateNodeVisibility(nodes, 'category1', false);

            expect(result[0].isFilteredOut).toBe(true);
            expect(result[1].isFilteredOut).toBe(false);
            expect(result[2].isFilteredOut).toBe(true);
        });

        it('should show nodes when shouldShow is true', () => {
            const nodes = [
                {id: 1, group: 'category1', isFilteredOut: true},
                {id: 2, group: 'category2', isFilteredOut: true}
            ];

            const result = updateNodeVisibility(nodes, 'category1', true);

            expect(result[0].isFilteredOut).toBe(false);
            expect(result[1].isFilteredOut).toBe(true);
        });

        it('should not mutate original nodes', () => {
            const nodes = [{id: 1, group: 'category1', isFilteredOut: false}];
            const result = updateNodeVisibility(nodes, 'category1', false);

            expect(nodes[0].isFilteredOut).toBe(false);
            expect(result[0].isFilteredOut).toBe(true);
            expect(result).not.toBe(nodes);
        });

        it('should handle non-matching categories', () => {
            const nodes = [
                {id: 1, group: 'category1', isFilteredOut: false},
                {id: 2, group: 'category2', isFilteredOut: false}
            ];

            const result = updateNodeVisibility(nodes, 'category3', false);

            result.forEach(node => {
                expect(node.isFilteredOut).toBe(false);
            });
        });

        it('should handle empty nodes array', () => {
            const result = updateNodeVisibility([], 'category1', false);
            expect(result).toEqual([]);
        });
    });
});

