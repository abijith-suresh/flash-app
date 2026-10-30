import { expect, test } from 'bun:test';
import { createMutationGate } from './mutation';

test('serializes writes while request and refresh are pending', async () => {
  let release!: () => void;
  const waiting = new Promise<void>(resolve => { release = resolve; });
  let writes = 0;
  const states: string[] = [];
  const gate = createMutationGate(state => states.push(state));
  const first = gate.run(async () => { writes++; await waiting; }, async () => {});
  expect(await gate.run(async () => { writes++; }, async () => {})).toBe(false);
  expect(writes).toBe(1);
  release();
  expect(await first).toBe(true);
  expect(states).toEqual(['saving', 'idle']);
});

test('a committed write with failed refresh stays locked until refresh succeeds', async () => {
  let writes = 0;
  const states: string[] = [];
  const gate = createMutationGate(state => states.push(state));
  expect(await gate.run(async () => { writes++; }, async () => { throw Error('offline'); })).toBe(false);
  expect(await gate.run(async () => { writes++; }, async () => {})).toBe(false);
  expect(writes).toBe(1);
  expect(await gate.retry(async () => { throw Error('still offline'); })).toBe(false);
  expect(await gate.retry(async () => {})).toBe(true);
  expect(await gate.run(async () => { writes++; }, async () => {})).toBe(true);
  expect(writes).toBe(2);
  expect(states).toEqual(['saving', 'refresh-needed', 'saving', 'refresh-needed', 'saving', 'idle', 'saving', 'idle']);
});
