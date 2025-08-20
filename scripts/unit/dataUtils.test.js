import { describe, it, expect } from 'vitest';
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
      expect(frequencySizeAsc({ frequency: 60 })).toBe(1);
      expect(frequencySizeAsc({ frequency: 120 })).toBe(2);
      expect(frequencySizeAsc({ frequency: 30 })).toBe(0.5);
    });

    it('should handle zero frequency', () => {
      expect(frequencySizeAsc({ frequency: 0 })).toBe(0);
    });
  });

  describe('frequencySizeDsc', () => {
    it('should calculate size based on frequency (descending)', () => {
      expect(frequencySizeDsc({ frequency: 130 })).toBe(1);
      expect(frequencySizeDsc({ frequency: 65 })).toBe(2);
      expect(frequencySizeDsc({ frequency: 260 })).toBe(0.5);
    });

    it('should cap at maximum value of 50', () => {
      expect(frequencySizeDsc({ frequency: 1 })).toBe(50);
      expect(frequencySizeDsc({ frequency: 2 })).toBe(50);
      expect(frequencySizeDsc({ frequency: 2.5 })).toBe(50);
    });

    it('should not cap when under threshold', () => {
      expect(frequencySizeDsc({ frequency: 3 })).toBeCloseTo(43.33, 2);
      expect(frequencySizeDsc({ frequency: 10 })).toBe(13);
    });
  });

  describe('numberSizeAsc', () => {
    it('should calculate size based on number (ascending)', () => {
      expect(numberSizeAsc({ number: 10 })).toBe(1);
      expect(numberSizeAsc({ number: 50 })).toBe(5);
      expect(numberSizeAsc({ number: 100 })).toBe(10);
    });

    it('should handle zero', () => {
      expect(numberSizeAsc({ number: 0 })).toBe(0);
    });
  });

  describe('numberSizeDsc', () => {
    it('should calculate size based on number (descending)', () => {
      expect(numberSizeDsc({ number: 215 })).toBe(0);
      expect(numberSizeDsc({ number: 205 })).toBe(1);
      expect(numberSizeDsc({ number: 195 })).toBe(2);
      expect(numberSizeDsc({ number: 1 })).toBe(21.4);
    });

    it('should handle edge cases', () => {
      expect(numberSizeDsc({ number: 214 })).toBe(0.1);
      expect(numberSizeDsc({ number: 0 })).toBe(21.5);
    });
  });

  describe('readingSizeAsc and readingSizeDsc', () => {
    it('should always return 10 for ascending', () => {
      expect(readingSizeAsc({ reading: 'any' })).toBe(10);
      expect(readingSizeAsc({})).toBe(10);
    });

    it('should always return 10 for descending', () => {
      expect(readingSizeDsc({ reading: 'any' })).toBe(10);
      expect(readingSizeDsc({})).toBe(10);
    });
  });

  describe('categorySizeAsc and categorySizeDsc', () => {
    it('should always return 10 for ascending', () => {
      expect(categorySizeAsc({ category: 'any' })).toBe(10);
      expect(categorySizeAsc({})).toBe(10);
    });

    it('should always return 10 for descending', () => {
      expect(categorySizeDsc({ category: 'any' })).toBe(10);
      expect(categorySizeDsc({})).toBe(10);
    });
  });
});

