import React, { useState } from 'react';
import { useTranslation } from '../../../../i18n';
import { useCanvasContext } from '../../composables/CanvasContext';

/**
 * 语义涂抹控制面板组件
 * 功能：提供语义涂抹模式的配置选项
 */
interface SemanticBrushPanelProps {
  onBrushModeChange: (mode: string) => void;
  onBrushSizeChange: (size: number) => void;
  onEdgeSnapChange: (enabled: boolean) => void;
  onJointExpansionChange: (enabled: boolean) => void;
  currentBrushMode: string;
  currentBrushSize: number;
  edgeSnapEnabled: boolean;
  jointExpansionEnabled: boolean;
}

export const SemanticBrushPanel: React.FC<SemanticBrushPanelProps> = ({
  onBrushModeChange,
  onBrushSizeChange,
  onEdgeSnapChange,
  onJointExpansionChange,
  currentBrushMode,
  currentBrushSize,
  edgeSnapEnabled,
  jointExpansionEnabled
}) => {
  const { t } = useTranslation();
  const { state } = useCanvasContext();

  // 部位颜色映射
  const partColors: Record<string, string> = {
    head: '#FF6B6B',
    body: '#4ECDC4',
    leftArm: '#45B7D1',
    rightArm: '#96CEB4',
    leftLeg: '#FFEAA7',
    rightLeg: '#DDA0DD',
    eraser: '#95A5A6'
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-text-secondary">{t('stageB.semanticBrush')}</h4>
      
      <div className="space-y-2">
        <div className="text-xs text-text-tertiary mb-1">{t('stageB.brushMode')}</div>
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(partColors).map(([mode, color]) => (
            <button
              key={mode}
              className={`px-2 py-1 text-xs rounded transition-colors ${currentBrushMode === mode ? 'bg-accent text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
              onClick={() => onBrushModeChange(mode)}
              style={{ borderLeft: `3px solid ${color}` }}
            >
              {mode === 'head' && t('stageB.head')}
              {mode === 'body' && t('stageB.body')}
              {mode === 'leftArm' && t('stageB.leftArm')}
              {mode === 'rightArm' && t('stageB.rightArm')}
              {mode === 'leftLeg' && t('stageB.leftLeg')}
              {mode === 'rightLeg' && t('stageB.rightLeg')}
              {mode === 'eraser' && t('stageB.eraser')}
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-text-tertiary">
          <span>{t('stageB.brushSize')}</span>
          <span>{currentBrushSize}px</span>
        </div>
        <input
          type="range"
          min="5"
          max="50"
          value={currentBrushSize}
          onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
          className="w-full accent-accent"
        />
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center text-xs">
          <input
            type="checkbox"
            checked={edgeSnapEnabled}
            onChange={(e) => onEdgeSnapChange(e.target.checked)}
            className="mr-2 accent-accent"
          />
          {t('stageB.edgeSnap')}
        </label>
        
        <label className="flex items-center text-xs">
          <input
            type="checkbox"
            checked={jointExpansionEnabled}
            onChange={(e) => onJointExpansionChange(e.target.checked)}
            className="mr-2 accent-accent"
          />
          {t('stageB.jointExpansion')}
        </label>
      </div>
    </div>
  );
};
