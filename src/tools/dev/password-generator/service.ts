export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
}

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/';

export const LIMITS = { minLength: 8, maxLength: 64 };

function randomInt(maxExclusive: number): number {
  // 拒绝采样避免取模偏差
  const range = 4294967296; // 2^32
  const limit = range - (range % maxExclusive);
  const buffer = new Uint32Array(1);
  do {
    globalThis.crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % maxExclusive;
}

/** 生成密码；保证每类启用的字符集至少出现一次 */
export function generatePassword(options: PasswordOptions): string {
  const { length, uppercase, digits, symbols } = options;
  if (!Number.isInteger(length) || length < LIMITS.minLength || length > LIMITS.maxLength) {
    throw new Error(`密码长度需在 ${LIMITS.minLength}-${LIMITS.maxLength} 位之间`);
  }
  if (globalThis.crypto?.getRandomValues === undefined) {
    throw new Error('当前环境不支持加密级随机数');
  }

  let pool = LOWERCASE;
  const required: string[] = [];
  if (uppercase) {
    pool += UPPERCASE;
    required.push(UPPERCASE[randomInt(UPPERCASE.length)]);
  }
  if (digits) {
    pool += DIGITS;
    required.push(DIGITS[randomInt(DIGITS.length)]);
  }
  if (symbols) {
    pool += SYMBOLS;
    required.push(SYMBOLS[randomInt(SYMBOLS.length)]);
  }

  const chars: string[] = [];
  for (let i = 0; i < length - required.length; i += 1) {
    chars.push(pool[randomInt(pool.length)]);
  }
  chars.push(...required);
  // Fisher-Yates 洗牌打乱必需字符的位置
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

/** 信息熵（bit）：log2(字符集大小^长度) */
export function entropyBits(options: PasswordOptions): number {
  let poolSize = LOWERCASE.length;
  if (options.uppercase) poolSize += UPPERCASE.length;
  if (options.digits) poolSize += DIGITS.length;
  if (options.symbols) poolSize += SYMBOLS.length;
  return Math.round(options.length * Math.log2(poolSize));
}

/** 熵值对应的强度等级 */
export function strengthLabel(bits: number): {
  label: string;
  tone: 'weak' | 'fair' | 'good' | 'strong';
} {
  if (bits < 45) return { label: '较弱', tone: 'weak' };
  if (bits < 60) return { label: '一般', tone: 'fair' };
  if (bits < 80) return { label: '良好', tone: 'good' };
  return { label: '很强', tone: 'strong' };
}

// ============ 生成历史（localStorage） ============

export const HISTORY_KEY = 'youren-password-history';
export const HISTORY_LIMIT = 10;

export interface HistoryEntry {
  /** 唯一标识（同毫秒内可能生成多条，时间戳不能当 ID 用） */
  id: string;
  password: string;
  /** 生成时间戳（毫秒） */
  time: number;
  options: PasswordOptions;
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.password === 'string' &&
    typeof entry.time === 'number' &&
    typeof entry.options === 'object' &&
    entry.options !== null
  );
}

/** 读取历史；损坏或缺失时返回空数组（历史属于敏感数据，读取失败宁可静默为空） */
export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isHistoryEntry).slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function newId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `p${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

/** 前插一条历史（相同密码移到最前），超出上限裁剪；返回新列表 */
export function saveToHistory(
  password: string,
  options: PasswordOptions,
  existing: HistoryEntry[] = loadHistory(),
): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: newId(),
    password,
    time: Date.now(),
    options: { ...options },
  };
  const history = [entry, ...existing.filter((item) => item.password !== password)].slice(
    0,
    HISTORY_LIMIT,
  );
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* 存储不可用（隐私模式等）时仅影响历史功能 */
  }
  return history;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* 忽略 */
  }
}

/** 按唯一标识删除单条历史；返回新列表 */
export function removeFromHistory(
  id: string,
  existing: HistoryEntry[] = loadHistory(),
): HistoryEntry[] {
  const history = existing.filter((entry) => entry.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* 忽略 */
  }
  return history;
}

/** 历史条目的字符集摘要：如「小写+大写+数字」 */
export function optionsSummary(options: PasswordOptions): string {
  const parts = ['小写'];
  if (options.uppercase) parts.push('大写');
  if (options.digits) parts.push('数字');
  if (options.symbols) parts.push('符号');
  return parts.join('+');
}
