import React from 'react';
import { useTranslation } from '../../../i18n';
import { FilePlus, File, Save } from 'lucide-react';
import { Menu } from '../components/Menu';
import { MenuItem } from '../components/MenuItem';
import { sx } from '../../../themes/themeUtils';

interface FileMenuProps {
  /** 当前是否激活 */
  isActive: boolean;
  /** 菜单激活状态变化事件 */
  onToggle: () => void;
  /** 新建画布事件处理函数 */
  onNewCanvas?: (width: number, height: number, mode: 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'animation') => void;
  /** 打开图片事件处理函数 */
  onOpenImage?: () => void;
  /** 保存图片事件处理函数 */
  onSaveImage?: () => void;
}

/**
 * 文件菜单组件
 * 功能：提供文件相关操作，包括新建画布、打开图片、保存图片等
 */
export const FileMenu: React.FC<FileMenuProps> = ({
  isActive,
  onToggle,
  onNewCanvas,
  onOpenImage,
  onSaveImage
}) => {
  const { t } = useTranslation();

  /**
   * 处理新建画布
   */
  const handleNewCanvas = () => {
    // 使用默认参数调用新建画布
    onNewCanvas?.(1920, 1080, 'precision-cut');
    onToggle(); // 关闭菜单
  };

  /**
   * 处理打开图片
   */
  const handleOpenImage = () => {
    onOpenImage?.();
    onToggle(); // 关闭菜单
  };

  /**
   * 处理保存图片
   */
  const handleSaveImage = () => {
    onSaveImage?.();
    onToggle(); // 关闭菜单
  };

  return (
    <>
      <Menu name={t('menu.file')} isActive={isActive} onToggle={onToggle}>
        <MenuItem
          title={t('menu.new')}
          icon={FilePlus}
          shortcut="Ctrl+N"
          onClick={handleNewCanvas}
        />
        <MenuItem
          title={t('menu.open')}
          icon={File}
          shortcut="Ctrl+O"
          onClick={handleOpenImage}
        />
        <MenuItem
          title={t('menu.save')}
          icon={Save}
          shortcut="Ctrl+S"
          onClick={handleSaveImage}
        />
      </Menu>
    </>
  );
};
