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

  describe('first & last', () => {
    it('空环应返回 undefined', () => {
      const ring = makeRing<number>();
      expect(ring.first()).toBeUndefined();
      expect(ring.last()).toBeUndefined();
    });

    it('单元素环的首尾应该相同', () => {
      const ring = makeRing<number>();
      ring.push(1);
      expect(ring.first()).toBe(1);
      expect(ring.last()).toBe(1);
    });

    it('多元素环应正确返回首尾元素', () => {
      const ring = makeRing<number>();
      ring.push(1);
      ring.push(2);
      ring.push(3);
      expect(ring.first()).toBe(1);
      expect(ring.last()).toBe(3);
    });
  });

  describe('shift & pop', () => {
    it('空环的 shift/pop 应返回 undefined', () => {
      const ring = makeRing<number>();
      expect(ring.shift()).toBeUndefined();
      expect(ring.pop()).toBeUndefined();
    });

    it('shift 应移除并返回第一个元素', () => {
      const ring = makeRing<number>();
      ring.push(1);
      ring.push(2);
      ring.push(3);

      expect(ring.shift()).toBe(1);
      expect(ring.size()).toBe(2);
      expect(ring.first()).toBe(2);
      expect(ring.last()).toBe(3);
    });

    it('pop 应移除并返回最后一个元素', () => {
      const ring = makeRing<number>();
      ring.push(1);
      ring.push(2);
      ring.push(3);

      expect(ring.pop()).toBe(3);
      expect(ring.size()).toBe(2);
      expect(ring.first()).toBe(1);
      expect(ring.last()).toBe(2);
    });

    it('单元素环的 shift/pop 后应为空', () => {
      const ring = makeRing<number>();
      ring.push(1);

      ring.shift();
      expect(ring.size()).toBe(0);
      expect(ring.first()).toBeUndefined();
      expect(ring.last()).toBeUndefined();

      ring.push(1);
      ring.pop();
      expect(ring.size()).toBe(0);
      expect(ring.first()).toBeUndefined();
      expect(ring.last()).toBeUndefined();
    });

    it('反复 shift/pop 应保持环的一致性', () => {
      const ring = makeRing<number>();
      ring.push(1);
      ring.push(2);
      ring.push(3);

      expect(ring.shift()).toBe(1);
      expect(ring.pop()).toBe(3);
      expect(ring.size()).toBe(1);
      expect(ring.first()).toBe(2);
      expect(ring.last()).toBe(2);

      ring.push(4);
      expect(ring.shift()).toBe(2);
      expect(ring.shift()).toBe(4);
      expect(ring.size()).toBe(0);
    });
  });

  describe('clear', () => {
    it('应清空环并重置大小', () => {
      const ring = makeRing<number>();
      ring.push(1);
      ring.push(2);
      ring.push(3);

      ring.clear();
      expect(ring.size()).toBe(0);
      expect(ring.first()).toBeUndefined();
      expect(ring.last()).toBeUndefined();
      expect(ring.toArray()).toEqual([]);
    });

    it('清空后应可以继续使用', () => {
      const ring = makeRing<number>();
      ring.push(1);
      ring.push(2);
      
      ring.clear();
      
      ring.push(3);
      ring.push(4);
      expect(ring.size()).toBe(2);
      expect(ring.first()).toBe(3);
      expect(ring.last()).toBe(4);
      expect(ring.toArray()).toEqual([3, 4]);
    });

    it('重复清空应该是安全的', () => {
      const ring = makeRing<number>();
      ring.push(1);
      
      ring.clear();
      ring.clear();
      
      expect(ring.size()).toBe(0);
      expect(ring.first()).toBeUndefined();
      expect(ring.last()).toBeUndefined();
    });
  });
}); 