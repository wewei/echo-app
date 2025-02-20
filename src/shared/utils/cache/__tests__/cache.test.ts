import { makeCache, makeAsyncCache } from '../cache'
import { lru, unlimited } from '../strategies'
import { ENTITY_NOT_EXIST, EntityState } from '@/shared/types/entity'

describe('makeCache', () => {
  describe('基本功能', () => {
    it('应该正确存取值', () => {
      const cache = makeCache<string, number>()
      
      cache.set('key1', 100)
      expect(cache.get('key1')).toBe(100)
    })

    it('获取不存在的值应返回 ENTITY_NOT_EXIST', () => {
      const cache = makeCache<string, number>()
      expect(cache.get('nonexistent')).toBe(ENTITY_NOT_EXIST)
    })

    it('has 方法应正确判断值是否存在', () => {
      const cache = makeCache<string, number>()
      
      cache.set('key1', 100)
      expect(cache.has('key1')).toBe(true)
      expect(cache.has('nonexistent')).toBe(false)
    })

    it('del 方法应正确删除值', () => {
      const cache = makeCache<string, number>()
      
      cache.set('key1', 100)
      cache.del('key1')
      expect(cache.get('key1')).toBe(ENTITY_NOT_EXIST)
      expect(cache.has('key1')).toBe(false)
    })
  })

  describe('缓存策略', () => {
    it('应该正确触发 onGet 回调', () => {
      const onGet = jest.fn()
      const cache = makeCache<string, number>({ onGet })
      
      cache.set('key1', 100)
      cache.get('key1')
      cache.get('nonexistent')
      
      expect(onGet).toHaveBeenCalledTimes(1)
      expect(onGet).toHaveBeenCalledWith('key1')
    })

    it('应该正确触发 onSet/onAdd 回调', () => {
      const onSet = jest.fn()
      const onAdd = jest.fn()
      const cache = makeCache<string, number>({ onSet, onAdd })
      
      // 新增值应触发 onAdd
      cache.set('key1', 100)
      expect(onAdd).toHaveBeenCalledWith('key1')
      expect(onSet).not.toHaveBeenCalled()
      
      // 更新值应触发 onSet
      cache.set('key1', 200)
      expect(onSet).toHaveBeenCalledWith('key1')
      expect(onAdd).toHaveBeenCalledTimes(1)
    })

    it('应该正确触发 onDel 回调', () => {
      const onDel = jest.fn()
      const cache = makeCache<string, number>({ onDel })
      
      cache.set('key1', 100)
      cache.del('key1')
      
      expect(onDel).toHaveBeenCalledWith('key1')
    })

    it('应该正确处理 suggestSwapOut', () => {
      const onDel = jest.fn()
      const suggestSwapOut = jest.fn().mockReturnValue('key1')
      const cache = makeCache<string, number>({ onDel, suggestSwapOut })
      
      cache.set('key1', 100)
      cache.set('key2', 200)
      
      expect(suggestSwapOut).toHaveBeenCalled()
      expect(onDel).toHaveBeenCalledWith('key1')
      expect(cache.has('key1')).toBe(false)
    })
  })
})

describe('makeAsyncCache', () => {
  describe('基本功能', () => {
    it('应该正确存取异步值', async () => {
      const cache = makeAsyncCache<string, number>()
      const promise = Promise.resolve(100)
      
      cache.set('key1', promise)
      expect(await cache.get('key1')).toBe(100)
    })

    it('获取不存在的值应返回 ENTITY_NOT_EXIST', () => {
      const cache = makeAsyncCache<string, number>()
      expect(cache.get('nonexistent')).toBe(ENTITY_NOT_EXIST)
    })
  })

  describe('错误处理', () => {
    it('应该在 Promise reject 时删除缓存项', async () => {
      const cache = makeAsyncCache<string, number>()
      const promise = Promise.reject(new Error('failed'))
      
      cache.set('key1', promise)
      await expect(cache.get('key1')).rejects.toThrow('failed')
      
      // 等待下一个事件循环，让 Promise rejection 处理完成
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(cache.has('key1')).toBe(false)
    })

    it('应该在返回 ENTITY_NOT_EXIST 时删除缓存项', async () => {
      const cache = makeAsyncCache<string, EntityState<number>>()
      const promise = Promise.resolve(ENTITY_NOT_EXIST)
      
      cache.set('key1', promise)
      await cache.get('key1')
      
      // 等待下一个事件循环，让 Promise 处理完成
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(cache.has('key1')).toBe(false)
    })
  })

  describe('与缓存策略集成', () => {
    it('应该与 LRU 策略正确工作', async () => {
      const swapOutKeys: string[] = []
      const strategy = lru<string>(2, {
        onSwapOut: key => swapOutKeys.push(key)
      })
      const cache = makeAsyncCache<string, number>(strategy)
      
      cache.set('key1', Promise.resolve(100))
      cache.set('key2', Promise.resolve(200))
      cache.set('key3', Promise.resolve(300))
      
      await Promise.all([
        cache.get('key2'),
        cache.get('key3')
      ])
      
      expect(swapOutKeys).toContain('key1')
      expect(cache.has('key1')).toBe(false)
    })

    it('应该与 unlimited 策略正确工作', async () => {
      const events: Array<{ type: string, key: string }> = []
      const strategy = unlimited<string>({
        onSwapIn: key => events.push({ type: 'in', key }),
        onSwapOut: key => events.push({ type: 'out', key })
      })
      const cache = makeAsyncCache<string, number>(strategy)
      
      cache.set('key1', Promise.resolve(100))
      cache.del('key1')
      
      expect(events).toEqual([
        { type: 'in', key: 'key1' },
        { type: 'out', key: 'key1' }
      ])
    })

    it('应该正确处理空策略', async () => {
      const cache = makeAsyncCache<string, number>({})
      cache.set('key1', Promise.resolve(100))
      cache.del('key1')
      expect(cache.has('key1')).toBe(false)
    })
  })
}) 