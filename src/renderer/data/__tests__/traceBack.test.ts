import { traceBack } from '../interactionStreams';
import { buildMockNodes, mockInteractionApi } from '@/shared/mock/mockInteractionAPI'
import { streamToAsyncIterator } from '@/shared/utils/stream'


describe('traceBack', () => {
  const api = mockInteractionApi(
    buildMockNodes([
      {
        id: 1,
        type: "chat",
        children: [
          {
            id: 2,
            type: "nav",
            children: [
              { id: 3, type: "chat" },
              { id: 4, type: "chat" },
              { id: 5, type: "chat" },
              { id: 6, type: "nav" },
            ],
          },
        ],
      },
      { id: 7, type: "chat" },
      { id: 8, type: "chat" },
      {
        id: 9,
        type: "chat",
        children: [
          {
            id: 10,
            type: "nav",
            children: [
              { id: 11, type: "chat" },
              { id: 12, type: "chat" },
              { id: 13, type: "nav" },
            ],
          },
          { id: 14, type: "chat" },
          { id: 15, type: "chat" },
        ],
      },
    ])
  );

  it('should get the correct trace back from a chat interaction, the initial interaction should be excluded', async () => {
    const stream = traceBack(api)(4)
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([3, 2, 1])
  })

  it('should get the correct trace back from a nav interaction', async () => {
    const stream = traceBack(api)(2)
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([1])
  })

  it('should get the correct trace back from a deep nav interaction', async () => {
    const stream = traceBack(api)(13)
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([10, 9, 8, 7, 1])
  })

  it('should get the correct trace back from a deep chat interaction', async () => {
    const stream = traceBack(api)(12)
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([11, 10, 9, 8, 7, 1])
  })

  it('should handle the case when the context is not found', async () => {
    const stream = traceBack(api)(-1)
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([])
  })

  it('should handle pulling after closed', async () => {
    const stream = traceBack(api)(1)
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([])
    const reader = stream.getReader()
    const result = await reader.read()
    expect(result.done).toBe(true)
    expect(result.value).toBeUndefined()
  })

  it('should handle the case when the context is not found', async () => {
    const stream = traceBack({
      ...api,
      getInteraction: async (id) => (id === 1 ? null : api.getInteraction(id)),
    })(4);
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([3, 2])
  })
});


