import { calculateTTCPrice, cn } from '../utils';

describe('Utils', () => {
  describe('calculateTTCPrice', () => {
    it('should calculate TTC price correctly with default VAT rate', () => {
      const htPrice = 100;
      const result = calculateTTCPrice(htPrice);
      
      // 100 + (100 * 0.2) = 120
      expect(result).toBe(120);
    });

    it('should handle decimal numbers correctly', () => {
      const htPrice = 33.33;
      const result = calculateTTCPrice(htPrice);
      
      // 33.33 * 1.2 = 39.996
      expect(result).toBeCloseTo(39.996, 3);
    });

    it('should handle zero price', () => {
      const htPrice = 0;
      const result = calculateTTCPrice(htPrice);
      
      expect(result).toBe(0);
    });

    it('should handle negative price', () => {
      const htPrice = -50;
      const result = calculateTTCPrice(htPrice);
      
      // -50 * 1.2 = -60
      expect(result).toBe(-60);
    });

    it('should use fixed VAT rate of 20%', () => {
      const htPrice = 100;
      const result = calculateTTCPrice(htPrice);
      
      // 100 * 1.2 = 120 (with 20% VAT)
      expect(result).toBe(120);
    });
  });

  describe('cn (className utility)', () => {
    it('should combine multiple class names', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should handle conditional classes', () => {
      const condition = true;
      const result = cn('base-class', condition && 'conditional-class');
      expect(result).toBe('base-class conditional-class');
    });

    it('should filter out falsy values', () => {
      const result = cn('class1', false, null, undefined, '', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle objects with conditional properties', () => {
      const result = cn('base', {
        'active': true,
        'disabled': false,
        'highlighted': true
      });
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).toContain('highlighted');
      expect(result).not.toContain('disabled');
    });

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2'], 'class3');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });

    it('should handle Tailwind conflicting classes', () => {
      // This test assumes the cn function uses clsx + tailwind-merge
      const result = cn('p-4', 'p-2'); // Conflicting padding
      // tailwind-merge should keep only the last one
      expect(result).toBe('p-2');
    });

    it('should handle complex Tailwind scenarios', () => {
      const result = cn(
        'bg-red-500 text-white',
        'hover:bg-red-600',
        {
          'bg-blue-500': false, // Should not appear
          'font-bold': true
        }
      );
      
      expect(result).toContain('bg-red-500');
      expect(result).toContain('text-white');
      expect(result).toContain('hover:bg-red-600');
      expect(result).toContain('font-bold');
      expect(result).not.toContain('bg-blue-500');
    });
  });

  describe('Edge cases', () => {
    it('should handle very large numbers for TTC calculation', () => {
      const htPrice = Number.MAX_SAFE_INTEGER;
      const result = calculateTTCPrice(htPrice);
      
      expect(result).toBe(htPrice * 1.2);
      expect(Number.isFinite(result)).toBe(true);
    });

    it('should handle very small numbers for TTC calculation', () => {
      const htPrice = 0.01;
      const result = calculateTTCPrice(htPrice);
      
      expect(result).toBeCloseTo(0.012, 5);
    });

    it('should handle floating point precision issues', () => {
      const htPrice = 0.1 + 0.2; // Known JS floating point issue
      const result = calculateTTCPrice(htPrice);
      
      // Should handle the 0.30000000000000004 case
      expect(result).toBeCloseTo(0.36, 10);
    });
  });
}); 