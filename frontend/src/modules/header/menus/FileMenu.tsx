import React, { useState } from 'react';
import { useTranslation } from '../../../i18n';
import { FilePlus, File, Save } from 'lucide-react';
import { Menu } from '../components/Menu';
import { MenuItem } from '../components/MenuItem';
import { Modal } from '../../../components/common/Modal';

interface FileMenuProps {
  /** 当前是否激活 */
  isActive: boolean;
  /** 菜单激活状态变化事件 */
  onToggle: () => void;
  /** 新建画布事件处理函数 */
  onNewCanvas?: (width: number, height: number, mode: 'precision-cut' | 'character-layer' | 'skeleton-binding') => void;
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
  const [showNewCanvasModal, setShowNewCanvasModal] = useState(false);
  const [canvasParams, setCanvasParams] = useState({
    width: 1920,
    height: 1080,
    mode: 'precision-cut' as 'precision-cut' | 'character-layer' | 'skeleton-binding'
  });

  /**
   * 处理新建画布
   */
  const handleNewCanvas = () => {
    setShowNewCanvasModal(true);
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

  /**
   * 确认新建画布
   */
  const confirmNewCanvas = () => {
    onNewCanvas?.(canvasParams.width, canvasParams.height, canvasParams.mode);
    setShowNewCanvasModal(false);
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

      {/* 新建画布模态对话框 */}
      <Modal
        visible={showNewCanvasModal}
        title={t('menu.new-canvas')}
        onClose={() => setShowNewCanvasModal(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button 
              className="px-4 py-2 bg-background border border-border rounded text-textPrimary hover:bg-hover transition-colors"
              onClick={() => setShowNewCanvasModal(false)}
            >
              {t('common.cancel')}
            </button>
            <button 
              className="px-4 py-2 bg-accent text-white rounded hover:bg-accent-dark transition-colors flex items-center gap-2"
              onClick={confirmNewCanvas}
            >
              {t('common.ok')}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-textSecondary mb-1">{t('canvas.width')}</label>
            <input 
              type="number" 
              value={canvasParams.width} 
              onChange={(e) => setCanvasParams({...canvasParams, width: parseInt(e.target.value) || 0})} 
              className="w-full px-3 py-2 bg-background border border-border rounded text-textPrimary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-textSecondary mb-1">{t('canvas.height')}</label>
            <input 
              type="number" 
              value={canvasParams.height} 
              onChange={(e) => setCanvasParams({...canvasParams, height: parseInt(e.target.value) || 0})} 
              className="w-full px-3 py-2 bg-background border border-border rounded text-textPrimary"
            />
          </div>
          
          <div>
            <label className="block text-sm text-textSecondary mb-1">{t('canvas.mode')}</label>
            <select 
              value={canvasParams.mode} 
              onChange={(e) => setCanvasParams({...canvasParams, mode: e.target.value as 'precision-cut' | 'character-layer' | 'skeleton-binding'})} 
              className="w-full px-3 py-2 bg-background border border-border rounded text-textPrimary"
            >
              <option value="precision-cut">{t('mode.precision-cut')}</option>
              <option value="character-layer">{t('mode.character-layer')}</option>
              <option value="skeleton-binding">{t('mode.skeleton-binding')}</option>
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
};
