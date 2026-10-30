import { describe, it, expect } from 'vitest';
import { tickSimulatedArrivals } from '../transportService';

describe('transportService simulated ETA', () => {
  it('counts arrivals down by one minute', () => {
    const next = tickSimulatedArrivals([
      { minutes: 2, remark: '座位充足' },
      { minutes: 11 },
    ]);
    expect(next[0].minutes).toBe(1);
    expect(next[0].remark).toBe('座位充足');
    expect(next[1].minutes).toBe(10);
  });

  it('shows an arriving bus, then recycles the slot on the next tick', () => {
    const arriving = tickSimulatedArrivals([{ minutes: 1 }, { minutes: 8 }]);
    expect(arriving[0].minutes).toBe(0);
    expect(arriving[1].minutes).toBe(7);

    const recycled = tickSimulatedArrivals(arriving);
    expect(recycled[0].minutes).toBe(8);
    expect(recycled[1].minutes).toBe(6);
  });
});
