import React from 'react';
import { cn } from '@/lib/utils';

interface MenuProps {
  /** 菜单名称 */
  name: string;
  /** 当前是否激活 */
  isActive: boolean;
  /** 菜单激活状态变化事件 */
  onToggle: () => void;
  /** 菜单项内容 */
  children: React.ReactNode;
  /** 额外的CSS类名 */
  className?: string;
}

/**
 * 一级菜单组件
 * 功能：渲染单个一级菜单，包括菜单标题和下拉内容
 */
export const Menu: React.FC<MenuProps> = ({
  name,
  isActive,
  onToggle,
  children,
  className
}) => {
  return (
    <div className={cn("relative group flex-shrink-0", className)}>
      {/* 菜单标题 */}
      <div 
        className="px-4 py-2 text-textPrimary text-sm cursor-pointer select-none hover:bg-hover rounded-lg transition-all duration-150"
        onClick={onToggle}
      >
        <span>{name}</span>
      </div>
      
      {/* 下拉菜单内容 */}
      <div 
        className={cn(
          "absolute left-0 mt-1 bg-[#252525] border border-border rounded-lg shadow-2xl py-1 opacity-0 invisible transition-all duration-200 z-10 min-w-[180px]",
          isActive && 'opacity-100 visible'
        )}
      >
        {children}
      </div>
    </div>
  );
};
