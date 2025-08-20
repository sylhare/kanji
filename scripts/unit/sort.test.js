import { describe, it, expect } from 'vitest';

import {
  frequencyAsc,
  frequencyDsc,
  numberAsc,
  numberDsc,
  categoryAsc,
  categoryDsc,
  readingAsc,
  readingDsc,
  setOrder
} from '../../assets/js/modules/sort.js';

const createMockElement = (dataset) => ({ dataset });

describe('Sort Module - Pure Functions', () => {
  let testElements;

  beforeEach(() => {
    testElements = [
      createMockElement({ frequency: '10', value: '1', category: 'nature', reading: 'ka' }),
      createMockElement({ frequency: '5', value: '3', category: 'animals', reading: 'ki' }),
      createMockElement({ frequency: '15', value: '2', category: 'body', reading: 'ku' })
    ];
  });

  describe('Frequency Sorting Functions', () => {
    it('should sort by frequency in ascending order', () => {
      const sorted = [...testElements].sort(frequencyAsc);
      expect(sorted[0].dataset.frequency).toBe('5');
      expect(sorted[1].dataset.frequency).toBe('10');
      expect(sorted[2].dataset.frequency).toBe('15');
    });

    it('should sort by frequency in descending order', () => {
      const sorted = [...testElements].sort(frequencyDsc);
      expect(sorted[0].dataset.frequency).toBe('15');
      expect(sorted[1].dataset.frequency).toBe('10');
      expect(sorted[2].dataset.frequency).toBe('5');
    });

    it('should handle equal frequencies', () => {
      const equalElements = [
        createMockElement({ frequency: '10' }),
        createMockElement({ frequency: '10' })
      ];
      const sorted = [...equalElements].sort(frequencyAsc);
      expect(sorted[0].dataset.frequency).toBe('10');
      expect(sorted[1].dataset.frequency).toBe('10');
    });
  });

  describe('Number Sorting Functions', () => {
    it('should sort by number value in ascending order', () => {
      const sorted = [...testElements].sort(numberAsc);
      expect(sorted[0].dataset.value).toBe('1');
      expect(sorted[1].dataset.value).toBe('2');
      expect(sorted[2].dataset.value).toBe('3');
    });

    it('should sort by number value in descending order', () => {
      const sorted = [...testElements].sort(numberDsc);
      expect(sorted[0].dataset.value).toBe('3');
      expect(sorted[1].dataset.value).toBe('2');
      expect(sorted[2].dataset.value).toBe('1');
    });

    it('should handle string numbers correctly', () => {
      const stringNumbers = [
        createMockElement({ value: '100' }),
        createMockElement({ value: '20' }),
        createMockElement({ value: '3' })
      ];
      const sorted = [...stringNumbers].sort(numberAsc);
      expect(sorted[0].dataset.value).toBe('3');
      expect(sorted[1].dataset.value).toBe('20');
      expect(sorted[2].dataset.value).toBe('100');
    });
  });

  describe('Category Sorting Functions', () => {
    it('should sort by category in ascending order', () => {
      const sorted = [...testElements].sort(categoryAsc);
      expect(sorted[0].dataset.category).toBe('animals');
      expect(sorted[1].dataset.category).toBe('body');
      expect(sorted[2].dataset.category).toBe('nature');
    });

    it('should sort by category in descending order', () => {
      const sorted = [...testElements].sort(categoryDsc);
      expect(sorted[0].dataset.category).toBe('nature');
      expect(sorted[1].dataset.category).toBe('body');
      expect(sorted[2].dataset.category).toBe('animals');
    });

    it('should handle Japanese characters in categories', () => {
      const japaneseElements = [
        createMockElement({ category: 'みず' }),
        createMockElement({ category: 'あめ' }),
        createMockElement({ category: 'き' })
      ];
      const sorted = [...japaneseElements].sort(categoryAsc);
      expect(sorted[0].dataset.category).toBe('あめ');
      expect(sorted[1].dataset.category).toBe('き');
      expect(sorted[2].dataset.category).toBe('みず');
    });
  });

  describe('Reading Sorting Functions', () => {
    it('should sort by reading in ascending order', () => {
      const sorted = [...testElements].sort(readingAsc);
      expect(sorted[0].dataset.reading).toBe('ka');
      expect(sorted[1].dataset.reading).toBe('ki');
      expect(sorted[2].dataset.reading).toBe('ku');
    });

    it('should sort by reading in descending order', () => {
      const sorted = [...testElements].sort(readingDsc);
      expect(sorted[0].dataset.reading).toBe('ku');
      expect(sorted[1].dataset.reading).toBe('ki');
      expect(sorted[2].dataset.reading).toBe('ka');
    });

    it('should handle hiragana readings correctly', () => {
      const hiraganaElements = [
        createMockElement({ reading: 'みず' }),
        createMockElement({ reading: 'あめ' }),
        createMockElement({ reading: 'かぜ' })
      ];
      const sorted = [...hiraganaElements].sort(readingAsc);
      expect(sorted[0].dataset.reading).toBe('あめ');
      expect(sorted[1].dataset.reading).toBe('かぜ');
      expect(sorted[2].dataset.reading).toBe('みず');
    });
  });

  describe('setOrder Function', () => {
    it('should toggle from ascending to descending', () => {
      const result = setOrder(numberAsc, numberAsc, numberDsc);
      expect(result).toBe(numberDsc);
    });

    it('should toggle from descending to ascending', () => {
      const result = setOrder(numberDsc, numberAsc, numberDsc);
      expect(result).toBe(numberAsc);
    });

    it('should handle different comparison functions', () => {
      const result = setOrder(frequencyAsc, frequencyAsc, frequencyDsc);
      expect(result).toBe(frequencyDsc);
    });

    it('should return descending when current order is not descending', () => {
      const customOrder = (a, b) => 0; // Different function
      const result = setOrder(customOrder, numberAsc, numberDsc);
      expect(result).toBe(numberDsc); // Returns dec when order !== dec
    });
  });
});