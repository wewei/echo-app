import { makeRing } from "./ring";

export type EventHandler<V> = (value: V) => void;
export type EventSource<V> = {
    notify: (value: V) => void,
    watch: (handler: EventHandler<V>) => () => boolean
    isWatched: () => boolean
}

export const makeEventSource = <V>(): EventSource<V> => {
    const handlers = makeRing<EventHandler<V>>()
    const isWatched = () => handlers.size() > 0
    return {
        notify: (value: V) => {
            handlers.toArray().forEach(handler => handler(value))
        },
        // 监听事件，返回一个函数用于取消监听，取消后返回是否是最后一个监听者
        watch: (handler: EventHandler<V>) => {
            const node = handlers.push(handler)
            return () => {
                handlers.remove(node)
                return !isWatched()
            }
        },
        isWatched,
    }
}

export type EventHub<V> = {
    notify: (keyPath: string[], value: V) => void
    watch: (keyPath: string[], handler: EventHandler<V>) => () => boolean
    isWatched: () => boolean
}

export const makeEventHub = <V>(): EventHub<V> => {
    const children = new Map<string, EventHub<V>>()
    const eventSource = makeEventSource<V>()
    const isWatched = () => eventSource.isWatched() || children.size > 0

    return {
        notify: (keyPath: string[], value: V) => {
            eventSource.notify(value)
            if (keyPath.length > 0) {
                const [head, ...tail] = keyPath
                const child = children.get(head)
                if (child) {
                    child.notify(tail, value)
                }
            }
        },
        watch: (keyPath: string[], handler: EventHandler<V>) => {
            if (keyPath.length > 0) {
                const [head, ...tail] = keyPath
                const child = children.get(head) ?? (() => {
                    const child = makeEventHub<V>()
                    children.set(head, child)
                    return child
                })()
                const unwatchChild = child.watch(tail, handler)
                return () => {
                    if (unwatchChild()) {
                        children.delete(head)
                    }
                    return !isWatched()
                }
            }
            return eventSource.watch(handler)
        },
        isWatched
    }
}
