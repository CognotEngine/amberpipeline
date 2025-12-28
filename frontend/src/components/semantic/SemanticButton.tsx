import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';
import { sx, useComponentStyle } from '@/themes/themeUtils';

interface SemanticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'success' | 'ghost';
  size?: 'small' | 'medium' | 'large' | 'sm' | 'icon';
  semantic?: string[];
  isLoading?: boolean;
}

/**
 * 语义化按钮组件
 * 功能：提供符合主题样式的按钮，支持多种变体和尺寸
 * 使用示例：
 * <SemanticButton variant="primary" semantic={['state.hover', 'state.focus']}>
 *   按钮文本
 * </SemanticButton>
 */
const SemanticButton = React.forwardRef<HTMLButtonElement, SemanticButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'medium', 
    asChild = false, 
    semantic = [],
    disabled,
    isLoading = false,
    children,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    // 标准化size值
    const normalizedSize = size === 'sm' ? 'small' : size === 'icon' ? 'small' : size;
    
    // 使用组件样式 Hook
    const componentStyles = useComponentStyle({
      component: 'button',
      variant: variant === 'ghost' ? 'secondary' : variant,
      size: normalizedSize
    });
    
    // 合并所有样式
    const finalStyles = sx(
      [...semantic, 'state.transition'],
      {
        'opacity-70 cursor-not-allowed': disabled === true || isLoading,
        'bg-transparent hover:bg-accent/10': variant === 'ghost',
        'h-8 w-8 p-0': size === 'icon'
      },
      cn(componentStyles, className)
    );

    return (
      <Comp
        className={finalStyles}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

SemanticButton.displayName = 'SemanticButton';

export { SemanticButton };
