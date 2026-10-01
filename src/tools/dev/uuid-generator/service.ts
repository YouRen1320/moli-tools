export const MAX_COUNT = 50;

/** 批量生成 v4 UUID（crypto.randomUUID） */
export function generateUuids(count: number): string[] {
  if (!Number.isInteger(count) || count < 1 || count > MAX_COUNT) {
    throw new Error(`一次生成 1-${MAX_COUNT} 个`);
  }
  if (typeof globalThis.crypto?.randomUUID !== 'function') {
    throw new Error('当前环境不支持 crypto.randomUUID');
  }
  const result: string[] = [];
  for (let i = 0; i < count; i += 1) {
    result.push(globalThis.crypto.randomUUID());
  }
  return result;
}
