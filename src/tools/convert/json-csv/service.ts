export type Delimiter = ',' | ';' | '\t';

export const DELIMITERS: { value: Delimiter; label: string }[] = [
  { value: ',', label: '逗号 (,)' },
  { value: ';', label: '分号 (;)' },
  { value: '\t', label: 'Tab' },
];

/** RFC 4180 状态机解析：支持引号字段、转义引号、字段内换行；分隔符可选 */
export function parseCsv(text: string, delimiter: Delimiter = ','): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let index = 0;

  while (index < text.length) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 2;
          continue;
        }
        inQuotes = false;
        index += 1;
        continue;
      }
      field += char;
      index += 1;
      continue;
    }
    if (char === '"' && field === '') {
      inQuotes = true;
      index += 1;
      continue;
    }
    if (char === delimiter) {
      row.push(field);
      field = '';
      index += 1;
      continue;
    }
    if (char === '\n' || char === '\r') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      if (char === '\r' && text[index + 1] === '\n') index += 1;
      index += 1;
      continue;
    }
    field += char;
    index += 1;
  }

  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // 跳过纯空行
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

function escapeCell(cell: string, delimiter: Delimiter): string {
  const needsQuotes = /[",\n\r]/.test(cell) || cell.includes(delimiter);
  return needsQuotes ? `"${cell.replace(/"/g, '""')}"` : cell;
}

function cellOf(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function collectRecords(input: string): Record<string, unknown>[] {
  let data: unknown;
  try {
    data = JSON.parse(input);
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`JSON 语法错误：${message}`, { cause });
  }
  const records: Record<string, unknown>[] = Array.isArray(data)
    ? data
    : [data as Record<string, unknown>];
  if (records.length === 0) throw new Error('JSON 数组为空');
  if (
    records.some((record) => typeof record !== 'object' || record === null || Array.isArray(record))
  ) {
    throw new Error('JSON 需要是由对象组成的数组，例如 [{"name":"茉莉"}]');
  }
  return records;
}

/** 解析 JSON 的列名（按首次出现顺序）；输入非法时返回 null，供 UI 实时提示 */
export function getJsonKeys(input: string): string[] | null {
  try {
    const records = collectRecords(input);
    const keys: string[] = [];
    for (const record of records) {
      for (const key of Object.keys(record)) {
        if (!keys.includes(key)) keys.push(key);
      }
    }
    return keys;
  } catch {
    return null;
  }
}

export interface JsonToCsvOptions {
  /** 只导出指定列（按给出顺序）；缺省导出全部列 */
  includeKeys?: string[];
  /** 输出分隔符，缺省逗号 */
  delimiter?: Delimiter;
}

/** JSON（对象数组）→ CSV；键按首次出现顺序合并，可用 includeKeys 选择/排序列 */
export function jsonToCsv(input: string, options: JsonToCsvOptions = {}): string {
  const delimiter = options.delimiter ?? ',';
  const records = collectRecords(input);
  const allKeys: string[] = [];
  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!allKeys.includes(key)) allKeys.push(key);
    }
  }
  const keys =
    options.includeKeys === undefined
      ? allKeys
      : options.includeKeys.filter((key) => allKeys.includes(key));
  if (keys.length === 0) throw new Error('请至少选择一列');
  const lines = [keys.map((key) => escapeCell(key, delimiter)).join(delimiter)];
  for (const record of records) {
    lines.push(keys.map((key) => escapeCell(cellOf(record[key]), delimiter)).join(delimiter));
  }
  return lines.join('\n');
}

const NUMERIC_PATTERN = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;

export interface CsvToJsonOptions {
  convertNumbers?: boolean;
  /** 按列位置重命名表头；缺省的位置沿用原表头 */
  headerNames?: Record<number, string>;
  /** 输入分隔符，缺省逗号 */
  delimiter?: Delimiter;
}

/** 提取 CSV 表头；输入为空时返回 null，供 UI 实时提示 */
export function getCsvHeader(input: string, delimiter: Delimiter = ','): string[] | null {
  const rows = parseCsv(input, delimiter);
  return rows.length > 0 ? rows[0] : null;
}

/** CSV → JSON（对象数组，2 空格缩进） */
export function csvToJson(input: string, options: CsvToJsonOptions = {}): string {
  const rows = parseCsv(input, options.delimiter ?? ',');
  if (rows.length === 0) throw new Error('CSV 内容为空');
  const [header, ...body] = rows;
  if (header.every((cell) => cell === '')) throw new Error('CSV 表头为空');

  const records = body.map((row) => {
    const record: Record<string, unknown> = {};
    header.forEach((key, columnIndex) => {
      const renamed = options.headerNames?.[columnIndex];
      const name =
        renamed !== undefined && renamed.trim() !== ''
          ? renamed.trim()
          : key === ''
            ? `column_${columnIndex + 1}`
            : key;
      const raw = row[columnIndex] ?? '';
      record[name] = options.convertNumbers && NUMERIC_PATTERN.test(raw) ? Number(raw) : raw;
    });
    return record;
  });
  return JSON.stringify(records, null, 2);
}
