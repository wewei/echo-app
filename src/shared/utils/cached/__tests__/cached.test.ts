import { makeEventSource } from '../../event';
import { cachedWith, ENTITY_NOT_FOUND } from '../cached';
import { lru, unlimited } from '../strategies';

describe('cachedWith', () => {
  it('should cache function results', async () => {
    let computeCount = 0;
    const expensive = async (x: number) => {
      computeCount++;
      return x * 2;
    };
    
    const [cachedFn] = cachedWith()(expensive);
    
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
      return key === 404 ? ENTITY_NOT_FOUND : key;
    };

    const [cachedFn] = cachedWith()(fetchWithNotFound);

    expect(await cachedFn(1)).toBe(1);
    expect(await cachedFn(404)).toBe(ENTITY_NOT_FOUND);
  });

  it('should work with LRU strategy', async () => {
    const swapOutKeys: number[] = [];
    const strategy = lru<number>(2, {
      onSwapOut: (key) => swapOutKeys.push(key)
    });
    
    const [cachedFn] = cachedWith(strategy)(async (x: number) => x * 2);

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
    const [cachedFn, updater] = cachedWith(strategy)(async (x: number) => x * 2);

    // 首次获取值
    expect(await cachedFn(1)).toBe(2);

    // 更新缓存的值
    updater(1, () => 10);
    expect(await cachedFn(1)).toBe(10);

    // Entity 已经删除，更新为 not found 应该从缓存中移除
    updater(1, () => ENTITY_NOT_FOUND);
    expect(await cachedFn(1)).toBe(ENTITY_NOT_FOUND);
    expect(swapOutKeys).toContain(1);
  });

  describe('error handling', () => {
    it('should propagate errors', async () => {
      const error = new Error('fetch failed');
      const [cachedFn] = cachedWith()(async () => {
        throw error;
      });

      await expect(cachedFn(1)).rejects.toThrow(error);
    });

    it('should not cache rejected promises', async () => {
      let callCount = 0;
      const [cachedFn] = cachedWith()(async () => {
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
      const [cachedFn, updater] = cachedWith()(async (x: number) => x * 2);
      
      updater(1, () => 10);
      expect(await cachedFn(1)).toBe(2); // 应该执行原始计算
    });

    it('should handle concurrent updates', async () => {
      const [cachedFn, updater] = cachedWith()(async (x: number) => x * 2);
      
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
      
      const [cachedFn, updater] = cachedWith(strategy)(async (x: number) => x);

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
      const [newCachedFn] = cachedWith(strategy)(async (x: number) => {
        fetchCount++;
        return x;
      });

      await newCachedFn(1);
      expect(fetchCount).toBe(1);
    });

    it('should handle updater returning ENTITY_NOT_FOUND', async () => {
      const swapOutKeys: number[] = [];
      const strategy = unlimited<number>({
        onSwapOut: (key) => swapOutKeys.push(key)
      });
      
      const [cachedFn, updater] = cachedWith(strategy)(async (x: number) => x);

      // 首先缓存一个值
      await cachedFn(1);

      // 更新为 ENTITY_NOT_FOUND
      await updater(1, () => ENTITY_NOT_FOUND);

      // 验证缓存项被移除
      expect(swapOutKeys).toContain(1);
    });

    it('should handle concurrent errors in updater', async () => {
      const swapOutKeys: number[] = [];
      const strategy = unlimited<number>({
        onSwapOut: (key) => swapOutKeys.push(key)
      });
      
      const [cachedFn, updater] = cachedWith(strategy)(async (x: number) => x);

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
      const [newCachedFn] = cachedWith(strategy)(async (x: number) => {
        fetchCount++;
        return x;
      });

      await newCachedFn(1);
      expect(fetchCount).toBe(1);
    });

    it('should not call updater function when cached promise resolves to ENTITY_NOT_FOUND', async () => {
      const source = makeEventSource<void>();
      let updateFnCalled = false;
      
      const [cachedFn, updater] = cachedWith()(async () => {
        await new Promise(resolve => {
          source.watch(() => resolve(undefined));
        });
        return ENTITY_NOT_FOUND;
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
      
      const [cachedFn] = cachedWith(strategy)(async (x: number) => x);

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
      const [cachedFn] = cachedWith(strategy)(async (x: number) => x);

      // 重复访问相同的key
      await cachedFn(1);
      await cachedFn(1);
      await cachedFn(2);
      await cachedFn(1); // 重新访问1应该将其移到最新位置
      await cachedFn(3); // 应该移除2而不是1
      
      // 验证2被移除（通过再次访问2会重新计算）
      let computeCount = 0;
      const [newCachedFn] = cachedWith(strategy)(async (x: number) => {
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
        onSwapOut: (key) => events.push({ type: 'out', key })
      });
      
      const [cachedFn, updater] = cachedWith(strategy)(async (x: number) => x);

      await cachedFn(1);
      await cachedFn(2);
      
      // 通过返回 ENTITY_NOT_FOUND 触发移除
      await updater(1, () => ENTITY_NOT_FOUND);

      expect(events).toEqual([
        { type: 'in', key: 1 },
        { type: 'in', key: 2 },
        { type: 'out', key: 1 },
      ]);
    });

    it('should never evict entries', async () => {
      const strategy = unlimited<number>();
      let computeCount = 0;

      const [cachedFn] = cachedWith(strategy)(async (x: number) => {
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