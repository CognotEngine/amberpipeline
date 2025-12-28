import { cn } from '@/lib/utils';

interface ThemedComponentTemplateProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * 主题组件模板示例
 * 遵循 "Semantic Tokens + Utility Functions" 样式协议
 * 所有新组件应基于此模板创建
 */
export function ThemedComponentTemplate({ className, children, ...props }: ThemedComponentTemplateProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border border-border rounded-lg p-4",
        "hover:bg-accent hover:text-accent-foreground transition-colors duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}