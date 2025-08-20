import { describe, it, expect, vi } from 'vitest';
import {
  // String formatting functions
  createKanjiLabel,
  formatKanjiTooltip,
  createLabel,
  formatDisplayName,
  // Sorting and comparison functions
  frequencyAsc,
  frequencyDsc,
  numberAsc,
  numberDsc,
  categoryAsc,
  categoryDsc,
  readingAsc,
  readingDsc,
  setOrder,
  createNumericComparator,
  createStringComparator,
  // Performance utilities
  createThrottledFunction,
  // Viewport utilities
  isElementInViewport,
  shouldLoadImage,
  getUpdatedImageAttributes,
  removeLoadedImage,
  isLazyLoadingComplete
} from '../../assets/js/modules/utils.js';

describe('String Formatting Functions', () => {
  describe('createKanjiLabel', () => {
    it('should create a properly formatted kanji label', () => {
      const kanjiData = { name: '一', reading: 'ichi', meaning: 'one' };
      const result = createKanjiLabel(kanjiData);
      expect(result).toBe('一 - ichi - one');
    });

    it('should handle empty or undefined values', () => {
      const kanjiData = { name: '水', reading: 'mizu', meaning: '' };
      const result = createKanjiLabel(kanjiData);
      expect(result).toBe('水 - mizu - ');
    });
  });

  describe('formatKanjiTooltip', () => {
    it('should format kanji tooltip correctly', () => {
      const kanjiData = { name: '火', reading: 'hi', meaning: 'fire' };
      const result = formatKanjiTooltip(kanjiData);
      expect(result).toBe('火 - hi - fire');
    });

    it('should handle complex readings and meanings', () => {
      const kanjiData = { 
        name: '山', 
        reading: 'yama/san', 
        meaning: 'mountain, hill' 
      };
      const result = formatKanjiTooltip(kanjiData);
      expect(result).toBe('山 - yama/san - mountain, hill');
    });
  });

  describe('createLabel', () => {
    it('should join items with default separator', () => {
      const items = ['item1', 'item2', 'item3'];
      const result = createLabel(items);
      expect(result).toBe('item1 - item2 - item3');
    });

    it('should join items with custom separator', () => {
      const items = ['apple', 'banana', 'cherry'];
      const result = createLabel(items, ' | ');
      expect(result).toBe('apple | banana | cherry');
    });

    it('should filter out null and empty values', () => {
      const items = ['one', null, '', 'two', undefined, 'three'];
      const result = createLabel(items);
      expect(result).toBe('one - two - three');
    });

    it('should handle empty array', () => {
      const result = createLabel([]);
      expect(result).toBe('');
    });
  });

  describe('formatDisplayName', () => {
    it('should format display name with additional info', () => {
      const result = formatDisplayName('MainName', ['info1', 'info2']);
      expect(result).toBe('MainName - info1 - info2');
    });

    it('should handle empty additional info', () => {
      const result = formatDisplayName('MainName', []);
      expect(result).toBe('MainName');
    });

    it('should filter out falsy values', () => {
      const result = formatDisplayName('MainName', ['info1', null, '', 'info2']);
      expect(result).toBe('MainName - info1 - info2');
    });
  });
});

