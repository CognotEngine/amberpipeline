import React from 'react';
import { StageARenderer } from './StageARenderer';
import { StageBRenderer } from './StageBRenderer';
import { StageCRenderer } from './StageCRenderer';
import { StageDRenderer } from './StageDRenderer';

interface RenderDispatcherProps {
  mode: 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'animation';
  data: any;
  transform: { scale: number; translateX: number; translateY: number };
  onProcessingChange?: (isProcessing: boolean) => void;
  onSelectLayer?: (layerId: string) => void;
  onUpdateOpacity?: (layerId: string, newOpacity: number) => void;
  onToggleVisibility?: (layerId: string, newVisible: boolean) => void;
  onAddPoint?: (point: any) => void;
  onSelectPoint?: (pointId: string) => void;
  onToggleAddMode?: (newMode: boolean) => void;
  onConnectPoints?: (pointId1: string, pointId2: string) => void;
  onUpdateLayers?: (layers: any[]) => void;
  onUpdateAnimation?: (animation: any) => void;
}

/**
 * 渲染调度器组件
 * 功能：根据当前模式动态渲染对应的图层组件
 */
export const RenderDispatcher: React.FC<RenderDispatcherProps> = ({
  mode,
  data,
  transform,
  onProcessingChange,
  onSelectLayer: _onSelectLayer,
  onUpdateOpacity: _onUpdateOpacity,
  onToggleVisibility: _onToggleVisibility,
  onAddPoint: _onAddPoint,
  onSelectPoint: _onSelectPoint,
  onToggleAddMode: _onToggleAddMode,
  onConnectPoints: _onConnectPoints,
  // onUpdateLayers属性暂时未使用
  // onUpdateLayers,
  onUpdateAnimation: _onUpdateAnimation
}) => {
  // 使用条件渲染，根据模式单独渲染对应的组件，确保类型安全
  return (
    <>
      {mode === 'precision-cut' && (
        <StageARenderer 
          imagePath={data?.imagePath || ''}
          transform={transform}
          onProcessingChange={onProcessingChange}
        />
      )}
      {mode === 'character-layer' && (
        <StageBRenderer 
          imagePath={data?.imagePath || ''}
          transform={transform}
          onProcessingChange={onProcessingChange}
        />
      )}
      {mode === 'skeleton-binding' && (
        <StageCRenderer 
          imagePath={data?.imagePath || ''}
          transform={transform}
          onProcessingChange={onProcessingChange}
        />
      )}
      {mode === 'animation' && (
        <StageDRenderer 
          imagePath={data?.imagePath || ''}
          transform={transform}
          onProcessingChange={onProcessingChange}
        />
      )}
    </>
  );
};