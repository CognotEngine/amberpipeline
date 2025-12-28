import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MenuItemProps {
  /** 菜单项标题 */
  title?: string;
  /** 菜单项图标 */
  icon?: LucideIcon;
  /** 菜单项快捷键 */
  shortcut?: string;
  /** 菜单项是否禁用 */
  disabled?: boolean;
  /** 菜单项点击事件处理函数 */
  onClick?: () => void;
  /** 菜单项是否为分隔线 */
  isSeparator?: boolean;
  /** 额外的CSS类名 */
  className?: string;
}

/**
 * 单个菜单项组件
 * 功能：渲染单个菜单项，支持图标、快捷键、禁用状态等
 */
export const MenuItem: React.FC<MenuItemProps> = ({
  title,
  icon: IconComponent,
  shortcut,
  disabled = false,
  onClick,
  isSeparator = false,
  className
}) => {
  // 如果是分隔线，渲染分隔线样式
  if (isSeparator) {
    return (
      <div className={cn(
        "border-t border-border my-1 mx-3 opacity-50",
        className
      )} />
    );
  }

  return (
    <button
      className={cn(
        "block px-5 py-2.5 text-sm text-textPrimary hover:bg-hover hover:text-accent flex items-center gap-3 transition-all duration-150 w-full text-left",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {IconComponent && <IconComponent size={16} />}
      <span>{title}</span>
      {shortcut && (
        <span className="ml-auto text-textTertiary text-xs">{shortcut}</span>
      )}
    </button>
  );
};
