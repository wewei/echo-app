import { ipcMain } from 'electron'
import type { OpenAI } from 'openai'
import { getClient } from '../services/chatManager'
import { searchAndFormatResults } from '../services/searchManager'
import type { IpcMainInvokeEvent } from 'electron'

const handleChat = async (
  event: IpcMainInvokeEvent, 
  streamId: string, 
  profileId: string, 
  params: OpenAI.Chat.Completions.ChatCompletionCreateParams,
  recursionDepth: number = 0
) => {
  if (recursionDepth > 5) {
    throw new Error('Recursion depth exceeded');
  }

  const sender = event.sender;
  const client = await getClient(profileId)
  const stream = await client.chat.completions.create({
    ...params, stream: true, 
  })

  // 用于收集tool_call数据的变量
  let collectingFunctionCall = false;
  let functionName = '';
  let functionArgs = '';

  // 处理流式响应
  for await (const chunk of stream) {
    if (!chunk || !chunk.choices || chunk.choices.length === 0) {
      continue;
    }

    const delta = chunk.choices[0]?.delta;

    // 检查是否有function_call
    if (delta.function_call) {
      collectingFunctionCall = true;

      // 获取function名称（只在第一个chunk中出现）
      if (delta.function_call.name && !functionName) {
        functionName = delta.function_call.name;
      }

      // 收集参数
      if (delta.function_call.arguments) {
        functionArgs += delta.function_call.arguments;
      }

      // 不将function_call相关内容发送给客户端
      continue;
    }
    // 如果之前在收集function_call并且当前chunk没有function_call，说明function_call完成
    else if (collectingFunctionCall && !delta.function_call) {
      // 处理function_call
      if (functionName === 'search') {
        try {
          // 解析参数
          const args = JSON.parse(functionArgs);
          const query = args.query;

          // 执行搜索
          const searchResults = await searchAndFormatResults(query);

          // 创建新的请求，包含搜索结果
          const updatedMessages = [
            ...params.messages,
            {
              role: 'assistant',
              content: null,
              function_call: {
                name: functionName,
                arguments: functionArgs
              }
            } as OpenAI.ChatCompletionMessageParam,
            {
              role: 'function',
              name: functionName,
              content: searchResults
            } as OpenAI.ChatCompletionMessageParam
          ];

          // 递归调用处理新的请求
          
          await handleChat(event, streamId, profileId, {
            model: params.model as string,
            messages: updatedMessages
          }, recursionDepth + 1);
          collectingFunctionCall = false;
        } catch (error) {
          console.error('Error handling search function:', error);
          // 如果搜索失败，则发送错误消息
          const errorMessage: OpenAI.Chat.Completions.ChatCompletionChunk = {
            id: 'error',
            object: 'chat.completion.chunk',
            created: Date.now(),
            model: params.model as string,
            choices: [{
              index: 0,
              delta: { content: `\n\nError performing search: ${error.message}` },
              finish_reason: 'function_call'
            }]
          };
          sender.send('chat:stream:delta', streamId, errorMessage);
        }
      }
    } else {
      // 正常的内容，发送给客户端
      sender.send('chat:stream:delta', streamId, chunk);
    }
  }
}

export const registerChatHandlers = () => {
  ipcMain.handle(
    'chat:send',
    async (_, profileId: string, params: OpenAI.Chat.Completions.ChatCompletionCreateParams) => {
      const client = await getClient(profileId)
      return client.chat.completions.create(params)
    }
  )

  ipcMain.handle(
    'chat:stream',
    async (event, streamId: string, profileId: string, params: OpenAI.Chat.Completions.ChatCompletionCreateParams) => {
      try {
        const realParams : OpenAI.Chat.Completions.ChatCompletionCreateParams = {
          ...params,
          function_call: 'auto', 
          functions: [
            {
              name: "search",
                description: "Search the web for current information",
                parameters: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "The search query"
                    }
                  },
                  required: ["query"]
                }
            }
          ]
        }
        
        await handleChat(event, streamId, profileId, realParams);
        event.sender.send('chat:stream:done', streamId)
      } catch (error) {
        event.sender.send('chat:stream:error', streamId, error.message)
        throw error // 重新抛出错误以便 preload 脚本可以处理
      }
    }
  )
}