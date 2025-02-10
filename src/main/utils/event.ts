export type EventHandler<T> = (value: T) => void;
export type EventSource<T> = [EventHandler<T>, (handler: EventHandler<T>) => () => void]

export const eventSource = <T>(): EventSource<T> => {
    const handlers = new Set<EventHandler<T>>()
    return [
        (value: T) => {
            handlers.forEach(handler => handler(value))
        },
        (handler: EventHandler<T>) => {
            handlers.add(handler)
            return () => {
                handlers.delete(handler)
            }
        }
    ]
}
