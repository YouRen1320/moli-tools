/**
 * 无障碍巡检：扫描 dist 下全部 HTML，检查
 * 1) 每页恰好一个 h1；2) header/main/footer 三个 landmark 存在；3) 每张 img 都有 alt。
 * 违例时逐条列出并以非零码退出（CI 与 pnpm verify 使用）。
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function listHtml(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listHtml(full)));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

const distDir = 'dist';
const files = await listHtml(distDir);
const problems = [];

for (const file of files) {
  const html = await readFile(file, 'utf8');
  const rel = file.slice(distDir.length + 1);

  const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count !== 1) problems.push(`${rel}: 期望恰好 1 个 h1，实际 ${h1Count}`);

  for (const landmark of ['<header', '<main', '<footer']) {
    if (!html.includes(landmark)) problems.push(`${rel}: 缺少 landmark <${landmark}>`);
  }

  for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
    if (!/\balt=/.test(match[1])) problems.push(`${rel}: img 缺少 alt 属性`);
  }
}

if (problems.length > 0) {
  console.error(`无障碍巡检发现 ${problems.length} 个问题：`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(`无障碍巡检通过：${files.length} 个页面（h1 唯一 / landmark 齐全 / img alt 齐全）`);
