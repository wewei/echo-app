import { traceBack } from '../interactionStreams';
import { buildMockNodes, mockInteractionApi } from '@/shared/mock/mockInteractionAPI'
import { BaseInteraction } from '@/shared/types/interactionsV2';
import { streamToAsyncIterator } from '@/shared/utils/stream'
import { faker } from '@faker-js/faker'


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
    const interaction = await api.getInteraction(4)
    const stream = traceBack(api)(interaction)
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([3, 2, 1])
  })

  it('should get the correct trace back from a nav interaction', async () => {
    const interaction = await api.getInteraction(2)
    const stream = traceBack(api)(interaction)
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([1])
  })

  it('should get the correct trace back from a deep nav interaction', async () => {
    const interaction = await api.getInteraction(13)
    const stream = traceBack(api)(interaction)
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([10, 9, 8, 7, 1])
  })

  it('should get the correct trace back from a deep chat interaction', async () => {
    const interaction = await api.getInteraction(12)
    const stream = traceBack(api)(interaction)
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([11, 10, 9, 8, 7, 1])
  })

  it('should handle the case when the chat context is not found', async () => {
    const interaction: BaseInteraction = {
      id: -1,
      type: "chat",
      userContent: faker.lorem.sentence(),
      contextId: null,
      createdAt: 0,
    };
    const stream = traceBack(api)(interaction)
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([])
  })

  it('should handle the case when the nav context is not found', async () => {
    const interaction: BaseInteraction = {
      id: -1,
      type: "nav",
      userContent: faker.internet.url(),
      contextId: null,
      createdAt: 0,
    };
    const stream = traceBack(api)(interaction)
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([])
  })

  it('should handle pulling after closed', async () => {
    const interaction = await api.getInteraction(1)
    const stream = traceBack(api)(interaction)
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
    const interaction = await api.getInteraction(4)
    const stream = traceBack({
      ...api,
      getInteraction: async (id) => (id === 1 ? null : api.getInteraction(id)),
    })(interaction);
    const ids: number[] = []
    for await (const chunk of streamToAsyncIterator(stream)) {
      ids.push(chunk.id)
    }
    expect(ids).toEqual([3, 2])
  })
});


