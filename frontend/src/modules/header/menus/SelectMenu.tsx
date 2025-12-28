import React from 'react';
import { useTranslation } from '../../../i18n';
import { Square, Circle, LassoSelect, MousePointerClick, EyeOff } from 'lucide-react';
import { Menu } from '../components/Menu';
import { MenuItem } from '../components/MenuItem';

interface SelectMenuProps {
  /** 当前是否激活 */
  isActive: boolean;
  /** 菜单激活状态变化事件 */
  onToggle: () => void;
}

/**
 * 选择菜单组件
 * 功能：提供选择相关操作，包括矩形选择、圆形选择、自由选择、全选、取消选择等
 */
export const SelectMenu: React.FC<SelectMenuProps> = ({
  isActive,
  onToggle
}) => {
  const { t } = useTranslation();

  return (
    <Menu name={t('menu.select')} isActive={isActive} onToggle={onToggle}>
      <MenuItem
        title={t('select.rectangle') || '矩形选择'}
        icon={Square}
        onClick={() => {
          onToggle();
          // 这里可以添加具体的矩形选择逻辑
          console.log('矩形选择');
        }}
      />
      <MenuItem
        title={t('select.circle') || '圆形选择'}
        icon={Circle}
        onClick={() => {
          onToggle();
          // 这里可以添加具体的圆形选择逻辑
          console.log('圆形选择');
        }}
      />
      <MenuItem
        title={t('select.lasso') || '自由选择'}
        icon={LassoSelect}
        onClick={() => {
          onToggle();
          // 这里可以添加具体的自由选择逻辑
          console.log('自由选择');
        }}
      />
      <MenuItem isSeparator />
      <MenuItem
        title={t('select.selectAll') || '全选'}
        icon={MousePointerClick}
        shortcut="Ctrl+A"
        onClick={() => {
          onToggle();
          // 这里可以添加具体的全选逻辑
          console.log('全选');
        }}
      />
      <MenuItem
        title={t('select.deselectAll') || '取消选择'}
        icon={EyeOff}
        onClick={() => {
          onToggle();
          // 这里可以添加具体的取消选择逻辑
          console.log('取消选择');
        }}
      />
    </Menu>
  );
};
