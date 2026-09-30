export type UrlMode = 'component' | 'full';

/** component = encodeURIComponent（编码所有保留字符）；full = encodeURI（保留 URL 结构符） */
export function encodeUrlText(text: string, mode: UrlMode): string {
  return mode === 'component' ? encodeURIComponent(text) : encodeURI(text);
}

export function decodeUrlText(text: string, mode: UrlMode): string {
  try {
    return mode === 'component' ? decodeURIComponent(text) : decodeURI(text);
  } catch (cause) {
    throw new Error('解码失败：输入不是合法的编码字符串', { cause });
  }
}
