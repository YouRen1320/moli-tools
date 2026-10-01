import { describe, expect, it } from 'vitest';
import { csvToJson, getJsonKeys, getCsvHeader, jsonToCsv, parseCsv } from './service';

describe('parseCsv', () => {
  it('解析引号内的逗号与换行', () => {
    expect(parseCsv('a,"b,1",c')).toEqual([['a', 'b,1', 'c']]);
    expect(parseCsv('"第一行\n第二行",x')).toEqual([['第一行\n第二行', 'x']]);
  });

  it('解析转义引号', () => {
    expect(parseCsv('"他说 ""你好""",y')).toEqual([['他说 "你好"', 'y']]);
  });

  it('兼容 CRLF 并跳过空行', () => {
    expect(parseCsv('a,b\r\nc,d\r\n')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });
});

describe('jsonToCsv', () => {
  it('基础转换：表头 + 数据行', () => {
    expect(jsonToCsv('[{"name":"茉莉","age":3},{"name":"Moli","age":4}]')).toBe(
      'name,age\n茉莉,3\nMoli,4',
    );
  });

  it('合并不同对象的键，缺省补空', () => {
    expect(jsonToCsv('[{"a":1},{"b":2}]')).toBe('a,b\n1,\n,2');
  });

  it('逗号/引号/换行按 RFC 4180 转义', () => {
    const jsonInput = JSON.stringify([{ text: '含,逗号"与换行\n' }]);
    expect(jsonToCsv(jsonInput)).toBe('text\n"含,逗号""与换行\n"');
  });

  it('null 补空、对象转 JSON 字符串、布尔直出', () => {
    expect(jsonToCsv('[{"n":null,"o":{"x":1},"b":true}]')).toBe('n,o,b\n,"{""x"":1}",true');
  });

  it('非对象元素给出友好错误，单对象视为一行', () => {
    expect(() => jsonToCsv('[1,2,3]')).toThrow('由对象组成的数组');
    expect(() => jsonToCsv('{"a":1}')).not.toThrow();
  });

  it('非法 JSON 报语法错误', () => {
    expect(() => jsonToCsv('{bad')).toThrow('JSON 语法错误');
  });
});

describe('csvToJson', () => {
  it('基础转换：表头为键，默认全部字符串', () => {
    expect(csvToJson('name,age\n茉莉,3')).toBe(
      '[\n  {\n    "name": "茉莉",\n    "age": "3"\n  }\n]',
    );
  });

  it('convertNumbers 开启后纯数字转数值', () => {
    const json = csvToJson('name,age\n茉莉,3', { convertNumbers: true });
    expect(json).toContain('"age": 3');
  });

  it('前导零字符串不被数字转换破坏', () => {
    expect(csvToJson('code\n007', { convertNumbers: true })).toContain('"007"');
  });

  it('字段少于表头时补空字符串', () => {
    expect(csvToJson('a,b\n1')).toContain('"b": ""');
  });

  it('往返：CSV → JSON → CSV 一致', () => {
    const original = 'name,text,age\n茉莉,"含,逗号",3\nMoli,"line1\nline2",4';
    const json = csvToJson(original, { convertNumbers: true });
    expect(jsonToCsv(json)).toBe(original);
  });
});

describe('列选择与表头重命名（v1.1.0）', () => {
  it('includeKeys 选择子集并按给出顺序输出', () => {
    expect(jsonToCsv('[{"a":1,"b":2,"c":3}]', { includeKeys: ['c', 'a'] })).toBe('c,a\n3,1');
  });

  it('includeKeys 忽略不存在的键', () => {
    expect(jsonToCsv('[{"a":1}]', { includeKeys: ['a', 'ghost'] })).toBe('a\n1');
  });

  it('全部键都被取消时提示至少选择一列', () => {
    expect(() => jsonToCsv('[{"a":1}]', { includeKeys: [] })).toThrow('请至少选择一列');
  });

  it('getJsonKeys 提取列名，非法输入返回 null', () => {
    expect(getJsonKeys('[{"a":1,"b":2},{"a":3}]')).toEqual(['a', 'b']);
    expect(getJsonKeys('{bad')).toBeNull();
  });

  it('getCsvHeader 提取表头，空输入返回 null', () => {
    expect(getCsvHeader('a,b\n1,2')).toEqual(['a', 'b']);
    expect(getCsvHeader('')).toBeNull();
  });

  it('headerNames 按列位置重命名，缺省沿用原名', () => {
    const json = csvToJson('a,b\n1,2', { headerNames: { 0: '列一' }, convertNumbers: true });
    expect(json).toContain('"列一": 1');
    expect(json).toContain('"b": 2');
  });
});
