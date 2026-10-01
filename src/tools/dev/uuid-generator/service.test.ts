// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { generateUuids, MAX_COUNT } from './service';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('generateUuids', () => {
  it('生成指定数量的 v4 UUID', () => {
    const uuids = generateUuids(5);
    expect(uuids).toHaveLength(5);
    for (const uuid of uuids) {
      expect(uuid).toMatch(UUID_V4);
    }
  });

  it('批量生成互不重复', () => {
    expect(new Set(generateUuids(MAX_COUNT)).size).toBe(MAX_COUNT);
  });

  it('拒绝越界数量', () => {
    expect(() => generateUuids(0)).toThrow('1-50');
    expect(() => generateUuids(MAX_COUNT + 1)).toThrow('1-50');
  });
});
