import React from 'react';
import { cn } from '@/lib/utils';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * 数字输入组件
 * 提供带标签的数字输入框，支持最小值、最大值和步长
 */
export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  className,
  disabled = false,
  placeholder
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      // 确保值在范围内
      let clampedValue = newValue;
      if (min !== undefined && clampedValue < min) clampedValue = min;
      if (max !== undefined && clampedValue > max) clampedValue = max;
      onChange(clampedValue);
    }
  };

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      {label && (
        <label className="text-sm text-muted-foreground">
          {label}
        </label>
      )}
      <input
        type="number"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          'px-3 py-2 rounded-md border border-border',
          'bg-background text-foreground',
          'focus:outline-none focus:ring-2 focus:ring-accent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors'
        )}
      />
    </div>
  );
};
