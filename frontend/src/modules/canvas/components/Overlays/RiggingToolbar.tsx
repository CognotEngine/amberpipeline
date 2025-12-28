import React from 'react';
import { useTranslation } from '../../../../i18n';
import { Button, Tooltip } from '../../../../components/ui';
import { Plus, Link2, MousePointer, Palette, Settings } from 'lucide-react';
import { sx } from '../../../../themes/themeUtils';

// 定义工具栏模式类型
type RiggingMode = 'add' | 'connect' | 'weight' | 'ik';

interface RiggingToolbarProps {
  currentMode: RiggingMode;
  onModeChange: (mode: RiggingMode) => void;
  onToggleWeightVisualization: () => void;
  weightVisualization: boolean;
}

/**
 * 骨骼绑定工具栏组件
 * 功能：提供骨骼绘制、权重编辑、IK链配置等功能的入口
 */
export const RiggingToolbar: React.FC<RiggingToolbarProps> = ({
  currentMode,
  onModeChange,
  onToggleWeightVisualization,
  weightVisualization
}) => {
  const { t } = useTranslation();

  return (
    <div className={sx(['absolute', 'top-4', 'left-4', 'bg.surface', 'border', 'border.border', 'rounded-lg', 'p-2', 'space-y-2', 'shadow-md', 'z-20']) }>
      {/* 模式选择 */}
      <div className={sx(['text-xs', 'text.text-secondary', 'mb-2'])}>{t('rigging.toolbar.mode')}</div>
      <div className={sx(['space-y-1'])}>
        <Tooltip content={t('rigging.toolbar.add-point')}>
          <Button
            variant={currentMode === 'add' ? 'primary' : 'secondary'}
            size="small"
            className={sx(['w-full', 'flex', 'items-center', 'justify-start', 'gap-2'])} 
            onClick={() => onModeChange('add')}
          >
            <Plus className="w-4 h-4" />
            {t('rigging.toolbar.add-point')}
          </Button>
        </Tooltip>
        
        <Tooltip content={t('rigging.toolbar.connect-points')}>
          <Button
            variant={currentMode === 'connect' ? 'primary' : 'secondary'}
            size="small"
            className={sx(['w-full', 'flex', 'items-center', 'justify-start', 'gap-2'])} 
            onClick={() => onModeChange('connect')}
          >
            <Link2 className="w-4 h-4" />
            {t('rigging.toolbar.connect-points')}
          </Button>
        </Tooltip>
        
        <Tooltip content={t('rigging.toolbar.weight-edit')}>
          <Button
            variant={currentMode === 'weight' ? 'primary' : 'secondary'}
            size="small"
            className={sx(['w-full', 'flex', 'items-center', 'justify-start', 'gap-2'])} 
            onClick={() => onModeChange('weight')}
          >
            <Palette className="w-4 h-4" />
            {t('rigging.toolbar.weight-edit')}
          </Button>
        </Tooltip>
        
        <Tooltip content={t('rigging.toolbar.ik-config')}>
          <Button
            variant={currentMode === 'ik' ? 'primary' : 'secondary'}
            size="small"
            className={sx(['w-full', 'flex', 'items-center', 'justify-start', 'gap-2'])} 
            onClick={() => onModeChange('ik')}
          >
            <Settings className="w-4 h-4" />
            {t('rigging.toolbar.ik-config')}
          </Button>
        </Tooltip>
      </div>
      
      {/* 分隔线 */}
      <div className={sx(['border-t', 'border.border', 'my-2'])}/>
      
      {/* 权重可视化开关 */}
      <Tooltip content={t('rigging.toolbar.toggle-weight-visualization')}>
        <Button
          variant={weightVisualization ? 'primary' : 'secondary'}
          size="small"
          className={sx(['w-full', 'flex', 'items-center', 'justify-start', 'gap-2'])} 
          onClick={onToggleWeightVisualization}
        >
          <MousePointer className="w-4 h-4" />
          {t('rigging.toolbar.show-weights')}
        </Button>
      </Tooltip>
    </div>
  );
};
