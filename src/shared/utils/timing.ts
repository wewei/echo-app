const throttle = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout | null = null
  return function(...args: any[]) {
    if (!timeout) {
      timeout = setTimeout(() => {
        func.apply(this, args)
        timeout = null
      }, wait)
    }
  }
}

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout | null = null
  return function(...args: any[]) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

export { throttle, debounce }

