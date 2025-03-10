import type { BaseInteraction } from "@/shared/types/interactions"
import type { ProfileInteractionApi } from "@/shared/types/ipc"
import { concatStreams } from "@/shared/utils/stream"
const DEFAULT_BATCH_LIMIT = 20

/**
 * 给定 Interaction，返回一个 ReadableStream，按时间倒序从该 Interaction 回溯到原初 Null Interaction 的完整交互路径
 * @param getChats 批量获取聊天记录的函数
 * @param getChatState 获取聊天状态的函数
 * @param getInteraction 获取 interaction 的函数
 * @param batchLimit 批量获取聊天记录的最大数量
 * @param interaction 要回溯的 Interaction
 * @returns 
 */
export const traceBack =
  ({
    getChats,
    getInteraction,
    batchLimit = DEFAULT_BATCH_LIMIT,
  }: Pick<ProfileInteractionApi, 'getChats' | 'getInteraction'> & {
    batchLimit?: number
  }) =>
  (
    contextId: number,
  ): ReadableStream<BaseInteraction> => {
    let iter: BaseInteraction | null = null

    type Controller = ReadableStreamDefaultController<BaseInteraction>

    const pullContext = async (controller: Controller) => {
      if (!Number.isInteger(iter.contextId)) {
        controller.close()
        return
      }
      const context = await getInteraction(iter.contextId)
      if (context) {
        controller.enqueue(context)
        iter = context
      } else {
        controller.close()
      }
    }

    const pullChatsOrContext = async (controller: Controller) => {
      const chats = await getChats({
        contextId: iter.contextId,
        created: { before: iter.createdAt },
        limit: batchLimit,
        order: 'desc'
      })
      if (chats.length > 0) {
        iter = chats[chats.length - 1]
        for (const chat of chats) {
          controller.enqueue(chat)
        }
      } else {
        return pullContext(controller)
      }
    }
    const pull = async (controller: Controller) => {
      if (iter === null) {
        iter = await getInteraction(contextId)
        if (iter === null) {
          controller.close()
          return
        }
        controller.enqueue(iter)
        return pull(controller)
      }
      if (iter.type === "chat") {
        return pullChatsOrContext(controller);
      } else {
        return pullContext(controller);
      }
    }


    return new ReadableStream({ pull });
  }

export const recentChats =
  ({
    getChats,
    batchLimit = DEFAULT_BATCH_LIMIT,
  }: Pick<ProfileInteractionApi, 'getChats'> & {
    batchLimit?: number
  }) =>
  (contextId?: number | null, timestamp: number = Date.now()): ReadableStream<BaseInteraction> => {

    return new ReadableStream({
      pull: async (controller) => {
        const interactions = await getChats({
          contextId,
          created: { before: timestamp },
          order: "desc",
          limit: batchLimit,
        });
        if (interactions.length > 0) {
          timestamp = interactions[interactions.length - 1].createdAt;
          for (const interaction of interactions) {
            controller.enqueue(interaction);
          }
        }
        if (interactions.length < batchLimit) {
          controller.close()
        }
      }
    });
  };

export const chatsForContext =
  ({
    getChats,
    getInteraction,
    batchLimit = DEFAULT_BATCH_LIMIT,
  }: Pick<ProfileInteractionApi, "getChats" | "getInteraction"> & {
    batchLimit?: number;
  }) =>
  (contextId?: number) =>
    concatStreams(
      recentChats({ getChats, batchLimit })(contextId),
      traceBack({ getChats, getInteraction, batchLimit })(contextId)
    );