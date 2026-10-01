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