describe('Sorting and Comparison Functions', () => {
  // Mock dataset objects for testing
  const createMockElement = (frequency, value, category, reading) => ({
    dataset: { frequency, value, category, reading }
  });

  describe('Frequency sorting', () => {
    it('frequencyAsc should sort in ascending order', () => {
      const a = createMockElement('10', '', '', '');
      const b = createMockElement('20', '', '', '');
      expect(frequencyAsc(a, b)).toBe(-10);
      expect(frequencyAsc(b, a)).toBe(10);
    });

    it('frequencyDsc should sort in descending order', () => {
      const a = createMockElement('10', '', '', '');
      const b = createMockElement('20', '', '', '');
      expect(frequencyDsc(a, b)).toBe(10);
      expect(frequencyDsc(b, a)).toBe(-10);
    });
  });

  describe('Number sorting', () => {
    it('numberAsc should sort in ascending order', () => {
      const a = createMockElement('', '5', '', '');
      const b = createMockElement('', '15', '', '');
      expect(numberAsc(a, b)).toBe(-10);
      expect(numberAsc(b, a)).toBe(10);
    });

    it('numberDsc should sort in descending order', () => {
      const a = createMockElement('', '5', '', '');
      const b = createMockElement('', '15', '', '');
      expect(numberDsc(a, b)).toBe(10);
      expect(numberDsc(b, a)).toBe(-10);
    });
  });

  describe('Category sorting', () => {
    it('categoryAsc should sort alphabetically ascending', () => {
      const a = createMockElement('', '', 'apple', '');
      const b = createMockElement('', '', 'banana', '');
      expect(categoryAsc(a, b)).toBeLessThan(0);
      expect(categoryAsc(b, a)).toBeGreaterThan(0);
    });

    it('categoryDsc should sort alphabetically descending', () => {
      const a = createMockElement('', '', 'apple', '');
      const b = createMockElement('', '', 'banana', '');
      expect(categoryDsc(a, b)).toBeGreaterThan(0);
      expect(categoryDsc(b, a)).toBeLessThan(0);
    });
  });

  describe('Reading sorting', () => {
    it('readingAsc should sort alphabetically ascending', () => {
      const a = createMockElement('', '', '', 'ichi');
      const b = createMockElement('', '', '', 'ni');
      expect(readingAsc(a, b)).toBeLessThan(0);
      expect(readingAsc(b, a)).toBeGreaterThan(0);
    });

    it('readingDsc should sort alphabetically descending', () => {
      const a = createMockElement('', '', '', 'ichi');
      const b = createMockElement('', '', '', 'ni');
      expect(readingDsc(a, b)).toBeGreaterThan(0);
      expect(readingDsc(b, a)).toBeLessThan(0);
    });
  });

  describe('setOrder', () => {
    const ascFn = (a, b) => a - b;
    const descFn = (a, b) => b - a;

    it('should toggle from ascending to descending', () => {
      const result = setOrder(ascFn, ascFn, descFn);
      expect(result).toBe(descFn);
    });

    it('should toggle from descending to ascending', () => {
      const result = setOrder(descFn, ascFn, descFn);
      expect(result).toBe(ascFn);
    });

    it('should return descending when current is not descending', () => {
      const otherFn = () => 0;
      const result = setOrder(otherFn, ascFn, descFn);
      expect(result).toBe(descFn);
    });
  });

  describe('createNumericComparator', () => {
    it('should create ascending numeric comparator', () => {
      const comparator = createNumericComparator('value', true);
      const a = createMockElement('', '10', '', '');
      const b = createMockElement('', '20', '', '');
      expect(comparator(a, b)).toBe(-10);
    });

    it('should create descending numeric comparator', () => {
      const comparator = createNumericComparator('value', false);
      const a = createMockElement('', '10', '', '');
      const b = createMockElement('', '20', '', '');
      expect(comparator(a, b)).toBe(10);
    });
  });

  describe('createStringComparator', () => {
    it('should create ascending string comparator', () => {
      const comparator = createStringComparator('category', true);
      const a = createMockElement('', '', 'apple', '');
      const b = createMockElement('', '', 'banana', '');
      expect(comparator(a, b)).toBeLessThan(0);
    });

    it('should create descending string comparator', () => {
      const comparator = createStringComparator('category', false);
      const a = createMockElement('', '', 'apple', '');
      const b = createMockElement('', '', 'banana', '');
      expect(comparator(a, b)).toBeGreaterThan(0);
    });
  });
});

describe('Performance Utilities', () => {
  describe('createThrottledFunction', () => {
    it('should throttle function calls', async () => {
      vi.useFakeTimers();
      const mockFn = vi.fn();
      const throttledFn = createThrottledFunction(mockFn, 100);

      // Call the function multiple times rapidly
      throttledFn('arg1');
      throttledFn('arg2');
      throttledFn('arg3');

      // Should only be called once initially
      expect(mockFn).toHaveBeenCalledTimes(0);

      // Fast-forward time
      vi.advanceTimersByTime(100);

      // Should be called once with the first arguments
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('arg1');

      vi.useRealTimers();
    });

    it('should use default delay when not specified', () => {
      const mockFn = vi.fn();
      const throttledFn = createThrottledFunction(mockFn);
      expect(typeof throttledFn).toBe('function');
    });

    it('should preserve function context', async () => {
      vi.useFakeTimers();
      const context = { value: 42 };
      const mockFn = vi.fn(function() { return this.value; });
      const throttledFn = createThrottledFunction(mockFn, 50);

      throttledFn.call(context);
      vi.advanceTimersByTime(50);

      expect(mockFn).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
    });
  });
});

