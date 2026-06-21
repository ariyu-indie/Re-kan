export function observable(initial) {
  let value = initial
  const listeners = new Set()
  return {
    get value() {
      return value
    },
    set value(v) {
      if (v === value) return
      value = v
      listeners.forEach(fn => fn(v))
    },
    onChange(fn) {
      listeners.add(fn)
      return () => listeners.delete(fn)
    }
  }
}
export function waitUntil(observableVar, target) {
  return new Promise(resolve => {
    // already true? resolve immediately
    if (observableVar.value === target) {
      resolve()
      return
    }
    const off = observableVar.onChange(value => {
      if (value === target) {
        off()
        resolve()
      }
    })
  })
}