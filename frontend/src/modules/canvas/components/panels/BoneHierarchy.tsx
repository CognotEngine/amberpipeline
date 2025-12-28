import React from 'react';
import { useTranslation } from '../../../../i18n';
import { useCanvasContext } from '../../composables/CanvasContext';
import { Button } from '@/components/ui/button';

/**
 * 骨骼层级树组件
 * 功能：显示和管理骨骼层级关系，支持重命名、设置镜像对称等操作
 */
export const BoneHierarchy: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  
  // 权重画笔设置
  const [brushSettings, setBrushSettings] = React.useState({
    strength: 0.5,
    radius: 20
  });
  
  // 旋转角度限制
  const [rotationLimit, setRotationLimit] = React.useState(60);
  
  // 递归渲染骨骼层级
  const renderSkeletonHierarchy = (pointId: string | null, level = 0) => {
    const points = pointId
      ? state.skeletonPoints.filter(p => p.parentId === pointId)
      : state.skeletonPoints.filter(p => !p.parentId);
      
    return points.map(point => (
      <div key={point.id} className="ml-4 border-l border-border pl-4">
        <div
          className={`flex items-center space-x-2 py-1 ${state.selectedPointId === point.id ? 'bg-primary/10 rounded' : ''}`}
        >
          <div
            className="flex-1 cursor-pointer text-sm truncate"
            onClick={() => dispatch({ type: 'SET_SELECTED_POINT', payload: point.id })}
          >
            {point.name || `关节 ${point.id.split('-')[1]}`}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6"
            onClick={() => toggleSymmetry(point.id)}
          >
            ↔️
          </Button>
        </div>
        {renderSkeletonHierarchy(point.id, level + 1)}
      </div>
    ));
  };
  
  // 切换镜像对称
  const toggleSymmetry = (pointId: string) => {
    // 这里可以添加设置镜像对称的逻辑
    console.log('设置镜像对称:', pointId);
  };
  
  // 更新画笔设置
  const updateBrushSetting = (setting: keyof typeof brushSettings, value: number) => {
    setBrushSettings(prev => ({ ...prev, [setting]: value }));
  };
  
  // 更新旋转限制
  const updateRotationLimit = (value: number) => {
    setRotationLimit(value);
  };
  
  // 应用自动权重计算
  const applyAutoWeights = () => {
    // 这里可以添加自动权重计算的逻辑
    console.log('应用自动权重计算');
  };

  return (
    <div className="space-y-4">
      {/* 骨骼层级树 */}
      <div className="max-h-48 overflow-y-auto border border-border rounded p-2">
        {state.skeletonPoints.length === 0 ? (
          <div className="text-sm text-text-secondary text-center py-4">
            {t('stageC.noBones')}
          </div>
        ) : (
          renderSkeletonHierarchy(null)
        )}
      </div>
      
      {/* 权重编辑工具 */}
      <div className="pt-2 border-t border-border">
        <h4 className="text-sm font-medium mb-2">{t('stageC.weightTools')}</h4>
        
        {/* 画笔强度 */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium">{t('stageC.brushStrength')}</label>
            <span className="text-xs text-text-secondary">{brushSettings.strength.toFixed(2)}</span>
          </div>
          <input
            type="range"
            value={brushSettings.strength}
            min={0}
            max={1}
            step={0.01}
            onChange={(e) => updateBrushSetting('strength', parseFloat(e.target.value))}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* 画笔半径 */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium">{t('stageC.brushRadius')}</label>
            <span className="text-xs text-text-secondary">{brushSettings.radius}px</span>
          </div>
          <input
            type="range"
            value={brushSettings.radius}
            min={5}
            max={50}
            step={1}
            onChange={(e) => updateBrushSetting('radius', parseInt(e.target.value))}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* 自动权重计算按钮 */}
        <Button variant="outline" size="sm" className="w-full text-xs mb-3" onClick={applyAutoWeights}>
          {t('stageC.autoWeights')}
        </Button>
      </div>
      
      {/* 约束设置 */}
      <div className="pt-2 border-t border-border">
        <h4 className="text-sm font-medium mb-2">{t('stageC.constraintSettings')}</h4>
        
        {/* 旋转角度限制 */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium">{t('stageC.rotationLimit')}</label>
            <span className="text-xs text-text-secondary">±{rotationLimit}°</span>
          </div>
          <input
            type="range"
            value={rotationLimit}
            min={10}
            max={180}
            step={5}
            onChange={(e) => updateRotationLimit(parseInt(e.target.value))}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