describe('Viewport Utilities', () => {
  describe('isElementInViewport', () => {
    it('should return true for element in viewport', () => {
      const rect = { top: 100, bottom: 200 };
      const windowHeight = 500;
      expect(isElementInViewport(rect, windowHeight)).toBe(true);
    });

    it('should return false for element above viewport', () => {
      const rect = { top: -100, bottom: -50 };
      const windowHeight = 500;
      expect(isElementInViewport(rect, windowHeight)).toBe(false);
    });

    it('should return false for element below viewport', () => {
      const rect = { top: 600, bottom: 700 };
      const windowHeight = 500;
      expect(isElementInViewport(rect, windowHeight)).toBe(false);
    });

    it('should return true for partially visible element', () => {
      const rect = { top: -50, bottom: 50 };
      const windowHeight = 500;
      expect(isElementInViewport(rect, windowHeight)).toBe(true);
    });

    it('should use default window height', () => {
      const rect = { top: 100, bottom: 200 };
      // This test assumes window.innerHeight is available in test environment
      expect(typeof isElementInViewport(rect)).toBe('boolean');
    });
  });

  describe('shouldLoadImage', () => {
    const createMockElement = (rect, displayStyle = 'block') => ({
      getBoundingClientRect: () => rect
    });

    // Mock getComputedStyle
    beforeEach(() => {
      global.getComputedStyle = vi.fn().mockReturnValue({ display: 'block' });
    });

    it('should return true for visible element in viewport', () => {
      const element = createMockElement({ top: 100, bottom: 200 });
      expect(shouldLoadImage(element, 500)).toBe(true);
    });

    it('should return false for element outside viewport', () => {
      const element = createMockElement({ top: 600, bottom: 700 });
      expect(shouldLoadImage(element, 500)).toBe(false);
    });

    it('should return false for hidden element', () => {
      global.getComputedStyle = vi.fn().mockReturnValue({ display: 'none' });
      const element = createMockElement({ top: 100, bottom: 200 });
      expect(shouldLoadImage(element, 500)).toBe(false);
    });
  });

  describe('getUpdatedImageAttributes', () => {
    it('should extract src and srcset from dataset', () => {
      const element = {
        dataset: {
          src: 'image.jpg',
          srcset: 'image-2x.jpg 2x'
        }
      };
      const result = getUpdatedImageAttributes(element);
      expect(result).toEqual({
        src: 'image.jpg',
        srcset: 'image-2x.jpg 2x'
      });
    });

    it('should handle undefined dataset values', () => {
      const element = {
        dataset: {
          src: undefined,
          srcset: undefined
        }
      };
      const result = getUpdatedImageAttributes(element);
      expect(result).toEqual({
        src: undefined,
        srcset: undefined
      });
    });
  });

  describe('removeLoadedImage', () => {
    it('should remove specified image from array', () => {
      const img1 = { id: 1 };
      const img2 = { id: 2 };
      const img3 = { id: 3 };
      const images = [img1, img2, img3];

      const result = removeLoadedImage(images, img2);
      expect(result).toEqual([img1, img3]);
      expect(result).toHaveLength(2);
    });

    it('should return same array if image not found', () => {
      const img1 = { id: 1 };
      const img2 = { id: 2 };
      const img3 = { id: 3 };
      const img4 = { id: 4 };
      const images = [img1, img2, img3];

      const result = removeLoadedImage(images, img4);
      expect(result).toEqual([img1, img2, img3]);
      expect(result).toHaveLength(3);
    });

    it('should handle empty array', () => {
      const img = { id: 1 };
      const result = removeLoadedImage([], img);
      expect(result).toEqual([]);
    });
  });

  describe('isLazyLoadingComplete', () => {
    it('should return true for empty array', () => {
      expect(isLazyLoadingComplete([])).toBe(true);
    });

    it('should return false for non-empty array', () => {
      expect(isLazyLoadingComplete([1, 2, 3])).toBe(false);
    });

    it('should return false for single item array', () => {
      expect(isLazyLoadingComplete([{ id: 1 }])).toBe(false);
    });
  });
});
