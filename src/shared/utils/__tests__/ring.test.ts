import { makeRing } from '../ring';

describe('Ring', () => {
  it('should initialize empty', () => {
    const ring = makeRing<number>();
    expect(ring.size()).toBe(0);
    expect(ring.toArray()).toEqual([]);
  });

  describe('push operations', () => {
    it('should push elements to the end', () => {
      const ring = makeRing<number>();
      ring.push(1);
      ring.push(2);
      ring.push(3);
      expect(ring.toArray()).toEqual([1, 2, 3]);
      expect(ring.size()).toBe(3);
    });

    it('should maintain correct order after push and pop', () => {
      const ring = makeRing<number>();
      ring.push(1);
      ring.push(2);
      expect(ring.pop()).toBe(2);
      ring.push(3);
      expect(ring.toArray()).toEqual([1, 3]);
    });
  });

  describe('unshift operations', () => {
    it('should add elements to the beginning', () => {
      const ring = makeRing<number>();
      ring.unshift(1);
      ring.unshift(2);
      ring.unshift(3);
      expect(ring.toArray()).toEqual([3, 2, 1]);
      expect(ring.size()).toBe(3);
    });

    it('should maintain correct order after unshift and shift', () => {
      const ring = makeRing<number>();
      ring.unshift(1);
      ring.unshift(2);
      expect(ring.shift()).toBe(2);
      ring.unshift(3);
      expect(ring.toArray()).toEqual([3, 1]);
    });
  });

  describe('remove operations', () => {
    it('should remove specific nodes', () => {
      const ring = makeRing<number>();
      ring.push(1);
      const node2 = ring.push(2);
      ring.push(3);
      
      ring.remove(node2);
      expect(ring.toArray()).toEqual([1, 3]);
      expect(ring.size()).toBe(2);
    });

    it('should handle removing first and last nodes', () => {
      const ring = makeRing<number>();
      const first = ring.push(1);
      ring.push(2);
      const last = ring.push(3);
      
      ring.remove(first);
      expect(ring.toArray()).toEqual([2, 3]);
      
      ring.remove(last);
      expect(ring.toArray()).toEqual([2]);
    });
  });

  describe('iteration', () => {
    it('should iterate over all elements', () => {
      const ring = makeRing<number>();
      ring.push(1);
      ring.push(2);
      ring.push(3);
      
      const values: number[] = [];
      ring.forEach(value => values.push(value));
      expect(values).toEqual([1, 2, 3]);
    });

    it('should handle empty ring iteration', () => {
      const ring = makeRing<number>();
      const values: number[] = [];
      ring.forEach(value => values.push(value));
      expect(values).toEqual([]);
    });
  });

  describe('edge cases', () => {
    it('should handle pop on empty ring', () => {
      const ring = makeRing<number>();
      expect(ring.pop()).toBeUndefined();
    });

    it('should handle shift on empty ring', () => {
      const ring = makeRing<number>();
      expect(ring.shift()).toBeUndefined();
    });

    it('should handle clear operation', () => {
      const ring = makeRing<number>();
      ring.push(1);
      ring.push(2);
      ring.clear();
      expect(ring.size()).toBe(0);
      expect(ring.toArray()).toEqual([]);
    });
  });
}); 