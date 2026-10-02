import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import JsonCsv from './index';

/** 无障碍第四批：Tab 连续遍历不应出现焦点陷阱 */
describe('JsonCsv 键盘遍历', () => {
  it('连续 Tab 焦点持续移动且覆盖主要控件（无陷阱）', async () => {
    const user = userEvent.setup();
    render(<JsonCsv />);

    const seen: string[] = [];
    let stalled = 0;
    for (let i = 0; i < 40; i += 1) {
      await user.tab();
      const active = document.activeElement;
      const key = `${active?.tagName}:${active?.getAttribute('aria-label') ?? active?.textContent?.slice(0, 8)}`;
      seen.push(key);
      if (seen.length >= 2 && seen[seen.length - 1] === seen[seen.length - 2]) stalled += 1;
    }

    // 40 次 Tab 无连续停滞（无焦点陷阱），且已覆盖文本框与主要按钮
    expect(stalled).toBe(0);
    const focusedText = seen.join('|');
    expect(focusedText).toContain('TEXTAREA');
    expect(focusedText).toContain('BUTTON:JSON → C');
  });

  it(' Shift+Tab 反向遍历同样可达控件', async () => {
    const user = userEvent.setup();
    render(<JsonCsv />);
    const textarea = screen.getByLabelText('输入 JSON（对象数组）');
    textarea.focus();
    await user.tab({ shift: true });
    // 焦点离开 textarea 即可（具体落点取决于遍历实现）
    expect(document.activeElement).not.toBe(textarea);
  });
});
