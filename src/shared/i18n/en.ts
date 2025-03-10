export default {
  app: {
    name: 'Echo Chat',
    version: '1.0.0'
  },
  profile: {
    defaultName: 'New User',
    create: {
      title: 'Create New Account',
      username: 'Username',
      avatar: 'Choose Avatar',
      submit: 'Create',
      cancel: 'Cancel'
    },
    current: 'Current Account',
    switchTo: 'Switch to this account',
    addNew: 'Add New Account'
  },
  settings: {
    title: 'Settings',
    account: 'Account',
    version: 'Version',
    about: 'About',
    editProfile: 'Edit Profile',
    save: 'Save',
    logout: 'Logout',
    logoutConfirmTitle: 'Confirm Logout',
    logoutConfirmMessage: 'Logging out will delete all your data. This action cannot be undone. Are you sure you want to continue?',
    ai: {
      title: 'AI Settings',
      provider: 'AI Provider',
      apiKey: 'API Key',
      endpoint: 'Endpoint',
      model: 'Model',
      providers: {
        openai: 'OpenAI',
        deepseek: 'DeepSeek',
        azure: 'Azure OpenAI'
      },
      models: {
        gpt35: 'GPT-3.5 Turbo',
        gpt4: 'GPT-4',
        deepseekChat: 'DeepSeek Chat',
        deepseekCoder: 'DeepSeek Coder',
        azureGpt35: 'Azure GPT-3.5 Turbo',
        azureGpt4: 'Azure GPT-4'
      },
      azure: {
        apiVersion: 'API Version',
        deployment: 'Deployment Name'
      }
    },
    search: {
      title: 'Search Settings',
      provider: 'Search Provider',
      providers: {
        bing: 'Bing Search'
      },
      bing: {
        apiKey: 'Bing API Key'
      }
    },
    rag: {
      title: 'RAG Settings',
      provider: 'RAG Provider',
      providers: {
        custom: 'Custom',
      },
      custom: {
        endpoint: 'Endpoint',
        topK: 'Top K',
        distanceThreshold: 'Distance Threshold'
      }
    }
  },
  welcome: {
    title: 'Welcome to Echo Chat',
    subtitle: 'Create a profile to start chatting',
    createProfile: 'Create Profile'
  },
  common: {
    settings: 'Settings',
    back: 'Back',
    cancel: 'Cancel'
  },
  chat: {
    error: {
      loadHistory: 'Failed to load message history'
    }
  }
} 