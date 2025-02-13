import { makeRing } from "./ring";

export type EventHandler<V> = (value: V) => void;
export type EventSource<V> = {
    notify: (value: V) => void,
    watch: (handler: EventHandler<V>) => () => boolean
}

export const makeEventSource = <V>(): EventSource<V> => {
    const handlers = makeRing<EventHandler<V>>()
    return {
        notify: (value: V) => {
            handlers.toArray().forEach(handler => handler(value))
        },
        // 监听事件，返回一个函数用于取消监听，取消后返回是否是最后一个监听者
        watch: (handler: EventHandler<V>) => {
            const node = handlers.push(handler)
            return () => {
                handlers.remove(node)
                return handlers.size() === 0
            }
        }
    }
}
