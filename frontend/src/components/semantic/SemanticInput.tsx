import * as React from 'react';
import { cn } from '@/lib/utils';
import { sx, useComponentStyle } from '@/themes/themeUtils';

interface SemanticInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'accent' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  semantic?: string[];
}

/**
 * 语义化输入框组件
 * 功能：提供符合主题样式的输入框，支持多种状态和变体
 * 使用示例：
 * <SemanticInput variant="accent" size="large" placeholder="请输入内容" /> 
 * <SemanticInput semantic={['state.focus', 'state.transition']} disabled /> 
 */
const SemanticInput = React.forwardRef<HTMLInputElement, SemanticInputProps>(
  ({ 
    className, 
    variant = 'default',
    size = 'medium',
    semantic = [],
    disabled,
    ...props 
  }, ref) => {
    // 使用组件样式工具获取主题定义的组件样式
    const componentStyle = useComponentStyle({
      component: 'input',
      variant,
      size
    });
    
    // 合并所有样式
    const finalStyles = sx(
      [...semantic, 'state.transition'],
      {
        'opacity-70 cursor-not-allowed': !!disabled,
        'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent': !disabled
      },
      cn(
        'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground',
        // 根据尺寸调整高度
        { 'h-8': size === 'small', 'h-10': size === 'medium', 'h-12': size === 'large' },
        componentStyle,
        className
      )
    );

    return (
      <input
        className={finalStyles}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);

SemanticInput.displayName = 'SemanticInput';

export { SemanticInput };
