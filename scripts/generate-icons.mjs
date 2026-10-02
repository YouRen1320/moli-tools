/**
 * 生成 PWA 图标（一次性脚本，产物提交到 public/icons/）。
 * 运行：pnpm node scripts/generate-icons.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const GRADIENT_DEFS = `
  <defs>
    <linearGradient id="dusk" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff8a5c" />
      <stop offset="0.55" stop-color="#f468a7" />
      <stop offset="1" stop-color="#6d5ae0" />
    </linearGradient>
  </defs>`;

const STAR = (cx, cy, r) =>
  `M ${cx} ${cy - r} L ${cx + r * 0.38} ${cy - r * 0.38} L ${cx + r} ${cy} ` +
  `L ${cx + r * 0.38} ${cy + r * 0.38} L ${cx} ${cy + r} L ${cx - r * 0.38} ${cy + r * 0.38} ` +
  `L ${cx - r} ${cy} L ${cx - r * 0.38} ${cy - r * 0.38} Z`;

function iconSvg({ size, rounded, padding }) {
  const inset = rounded ? size * 0.03 : 0;
  const radius = rounded ? size * 0.22 : 0;
  const starR = size * 0.31 * (1 - padding);
  const starCx = size / 2;
  const starCy = size / 2 - size * 0.02 * padding;
  const dots = padding < 0.01;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  ${GRADIENT_DEFS}
  <rect x="${inset}" y="${inset}" width="${size - inset * 2}" height="${size - inset * 2}" rx="${radius}" fill="url(#dusk)" />
  <path d="${STAR(starCx, starCy, starR)}" fill="#ffffff" />
  ${
    dots
      ? `<circle cx="${size * 0.74}" cy="${size * 0.26}" r="${size * 0.037}" fill="#ffffff" opacity="0.9" />
  <circle cx="${size * 0.26}" cy="${size * 0.74}" r="${size * 0.028}" fill="#ffffff" opacity="0.7" />`
      : ''
  }
</svg>`;
}

await mkdir('public/icons', { recursive: true });

const targets = [
  { file: 'public/icons/icon-192.png', size: 192, rounded: true, padding: 0 },
  { file: 'public/icons/icon-512.png', size: 512, rounded: true, padding: 0 },
  // maskable 需要 80% 安全区：图形缩小，背景全出血
  { file: 'public/icons/maskable-512.png', size: 512, rounded: false, padding: 0.2 },
];

for (const target of targets) {
  const png = await sharp(Buffer.from(iconSvg(target)))
    .png()
    .toBuffer();
  await writeFile(target.file, png);
  console.log(`已生成 ${target.file}（${png.length} 字节）`);
}

// OG 分享图 1200x630（社交媒体链接卡片）
function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  ${GRADIENT_DEFS}
  <rect width="1200" height="630" fill="url(#dusk)" />
  <circle cx="980" cy="470" r="150" fill="#ffffff" opacity="0.08" />
  <path d="${STAR(120, 130, 52)}" fill="#ffffff" />
  <circle cx="1060" cy="110" r="8" fill="#ffffff" opacity="0.9" />
  <circle cx="180" cy="520" r="6" fill="#ffffff" opacity="0.7" />
  <text x="120" y="345" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="104" font-weight="700" fill="#ffffff">YouRen工具箱</text>
  <text x="124" y="425" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="36" fill="#ffffff" opacity="0.92">纯浏览器本地处理 · 文件不上传服务器 · 支持离线使用</text>
  <text x="124" y="486" font-family="PingFang SC, Microsoft YaHei, sans-serif" font-size="28" fill="#ffffff" opacity="0.75">youren1320.github.io/youren-tools</text>
</svg>`;
}
const ogPng = await sharp(Buffer.from(ogSvg())).png().toBuffer();
await writeFile('public/og.png', ogPng);
console.log(`已生成 public/og.png（${ogPng.length} 字节）`);
