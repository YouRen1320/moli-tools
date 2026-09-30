import { getTool } from '@tools';

/** Astro 岛屿无法序列化组件，客户端按 slug 从注册表取回工具组件 */
export default function ToolHost({ slug }: { slug: string }) {
  const tool = getTool(slug);
  if (!tool) return null;
  const Component = tool.component;
  return <Component />;
}
