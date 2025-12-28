import React, { useState } from 'react';
import { useTranslation } from '../../../../i18n';
import { Button } from '@/components/ui/button';
import { useCanvasContext } from '../../composables/CanvasContext';

/**
 * 修复设置组件
 * 功能：提供修复算法选择、扩散步数和边缘扩张像素的调节
 */
export const InpaintSettings: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  
  // 修复设置状态
  const [inpaintSettings, setInpaintSettings] = useState({
    algorithm: 'Lama' as 'Lama' | 'SD Inpaint',
    steps: 30,
    padding: 10
  });
  
  // 处理算法选择
  const handleAlgorithmChange = (value: 'Lama' | 'SD Inpaint') => {
    setInpaintSettings(prev => ({ ...prev, algorithm: value }));
  };
  
  // 处理步数变化
  const handleStepsChange = (value: number[]) => {
    setInpaintSettings(prev => ({ ...prev, steps: value[0] }));
  };
  
  // 处理边缘扩张变化
  const handlePaddingChange = (value: number[]) => {
    setInpaintSettings(prev => ({ ...prev, padding: value[0] }));
  };
  
  // 应用修复设置
  const applySettings = () => {
    const selectedLayer = state.layers.find(layer => layer.id === state.selectedLayerId);
    if (selectedLayer) {
      dispatch({
        type: 'UPDATE_LAYER',
        payload: {
          id: selectedLayer.id,
          updates: {
            properties: {
              ...selectedLayer.properties,
              inpaintSettings
            }
          }
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* 修复算法选择 */}
      <div>
        <label className="text-sm mb-2 block font-medium text-text-secondary">{t('stageA.inpaintAlgorithm')}</label>
        <select
          value={inpaintSettings.algorithm}
          onChange={(e) => handleAlgorithmChange(e.target.value as 'Lama' | 'SD Inpaint')}
          className="w-full text-sm border border-border rounded px-3 py-2 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent hover:border-border-light transition-colors"
        >
          <option value="Lama">{t('stageA.lamaAlgorithm')}</option>
          <option value="SD Inpaint">{t('stageA.sdInpaintAlgorithm')}</option>
        </select>
      </div>
      
      {/* 扩散步数 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-text-secondary">{t('stageA.diffusionSteps')}</label>
          <span className="text-xs text-text-tertiary">{inpaintSettings.steps}</span>
        </div>
        <input
          type="range"
          value={inpaintSettings.steps}
          min={10}
          max={100}
          step={1}
          onChange={(e) => handleStepsChange([parseInt(e.target.value)])}
          className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
        />
      </div>
      
      {/* 边缘扩张 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-text-secondary">{t('stageA.edgePadding')}</label>
          <span className="text-xs text-text-tertiary">{inpaintSettings.padding}px</span>
        </div>
        <input
          type="range"
          value={inpaintSettings.padding}
          min={0}
          max={50}
          step={1}
          onChange={(e) => handlePaddingChange([parseInt(e.target.value)])}
          className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
        />
      </div>
      
      {/* 应用按钮 */}
      <Button variant="outline" size="sm" className="w-full text-xs" onClick={applySettings}>
        {t('common.apply')}
      </Button>
    </div>
  );
};
