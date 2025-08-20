import { describe, it, expect } from 'vitest';

import { kanjiLabel } from '../../assets/js/modules/graph.js';

describe('Graph Module - Pure Functions', () => {
  describe('kanjiLabel function', () => {
    it('should format kanji label correctly with all properties', () => {
      const kanjiData = {
        name: '水',
        reading: 'mizu',
        meaning: 'water'
      };
      
      const result = kanjiLabel(kanjiData);
      expect(result).toBe('水 - mizu - water');
    });

    it('should handle different kanji characters', () => {
      const fireKanji = {
        name: '火',
        reading: 'hi',
        meaning: 'fire'
      };
      
      const result = kanjiLabel(fireKanji);
      expect(result).toBe('火 - hi - fire');
    });

    it('should handle complex readings', () => {
      const complexKanji = {
        name: '学',
        reading: 'gaku/mana(bu)',
        meaning: 'study/learn'
      };
      
      const result = kanjiLabel(complexKanji);
      expect(result).toBe('学 - gaku/mana(bu) - study/learn');
    });

    it('should handle hiragana readings', () => {
      const hiraganaKanji = {
        name: '川',
        reading: 'かわ',
        meaning: 'river'
      };
      
      const result = kanjiLabel(hiraganaKanji);
      expect(result).toBe('川 - かわ - river');
    });

    it('should handle katakana readings', () => {
      const katakanaKanji = {
        name: '水',
        reading: 'ミズ',
        meaning: 'water'
      };
      
      const result = kanjiLabel(katakanaKanji);
      expect(result).toBe('水 - ミズ - water');
    });

    it('should handle English meanings', () => {
      const englishMeaning = {
        name: '犬',
        reading: 'inu',
        meaning: 'dog'
      };
      
      const result = kanjiLabel(englishMeaning);
      expect(result).toBe('犬 - inu - dog');
    });

    it('should handle multiple word meanings', () => {
      const multiWordMeaning = {
        name: '友',
        reading: 'tomo',
        meaning: 'friend, companion'
      };
      
      const result = kanjiLabel(multiWordMeaning);
      expect(result).toBe('友 - tomo - friend, companion');
    });

    it('should handle empty strings', () => {
      const emptyData = {
        name: '',
        reading: '',
        meaning: ''
      };
      
      const result = kanjiLabel(emptyData);
      expect(result).toBe(' -  - ');
    });

    it('should handle special characters in meaning', () => {
      const specialChars = {
        name: '人',
        reading: 'hito',
        meaning: 'person/human being'
      };
      
      const result = kanjiLabel(specialChars);
      expect(result).toBe('人 - hito - person/human being');
    });

    it('should handle radical names', () => {
      const radicalData = {
        name: '⺅',
        reading: 'ninben',
        meaning: 'person radical'
      };
      
      const result = kanjiLabel(radicalData);
      expect(result).toBe('⺅ - ninben - person radical');
    });

    it('should handle numbers in readings', () => {
      const numberedReading = {
        name: '一',
        reading: 'ichi/hito(tsu)',
        meaning: 'one'
      };
      
      const result = kanjiLabel(numberedReading);
      expect(result).toBe('一 - ichi/hito(tsu) - one');
    });

    it('should handle long meanings', () => {
      const longMeaning = {
        name: '義',
        reading: 'gi',
        meaning: 'righteousness, justice, morality, honor, loyalty, meaning'
      };
      
      const result = kanjiLabel(longMeaning);
      expect(result).toBe('義 - gi - righteousness, justice, morality, honor, loyalty, meaning');
    });

    it('should preserve spacing in the format', () => {
      const data = {
        name: 'A',
        reading: 'B',
        meaning: 'C'
      };
      
      const result = kanjiLabel(data);
      expect(result).toBe('A - B - C');
      expect(result.includes(' - ')).toBe(true);
    });
  });

  describe('kanjiLabel edge cases', () => {
    it('should handle undefined properties gracefully', () => {
      const incompleteData = {
        name: '水'
        // missing reading and meaning
      };
      
      const result = kanjiLabel(incompleteData);
      expect(result).toBe('水 - undefined - undefined');
    });

    it('should handle null values', () => {
      const nullData = {
        name: null,
        reading: null,
        meaning: null
      };
      
      expect(() => kanjiLabel(nullData)).toThrow();
    });

    it('should work with string conversion', () => {
      const numberData = {
        name: '123',  // Strings work with concat
        reading: '456',
        meaning: '789'
      };
      
      const result = kanjiLabel(numberData);
      expect(result).toBe('123 - 456 - 789');
    });
  });
});