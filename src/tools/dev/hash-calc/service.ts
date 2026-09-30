export const HASH_ALGORITHMS = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;

export type HashAlgorithm = (typeof HASH_ALGORITHMS)[number];

export const DEFAULT_ALGORITHM: HashAlgorithm = 'SHA-256';

function toHex(digest: ArrayBuffer): string {
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function digestHex(data: ArrayBuffer, algorithm: HashAlgorithm): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('当前浏览器不支持 WebCrypto，无法计算哈希');
  }
  const digest = await globalThis.crypto.subtle.digest(algorithm, data);
  return toHex(digest);
}

export async function hashText(text: string, algorithm: HashAlgorithm): Promise<string> {
  return digestHex(new TextEncoder().encode(text).buffer as ArrayBuffer, algorithm);
}

export async function hashFile(file: Blob, algorithm: HashAlgorithm): Promise<string> {
  return digestHex(await file.arrayBuffer(), algorithm);
}
