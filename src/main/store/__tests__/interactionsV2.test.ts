import { createInteractionStore } from '../interactionsV2'
import { ChatInteraction, NavInteraction } from '@/shared/types/interactionsV2'
import { EntityData } from '@/shared/types/entity'
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
    it('应该正确创建聊天交互并生成ID', () => {
      const chatData: EntityData<ChatInteraction> = {
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！有什么我可以帮你的吗？',
        updatedAt: 1234567891
      }

      const chat = store.createChat(chatData)
      expect(chat.id).toBeDefined()
      
      const result = store.getInteraction(chat.id)
      expect(result).toEqual(chat)
    })

    it('应该正确处理带有上下文的聊天交互', () => {
      const chat1Data: EntityData<ChatInteraction> = {
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      }

      const chat1 = store.createChat(chat1Data)

      const chat2Data: EntityData<ChatInteraction> = {
        type: 'chat',
        userContent: '今天天气如何？',
        contextId: chat1.id,
        createdAt: 1234567892,
        model: 'gpt-3.5',
        assistantContent: '今天天气晴朗',
        updatedAt: 1234567893
      }

      const chat2 = store.createChat(chat2Data)
      
      const result1 = store.getInteraction(chat1.id)
      const result2 = store.getInteraction(chat2.id)
      
      expect(result1).toEqual(chat1)
      expect(result2).toEqual(chat2)
      expect((result2 as ChatInteraction).contextId).toBe(chat1.id)
    })

    it('相同上下文和内容的聊天应更新而不是创建新记录', () => {
      const chatData: EntityData<ChatInteraction> = {
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      }

      const chat1 = store.createChat(chatData)
      
      const updatedChatData = {
        ...chatData,
        assistantContent: '更新的回复',
        updatedAt: 1234567892
      }

      const chat2 = store.createChat(updatedChatData)
      
      expect(chat1.id).toBe(chat2.id)
      const result = store.getInteraction(chat1.id)
      expect(result).toEqual(chat2)
    })
  })

  describe('createNav', () => {
    it('应该正确创建导航交互并生成ID', () => {
      const navData: EntityData<NavInteraction> = {
        type: 'nav',
        userContent: 'https://example.com',
        contextId: null,
        createdAt: 1234567890,
        title: '示例网站',
        description: '这是一个示例网站',
        favIconUrl: 'https://example.com/favicon.ico',
        imageAssetId: 'asset123',
        updatedAt: 1234567891
      }

      store.createNav(navData)
      const result = store.getNavsByUrl('https://example.com')
      expect(result).toBeDefined()
      expect(result[0].title).toBe('示例网站')
    })

    it('相同URL和上下文的导航应更新而不是创建新记录', () => {
      const navData: EntityData<NavInteraction> = {
        type: 'nav',
        userContent: 'https://example.com',
        contextId: null,
        createdAt: 1234567890,
        title: '示例网站',
        description: null,
        favIconUrl: null,
        imageAssetId: null,
        updatedAt: 1234567891
      }

      store.createNav(navData)
      
      const updatedNavData = {
        ...navData,
        title: '更新的标题',
        updatedAt: 1234567892
      }

      store.createNav(updatedNavData)
      
      const result = store.getNavsByUrl('https://example.com')
      expect(result[0].title).toBe('更新的标题')
    })
  })


  describe('getNavsByUrl', () => {
    it('应该返回所有匹配 URL 的导航记录，按创建时间降序排序', () => {
      const navData1: EntityData<NavInteraction> = {
        type: 'nav',
        userContent: 'https://example.com',
        contextId: null,
        createdAt: 1234567890,
        title: '旧记录',
        description: null,
        favIconUrl: null,
        imageAssetId: null,
        updatedAt: 1234567891
      }

      const nav1 = store.createNav(navData1)

      const navData2: EntityData<NavInteraction> = {
        type: 'nav',
        userContent: 'https://example.com',
        contextId: nav1.id,
        createdAt: 1234567892,
        title: '新记录',
        description: null,
        favIconUrl: null,
        imageAssetId: null,
        updatedAt: 1234567893
      }

      const nav2 = store.createNav(navData2)
      
      const results = store.getNavsByUrl('https://example.com')
      expect(results).toHaveLength(2)
      expect(results[0].title).toBe('新记录')
      expect(results[1].title).toBe('旧记录')
      expect(results[0].createdAt).toBeGreaterThan(results[1].createdAt)
    })

    it('当 URL 不存在时应返回空数组', () => {
      const results = store.getNavsByUrl('https://nonexistent.com')
      expect(results).toEqual([])
    })

    it('应该只返回匹配 URL 的导航记录', () => {
      const nav1: EntityData<NavInteraction> = {
        type: 'nav',
        userContent: 'https://example.com',
        contextId: null,
        createdAt: 1234567890,
        title: '示例网站',
        description: null,
        favIconUrl: null,
        imageAssetId: null,
        updatedAt: 1234567891
      }

      const nav2: EntityData<NavInteraction> = {
        type: 'nav',
        userContent: 'https://other.com',
        contextId: null,
        createdAt: 1234567892,
        title: '其他网站',
        description: null,
        favIconUrl: null,
        imageAssetId: null,
        updatedAt: 1234567893
      }

      store.createNav(nav1)
      store.createNav(nav2)

      const results = store.getNavsByUrl('https://example.com')
      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('示例网站')
      expect(results[0].userContent).toBe('https://example.com')
    })
  })

  describe('getInteraction', () => {
    it('应该返回 null 当 ID 不存在时', () => {
      const result = store.getInteraction('nonexistent')
      expect(result).toBeNull()
    })

    it('应该正确区分不同类型的交互', () => {
      const chatData: EntityData<ChatInteraction> = {
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      }

      const navData: EntityData<NavInteraction> = {
        type: 'nav',
        userContent: 'https://example.com',
        contextId: null,
        createdAt: 1234567890,
        title: '示例网站',
        description: null,
        favIconUrl: null,
        imageAssetId: null,
        updatedAt: 1234567891
      }

      const chat = store.createChat(chatData)
      const nav = store.createNav(navData)

      const chatResult = store.getInteraction(chat.id)
      const navResult = store.getInteraction(nav.id)

      expect(chatResult?.type).toBe('chat')
      expect(navResult?.type).toBe('nav')
      expect((chatResult as ChatInteraction).model).toBe('gpt-3.5')
      expect((navResult as NavInteraction).title).toBe('示例网站')
    })
  })
}) 