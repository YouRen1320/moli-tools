import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Base64Tool from './index';

describe('Base64Tool 组件', () => {
  it('输入中文并编码，结果区出现 Base64', () => {
    render(<Base64Tool />);
    const input = screen.getByLabelText('要编码的文本');
    fireEvent.change(input, { target: { value: '世界' } });
    fireEvent.click(screen.getByRole('button', { name: '执行编码' }));
    const output = screen.getByLabelText('结果') as HTMLTextAreaElement;
    expect(output.value).toBe('5LiW55WM');
  });

  it('解码非法 Base64 时展示错误提示', () => {
    render(<Base64Tool />);
    fireEvent.click(screen.getByRole('button', { name: '解码' }));
    const input = screen.getByLabelText('要解码的 Base64');
    fireEvent.change(input, { target: { value: '!!!' } });
    fireEvent.click(screen.getByRole('button', { name: '执行解码' }));
    expect(screen.getByText(/解码失败/)).toBeInTheDocument();
  });
});
