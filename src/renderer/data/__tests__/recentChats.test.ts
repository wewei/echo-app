import { recentChats } from '../interactionStreams'
import { buildMockNodes, mockInteractionApi } from '@/shared/mock/mockInteractionAPI'
import { streamToAsyncIterator } from '@/shared/utils/stream'

describe('recentChats', () => {
  const api = mockInteractionApi(
    buildMockNodes([
      {
        id: 1,
        type: "chat",
        children: [
          { id: 2, type: "chat" },
          { id: 3, type: "chat" },
        ],
      },
      {
        id: 4,
        type: "chat",
        children: [
          { id: 5, type: "chat" },
        ],
      },
      { id: 6, type: "chat" },
    ])
  )

  it('在不传入 contextId 时应该按时间倒序返回所有对话', async () => {
    const stream = recentChats({ getChats: api.getChats })()
    const ids: number[] = []
    for await (const chat of streamToAsyncIterator(stream)) {
      ids.push(chat.id)
    }
    expect(ids).toEqual([6, 5, 4, 3, 2, 1])
  })

  it('在传入 contextId 时应该按时间倒序返回指定上下文的对话', async () => {
    const stream = recentChats({ getChats: api.getChats })(1)
    const ids: number[] = []
    for await (const chat of streamToAsyncIterator(stream)) {
      ids.push(chat.id)
    }
    expect(ids).toEqual([3, 2])
  })

  it('应该分批返回对话', async () => {
    const getChats = jest.fn(api.getChats)
    const stream = recentChats({ getChats, batchLimit: 2 })(undefined, api.maxCreatedAt + 1)
    const ids: number[] = []
    
    for await (const chat of streamToAsyncIterator(stream)) {
      ids.push(chat.id)
    }

    expect(ids).toEqual([6, 5, 4, 3, 2, 1])
    // 应该被调用 4 次，前三次返回 2 个，最后一次返回 0 个，返回数量少于 batchLimit 时，会关闭流
    expect(getChats).toHaveBeenCalledTimes(4)

    getChats.mockClear()

    const stream2 = recentChats({ getChats, batchLimit: 4 })(undefined, api.maxCreatedAt + 1)
    const ids2: number[] = []
    for await (const chat of streamToAsyncIterator(stream2)) {
      ids2.push(chat.id)
    }
    expect(ids2).toEqual([6, 5, 4, 3, 2, 1])
    // 应该被调用 2 次，前一次返回 4 个，后一次返回 2 个，返回数量少于 batchLimit 时，会关闭流
    expect(getChats).toHaveBeenCalledTimes(2)
  })

  it('当没有更多数据时应该关闭流', async () => {
    const stream = recentChats({ getChats: api.getChats })()
    const reader = stream.getReader()
    
    // 读取所有数据
    while (!(await reader.read()).done);
    
    // 再次读取应该返回 done
    const result = await reader.read()
    expect(result.done).toBe(true)
    expect(result.value).toBeUndefined()
  })

  it('应该处理空结果', async () => {
    const emptyApi = mockInteractionApi(buildMockNodes([]))
    const stream = recentChats({ getChats: emptyApi.getChats })()
    const ids: number[] = []
    
    for await (const chat of streamToAsyncIterator(stream)) {
      ids.push(chat.id)
    }
    expect(ids).toEqual([])
  })

  it('应该正确处理错误', async () => {
    const errorApi = {
      getChats: () => Promise.reject(new Error('API Error'))
    }
    const stream = recentChats({ getChats: errorApi.getChats })()
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for await (const _ of streamToAsyncIterator(stream)) {
        // 不应该执行到这里
        expect(true).toBe(false)
      }
    } catch (error) {
      expect(error.message).toBe('API Error')
    }
  })

  it('应该正确处理自定义批量大小', async () => {
    const getChats = jest.fn(api.getChats)
    const stream = recentChats({ getChats, batchLimit: 1 })()
    const ids: number[] = []
    
    for await (const chat of streamToAsyncIterator(stream)) {
      ids.push(chat.id)
    }

    expect(ids).toEqual([6, 5, 4, 3, 2, 1])
    // 应该被调用 7 次，前 6 次返回 1 个，最后一次返回 0 个，返回数量少于 batchLimit 时，会关闭流
    expect(getChats).toHaveBeenCalledTimes(7)
  })
})
