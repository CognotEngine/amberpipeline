import React from 'react';
import { useTranslation } from '../../../i18n';
import { Undo, Redo, LassoSelect, MousePointerClick } from 'lucide-react';
import { Menu } from '../components/Menu';
import { MenuItem } from '../components/MenuItem';

interface EditMenuProps {
  /** 当前是否激活 */
  isActive: boolean;
  /** 菜单激活状态变化事件 */
  onToggle: () => void;
}

/**
 * 编辑菜单组件
 * 功能：提供编辑相关操作，包括撤销、重做、导入、移动等
 */
export const EditMenu: React.FC<EditMenuProps> = ({
  isActive,
  onToggle
}) => {
  const { t } = useTranslation();

  return (
    <Menu name={t('menu.edit')} isActive={isActive} onToggle={onToggle}>
      <MenuItem
        title={t('menu.undo')}
        icon={Undo}
        onClick={() => {
          onToggle();
          // 这里可以添加具体的撤销逻辑
          console.log('撤销操作');
        }}
      />
      <MenuItem
        title={t('menu.redo')}
        icon={Redo}
        onClick={() => {
          onToggle();
          // 这里可以添加具体的重做逻辑
          console.log('重做操作');
        }}
      />
      <MenuItem isSeparator />
      <MenuItem
        title={t('common.import')}
        icon={LassoSelect}
        onClick={() => {
          onToggle();
          // 这里可以添加具体的导入逻辑
          console.log('导入操作');
        }}
      />
      <MenuItem
        title={t('tool.move')}
        icon={MousePointerClick}
        onClick={() => {
          onToggle();
          // 这里可以添加具体的移动逻辑
          console.log('移动工具');
        }}
      />
    </Menu>
  );
};
