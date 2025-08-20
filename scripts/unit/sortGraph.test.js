import { describe, it, expect } from 'vitest';

import {
  defaultSize,
  frequencySizeAsc,
  frequencySizeDsc,
  numberSizeAsc,
  numberSizeDsc,
  readingSizeAsc,
  readingSizeDsc,
  categorySizeAsc,
  categorySizeDsc
} from '../../assets/js/modules/sortGraph.js';

describe('SortGraph Module - Pure Functions', () => {
  let testData;

  beforeEach(() => {
    testData = [
      { frequency: 60, number: 10 },
      { frequency: 120, number: 50 },
      { frequency: 30, number: 100 },
      { frequency: 180, number: 200 },
      { frequency: 1, number: 1 }    // Edge case for testing caps
    ];
  });

  describe('Frequency Size Functions', () => {
    describe('frequencySizeAsc', () => {
      it('should calculate frequency size correctly', () => {
        expect(frequencySizeAsc(testData[0])).toBe(1);     // 60/60 = 1
        expect(frequencySizeAsc(testData[1])).toBe(2);     // 120/60 = 2
        expect(frequencySizeAsc(testData[2])).toBe(0.5);   // 30/60 = 0.5
        expect(frequencySizeAsc(testData[3])).toBe(3);     // 180/60 = 3
      });

      it('should handle zero frequency', () => {
        const zeroFreq = { frequency: 0 };
        expect(frequencySizeAsc(zeroFreq)).toBe(0);
      });

      it('should handle decimal frequencies', () => {
        const decimalFreq = { frequency: 45 };
        expect(frequencySizeAsc(decimalFreq)).toBe(0.75);  // 45/60 = 0.75
      });
    });

    describe('frequencySizeDsc', () => {
      it('should calculate inverse frequency size correctly', () => {
        expect(frequencySizeDsc(testData[0])).toBeCloseTo(2.17, 2);  // 130/60
        expect(frequencySizeDsc(testData[1])).toBeCloseTo(1.08, 2);  // 130/120
        expect(frequencySizeDsc(testData[2])).toBeCloseTo(4.33, 2);  // 130/30
      });

      it('should cap size at 50 for very low frequencies', () => {
        expect(frequencySizeDsc(testData[4])).toBe(50);  // 130/1 = 130, but capped at 50
      });

      it('should handle frequency of 130 exactly', () => {
        const exactFreq = { frequency: 130 };
        expect(frequencySizeDsc(exactFreq)).toBe(1);  // 130/130 = 1
      });
    });
  });

  describe('Number Size Functions', () => {
    describe('numberSizeAsc', () => {
      it('should calculate number size correctly', () => {
        expect(numberSizeAsc(testData[0])).toBe(1);    // 10/10 = 1
        expect(numberSizeAsc(testData[1])).toBe(5);    // 50/10 = 5
        expect(numberSizeAsc(testData[2])).toBe(10);   // 100/10 = 10
        expect(numberSizeAsc(testData[3])).toBe(20);   // 200/10 = 20
      });

      it('should handle zero number', () => {
        const zeroNum = { number: 0 };
        expect(numberSizeAsc(zeroNum)).toBe(0);
      });
    });

    describe('numberSizeDsc', () => {
      it('should calculate inverse number size correctly', () => {
        expect(numberSizeDsc(testData[0])).toBe(20.5);  // (215-10)/10 = 20.5
        expect(numberSizeDsc(testData[1])).toBe(16.5);  // (215-50)/10 = 16.5
        expect(numberSizeDsc(testData[2])).toBe(11.5);  // (215-100)/10 = 11.5
        expect(numberSizeDsc(testData[3])).toBe(1.5);   // (215-200)/10 = 1.5
      });

      it('should handle number 215 (maximum)', () => {
        const maxNum = { number: 215 };
        expect(numberSizeDsc(maxNum)).toBe(0);  // (215-215)/10 = 0
      });

      it('should handle numbers greater than 215', () => {
        const overMaxNum = { number: 300 };
        expect(numberSizeDsc(overMaxNum)).toBe(-8.5);  // (215-300)/10 = -8.5
      });
    });
  });

  describe('Constant Size Functions', () => {
    it('should return constant size for reading functions', () => {
      expect(readingSizeAsc(testData[0])).toBe(10);
      expect(readingSizeDsc(testData[0])).toBe(10);
      expect(readingSizeAsc({})).toBe(10);  // Should work with any input
    });

    it('should return constant size for category functions', () => {
      expect(categorySizeAsc(testData[0])).toBe(10);
      expect(categorySizeDsc(testData[0])).toBe(10);
      expect(categorySizeAsc({})).toBe(10);  // Should work with any input
    });
  });

  describe('Default size constant', () => {
    it('should have correct default size value', () => {
      expect(defaultSize).toBe(12);
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle missing properties gracefully', () => {
      const emptyData = {};
      
      expect(frequencySizeAsc(emptyData)).toBeNaN();
      expect(numberSizeAsc(emptyData)).toBeNaN();
      
      expect(readingSizeAsc(emptyData)).toBe(10);
      expect(categorySizeAsc(emptyData)).toBe(10);
    });

    it('should handle very large numbers', () => {
      const largeData = { frequency: 1000000, number: 1000000 };
      
      expect(frequencySizeAsc(largeData)).toBe(16666.666666666668);  // 1000000/60
      expect(numberSizeAsc(largeData)).toBe(100000);                 // 1000000/10
    });

    it('should handle negative numbers', () => {
      const negativeData = { frequency: -60, number: -10 };
      
      expect(frequencySizeAsc(negativeData)).toBe(-1);    // -60/60 = -1
      expect(numberSizeAsc(negativeData)).toBe(-1);       // -10/10 = -1
      expect(numberSizeDsc(negativeData)).toBe(22.5);     // (215-(-10))/10 = 22.5
    });
  });
});