/** UTF-8 安全的 Base64 编码 */
export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

/** UTF-8 安全的 Base64 解码，输入不合法时抛错 */
export function decodeBase64(base64: string): string {
  const normalized = base64.trim();
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** 宽松判断字符串是否像 Base64（只做提示，不作为安全依据） */
export function looksLikeBase64(text: string): boolean {
  const normalized = text.trim();
  if (normalized.length === 0 || normalized.length % 4 !== 0) return false;
  return /^[A-Za-z\d+/]+={0,2}$/.test(normalized);
}
