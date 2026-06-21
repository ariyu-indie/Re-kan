import { locId } from "./LOC.js"

export function BFS({ start, goal, getNeighbors }) {
  const queue = [start]
  let head = 0
  const visited = new Set([start.id])
  const cameFrom = new Map() // id -> id
  while (head < queue.length) {
    const current = queue[head++]
    if (current.id === goal.id) {
      return reconstructPath(cameFrom, current)
    }
    for (const neighbor of getNeighbors(current)) {
      if (!neighbor) continue
      if (visited.has(neighbor.id)) continue
      visited.add(neighbor.id)
      cameFrom.set(neighbor.id, current.id)
      queue.push(neighbor)
    }
  }
  return null
}
export function reconstructPath(cameFrom, endNode) {
    const path = [endNode]
    let currentId = endNode.id
    while (cameFrom.has(currentId)) {
        currentId = cameFrom.get(currentId)
        path.push(locId(currentId))
    }
    return path.reverse()
}
export const pathCache = new Map()
export function newJo(from, end) {
    const key = `${from.id}->${end.id}`
    if (pathCache.has(key)) {
        return [...pathCache.get(key)]
    }
    const res = BFS({
        start: from,
        goal: end,
        getNeighbors: n => n.connections.map(e=>locId(e))
    })
    if (!res) return null
    const trimmed = res.slice(1)
    pathCache.set(key, trimmed)
    return [...trimmed]
}