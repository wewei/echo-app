import { concatStreams } from '../stream';

describe('concatStreams', () => {
  it('应该正确连接多个流', async () => {
    // 创建测试数据流
    const stream1 = new ReadableStream({
      start(controller) {
        controller.enqueue('Hello');
        controller.close();
      }
    });

    const stream2 = new ReadableStream({
      start(controller) {
        controller.enqueue('World');
        controller.close();
      }
    });

    // 连接流
    const combinedStream = concatStreams(stream1, stream2);
    const reader = combinedStream.getReader();

    // 读取并验证结果
    const result1 = await reader.read();
    expect(result1.value).toBe('Hello');
    expect(result1.done).toBe(false);

    const result2 = await reader.read();
    expect(result2.value).toBe('World');
    expect(result2.done).toBe(false);

    const result3 = await reader.read();
    expect(result3.done).toBe(true);
  });

  it('应该处理空流数组', async () => {
    const combinedStream = concatStreams();
    const reader = combinedStream.getReader();
    
    const result = await reader.read();
    expect(result.done).toBe(true);
  });

  it('应该处理包含错误的流', async () => {
    const errorStream = new ReadableStream({
      start(controller) {
        controller.error(new Error('测试错误'));
      }
    });

    const normalStream = new ReadableStream({
      start(controller) {
        controller.enqueue('正常数据');
        controller.close();
      }
    });

    const combinedStream = concatStreams(errorStream, normalStream);
    const reader = combinedStream.getReader();

    await expect(reader.read()).rejects.toThrow('测试错误');
  });

  it('应该正确处理大量数据', async () => {
    const data = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
    const streams = data.map(item => new ReadableStream({
      start(controller) {
        controller.enqueue(item);
        controller.close();
      }
    }));

    const combinedStream = concatStreams(...streams);
    const reader = combinedStream.getReader();

    for (let i = 0; i < data.length; i++) {
      const result = await reader.read();
      expect(result.value).toBe(`item-${i}`);
      expect(result.done).toBe(false);
    }

    const finalResult = await reader.read();
    expect(finalResult.done).toBe(true);
  });

  it('应该正确处理取消操作', async () => {
    // 创建一个延迟发送数据的流
    const stream1 = new ReadableStream({
      async start(controller) {
        await new Promise(resolve => setTimeout(resolve, 100));
        controller.enqueue('数据1');
        controller.close();
      }
    });

    const stream2 = new ReadableStream({
      start(controller) {
        controller.enqueue('数据2');
        controller.close();
      }
    });

    const combinedStream = concatStreams(stream1, stream2);
    const reader = combinedStream.getReader();

    // 立即取消读取
    await reader.cancel();

    // 验证后续读取会返回 done
    const result = await reader.read();
    expect(result.done).toBe(true);
  });


  it('应该在取消时正确清理资源', async () => {
    let stream1Cancelled = false;
    
    const stream1 = new ReadableStream({
      start(controller) {
        controller.enqueue('数据1');
      },
      cancel() {
        stream1Cancelled = true;
      }
    });

    const combinedStream = concatStreams(stream1);
    const reader = combinedStream.getReader();

    // 读取一个值后取消
    await reader.read();
    await reader.cancel();

    // 验证原始流被正确取消
    expect(stream1Cancelled).toBe(true);
  });
}); 