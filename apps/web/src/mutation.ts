/** Serializes writes and blocks further writes if a committed change cannot be refreshed. */
export function createMutationGate(update: (state: 'idle'|'saving'|'refresh-needed') => void) {
  let state: 'idle'|'saving'|'refresh-needed' = 'idle';
  const set = (next: typeof state) => { state = next; update(next); };
  return {
    async run(write: () => Promise<void>, refresh: () => Promise<void>): Promise<boolean> {
      if (state !== 'idle') return false;
      set('saving');
      try { await write(); } catch (error) { set('idle'); throw error; }
      try { await refresh(); set('idle'); return true; }
      catch { set('refresh-needed'); return false; }
    },
    async retry(refresh: () => Promise<void>): Promise<boolean> {
      if (state === 'saving') return false;
      set('saving');
      try { await refresh(); set('idle'); return true; }
      catch { set('refresh-needed'); return false; }
    },
  };
}
