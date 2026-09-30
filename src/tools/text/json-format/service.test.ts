import { describe, expect, it } from 'vitest';
import { formatJson, minifyJson } from './service';

describe('formatJson', () => {
  it('按缩进格式化', () => {
    expect(formatJson('{"a":1,"b":[1,2]}')).toBe('{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}');
    expect(formatJson('{"a":1}', 4)).toBe('{\n    "a": 1\n}');
    expect(formatJson('{"a":1}', '\t')).toBe('{\n\t"a": 1\n}');
  });

  it('错误信息包含语法错误提示', () => {
    // 行号提示依赖运行时错误消息里是否带 position，做尽力而为
    expect(() => formatJson('{\n  "a": 1,\n}')).toThrow(/JSON 语法错误/);
    expect(() => minifyJson('not json')).toThrow(/JSON 语法错误/);
  });
});

describe('minifyJson', () => {
  it('去除全部空白', () => {
    expect(minifyJson('{ "a" : 1 , "b" : [ 1 , 2 ] }')).toBe('{"a":1,"b":[1,2]}');
  });
});
