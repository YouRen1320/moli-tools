export type JsonIndent = 2 | 4 | '\t';

function indentString(indent: JsonIndent): string {
  return indent === '\t' ? '\t' : ' '.repeat(indent);
}

/** 格式化 JSON，非法输入抛出含原因的错误 */
export function formatJson(text: string, indent: JsonIndent = 2): string {
  return JSON.stringify(parseJson(text), null, indentString(indent));
}

/** 压缩 JSON（去除所有空白），非法输入抛出含原因的错误 */
export function minifyJson(text: string): string {
  return JSON.stringify(parseJson(text));
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    const position = message.match(/position (\d+)/);
    if (position) {
      const offset = Number(position[1]);
      const line = text.slice(0, offset).split('\n').length;
      throw new Error(`JSON 语法错误（第 ${line} 行附近）：${message}`, { cause });
    }
    throw new Error(`JSON 语法错误：${message}`, { cause });
  }
}
