import { makeEventHub } from './event'

describe('EventHub', () => {
  it('should notify handlers with matching keyPath', () => {
    const hub = makeEventHub<string>()
    const handler1 = jest.fn()
    const handler2 = jest.fn()
    const handler3 = jest.fn()

    // 监听不同路径
    hub.watch(['profile1', 'chat1'], handler1)
    hub.watch(['profile1', 'chat2'], handler2)
    hub.watch(['profile2'], handler3)

    // 通知特定路径
    hub.notify(['profile1', 'chat1'], 'message1')

    // 验证回调
    expect(handler1).toHaveBeenCalledWith('message1')
    expect(handler2).not.toHaveBeenCalled()
    expect(handler3).not.toHaveBeenCalled()
  })

  it('should support nested notifications', () => {
    const hub = makeEventHub<string>()
    const handler = jest.fn()

    // 监听父路径
    hub.watch(['profile1'], handler)
    
    // 通知子路径
    hub.notify(['profile1', 'chat1'], 'message1')

    // 父路径的处理器应该被调用
    expect(handler).toHaveBeenCalledWith('message1')
  })

  it('should properly clean up when unwatching', () => {
    const hub = makeEventHub<string>()
    const handler = jest.fn()

    // 添加监听
    const unwatch = hub.watch(['profile1', 'chat1'], handler)
    
    // 取消监听
    const isLastHandler = unwatch()
    
    // 再次通知
    hub.notify(['profile1', 'chat1'], 'message1')

    expect(isLastHandler).toBe(true)
    expect(handler).not.toHaveBeenCalled()
  })
}) 