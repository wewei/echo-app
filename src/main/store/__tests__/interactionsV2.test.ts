import { createInteractionStore } from '../interactionsV2'
import { ChatInteraction, NavigationInteraction } from '@/shared/types/interactionsV2'
import path from 'path'
import fs from 'fs'

describe('InteractionStore', () => {
  const testDbPath = path.join(__dirname, 'test.db')
  let store: ReturnType<typeof createInteractionStore>

  beforeEach(() => {
    // 每个测试前删除测试数据库
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath)
    }
    store = createInteractionStore(testDbPath)
  })

  afterEach(() => {
    store.close()
    // 测试后清理数据库文件
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath)
    }
  })

  describe('createChat', () => {
    it('应该正确创建聊天交互', () => {
      const chat: ChatInteraction = {
        id: 'chat1',
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！有什么我可以帮你的吗？',
        updatedAt: 1234567891
      }

      store.createChat(chat)
      const result = store.getInteraction('chat1')
      expect(result).toEqual(chat)
    })

    it('应该正确处理带有上下文的聊天交互', () => {
      const chat1: ChatInteraction = {
        id: 'chat1',
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      }

      const chat2: ChatInteraction = {
        id: 'chat2',
        type: 'chat',
        userContent: '今天天气如何？',
        contextId: 'chat1',
        createdAt: 1234567892,
        model: 'gpt-3.5',
        assistantContent: '今天天气晴朗',
        updatedAt: 1234567893
      }

      store.createChat(chat1)
      store.createChat(chat2)
      
      const result1 = store.getInteraction('chat1')
      const result2 = store.getInteraction('chat2')
      
      expect(result1).toEqual(chat1)
      expect(result2).toEqual(chat2)
      expect((result2 as ChatInteraction).contextId).toBe(chat1.id)
    })
  })

  describe('createNavigation', () => {
    it('应该正确创建导航交互', () => {
      const navigation: NavigationInteraction = {
        id: 'nav1',
        type: 'navigation',
        userContent: 'https://example.com',
        contextId: null,
        createdAt: 1234567890,
        title: '示例网站',
        description: '这是一个示例网站',
        favIconUrl: 'https://example.com/favicon.ico',
        imageAssetId: 'asset123',
        updatedAt: 1234567891
      }

      store.createNavigation(navigation)
      const result = store.getInteraction('nav1')
      expect(result).toEqual(navigation)
    })

    it('应该正确处理可选字段为 null 的导航交互', () => {
      const navigation: NavigationInteraction = {
        id: 'nav1',
        type: 'navigation',
        userContent: 'https://example.com',
        contextId: null,
        createdAt: 1234567890,
        title: '示例网站',
        description: null,
        favIconUrl: null,
        imageAssetId: null,
        updatedAt: 1234567891
      }

      store.createNavigation(navigation)
      const result = store.getInteraction('nav1')
      expect(result).toEqual(navigation)
    })
  })

  describe('getInteraction', () => {
    it('应该返回 null 当 ID 不存在时', () => {
      const result = store.getInteraction('nonexistent')
      expect(result).toBeNull()
    })

    it('应该正确区分不同类型的交互', () => {
      const chat: ChatInteraction = {
        id: 'chat1',
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      }

      const navigation: NavigationInteraction = {
        id: 'nav1',
        type: 'navigation',
        userContent: 'https://example.com',
        contextId: null,
        createdAt: 1234567890,
        title: '示例网站',
        description: null,
        favIconUrl: null,
        imageAssetId: null,
        updatedAt: 1234567891
      }

      store.createChat(chat)
      store.createNavigation(navigation)

      const chatResult = store.getInteraction('chat1')
      const navResult = store.getInteraction('nav1')

      expect(chatResult?.type).toBe('chat')
      expect(navResult?.type).toBe('navigation')
      expect((chatResult as ChatInteraction).model).toBe('gpt-3.5')
      expect((navResult as NavigationInteraction).title).toBe('示例网站')
    })
  })
}) 