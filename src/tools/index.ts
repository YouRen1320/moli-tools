import { toolCategories, type ToolCategory, type ToolMeta } from './types';
import { tool as mergePdf } from './pdf/merge-pdf/meta';
import { tool as extractPages } from './pdf/extract-pages/meta';
import { tool as imageCompress } from './image/compress/meta';
import { tool as base64 } from './text/base64/meta';
import { tool as jsonFormat } from './text/json-format/meta';
import { tool as wordCount } from './text/word-count/meta';
import { tool as urlCodec } from './text/url-codec/meta';
import { tool as markdownPreview } from './text/markdown-preview/meta';
import { tool as textDiff } from './text/text-diff/meta';
import { tool as textClean } from './text/text-clean/meta';
import { tool as unitConverter } from './convert/unit-converter/meta';
import { tool as timestamp } from './time/timestamp/meta';
import { tool as qrcode } from './generate/qrcode/meta';
import { tool as colorConvert } from './design/color-convert/meta';
import { tool as hashCalc } from './dev/hash-calc/meta';
import { tool as passwordGenerator } from './dev/password-generator/meta';
import { tool as uuidGenerator } from './dev/uuid-generator/meta';
import { tool as pdfToImage } from './pdf/pdf-to-image/meta';

export const allTools: ToolMeta[] = [
  mergePdf,
  extractPages,
  pdfToImage,
  imageCompress,
  base64,
  jsonFormat,
  wordCount,
  urlCodec,
  markdownPreview,
  textDiff,
  textClean,
  timestamp,
  qrcode,
  colorConvert,
  hashCalc,
  passwordGenerator,
  uuidGenerator,
  unitConverter,
];

const seenSlugs = new Set<string>();
for (const tool of allTools) {
  if (seenSlugs.has(tool.slug)) {
    throw new Error(`工具 slug 重复：${tool.slug}`);
  }
  seenSlugs.add(tool.slug);
}

export function getTool(slug: string): ToolMeta | undefined {
  return allTools.find((tool) => tool.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): ToolMeta[] {
  return allTools.filter((tool) => tool.category === category);
}

export { toolCategories };
export type { ToolCategory, ToolMeta } from './types';
