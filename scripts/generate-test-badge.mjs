/**
 * 从 vitest JSON 报告生成 shields.io endpoint 徽章数据。
 * 用法：node scripts/generate-test-badge.mjs [报告路径] [输出路径]
 * 由 badges.yml 在 main 推送时调用，README 的 tests 徽章引用输出文件的 raw 地址。
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const reportPath = process.argv[2] ?? 'vitest-report.json';
const outPath = process.argv[3] ?? 'docs/badges/tests.json';

const report = JSON.parse(await readFile(reportPath, 'utf8'));
const passed = Number(report.numPassedTests ?? 0);
const total = Number(report.numTotalTests ?? 0);
if (total === 0) throw new Error('测试报告为空，请确认 vitest --reporter=json 已运行');

const color = passed === total ? 'brightgreen' : 'red';
const badge = {
  schemaVersion: 1,
  label: 'tests',
  message: `${passed}/${total} passing`,
  color,
};

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(badge)}\n`);
console.log(`已生成 ${outPath}（${passed}/${total} passing，${color}）`);
