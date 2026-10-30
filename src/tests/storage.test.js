import { describe, it, expect, vi } from 'vitest';
import { addHistory, clearHistory, getHistory, HISTORY_KEY, HISTORY_LIMIT } from '../storage/history.js';
import { getFavourites, toggleFavourite } from '../storage/favourites.js';
import { readJson, writeJson } from '../storage/safeStorage.js';

describe('history', () => {
  it('stores newest first, caps at the limit and clears', () => {
    for (let i = 0; i < 25; i++) addHistory('emi', `run ${i}`);
    const list = getHistory();
    expect(list).toHaveLength(HISTORY_LIMIT);
    expect(list[0].s).toBe('run 24');
    expect(clearHistory()).toEqual([]);
    expect(getHistory()).toEqual([]);
  });
  it('survives corrupted or wrong-shaped stored data', () => {
    window.localStorage.setItem(HISTORY_KEY, '{not json');
    expect(getHistory()).toEqual([]);
    window.localStorage.setItem(HISTORY_KEY, '{"a":1}');
    expect(getHistory()).toEqual([]);
  });
  it('persists across a simulated reload (reads from localStorage, not memory)', () => {
    addHistory('gst', 'GST → ₹1,180.00');
    expect(JSON.parse(window.localStorage.getItem(HISTORY_KEY))[0].id).toBe('gst');
  });
});

describe('favourites', () => {
  it('toggles on and off', () => {
    expect(toggleFavourite('emi')).toEqual(['emi']);
    expect(toggleFavourite('gst')).toEqual(['emi', 'gst']);
    expect(toggleFavourite('emi')).toEqual(['gst']);
    expect(getFavourites()).toEqual(['gst']);
  });
});

describe('safe storage', () => {
  it('never throws when storage is unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(() => writeJson('k', 1)).not.toThrow();
    spy.mockRestore();
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    expect(readJson('k', 'fallback')).toBe('fallback');
    get.mockRestore();
  });
});
