const throttle = <Args extends unknown[]>(func: (...args: Args) => void, wait: number) => {
  let timeout: NodeJS.Timeout | null = null
  return function(...args: Args) {
    if (!timeout) {
      timeout = setTimeout(() => {
        func.apply(this, args)
        timeout = null
      }, wait)
    }
  }
}

const debounce = <Args extends unknown[]>(func: (...args: Args) => void, wait: number) => {
  let timeout: NodeJS.Timeout | null = null
  return function(...args: Args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

export { throttle, debounce }

