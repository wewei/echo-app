export default {
  app: {
    name: 'Echo Chat',
    version: '1.0.0'
  },
  profile: {
    defaultName: '新用户',
    create: {
      title: '创建新账号',
      username: '用户名',
      avatar: '选择头像',
      submit: '创建',
      cancel: '取消'
    },
    current: '当前账号',
    switchTo: '切换到此账号',
    addNew: '添加新账号'
  },
  settings: {
    title: '设置',
    account: '账号',
    version: '版本',
    about: '关于',
    editProfile: '编辑个人资料',
    save: '保存',
    logout: '注销账号',
    logoutConfirmTitle: '确认注销',
    logoutConfirmMessage: '注销账号将删除所有数据，此操作不可恢复。确定要继续吗？',
    ai: {
      title: 'AI 设置',
      provider: 'AI 供应商',
      apiKey: 'API 密钥',
      endpoint: '服务端点',
      model: '模型',
      providers: {
        openai: 'OpenAI',
        deepseek: 'DeepSeek',
        azure: 'Azure OpenAI',
        ollama: 'Ollama'
      },
      models: {
        gpt35: 'GPT-3.5 Turbo',
        gpt4: 'GPT-4',
        deepseekChat: 'DeepSeek Chat',
        deepseekCoder: 'DeepSeek Coder',
        azureGpt35: 'Azure GPT-3.5 Turbo',
        azureGpt4: 'Azure GPT-4',
        ollamaDeepseekr132: 'DeepSeek R1 32b'
      },
      azure: {
        apiVersion: 'API 版本',
        deployment: '部署名称'
      }
    },
    search: {
      title: '搜索设置',
      provider: '搜索供应商',
      providers: {
        bing: 'Bing 搜索'
      },
      bing: {
        apiKey: 'Bing API 密钥'
      }
    },
    rag: {
      title: 'RAG 设置',
      provider: 'RAG 供应商',
      providers: {
        custom: '自定义'
      },
      custom: {
        endpoint: '服务端点',
        topK: '返回几个结果',
        distanceThreshold: '距离阈值'
      }
    }
  },
  welcome: {
    title: '欢迎使用 Echo Chat',
    subtitle: '创建一个个人资料开始聊天',
    createProfile: '创建个人资料'
  },
  common: {
    settings: '设置',
    back: '返回',
    cancel: '取消'
  },
  chat: {
    inputPlaceholder: '输入消息，按 Enter 发送...',
    error: {
      unknown: '发生未知错误',
      noSettings: '请先在设置中配置 AI 供应商',
      networkError: '网络连接错误',
      invalidResponse: '无效的响应',
      loadHistory: '加载历史消息失败'
    }
  }
}