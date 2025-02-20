import { cachedWithAsync, cachedWith } from '../cached';
import { lru, unlimited } from '../strategies';
import { ENTITY_NOT_EXIST } from '@/shared/types/entity';

describe('cachedWithAsync', () => {
  it('should cache function results', async () => {
    let computeCount = 0;
    const expensive = async (x: number) => {
      computeCount++;
      return x * 2;
    };
    
    const [cachedFn] = cachedWithAsync()(expensive);
    
    // 第一次调用应该执行计算
    expect(await cachedFn(2)).toBe(4);
    expect(computeCount).toBe(1);
    
    // 第二次调用应该使用缓存
    expect(await cachedFn(2)).toBe(4);
    expect(computeCount).toBe(1);
    
    // 不同参数应该重新计算
    expect(await cachedFn(3)).toBe(6);
    expect(computeCount).toBe(2);
  });

  it('should handle not found results', async () => {
    const fetchWithNotFound = async (key: number) => {
      return key === 404 ? ENTITY_NOT_EXIST : key;
    };

    const [cachedFn] = cachedWithAsync()(fetchWithNotFound);

    expect(await cachedFn(1)).toBe(1);
    expect(await cachedFn(404)).toBe(ENTITY_NOT_EXIST);
  });

  it('should work with LRU strategy', async () => {
    const swapOutKeys: number[] = [];
    const strategy = lru<number>(2, {
      onSwapOut: (key) => swapOutKeys.push(key)
    });
    
    const [cachedFn] = cachedWithAsync(strategy)(async (x: number) => x * 2);

    // 填充缓存
    await cachedFn(1);
    await cachedFn(2);
    await cachedFn(3);

    // 验证 LRU 行为：最早的值(1)应该被移除
    expect(swapOutKeys).toContain(1);
    expect(swapOutKeys).not.toContain(2);
    expect(swapOutKeys).not.toContain(3);
  });

  it('should expose the cache', async () => {
    const swapOutKeys: number[] = [];
    const strategy = unlimited<number>({
      onSwapOut: (key) => {
        swapOutKeys.push(key)
      },
    })
    const [cachedFn, cache] = cachedWithAsync(strategy)(async (x: number) => x * 2);

    // 首次获取值
    expect(await cachedFn(1)).toBe(2);

    // 更新缓存的值
    cache.set(1, Promise.resolve(10));
    expect(await cachedFn(1)).toBe(10);

    // 删除缓存的值
    cache.del(1);
    expect(swapOutKeys).toContain(1);

    // 重新获取值
    expect(await cachedFn(1)).toBe(2);
  });

  describe('error handling', () => {
    it('should propagate errors', async () => {
      const error = new Error('fetch failed');
      const [cachedFn] = cachedWithAsync()(async () => {
        throw error;
      });

      await expect(cachedFn(1)).rejects.toThrow(error);
    });

    it('should not cache rejected promises', async () => {
      let callCount = 0;
      const [cachedFn] = cachedWithAsync()(async () => {
        callCount++;
        throw new Error('fetch failed');
      });

      await expect(cachedFn(1)).rejects.toThrow();
      await expect(cachedFn(1)).rejects.toThrow();
      expect(callCount).toBe(2);
    });
  });

  describe('LRU strategy', () => {
    it('should handle edge cases', async () => {
      const events: Array<{ type: string, key: number }> = [];
      const strategy = lru<number>(1, {
        onSwapIn: (key) => events.push({ type: 'in', key }),
        onSwapOut: (key) => events.push({ type: 'out', key })
      });
      
      const [cachedFn] = cachedWithAsync(strategy)(async (x: number) => x);

      // 测试容量为1的情况
      await cachedFn(1);
      await cachedFn(2);
      
      expect(events).toEqual([
        { type: 'in', key: 1 },
        { type: 'in', key: 2 },
        { type: 'out', key: 1 },
      ]);
    });

    it('should handle repeated access', async () => {
      const strategy = lru<number>(2);
      const [cachedFn] = cachedWithAsync(strategy)(async (x: number) => x);

      // 重复访问相同的key
      await cachedFn(1);
      await cachedFn(1);
      await cachedFn(2);
      await cachedFn(1); // 重新访问1应该将其移到最新位置
      await cachedFn(3); // 应该移除2而不是1
      
      // 验证2被移除（通过再次访问2会重新计算）
      let computeCount = 0;
      const [newCachedFn] = cachedWithAsync(strategy)(async (x: number) => {
        computeCount++;
        return x;
      });
      
      await newCachedFn(2);
      expect(computeCount).toBe(1);
    });
  });

  describe('unlimited strategy', () => {
    it('should track cache operations', async () => {
      const events: Array<{ type: string, key: number }> = [];
      const strategy = unlimited<number>({
        onSwapIn: (key) => events.push({ type: 'in', key }),
        onSwapOut: (key) => events.push({ type: 'out', key }),
      });
      
      const [cachedFn, cache] = cachedWithAsync(strategy)(async (x: number) => x);

      await cachedFn(1);
      await cachedFn(2);
      
      // 删除缓存的值
      cache.del(1);

      expect(events).toEqual([
        { type: 'in', key: 1 },
        { type: 'in', key: 2 },
        { type: 'out', key: 1 },
      ]);
    });

    it('should never evict entries', async () => {
      const strategy = unlimited<number>();
      let computeCount = 0;

      const [cachedFn] = cachedWithAsync(strategy)(async (x: number) => {
        computeCount++;
        return x;
      });

      // 添加多个缓存项
      const keys = Array.from({ length: 100 }, (_, i) => i);
      await Promise.all(keys.map(cachedFn));
      expect(computeCount).toBe(100);

      computeCount = 0;
      // 验证所有值都被缓存
      await Promise.all(keys.map(cachedFn));
      expect(computeCount).toBe(0);
    });
  });
});

