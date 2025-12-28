import React from 'react';
import { useTranslation } from '../../../../i18n';

/**
 * 骨骼绑定模式控制面板组件
 * 功能：提供骨骼绑定的模式切换选项
 */
interface RiggingModePanelProps {
  currentMode: string;
  onModeChange: (mode: string) => void;
  onToggleWeightVisualization: () => void;
  weightVisualization: boolean;
}

export const RiggingModePanel: React.FC<RiggingModePanelProps> = ({
  currentMode,
  onModeChange,
  onToggleWeightVisualization,
  weightVisualization
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-text-secondary">{t('stageC.mode')}</h4>
      
      <div className="grid grid-cols-2 gap-1">
        <button
          className={`px-2 py-1 text-xs rounded transition-colors ${currentMode === 'add' ? 'bg-accent text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
          onClick={() => onModeChange('add')}
        >
          {t('rigging.toolbar.add-point')}
        </button>
        <button
          className={`px-2 py-1 text-xs rounded transition-colors ${currentMode === 'connect' ? 'bg-accent text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
          onClick={() => onModeChange('connect')}
        >
          {t('rigging.toolbar.connect-points')}
        </button>
        <button
          className={`px-2 py-1 text-xs rounded transition-colors ${currentMode === 'weight' ? 'bg-accent text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
          onClick={() => onModeChange('weight')}
        >
          {t('rigging.toolbar.weight-edit')}
        </button>
        <button
          className={`px-2 py-1 text-xs rounded transition-colors ${currentMode === 'ik' ? 'bg-accent text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
          onClick={() => onModeChange('ik')}
        >
          {t('rigging.toolbar.ik-config')}
        </button>
      </div>
      
      <div className="flex items-center justify-between text-xs text-text-tertiary">
        <span>{t('rigging.toolbar.show-weights')}</span>
        <button
          onClick={onToggleWeightVisualization}
          className={`w-8 h-4 rounded-full transition-all ${weightVisualization ? 'bg-accent' : 'bg-surface'} border border-border flex items-center`}
        >
          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${weightVisualization ? 'translate-x-4' : 'translate-x-0.5'} shadow-md`} />
        </button>
      </div>
    </div>
  );
};
