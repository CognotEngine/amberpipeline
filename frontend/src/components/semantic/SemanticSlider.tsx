import * as React from 'react';
import { cn } from '@/lib/utils';
import { sx, useComponentStyle } from '@/themes/themeUtils';

interface SemanticSliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange'> {
  semantic?: string[];
  variant?: 'default' | 'range';
  sliderSize?: 'small' | 'medium' | 'large';
  value?: number[];
  onValueChange?: (value: number[]) => void;
}

/**
 * 语义化滑块组件
 * 功能：提供符合主题样式的滑块，支持多种变体和尺寸
 * 使用示例：
 * <SemanticSlider
 *   value={50}
 *   min={0}
 *   max={100}
 *   step={1}
 *   semantic={['state.focus', 'state.transition']}
 *   onChange={(e) => setValue(Number(e.target.value))}
 * />
 */
const SemanticSlider = React.forwardRef<HTMLInputElement, SemanticSliderProps>(
  ({ 
    className, 
    variant = 'default', 
    sliderSize = 'medium', 
    semantic = [],
    disabled,
    value,
    onValueChange,
    ...props 
  }, ref) => {
    // 使用组件样式 Hook
    const componentStyles = useComponentStyle({
      component: 'slider',
      variant,
      size: sliderSize
    });
    
    // 合并所有样式
    const finalStyles = sx(
      [...semantic, 'state.transition'],
      {
        'opacity-70 cursor-not-allowed': disabled === true,
        'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent': !disabled
      },
      cn(componentStyles, className)
    );

    // 处理值变化
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onValueChange) {
        onValueChange([Number(e.target.value)]);
      }
    };

    return (
      <input
        type="range"
        className={finalStyles}
        ref={ref}
        disabled={disabled}
        value={value ? value[0] : undefined}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

SemanticSlider.displayName = 'SemanticSlider';

export { SemanticSlider };
