export type EventHandler<Args extends any[]> = (...args: Args) => void;
export type EventSource<Args extends any[]> = [EventHandler<Args>, (handler: EventHandler<Args>) => () => boolean]

export const eventSource = <Args extends any[]>(): EventSource<Args> => {
    const handlers = new Set<EventHandler<Args>>()
    return [
        (...args: Args) => {
            handlers.forEach(handler => handler(...args))
        },
        (handler: EventHandler<Args>) => {
            handlers.add(handler)
            return () => {
                handlers.delete(handler)
                return handlers.size === 0
            }
        }
    ]
}
