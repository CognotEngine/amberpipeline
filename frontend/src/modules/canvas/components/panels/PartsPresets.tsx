import React from 'react';
import { useTranslation } from '../../../../i18n';
import { Button } from '@/components/ui/button';
import { useCanvasContext } from '../../composables/CanvasContext';

/**
 * 部位预设组件
 * 功能：提供标准人形和四足动物等预设模板，以及图层细分属性调节
 */
export const PartsPresets: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  
  // 预设模板定义
  const presets = [
    { id: 'human', name: t('stageB.humanPreset'), parts: 22 },
    { id: 'quadruped', name: t('stageB.quadrupedPreset'), parts: 18 },
    { id: 'bird', name: t('stageB.birdPreset'), parts: 15 },
  ];
  
  // 图层细分属性
  const [layerProperties, setLayerProperties] = React.useState({
    feathering: 3,
    dilation: 5,
    vertexDensity: 50
  });
  
  // 应用预设
  const applyPreset = (presetId: string) => {
    // 这里可以添加应用预设的逻辑
    console.log('应用预设:', presetId);
  };
  
  // 更新图层属性
  const updateLayerProperty = (property: keyof typeof layerProperties, value: number) => {
    setLayerProperties(prev => ({ ...prev, [property]: value }));
    
    const selectedLayer = state.layers.find(layer => layer.id === state.selectedLayerId);
    if (selectedLayer) {
      dispatch({
        type: 'UPDATE_LAYER',
        payload: {
          id: selectedLayer.id,
          updates: {
            properties: {
              ...selectedLayer.properties,
              ...layerProperties,
              [property]: value
            }
          }
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* 预设模板列表 */}
      <div className="space-y-2">
        {presets.map((preset) => (
          <div key={preset.id} className="p-2 border border-border rounded">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => applyPreset(preset.id)}
            >
              <div className="flex flex-col items-start">
                <div className="text-sm font-medium">{preset.name}</div>
                <div className="text-xs text-text-secondary">{t('stageB.partsCount', { count: preset.parts })}</div>
              </div>
            </Button>
          </div>
        ))}
      </div>
      
      {/* 图层细分属性 */}
      <div className="pt-2 border-t border-border">
        <h4 className="text-sm font-medium mb-2 text-text-secondary">{t('stageB.layerProperties')}</h4>
        
        {/* 边缘羽化 */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-text-secondary">{t('stageB.feathering')}</label>
            <span className="text-xs text-text-tertiary">{layerProperties.feathering}px</span>
          </div>
          <input
            type="range"
            value={layerProperties.feathering}
            min={0}
            max={20}
            step={0.5}
            onChange={(e) => updateLayerProperty('feathering', parseFloat(e.target.value))}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>
        
        {/* 扩张像素 */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-text-secondary">{t('stageB.dilation')}</label>
            <span className="text-xs text-text-tertiary">{layerProperties.dilation}px</span>
          </div>
          <input
            type="range"
            value={layerProperties.dilation}
            min={0}
            max={20}
            step={1}
            onChange={(e) => updateLayerProperty('dilation', parseInt(e.target.value))}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>
        
        {/* 顶点密度 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium text-text-secondary">{t('stageB.vertexDensity')}</label>
            <span className="text-xs text-text-tertiary">{layerProperties.vertexDensity}%</span>
          </div>
          <input
            type="range"
            value={layerProperties.vertexDensity}
            min={10}
            max={100}
            step={5}
            onChange={(e) => updateLayerProperty('vertexDensity', parseInt(e.target.value))}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>
      </div>
    </div>
  );
};