describe('Size Function Factories', () => {
  describe('createSizeFunction', () => {
    it('should create a size function that applies base size', () => {
      const mockCalculator = (d) => d.value * 2;
      const sizeFunction = createSizeFunction(mockCalculator);
      const actualSizeFunction = sizeFunction(10);
      
      const result = actualSizeFunction({ value: 5 });
      expect(result).toBe(20); // 10 (base) + 10 (5 * 2)
    });

    it('should handle zero base size', () => {
      const mockCalculator = (d) => d.value;
      const sizeFunction = createSizeFunction(mockCalculator);
      const actualSizeFunction = sizeFunction(0);
      
      const result = actualSizeFunction({ value: 15 });
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
        { id: 1, group: 'category1', name: 'node1' },
        { id: 2, group: 'category2', name: 'node2' },
        { id: 3, group: 'category1', name: 'node3' }
      ];
      const filterList = ['category1'];
      
      const result = filterNodesByCategories(nodes, filterList);
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
      expect(result[0].isFilteredOut).toBe(false);
    });

    it('should mark filtered items correctly', () => {
      const nodes = [
        { id: 1, group: 'category1' },
        { id: 2, group: 'category2' }
      ];
      const filterList = ['category1'];
      
      const result = filterNodesByCategories(nodes, filterList);
      
      expect(result).toHaveLength(1);
      expect(result[0].group).toBe('category2');
    });

    it('should handle empty filter list', () => {
      const nodes = [
        { id: 1, group: 'category1' },
        { id: 2, group: 'category2' }
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
        { id: 1, group: 'category1', isFilteredOut: true },
        { id: 2, group: 'category2', isFilteredOut: false },
        { id: 3, group: 'category3', isFilteredOut: true }
      ];
      const currentNodes = [
        { id: 2, group: 'category2', isFilteredOut: false }
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
        { id: 1, group: 'category1', isFilteredOut: true },
        { id: 2, group: 'category2', isFilteredOut: false }
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
      const original = { a: 1, b: { c: 2 } };
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
        { id: 1, group: 'category1' },
        { id: 2, group: 'category2' },
        { id: 3, group: 'category1' }
      ];
      const filterList = ['category1'];
      
      const result = markFilteredItems(nodes, filterList);
      
      expect(result[0].isFilteredOut).toBe(true);
      expect(result[1].isFilteredOut).toBe(false);
      expect(result[2].isFilteredOut).toBe(true);
    });

    it('should not mutate original nodes', () => {
      const nodes = [{ id: 1, group: 'category1' }];
      const filterList = ['category1'];
      
      const result = markFilteredItems(nodes, filterList);
      
      expect(nodes[0]).not.toHaveProperty('isFilteredOut');
      expect(result[0]).toHaveProperty('isFilteredOut');
    });

    it('should handle empty filter list', () => {
      const nodes = [{ id: 1, group: 'category1' }];
      const result = markFilteredItems(nodes, []);
      
      expect(result[0].isFilteredOut).toBe(false);
    });
  });

  describe('getVisibleNodes', () => {
    it('should return only non-filtered nodes', () => {
      const nodes = [
        { id: 1, isFilteredOut: false },
        { id: 2, isFilteredOut: true },
        { id: 3, isFilteredOut: false },
        { id: 4, isFilteredOut: true }
      ];
      
      const result = getVisibleNodes(nodes);
      
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(3);
    });

    it('should handle all filtered nodes', () => {
      const nodes = [
        { id: 1, isFilteredOut: true },
        { id: 2, isFilteredOut: true }
      ];
      
      const result = getVisibleNodes(nodes);
      expect(result).toHaveLength(0);
    });

    it('should handle all visible nodes', () => {
      const nodes = [
        { id: 1, isFilteredOut: false },
        { id: 2, isFilteredOut: false }
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
        nodes: [{ id: 1 }, { id: 2 }],
        links: [{ source: 1, target: 2 }],
        otherProperty: 'ignored'
      };
      
      const result = prepareGraphData(rawData);
      
      expect(result).toEqual({
        nodes: [{ id: 1 }, { id: 2 }],
        links: [{ source: 1, target: 2 }]
      });
    });

    it('should handle missing nodes property', () => {
      const rawData = {
        links: [{ source: 1, target: 2 }]
      };
      
      const result = prepareGraphData(rawData);
      
      expect(result).toEqual({
        nodes: [],
        links: [{ source: 1, target: 2 }]
      });
    });

    it('should handle missing links property', () => {
      const rawData = {
        nodes: [{ id: 1 }]
      };
      
      const result = prepareGraphData(rawData);
      
      expect(result).toEqual({
        nodes: [{ id: 1 }],
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
        { id: 1, group: 'category1', isFilteredOut: false },
        { id: 2, group: 'category2', isFilteredOut: false },
        { id: 3, group: 'category1', isFilteredOut: false }
      ];
      
      const result = updateNodeVisibility(nodes, 'category1', false);
      
      expect(result[0].isFilteredOut).toBe(true);
      expect(result[1].isFilteredOut).toBe(false);
      expect(result[2].isFilteredOut).toBe(true);
    });

    it('should show nodes when shouldShow is true', () => {
      const nodes = [
        { id: 1, group: 'category1', isFilteredOut: true },
        { id: 2, group: 'category2', isFilteredOut: true }
      ];
      
      const result = updateNodeVisibility(nodes, 'category1', true);
      
      expect(result[0].isFilteredOut).toBe(false);
      expect(result[1].isFilteredOut).toBe(true);
    });

    it('should not mutate original nodes', () => {
      const nodes = [{ id: 1, group: 'category1', isFilteredOut: false }];
      const result = updateNodeVisibility(nodes, 'category1', false);
      
      expect(nodes[0].isFilteredOut).toBe(false);
      expect(result[0].isFilteredOut).toBe(true);
      expect(result).not.toBe(nodes);
    });

    it('should handle non-matching categories', () => {
      const nodes = [
        { id: 1, group: 'category1', isFilteredOut: false },
        { id: 2, group: 'category2', isFilteredOut: false }
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
