export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  cjkCharacters: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
}

const CJK_CHAR_GLOBAL = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;

/** 中英混排统计：每个 CJK 字符计为一个词，拉丁文按空白分词 */
export function countTextStats(text: string): TextStats {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const cjkMatches = text.match(CJK_CHAR_GLOBAL);
  const cjkCharacters = cjkMatches ? cjkMatches.length : 0;
  const latinWords = text
    .replace(CJK_CHAR_GLOBAL, ' ')
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
  const trimmed = text.trim();
  const lines = trimmed === '' ? 0 : text.split(/\r\n|\r|\n/).length;
  const sentences =
    trimmed === ''
      ? 0
      : trimmed.split(/[.!?;。！？；]+/).filter((part) => part.trim() !== '').length;
  const paragraphs =
    trimmed === '' ? 0 : trimmed.split(/\n\s*\n/).filter((part) => part.trim() !== '').length;
  return {
    characters,
    charactersNoSpaces,
    cjkCharacters,
    words: latinWords + cjkCharacters,
    lines,
    sentences,
    paragraphs,
  };
}
