export type RingNode<T> = {
  value: T
  prev: RingNode<T>
  next: RingNode<T>
}

export type Ring<T> = {
  push: (value: T) => RingNode<T>
  pop: () => T | undefined
  unshift: (value: T) => RingNode<T>
  shift: () => T | undefined
  remove: (node: RingNode<T>) => void
  size: () => number
  toArray: () => T[]
  forEach: (callback: (value: T) => void) => void
  clear: () => void
  first: () => T | undefined
  last: () => T | undefined
}

const makeNode = <T>(value: T): RingNode<T> => {
  const node: RingNode<T> = { value, prev: null, next: null }
  node.prev = node.next = node
  return node
}

export const makeRing = <T>(): Ring<T> => {
  const head: RingNode<T> = makeNode(null as T)
  let size = 0

  return {
    push: (value: T) => {
      const node: RingNode<T> = makeNode(value)
      node.prev = head.prev
      node.next = head
      head.prev.next = node
      head.prev = node
      size++
      return node
    },
    pop: () => {
      const node = head.prev
      if (node === head) {
        return undefined
      }
      node.prev.next = node.next
      node.next.prev = node.prev
      size--
      return node.value
    },
    unshift: (value: T) => {
      const node: RingNode<T> = makeNode(value)
      node.next = head.next
      node.prev = head
      head.next.prev = node
      head.next = node
      size++
      return node
    },
    shift: () => {
      const node = head.next
      if (node === head) {
        return undefined
      }
      node.prev.next = node.next
      node.next.prev = node.prev
      size--
      return node.value
    },
    remove: (node: RingNode<T>) => {
      node.prev.next = node.next
      node.next.prev = node.prev
      node.prev = node.next = node
      size--
    },
    size: () => size,
    toArray: () => {
      const result: T[] = []
      let node = head.next
      while (node !== head) {
        result.push(node.value)
        node = node.next
      }
      return result
    },
    forEach: (callback: (value: T) => void) => {
      let node = head.next 
      while (node !== head) {
        callback(node.value)
        node = node.next
      }
    },
    clear: () => {
      head.prev = head.next = head
      size = 0
    },
    first: () => head.next === head ? undefined : head.next.value,
    last: () => head.prev === head ? undefined : head.prev.value,
  }
}
