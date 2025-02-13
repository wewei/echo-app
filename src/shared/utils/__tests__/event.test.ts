import { makeEventSource } from '../event';

describe('EventSource', () => {
  it('should notify all handlers', () => {
    const source = makeEventSource<number>();
    const values1: number[] = [];
    const values2: number[] = [];

    source.watch(value => values1.push(value));
    source.watch(value => values2.push(value));

    source.notify(1);
    source.notify(2);

    expect(values1).toEqual([1, 2]);
    expect(values2).toEqual([1, 2]);
  });

  it('should allow handler removal', () => {
    const source = makeEventSource<number>();
    const values: number[] = [];
    
    const unwatch = source.watch(value => values.push(value));
    
    source.notify(1);
    unwatch();
    source.notify(2);

    expect(values).toEqual([1]);
  });

  it('should handle multiple handlers and removals', () => {
    const source = makeEventSource<string>();
    const results1: string[] = [];
    const results2: string[] = [];
    const results3: string[] = [];

    const unwatch1 = source.watch(v => results1.push(v));
    const unwatch2 = source.watch(v => results2.push(v));
    source.watch(v => results3.push(v));

    source.notify('first');
    unwatch2();
    source.notify('second');
    unwatch1();
    source.notify('third');

    expect(results1).toEqual(['first', 'second']);
    expect(results2).toEqual(['first']);
    expect(results3).toEqual(['first', 'second', 'third']);
  });

  it('should indicate last handler removal', () => {
    const source = makeEventSource<number>();
    
    const unwatch1 = source.watch(jest.fn());
    const unwatch2 = source.watch(jest.fn());

    expect(unwatch1()).toBe(false); // 还有其他处理器
    expect(unwatch2()).toBe(true);  // 最后一个处理器
  });

  it('should handle adding handlers during notification, new handler should not be notified for this round', () => {
    const source = makeEventSource<number>();
    const values: number[] = [];
    
    source.watch(value => {
      values.push(value);
      if (value === 1) {
        source.watch(v => values.push(v * 10));
      }
    });

    source.notify(1);
    source.notify(2);

    expect(values).toEqual([1, 2, 20]);
  });

  it('should handle removing handlers during notification, removal should not impact this round of notification', () => {
    const source = makeEventSource<number>();
    const values: number[] = [];
    
    source.watch(value => {
      values.push(value);
      if (value === 2) {
        unwatch2();
      }
    });
    
    const unwatch2 = source.watch(value => values.push(value * 10));

    source.notify(1);
    source.notify(2);
    source.notify(3);

    expect(values).toEqual([1, 10, 2, 20, 3]);
  });
}); 