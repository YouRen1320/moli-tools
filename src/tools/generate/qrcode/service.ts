import QRCode from 'qrcode';

export type QrErrorLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrOptions {
  /** 输出图片边长（像素） */
  width: number;
  /** 静区宽度（模块数） */
  margin: number;
  level: QrErrorLevel;
}

/** 生成二维码 PNG 的 data URL；内容为空时抛错 */
export async function generateQrDataUrl(text: string, options: QrOptions): Promise<string> {
  if (text.trim() === '') throw new Error('请输入要生成二维码的内容');
  return QRCode.toDataURL(text, {
    width: options.width,
    margin: options.margin,
    errorCorrectionLevel: options.level,
  });
}
