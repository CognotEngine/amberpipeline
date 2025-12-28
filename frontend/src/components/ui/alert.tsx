import { SemanticAlert as Alert } from '../semantic/SemanticAlert';

export { Alert };

// 创建子组件的类型安全导出
type AlertComponent = typeof Alert & {
  Title: React.FC<React.HTMLAttributes<HTMLHeadingElement>>;
  Description: React.FC<React.HTMLAttributes<HTMLParagraphElement>>;
};

// 导出子组件
export const AlertTitle = (Alert as AlertComponent).Title;
export const AlertDescription = (Alert as AlertComponent).Description;