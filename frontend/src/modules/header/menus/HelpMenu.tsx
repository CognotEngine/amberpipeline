import React from 'react';
import { useTranslation } from '../../../i18n';
import { HelpCircle, Info } from 'lucide-react';
import { Menu } from '../components/Menu';
import { MenuItem } from '../components/MenuItem';

interface HelpMenuProps {
  /** 当前是否激活 */
  isActive: boolean;
  /** 菜单激活状态变化事件 */
  onToggle: () => void;
}

/**
 * 帮助菜单组件
 * 功能：提供帮助相关操作，包括帮助文档、关于等
 */
export const HelpMenu: React.FC<HelpMenuProps> = ({
  isActive,
  onToggle
}) => {
  const { t } = useTranslation();

  return (
    <Menu name={t('menu.help')} isActive={isActive} onToggle={onToggle}>
      <MenuItem
        title={t('common.help')}
        icon={HelpCircle}
        onClick={() => {
          onToggle();
          // 这里可以添加具体的帮助文档逻辑
          console.log('帮助文档');
        }}
      />
      <MenuItem
        title={t('common.about')}
        icon={Info}
        onClick={() => {
          onToggle();
          // 这里可以添加具体的关于逻辑
          console.log('关于');
        }}
      />
    </Menu>
  );
};
