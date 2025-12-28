import * as React from 'react';
import { sx, useComponentStyle } from '@/themes/themeUtils';

interface SemanticCardProps {
  children: React.ReactNode;
  className?: string;
  semantic?: string[];
  variant?: "default" | "elevated" | "outlined" | "ghost";
  size?: "small" | "medium" | "large";
}

interface SemanticCardHeaderProps {
  children: React.ReactNode;
  className?: string;
  semantic?: string[];
}

interface SemanticCardTitleProps {
  children: React.ReactNode;
  className?: string;
  semantic?: string[];
  as?: React.ElementType;
}

interface SemanticCardDescriptionProps {
  children: React.ReactNode;
  className?: string;
  semantic?: string[];
}

interface SemanticCardContentProps {
  children: React.ReactNode;
  className?: string;
  semantic?: string[];
}

interface SemanticCardFooterProps {
  children: React.ReactNode;
  className?: string;
  semantic?: string[];
}

/**
 * 语义化卡片组件
 * 功能：提供符合主题样式的卡片容器，支持多种子组件和变体
 * 使用示例：
 * <SemanticCard semantic={['shadow.md', 'border.rounded']} variant="elevated" size="medium">
 *   <SemanticCardHeader>
 *     <SemanticCardTitle>卡片标题</SemanticCardTitle>
 *     <SemanticCardDescription>卡片描述</SemanticCardDescription>
 *   </SemanticCardHeader>
 *   <SemanticCardContent>
 *     卡片内容
 *   </SemanticCardContent>
 *   <SemanticCardFooter>
 *     卡片页脚
 *   </SemanticCardFooter>
 * </SemanticCard>
 */
export const SemanticCard: React.FC<SemanticCardProps> = ({ 
  children, 
  className,
  semantic = ['bg.surface', 'border.default', 'shadow.md', 'border.rounded'],
  variant = "default",
  size = "medium"
}) => {
  // 使用useComponentStyle获取主题配置的卡片样式
  const componentStyle = useComponentStyle({ 
    component: 'card', 
    variant, 
    size 
  });

  return (
    <div 
      className={sx(
        [...semantic, 'state.transition'],
        {
          // 变体样式
          'shadow-sm hover:shadow-md hover:-translate-y-0.5': variant === "default",
          'shadow-md hover:shadow-lg hover:-translate-y-0.5': variant === "elevated",
          'border-2 border-accent/20': variant === "outlined",
          'border-transparent shadow-none': variant === "ghost",
          // 移除默认内边距，由子组件控制
          'p-0': true
        },
        `${componentStyle} ${className || ''}`
      )}
    >
      {children}
    </div>
  );
};

/**
 * 卡片头部组件
 */
export const SemanticCardHeader: React.FC<SemanticCardHeaderProps> = ({ 
  children, 
  className,
  semantic = ['p-6']
}) => {
  return (
    <div className={sx(semantic, undefined, className)}>
      {children}
    </div>
  );
};

/**
 * 卡片标题组件
 */
export const SemanticCardTitle: React.FC<SemanticCardTitleProps> = ({ 
  children, 
  className,
  semantic = ['typography.h3', 'text.primary', 'font-semibold'],
  as: As = 'h3'
}) => {
  return (
    <As className={sx(semantic, undefined, className)}>
      {children}
    </As>
  );
};

/**
 * 卡片描述组件
 */
export const SemanticCardDescription: React.FC<SemanticCardDescriptionProps> = ({ 
  children, 
  className,
  semantic = ['text.secondary', 'typography.small']
}) => {
  return (
    <p className={sx(semantic, undefined, className)}>
      {children}
    </p>
  );
};

/**
 * 卡片内容组件
 */
export const SemanticCardContent: React.FC<SemanticCardContentProps> = ({ 
  children, 
  className,
  semantic = ['p-6 pt-0']
}) => {
  return (
    <div className={sx(semantic, undefined, className)}>
      {children}
    </div>
  );
};

/**
 * 卡片页脚组件
 */
export const SemanticCardFooter: React.FC<SemanticCardFooterProps> = ({ 
  children, 
  className,
  semantic = ['flex items-center p-6 pt-0']
}) => {
  return (
    <div className={sx(semantic, undefined, className)}>
      {children}
    </div>
  );
};
