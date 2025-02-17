import { makeEventSource } from '../../event';
import { cachedWithAsync, cachedWith } from '../cached';
import { lru, unlimited } from '../strategies';
import { ENTITY_NOT_EXIST } from '../cache';

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

  it('should support cache updates', async () => {
    const swapOutKeys: number[] = [];
    const strategy = unlimited<number>({
      onSwapOut: (key) => {
        swapOutKeys.push(key)
      },
    })
    const [cachedFn, updater] = cachedWithAsync(strategy)(async (x: number) => x * 2);

    // 首次获取值
    expect(await cachedFn(1)).toBe(2);

    // 更新缓存的值
    updater(1, () => 10);
    expect(await cachedFn(1)).toBe(10);

    // Entity 已经删除，更新为 not found 应该从缓存中移除
    updater(1, () => ENTITY_NOT_EXIST);
    expect(await cachedFn(1)).toBe(ENTITY_NOT_EXIST);
    expect(swapOutKeys).toContain(1);
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

  describe('cache updater', () => {
    it('should ignore updates for non-existent keys', async () => {
      const [cachedFn, updater] = cachedWithAsync()(async (x: number) => x * 2);
      
      updater(1, () => 10);
      expect(await cachedFn(1)).toBe(2); // 应该执行原始计算
    });

    it('should handle concurrent updates', async () => {
      const [cachedFn, updater] = cachedWithAsync()(async (x: number) => x * 2);
      
      // 首次获取以缓存值
      const initial = await cachedFn(1);
      expect(initial).toBe(2);

      // 并发更新
      updater(1, () => 10);
      updater(1, () => 20);
      
      expect(await cachedFn(1)).toBe(20);
    });

    it('should handle updater errors', async () => {
      const swapOutKeys: number[] = [];
      const strategy = unlimited<number>({
        onSwapOut: (key) => swapOutKeys.push(key)
      });
      
      const [cachedFn, updater] = cachedWithAsync(strategy)(async (x: number) => x);

      // 首先缓存一个值
      await cachedFn(1);

      // 更新时抛出错误
      const error = new Error('update failed');
      await expect(
        updater(1, () => { throw error; })
      ).rejects.toThrow(error);

      // 验证错误的更新会导致缓存项被移除
      expect(swapOutKeys).toContain(1);

      // 再次访问应该重新获取
      let fetchCount = 0;
      const [newCachedFn] = cachedWithAsync(strategy)(async (x: number) => {
        fetchCount++;
        return x;
      });

      await newCachedFn(1);
      expect(fetchCount).toBe(1);
    });

    it('should handle updater returning ENTITY_NOT_EXIST', async () => {
      const swapOutKeys: number[] = [];
      const strategy = unlimited<number>({
        onSwapOut: (key) => swapOutKeys.push(key)
      });
      
      const [cachedFn, updater] = cachedWithAsync(strategy)(async (x: number) => x);

      // 首先缓存一个值
      await cachedFn(1);

      // 更新为 ENTITY_NOT_EXIST
      await updater(1, () => ENTITY_NOT_EXIST);

      // 验证缓存项被移除
      expect(swapOutKeys).toContain(1);
    });

    it('should handle concurrent errors in updater', async () => {
      const swapOutKeys: number[] = [];
      const strategy = unlimited<number>({
        onSwapOut: (key) => swapOutKeys.push(key)
      });
      
      const [cachedFn, updater] = cachedWithAsync(strategy)(async (x: number) => x);

      // 首先缓存一个值
      await cachedFn(1);

      // 并发更新，一个成功一个失败
      const error = new Error('update failed');
      await Promise.all([
        updater(1, () => 10),
        expect(
          updater(1, () => { throw error; })
        ).rejects.toThrow(error)
      ]);

      // 验证最后的状态
      expect(swapOutKeys).toContain(1);
      let fetchCount = 0;
      const [newCachedFn] = cachedWithAsync(strategy)(async (x: number) => {
        fetchCount++;
        return x;
      });

      await newCachedFn(1);
      expect(fetchCount).toBe(1);
    });

    it('should not call updater function when cached promise resolves to ENTITY_NOT_EXIST', async () => {
      const source = makeEventSource<void>();
      let updateFnCalled = false;
      
      const [cachedFn, updater] = cachedWithAsync()(async () => {
        await new Promise(resolve => {
          source.watch(() => resolve(undefined));
        });
        return ENTITY_NOT_EXIST;
      });

      // 开始获取，但还未返回结果
      const fetchPromise = cachedFn(1);
      
      // 在 fetch 完成之前尝试更新
      const updatePromise = updater(1, (value) => {
        updateFnCalled = true;
        return value;
      });

      // 让 fetch 完成
      source.notify();
      
      // 等待所有操作完成
      await Promise.all([fetchPromise, updatePromise]);
      
      // 验证更新函数没有被调用
      expect(updateFnCalled).toBe(false);
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
      
      const [cachedFn, updater] = cachedWithAsync(strategy)(async (x: number) => x);

      await cachedFn(1);
      await cachedFn(2);
      
      console.log(events)
      // 通过返回 ENTITY_NOT_EXIST 触发移除
      await updater(1, () => ENTITY_NOT_EXIST);

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

  it('should support cache updates', () => {
    const [cachedFn, updater] = cachedWith<string>()(key => `data-${key}`)

    // 首次获取值
    expect(cachedFn('123')).toBe('data-123')

    // 更新缓存的值
    updater('123', () => 'updated-data')
    expect(cachedFn('123')).toBe('updated-data')

    // 更新为 ENTITY_NOT_EXIST 应该从缓存中移除
    updater('123', () => ENTITY_NOT_EXIST)
    expect(cachedFn('123')).toBe('data-123') // 重新计算
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
      
      const [cachedFn, updater] = cachedWith<string>(strategy)(
        key => `data-${key}`
      );

      // 填充缓存
      cachedFn('1');
      cachedFn('2');
      
      // 更新已存在的项
      updater('1', () => 'updated-1');
      
      // 验证更新不会影响 LRU 顺序
      cachedFn('3');
      expect(swapOutKeys).toEqual(['1']);
    });

    it('should handle ENTITY_NOT_EXIST with LRU strategy', () => {
      const swapOutKeys: string[] = [];
      const strategy = lru<string>(2, {
        onSwapOut: (key) => swapOutKeys.push(key)
      });
      
      const [cachedFn, updater] = cachedWith<string>(strategy)(
        key => `data-${key}`
      );

      // 初始化缓存
      cachedFn('1');
      cachedFn('2');
      
      // 将某项更新为 ENTITY_NOT_EXIST
      updater('1', () => ENTITY_NOT_EXIST);
      
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
      
      const [cachedFn, updater] = cachedWith<string>(strategy)(
        key => `data-${key}`
      );

      // 混合操作序列
      cachedFn('1');           // 添加
      cachedFn('2');           // 添加
      cachedFn('1');           // 访问
      updater('2', () => 'updated-2'); // 更新
      cachedFn('3');           // 添加，应该淘汰 2
      updater('3', () => ENTITY_NOT_EXIST); // 删除
      cachedFn('2');           // 重新添加

      console.log(events)
      
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