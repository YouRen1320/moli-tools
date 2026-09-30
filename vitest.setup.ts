import '@testing-library/jest-dom/vitest';

// 固定时区，保证时间相关测试在任意机器上结果一致
process.env.TZ = 'Asia/Shanghai';
