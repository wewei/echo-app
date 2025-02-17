# Renderer 数据层
提供 Renderer 所需要的数据实体的读写操作。
读取数据以 Hook 形式提供，写入数据以 async function 的形式提供。

## 核心概念
### 数据实体 `Entity` 及其 `id`
数据实体是被一系列属性唯一确定的对象。例如
1. 一个 `Query` 是由它的内容和上下文唯一确定的
2. 一个 `Response` 是由它所回复的 `Query` 加上响应 `Query` 的 Agent 以及相应时间唯一确定的

### 数据实体的状态
数据实体 `Entity` 在全局有两状态
1. 实体不存在 `ENTITY_NOT_EXIST`
2. 实体存在 `Entity`

定义
```ts
export const ENTITY_NOT_EXIST = Symbol('ENTITY_NOT_EXIST')
export type EntityNotExist = typeof ENTITY_NOT_EXIST
export type EntityState<V> = EntityNotExist | V
```

数据实体在 Renderer 中还有第三中状态
1. 实体加载中 `ENTITY_LOADING`

定义
```ts
export const ENTITY_LOADING = Symbol('ENTITY_LOADING')
export type EntityLoading = typeof ENTITY_LOADING
export type EntityRendererState<V> = EntityState<V> | EntityLoading
```


## 数据 API 的主要场景
数据 API 应 Cover 以下场景
1. 读 (并监听变化)
  1.1 单个实体 `useEntity: (id: string) -> EntityRendererState<Entity>`
  1.2 罗列多个实体 `useEntities: filter -> entity[]` or `useEntityIds:  filter -> id[]`
2. 写
  2.1 新增 `createEntity: Omit<entity, 'id'> -> Promise<entity>`
  2.2 更改 `updateEntity: (id, operator) => Promise<entity>`
  2.3 删除 `deleteEntity: (id) -> Promise<boolean>`

包括以下模块
1. 账号管理 `profile.ts`
2. 配置管理 `settings.ts`
3. 交互数据管理 `interaction.ts`
4. 交互 session 管理 `contentSession.ts`



## 账号管理
[TODO]

## 配置管理
[TODO]

## 交互数据 (interaction) 管理
### 数据结构
Query 和 Response 构成的二分图结构
#### Query

#### Response

#### ListResult
```ts
interface ListResult<T> {
  // 罗列结果
  items: T[]
  // 是否还有更多
  hasMore: boolean
  // 加载更多
  loadMore: () => void
  // 刷新
  refresh: () => void
}
```

#### CreationParams
```ts
type CreationParams<Entity extends {id: string} }> = Omit<Entity, 'id'>
```

### Hooks
* `useRecentQueries(contextId: string): ListResult<Query>`, 获取最近的 Query 列表
* `useQuery(id: string): EntityState<Query>`, 获取 Query 的内容
* `useResponse(id: string): EntityState<Response>`, 获取 Response 的内容
* `useQueryResponseIds(queryId: string): ListResult<string>`, 获取 Query 对应的 Response 的 id 列表

### Actions
* `createQuery(params: CreationParams<Query>): Promise<Query>`, 创建 Query
* `deleteQuery(id: string): Promise<boolean>`, 删除 Query
* `createResponse(params: CreationParams<Response>): Promise<Response>`, 创建 Response
* `appendResponseContent(id: string, content: string): Promise<Response>`, 追加 Response 的内容


## 交互 session 管理
[TODO]
