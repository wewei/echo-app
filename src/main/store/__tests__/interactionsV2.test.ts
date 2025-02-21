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
      expect(typeof chat.id).toBe('number')
      expect(chat.id).toBeGreaterThan(0)
      
      const result = {
        ...store.getInteraction(chat.id),
        ...store.getChatState(chat.id)
      }
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
      
      const result1 = {
        ...store.getInteraction(chat1.id),
        ...store.getChatState(chat1.id)
      }
      const result2 = {
        ...store.getInteraction(chat2.id),
        ...store.getChatState(chat2.id)
      }
      
      expect(result1).toEqual(chat1)
      expect(result2).toEqual(chat2)
      expect((result2 as ChatInteraction).contextId).toBe(chat1.id)
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

      store.createNav(navData2)
      
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
      const result = store.getInteraction(-1)
      expect(result).toBeNull()
    })

    it('应该只返回基础交互信息', () => {
      const chatData: EntityData<ChatInteraction> = {
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      }

      const chat = store.createChat(chatData)
      const result = store.getInteraction(chat.id)

      // 只包含基础字段
      expect(result).toEqual({
        id: chat.id,
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890
      })

      // State 需要单独获取
      const state = store.getChatState(chat.id)
      expect(state).toEqual({
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      })
    })
  })

  describe('getChatState', () => {
    it('应该返回 null 当 ID 不存在时', () => {
      const result = store.getChatState(-1)
      expect(result).toBeNull()
    })

    it('应该正确获取 ChatState', () => {
      const chatData: EntityData<ChatInteraction> = {
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      }

      const chat = store.createChat(chatData)
      const state = store.getChatState(chat.id)

      expect(state).toEqual({
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      })
    })
  })

  describe('getNavState', () => {
    it('应该返回 null 当 ID 不存在时', () => {
      const result = store.getNavState(-1)
      expect(result).toBeNull()
    })

    it('应该正确获取 NavState', () => {
      const navData: EntityData<NavInteraction> = {
        type: 'nav',
        userContent: 'https://example.com',
        contextId: null,
        createdAt: 1234567890,
        title: '示例网站',
        description: '描述',
        favIconUrl: 'favicon.ico',
        imageAssetId: 'img1',
        updatedAt: 1234567891
      }

      const nav = store.createNav(navData)
      const state = store.getNavState(nav.id)

      expect(state).toEqual({
        title: '示例网站',
        description: '描述',
        favIconUrl: 'favicon.ico',
        imageAssetId: 'img1',
        updatedAt: 1234567891
      })
    })
  })

  describe('getChatsByContextId', () => {
    it('应该返回上下文相关的所有聊天', () => {
      const chat1 = store.createChat({
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      })

      const chat2 = store.createChat({
        type: 'chat',
        userContent: '问题1',
        contextId: chat1.id,
        createdAt: 1234567892,
        model: 'gpt-3.5',
        assistantContent: '回答1',
        updatedAt: 1234567893
      })

      const chat3 = store.createChat({
        type: 'chat',
        userContent: '问题2',
        contextId: chat1.id,
        createdAt: 1234567894,
        model: 'gpt-3.5',
        assistantContent: '回答2',
        updatedAt: 1234567895
      })

      const results = store.getChatsByContextId(chat1.id, null, 10)
      expect(results).toHaveLength(2)
      expect(results.map(r => r.id)).toEqual([chat2.id, chat3.id])
    })

    it('当上下文不存在时应返回空数组', () => {
      const results = store.getChatsByContextId(-1, null, 10)
      expect(results).toEqual([])
    })

    it('应该返回没有上下文的聊天记录', () => {
      const chat1 = store.createChat({
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      })

      const chat2 = store.createChat({
        type: 'chat',
        userContent: '另一个问题',
        contextId: null,
        createdAt: 1234567892,
        model: 'gpt-3.5',
        assistantContent: '另一个回答',
        updatedAt: 1234567893
      })
      console.log(chat1, chat2)

      const results = store.getChatsByContextId(null, null, 10)
      expect(results).toHaveLength(2)
      expect(results.map(r => r.id)).toEqual([chat1.id, chat2.id])
    })

    it('应该根据 lastId 分页返回聊天记录', () => {
      const chats = Array.from({ length: 3 }).map((_, i) => 
        store.createChat({
          type: 'chat',
          userContent: `消息${i}`,
          contextId: null,
          createdAt: 1234567890 + i * 2,
          model: 'gpt-3.5',
          assistantContent: `回答${i}`,
          updatedAt: 1234567891 + i * 2
        })
      )

      // 按创建时间顺序排列，获取第二页
      const results = store.getChatsByContextId(null, chats[1].id, 10)
      expect(results).toHaveLength(2)
      expect(results.map(r => r.id)).toEqual([chats[0].id, chats[1].id])
    })

    it('应该根据 lastId 分页返回特定上下文的聊天记录', () => {
      const rootChat = store.createChat({
        type: 'chat',
        userContent: '根消息',
        contextId: null,
        createdAt: 1234567880,
        model: 'gpt-3.5',
        assistantContent: '根回答',
        updatedAt: 1234567881
      })

      const contextChats = Array.from({ length: 3 }).map((_, i) => 
        store.createChat({
          type: 'chat',
          userContent: `上下文消息${i}`,
          contextId: rootChat.id,
          createdAt: 1234567890 + i * 2,
          model: 'gpt-3.5',
          assistantContent: `上下文回答${i}`,
          updatedAt: 1234567891 + i * 2
        })
      )

      // 按创建时间顺序排列，获取第二页的上下文消息
      const results = store.getChatsByContextId(rootChat.id, contextChats[1].id, 10)
      expect(results).toHaveLength(2)
      expect(results.map(r => r.id)).toEqual([contextChats[0].id, contextChats[1].id])
    })

    it('应该根据 limit 限制返回聊天记录', () => {
      const chats = Array.from({ length: 3 }).map((_, i) => 
        store.createChat({
          type: 'chat',
          userContent: `消息${i}`,
          contextId: null,
          createdAt: 1234567890 + i * 2,
          model: 'gpt-3.5',
          assistantContent: `回答${i}`,
          updatedAt: 1234567891 + i * 2
        }) 
      )

      const results = store.getChatsByContextId(null, null, 1)
      expect(results).toHaveLength(1)
      expect(results.map(r => r.id)).toEqual([chats[0].id])
    })
  })

  describe('getChatIdsByContextId & getNavIdsByUrl', () => {
    it('应该只返回 ID 列表', () => {
      const chat1 = store.createChat({
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      })

      store.createChat({
        type: 'chat',
        userContent: '问题1',
        contextId: chat1.id,
        createdAt: 1234567892,
        model: 'gpt-3.5',
        assistantContent: '回答1',
        updatedAt: 1234567893
      })

      const ids = store.getChatIdsByContextId(chat1.id, null, 10)
      expect(ids).toHaveLength(1)
      expect(typeof ids[0]).toBe('number')
    })

    it('应该返回匹配 URL 的导航 ID 列表', () => {
      const nav1 = store.createNav({
        type: 'nav',
        userContent: 'https://example.com',
        contextId: null,
        createdAt: 1234567890,
        title: '示例1',
        description: null,
        favIconUrl: null,
        imageAssetId: null,
        updatedAt: 1234567891
      })

      const nav2 = store.createNav({
        type: 'nav',
        userContent: 'https://example.com',
        contextId: null,
        createdAt: 1234567892,
        title: '示例2',
        description: null,
        favIconUrl: null,
        imageAssetId: null,
        updatedAt: 1234567893
      })

      const ids = store.getNavIdsByUrl('https://example.com')
      expect(ids).toHaveLength(2)
      expect(ids).toEqual([nav1.id, nav2.id])
    })

    it('应该返回没有上下文的聊天ID列表', () => {
      const chat1 = store.createChat({
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1234567891
      })

      const chat2 = store.createChat({
        type: 'chat',
        userContent: '另一个问题',
        contextId: null,
        createdAt: 1234567892,
        model: 'gpt-3.5',
        assistantContent: '另一个回答',
        updatedAt: 1234567893
      })

      const ids = store.getChatIdsByContextId(null, null, 10)
      expect(ids).toHaveLength(2)
      expect(ids).toEqual([chat1.id, chat2.id])
    })

    it('应该根据 lastId 分页返回聊天ID列表', () => {
      const chats = Array.from({ length: 3 }).map((_, i) => 
        store.createChat({
          type: 'chat',
          userContent: `消息${i}`,
          contextId: null,
          createdAt: 1234567890 + i * 2,
          model: 'gpt-3.5',
          assistantContent: `回答${i}`,
          updatedAt: 1234567891 + i * 2
        })
      )

      // 按创建时间降序排列，获取第二页
      const ids = store.getChatIdsByContextId(null, chats[1].id, 10)
      expect(ids).toHaveLength(2)
      expect(ids).toEqual([chats[0].id, chats[1].id])
    })

    it('应该根据 lastId 分页返回特定上下文的聊天ID列表', () => {
      const rootChat = store.createChat({
        type: 'chat',
        userContent: '根消息',
        contextId: null,
        createdAt: 1234567880,
        model: 'gpt-3.5',
        assistantContent: '根回答',
        updatedAt: 1234567881
      })

      const contextChats = Array.from({ length: 3 }).map((_, i) => 
        store.createChat({
          type: 'chat',
          userContent: `上下文消息${i}`,
          contextId: rootChat.id,
          createdAt: 1234567890 + i * 2,
          model: 'gpt-3.5',
          assistantContent: `上下文回答${i}`,
          updatedAt: 1234567891 + i * 2
        })
      )

      // 按创建时间降序排列，获取第二页的上下文消息ID
      const ids = store.getChatIdsByContextId(rootChat.id, contextChats[1].id, 10)
      expect(ids).toHaveLength(2)
      expect(ids).toEqual([contextChats[0].id, contextChats[1].id])
    })

    it('应该根据 limit 限制返回聊天ID列表', () => {
      const chats = Array.from({ length: 3 }).map((_, i) => 
        store.createChat({
          type: 'chat',
          userContent: `消息${i}`,
          contextId: null,
          createdAt: 1234567890 + i * 2,
          model: 'gpt-3.5',
          assistantContent: `回答${i}`,
          updatedAt: 1234567891 + i * 2
        })
      )

      const ids = store.getChatIdsByContextId(null, null, 1)
      expect(ids).toHaveLength(1)
      expect(ids).toEqual([chats[0].id])
    })
  })

  describe('appendAssistantContent', () => {
    it('应该正确追加内容并更新时间戳', () => {
      const chat = store.createChat({
        type: 'chat',
        userContent: '你好',
        contextId: null,
        createdAt: 1234567890,
        model: 'gpt-3.5',
        assistantContent: '你好',
        updatedAt: 1234567891
      })

      store.appendAssistantContent(chat.id, '！', 1234567892)
      
      const state = store.getChatState(chat.id)
      expect(state?.assistantContent).toBe('你好！')
      expect(state?.updatedAt).toBe(1234567892)
    })
  })

  describe('updateNavState', () => {
    it('应该正确更新部分字段', () => {
      const nav = store.createNav({
        type: 'nav',
        userContent: 'https://example.com',
        contextId: null,
        createdAt: 1234567890,
        title: '旧标题',
        description: '旧描述',
        favIconUrl: null,
        imageAssetId: null,
        updatedAt: 1234567891
      })

      store.updateNavState(nav.id, {
        title: '新标题',
        updatedAt: 1234567892
      })

      const state = store.getNavState(nav.id)
      expect(state).toEqual({
        title: '新标题',
        description: '旧描述',
        favIconUrl: null,
        imageAssetId: null,
        updatedAt: 1234567892
      })
    })
  })
}) 