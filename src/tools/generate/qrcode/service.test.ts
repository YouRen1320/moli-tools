import { describe, expect, it } from 'vitest';
import { generateQrDataUrl } from './service';

describe('generateQrDataUrl', () => {
  it('生成 PNG data URL', async () => {
    const url = await generateQrDataUrl('https://example.com', {
      width: 256,
      margin: 2,
      level: 'M',
    });
    expect(url).toMatch(/^data:image\/png;base64,/);
  });

  it('内容为空时给出可读错误', async () => {
    await expect(generateQrDataUrl('   ', { width: 256, margin: 2, level: 'M' })).rejects.toThrow(
      '请输入要生成二维码的内容',
    );
  });
});
