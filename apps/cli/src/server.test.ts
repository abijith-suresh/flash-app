import { test, expect } from 'bun:test';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('localhost API rejects foreign hosts and cross-origin mutations', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'flash-server-'));
  const proc = Bun.spawn(['bun', 'apps/cli/src/index.ts', 'ui'], { env: { ...process.env, FLASH_DB: join(dir, 'db.sqlite'), PORT: '0' }, stdout: 'pipe', stderr: 'pipe' });
  try {
    const reader = proc.stdout.getReader();
    const output = new TextDecoder().decode((await reader.read()).value);
    const address = output.match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
    expect(address).toBeDefined();
    const base = address!;
    expect((await fetch(base + '/api/cards')).status).toBe(200);
    expect((await fetch(base + '/api/cards', { headers: { Host: 'attacker.example' } })).status).toBe(403);
    expect((await fetch(base + '/api/cards/1/approve', { method: 'POST', headers: { Origin: 'http://attacker.example', 'Content-Type': 'application/json' }, body: '{}' })).status).toBe(403);
    expect((await fetch(base + '/api/cards/1/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status).toBe(403);
    expect((await fetch(base + '/api/cards/1/approve', { method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' }, body: '{}' })).status).toBe(400);
  } finally {
    proc.kill();
    await proc.exited;
    rmSync(dir, { recursive: true, force: true });
  }
});
