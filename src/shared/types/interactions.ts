export type QueryType = 'chat' | 'navigate'

export type Query = {
  id: number
  context?: number
  content: string
  timestamp: number
  isDeleted: boolean
  type: QueryType
}

export type Response = {
  id: number
  query: number
  content: string
  timestamp: number
  agents: string
}

export type QueryInput = Omit<Query, 'id'>
export type ResponseInput = Omit<Response, 'id'> 