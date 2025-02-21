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


  describe('getNavIdsByUrl', () => {
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

  describe('getChatsByContextId', () => {
    beforeEach(() => {
      // 准备测试数据
      store.createChat({
        type: 'chat',
        userContent: '根对话',
        contextId: null,
        createdAt: 1000,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1100
      })

      const chat1 = store.createChat({
        type: 'chat',
        userContent: '第一条',
        contextId: null,
        createdAt: 2000,
        model: 'gpt-4',
        assistantContent: '回答1',
        updatedAt: 2100
      })

      store.createChat({
        type: 'chat',
        userContent: '回复1',
        contextId: chat1.id,
        createdAt: 3000,
        model: 'gpt-4',
        assistantContent: '回答2',
        updatedAt: 3100
      })

      store.createChat({
        type: 'chat',
        userContent: '回复2',
        contextId: chat1.id,
        createdAt: 4000,
        model: 'gpt-3.5',
        assistantContent: '回答3',
        updatedAt: 4100
      })
    })

    it('应该根据 contextId 查询对话', () => {
      const chats = store.getChats({ contextId: null })
      expect(chats).toHaveLength(2)
      expect(chats.map(c => c.userContent)).toEqual(['根对话', '第一条'])
    })

    it('应该根据时间范围筛选', () => {
      const chats = store.getChats({
        contextId: null,
        created: {
          after: 1500,
          before: 2500
        }
      })
      expect(chats).toHaveLength(1)
      expect(chats[0].userContent).toBe('第一条')
    })

    it('应该根据更新时间筛选', () => {
      const chats = store.getChats({
        contextId: null,
        updated: {
          after: 2000,
          before: 3000
        }
      })
      expect(chats).toHaveLength(1)
      expect(chats[0].updatedAt).toBe(2100)
    })

    it('应该根据模型筛选', () => {
      const chats = store.getChats({
        contextId: null,
        model: 'gpt-4'
      })
      expect(chats).toHaveLength(1)
      expect(chats[0].model).toBe('gpt-4')
    })

    it('应该限制返回数量', () => {
      const chats = store.getChats({
        contextId: null,
        limit: 1
      })
      expect(chats).toHaveLength(1)
    })

    it('应该组合多个条件', () => {
      const chats = store.getChats({
        contextId: null,
        created: { after: 1500 },
        model: 'gpt-4',
        limit: 1
      })
      expect(chats).toHaveLength(1)
      expect(chats[0].model).toBe('gpt-4')
      expect(chats[0].createdAt).toBeGreaterThan(1500)
    })
  })

  describe('getChatIdsByContextId', () => {
    let rootChat: ChatInteraction
    let replyIds: number[]

    beforeEach(() => {
      // 准备测试数据
      rootChat = store.createChat({
        type: 'chat',
        userContent: '根对话',
        contextId: null,
        createdAt: 1000,
        model: 'gpt-3.5',
        assistantContent: '你好！',
        updatedAt: 1100
      })

      replyIds = [2000, 3000, 4000].map(time => 
        store.createChat({
          type: 'chat',
          userContent: `回复${time}`,
          contextId: rootChat.id,
          createdAt: time,
          model: time === 3000 ? 'gpt-4' : 'gpt-3.5',
          assistantContent: `回答${time}`,
          updatedAt: time + 100
        }).id
      )
    })

    it('应该返回符合条件的对话 ID 列表', () => {
      const ids = store.getChatIds({
        contextId: rootChat.id
      })
      expect(ids).toEqual(replyIds)
    })

    it('应该根据创建时间筛选 ID', () => {
      const ids = store.getChatIds({
        contextId: rootChat.id,
        created: {
          after: 2500,
          before: 3500
        }
      })
      expect(ids).toEqual([replyIds[1]])
    })

    it('应该根据更新时间筛选 ID', () => {
      const ids = store.getChatIds({
        contextId: rootChat.id,
        updated: {
          after: 2100,
          before: 3200
        }
      })
      expect(ids).toEqual([replyIds[1]])
    })

    it('应该根据模型筛选 ID', () => {
      const ids = store.getChatIds({
        contextId: rootChat.id,
        model: 'gpt-4'
      })
      expect(ids).toEqual([replyIds[1]])
    })

    it('应该限制返回 ID 数量', () => {
      const ids = store.getChatIds({
        contextId: rootChat.id,
        limit: 2
      })
      expect(ids).toHaveLength(2)
      expect(ids).toEqual(replyIds.slice(0, 2))
    })

    it('应该组合多个条件筛选 ID', () => {
      const ids = store.getChatIds({
        contextId: rootChat.id,
        created: { after: 2500 },
        model: 'gpt-3.5',
        limit: 1
      })
      expect(ids).toEqual([replyIds[2]])
    })
  })
}) 