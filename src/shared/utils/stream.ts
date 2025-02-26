export async function* streamToAsyncIterator<T>(stream: ReadableStream<T>): AsyncIterable<T> {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

export function concatStreams<T>(...streams: ReadableStream<T>[]): ReadableStream<T> {
  if (streams.length === 0) {
    return new ReadableStream({
      start(controller) {
        controller.close();
      }
    });
  }

  let reader: ReadableStreamDefaultReader<T> | null = null;
  let currentIndex = 0;

  return new ReadableStream({
    async pull(controller) {
      try {
        if (reader === null) {
          if (currentIndex >= streams.length) {
            controller.close();
            return;
          }
          reader = streams[currentIndex].getReader();
          currentIndex++;
        }

        const { done, value } = await reader.read();
        
        if (done) {
          await reader.cancel();
          reader = null;
          return this.pull(controller);
        }

        controller.enqueue(value);
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel() {
      if (reader) {
        await reader.cancel();
        reader = null;
      }
    }
  });
}
