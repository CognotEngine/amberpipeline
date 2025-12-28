import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { FileMenu } from './menus/FileMenu';
import { EditMenu } from './menus/EditMenu';
import { SelectMenu } from './menus/SelectMenu';
import { ViewMenu } from './menus/ViewMenu';
import { HelpMenu } from './menus/HelpMenu';

interface GlobalMenuProps {
  className?: string;
  onNewCanvas?: (width: number, height: number, mode: 'precision-cut' | 'character-layer' | 'skeleton-binding') => void;
  onOpenImage?: () => void;
  onSaveImage?: () => void;
}

/**
 * 全局菜单组件
 * 功能：提供文件操作、编辑功能、帮助等主菜单功能
 * 架构：采用组件化设计，每个一级菜单拆分为独立的子组件
 */
export const GlobalMenu: React.FC<GlobalMenuProps> = ({ 
  className, 
  onNewCanvas, 
  onOpenImage, 
  onSaveImage 
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  /**
   * 切换菜单显示状态
   */
  const toggleMenu = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  /**
   * 菜单列表配置
   * 支持动态配置，新增菜单只需添加到数组中
   */
  const menuConfig = [
    {
      id: 'file',
      component: (
        <FileMenu
          isActive={activeMenu === 'file'}
          onToggle={() => toggleMenu('file')}
          onNewCanvas={onNewCanvas}
          onOpenImage={onOpenImage}
          onSaveImage={onSaveImage}
        />
      )
    },
    {
      id: 'edit',
      component: (
        <EditMenu
          isActive={activeMenu === 'edit'}
          onToggle={() => toggleMenu('edit')}
        />
      )
    },
    {
      id: 'select',
      component: (
        <SelectMenu
          isActive={activeMenu === 'select'}
          onToggle={() => toggleMenu('select')}
        />
      )
    },
    {
      id: 'view',
      component: (
        <ViewMenu
          isActive={activeMenu === 'view'}
          onToggle={() => toggleMenu('view')}
        />
      )
    },
    {
      id: 'help',
      component: (
        <HelpMenu
          isActive={activeMenu === 'help'}
          onToggle={() => toggleMenu('help')}
        />
      )
    }
  ];

  return (
    <div className={cn("flex items-center justify-between h-full px-2", className)}>
      {/* Logo */}
      <div className="flex items-center flex-shrink-0">
        <div className="mr-[8px] flex items-center">
          <img src="/favicon.ico" alt="Logo" className="w-8 h-8" />
          <span className="ml-2 text-textPrimary text-sm font-medium">AmberPipeline</span>
        </div>
      </div>
      
      {/* 导航菜单 */}
      <nav className="flex items-center gap-[15px] flex-grow mx-4 whitespace-nowrap">
        {/* 动态渲染菜单列表 */}
        {menuConfig.map((menu) => (
          <div key={menu.id}>{menu.component}</div>
        ))}
      </nav>
    </div>
  );
};