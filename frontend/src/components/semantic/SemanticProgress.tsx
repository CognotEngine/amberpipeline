import * as React from 'react';
import { cn } from '@/lib/utils';
import { sx, useComponentStyle } from '@/themes/themeUtils';

interface SemanticProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: 'default' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  semantic?: string[];
}

/**
 * 语义化进度条组件
 * 功能：提供符合主题样式的进度条，支持多种变体和尺寸
 * 使用示例：
 * <SemanticProgress value={50} max={100} semantic={['border.roundedSm']} />
 * <SemanticProgress value={75} variant="accent" size="large" />
 */
const SemanticProgress = React.forwardRef<HTMLDivElement, SemanticProgressProps>(
  ({ 
    className, 
    value = 0,
    max = 100,
    variant = 'default',
    size = 'medium',
    semantic = [],
    ...props 
  }, ref) => {
    // 计算进度百分比
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    // 使用useComponentStyle获取主题配置的进度条样式
    const componentStyles = useComponentStyle({ 
      component: 'progress', 
      variant, 
      size 
    });

    // 根据变体获取背景色
    const getProgressColor = () => {
      switch (variant) {
        case 'accent':
          return 'bg.accent';
        case 'secondary':
          return 'bg.textSecondary';
        default:
          return 'bg.success';
      }
    };

    // 合并所有样式
    const containerStyles = cn(
      sx([...semantic, 'state.transition'], {
        'bg.surface border.border w-full overflow-hidden': true,
        'h-1': size === 'small',
        'h-2': size === 'medium',
        'h-3': size === 'large',
        'border.roundedSm': size === 'small',
        'border.roundedMd': size === 'medium',
        'border.roundedLg': size === 'large',
      }),
      componentStyles,
      className
    );

    const progressStyles = sx(
      ['h-full transition-all duration-300'],
      { [getProgressColor()]: true }
    );

    return (
      <div
        ref={ref}
        className={containerStyles}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        {...props}
      >
        <div
          className={progressStyles}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
SemanticProgress.displayName = 'SemanticProgress';

export { SemanticProgress };
