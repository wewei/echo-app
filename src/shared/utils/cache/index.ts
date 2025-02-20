/**
 * @description 缓存工具
 * 职责: 提供对特定类型数据的缓存，支持多种缓存策略
 */
export { lru, unlimited } from './strategies'
export { makeCache, makeAsyncCache } from './cache'
export { cached, asyncCached } from './cached'
