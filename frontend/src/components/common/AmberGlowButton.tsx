import React from 'react';
import { cn } from '@/lib/utils';

interface AmberGlowButtonProps {
  /** 按钮文本 */
  label: string;
  /** 按钮尺寸：small, medium, large */
  size?: 'small' | 'medium' | 'large';
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否为主按钮 */
  primary?: boolean;
  /** 点击事件处理函数 */
  onClick?: () => void;
  /** 额外的CSS类名 */
  className?: string;
}

/**
 * 琥珀绿发光按钮组件
 * 功能：提供带有发光效果的按钮，支持不同尺寸和状态
 */
export const AmberGlowButton: React.FC<AmberGlowButtonProps> = ({
  label,
  size = 'medium',
  disabled = false,
  primary = true,
  onClick,
  className
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={cn(
        'rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 ring-accent/50 font-Inter',
        {
          'px-3 py-1 text-xs': size === 'small',
          'px-4 py-2 text-sm': size === 'medium',
          'px-6 py-3 text-base': size === 'large',
          'bg-surface text-text-primary border border-border hover:bg-hover hover:border-border-light active:bg-surface-elevated active:scale-[0.98] shadow-sm hover:shadow-md': primary && !disabled,
          'bg-surface text-text-tertiary border border-border hover:bg-hover hover:text-text-secondary hover:border-border-light active:bg-surface-elevated active:scale-[0.98]': !primary && !disabled,
          'bg-surface text-disabled border border-border-light opacity-70 cursor-not-allowed': disabled
        },
        className
      )}
      disabled={disabled}
      onClick={handleClick}
    >
      {label}
    </button>
  );
};