describe('cachedWith', () => {
  it('should cache the result of first call', () => {
    let computeCount = 0
    const [cachedFn] = cachedWith<string>()(key => {
      computeCount++
      return `data-${key}`
    })

    // 第一次调用
    const result1 = cachedFn('123')
    expect(result1).toBe('data-123')
    expect(computeCount).toBe(1)

    // 第二次调用应该使用缓存
    const result2 = cachedFn('123')
    expect(result2).toBe('data-123')
    expect(computeCount).toBe(1)
  })

  it('should create different caches for different functions', () => {
    let computeCount1 = 0
    let computeCount2 = 0
    
    const [cachedFn1] = cachedWith<string>()(key => {
      computeCount1++
      return `data-${key}`
    })
    
    const [cachedFn2] = cachedWith<string>()(key => {
      computeCount2++
      return `data-${key}`
    })

    // 测试第一个函数
    const result1 = cachedFn1('123')
    expect(result1).toBe('data-123')
    expect(computeCount1).toBe(1)

    // 测试第二个函数
    const result2 = cachedFn2('123')
    expect(result2).toBe('data-123')
    expect(computeCount2).toBe(1)

    // 再次调用两个函数
    cachedFn1('123')
    cachedFn2('123')
    
    expect(computeCount1).toBe(1)
    expect(computeCount2).toBe(1)
  })

  it('should work with different return types', () => {
    const [cachedString] = cachedWith<string>()(key => `data-${key}`)
    const [cachedNumber] = cachedWith<string>()(key => parseInt(key))
    
    const stringResult = cachedString('123')
    expect(typeof stringResult).toBe('string')
    expect(stringResult).toBe('data-123')

    const numberResult = cachedNumber('123')
    expect(typeof numberResult).toBe('number')
    expect(numberResult).toBe(123)
  })

  it('should expose the cache', () => {
    const [cachedFn, cache] = cachedWith<string>()(key => `data-${key}`)

    // 首次获取值
    expect(cachedFn('123')).toBe('data-123')

    // 更新缓存的值
    cache.set('123', 'updated-data')
    expect(cachedFn('123')).toBe('updated-data')

    // 删除缓存的值
    cache.del('123')

    // 重新获取值
    expect(cachedFn('123')).toBe('data-123')
  })

  describe('LRU strategy', () => {
    it('should evict least recently used items when capacity is reached', () => {
      const swapOutKeys: string[] = [];
      const strategy = lru<string>(2, {
        onSwapOut: (key) => swapOutKeys.push(key)
      });
      
      const [cachedFn] = cachedWith<string>(strategy)(key => `data-${key}`);

      // 填充缓存到容量上限
      cachedFn('1');
      cachedFn('2');
      
      // 添加第三个项，应该触发淘汰
      cachedFn('3');
      
      // 验证最早使用的项被淘汰
      expect(swapOutKeys).toEqual(['1']);
      
      // 重新访问已淘汰的项应该重新计算
      let computeCount = 0;
      const [newCachedFn] = cachedWith<string>(strategy)(key => {
        computeCount++;
        return `data-${key}`;
      });
      
      newCachedFn('1');
      expect(computeCount).toBe(1);
    });

    it('should update access order on cache hits', () => {
      const swapOutKeys: string[] = [];
      const strategy = lru<string>(2, {
        onSwapOut: (key) => swapOutKeys.push(key)
      });
      
      const [cachedFn] = cachedWith<string>(strategy)(key => `data-${key}`);

      // 初始化缓存
      cachedFn('1');
      cachedFn('2');
      
      // 重新访问第一个项
      cachedFn('1');
      
      // 添加新项，应该淘汰第二个项（而不是第一个）
      cachedFn('3');
      
      expect(swapOutKeys).toEqual(['2']);
    });

    it('should handle cache updates with LRU strategy', () => {
      const swapOutKeys: string[] = [];
      const strategy = lru<string>(2, {
        onSwapOut: (key) => swapOutKeys.push(key)
      });
      
      const [cachedFn, cache] = cachedWith<string>(strategy)(
        key => `data-${key}`
      );

      // 填充缓存
      cachedFn('1');
      cachedFn('2');
      
      // 更新已存在的项
      cache.set('1', 'updated-1');
      
      // 验证更新不会影响 LRU 顺序
      cachedFn('3');
      expect(swapOutKeys).toEqual(['1']);
    });

    it('should handle delete with LRU strategy', () => {
      const swapOutKeys: string[] = [];
      const strategy = lru<string>(2, {
        onSwapOut: (key) => swapOutKeys.push(key)
      });
      
      const [cachedFn, cache] = cachedWith<string>(strategy)(
        key => `data-${key}`
      );

      // 初始化缓存
      cachedFn('1');
      cachedFn('2');
      
      // 删除缓存的值
      cache.del('1');
      
      // 验证项被移除且触发了 onSwapOut
      expect(swapOutKeys).toContain('1');
      
      // 添加新项不应该触发额外的淘汰
      cachedFn('3');
      expect(swapOutKeys.length).toBe(1);
    });

    it('should maintain correct capacity with mixed operations', () => {
      const events: Array<{ type: 'in' | 'out', key: string }> = [];
      const strategy = lru<string>(2, {
        onSwapIn: (key) => events.push({ type: 'in', key }),
        onSwapOut: (key) => events.push({ type: 'out', key })
      });
      
      const [cachedFn, cache] = cachedWith<string>(strategy)(
        key => `data-${key}`
      );

      // 混合操作序列
      cachedFn('1');                // 添加
      cachedFn('2');                // 添加
      cachedFn('1');                // 访问
      cache.set('2', 'updated-2');  // 更新
      cachedFn('3');                // 添加，应该淘汰 2
      cache.del('3');               // 删除
      cachedFn('2');                // 重新添加

      // 验证事件序列
      expect(events).toEqual([
        { type: 'in', key: '1' },
        { type: 'in', key: '2' },
        { type: 'in', key: '3' },
        { type: 'out', key: '2' },
        { type: 'out', key: '3' },
        { type: 'in', key: '2' }
      ]);
    });
  });
}); 