export type EventHandler<V> = (value: V) => void;
export type EventSource<V> = {
    notify: (value: V) => void,
    watch: (handler: EventHandler<V>) => () => boolean
}

export const eventSource = <V>(): EventSource<V> => {
    const handlers = new Set<EventHandler<V>>()
    return {
        notify: (value: V) => {
            handlers.forEach(handler => handler(value))
        },
        // 监听事件，返回一个函数用于取消监听，取消后返回是否是最后一个监听者
        watch: (handler: EventHandler<V>) => {
            handlers.add(handler)
            return () => {
                handlers.delete(handler)
                return handlers.size === 0
            }
        }
    }
}
