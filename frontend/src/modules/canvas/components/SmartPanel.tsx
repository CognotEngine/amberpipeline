import React from 'react';
import { useTranslation } from '../../../i18n';
import { useCanvasContext } from '../composables/CanvasContext';
import { LayerManager } from './panels/LayerManager';
import { InpaintSettings } from './panels/InpaintSettings';
import { PartsPresets } from './panels/PartsPresets';
import { BoneHierarchy } from './panels/BoneHierarchy';
import { ClipManager } from './panels/ClipManager';
import { AutoMeshPanel } from './panels/AutoMeshPanel';
import { MirrorSymmetryPanel } from './panels/MirrorSymmetryPanel';
import { PoseControlPanel } from './panels/PoseControlPanel';
import { SAMPanel } from './panels/SAMPanel';
import { SemanticBrushPanel } from './panels/SemanticBrushPanel';
import { RiggingModePanel } from './panels/RiggingModePanel';
import { AnimationModePanel } from './panels/AnimationModePanel';
import { TimelinePanel } from './panels/TimelinePanel';
import { UndoRedoToolbar } from './UndoRedoToolbar';
import { useCanvasHistory } from '../composables/CanvasContextWithHistory';
/**
 * 智能属性面板组件
 * 功能：根据当前选中的Stage动态切换功能组件
 */
export const SmartPanel: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  // 尝试获取历史记录功能（如果可用）
  let historyContext;
  try {
    historyContext = useCanvasHistory();
  } catch {
    // 如果不在 CanvasProviderWithHistory 中，historyContext 为 undefined
    historyContext = undefined;
  }
  
  // 网格设置组件
  const GridSettings = () => (
    <div className="mb-4 p-3 bg-surface-elevated rounded border border-border">
      <h4 className="text-sm font-medium mb-2 text-text-secondary">{t('canvas.gridSettings')}</h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-tertiary">{t('canvas.showGrid')}</span>
          <button
            onClick={() => dispatch({ type: 'TOGGLE_GRID' })}
            className={`w-8 h-4 rounded-full transition-all ${
              state.showGrid ? 'bg-accent' : 'bg-surface'
            } border border-border flex items-center`}
          >
            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
              state.showGrid ? 'translate-x-4' : 'translate-x-0.5'
            } shadow-md`} />
          </button>
        </div>
        {state.showGrid && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-tertiary">{t('canvas.gridSize')}</span>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={state.gridSize}
              onChange={(e) => dispatch({ type: 'SET_GRID_SIZE', payload: parseInt(e.target.value) })}
              className="w-20 accent-accent"
            />
            <span className="text-xs text-text-tertiary">{state.gridSize}px</span>
          </div>
        )}
      </div>
    </div>
  );
  
  // 根据当前模式渲染对应的面板组件
  const renderPanelContent = () => {
    switch (state.activeStage) {
      case 'A':
        return (
          <>
            {/* 撤销重做工具栏 */}
            {historyContext && (
              <div className="mb-4">
                <UndoRedoToolbar
                  canUndo={historyContext.canUndo}
                  canRedo={historyContext.canRedo}
                  onUndo={historyContext.undo}
                  onRedo={historyContext.redo}
                  onClear={historyContext.clearHistory}
                  showClear={true}
                />
              </div>
            )}
            
            
            
            <GridSettings />
            <h3 className="text-sm font-medium mb-2 text-text-secondary border-b border-border pb-1">{t('stageA.layerManager')}</h3>
            <LayerManager />
            
            <h3 className="text-sm font-medium mb-2 mt-4 text-text-secondary border-b border-border pb-1">{t('stageA.inpaintSettings')}</h3>
            <InpaintSettings />
            
            <h3 className="text-sm font-medium mb-2 mt-4 text-text-secondary border-b border-border pb-1">{t('stageA.samSettings')}</h3>
            <SAMPanel />
          </>
        );
      case 'B':
        return (
          <>
            <GridSettings />
            <h3 className="text-sm font-medium mb-2 text-text-secondary border-b border-border pb-1">{t('stageB.partsPresets')}</h3>
            <PartsPresets />
            
            <h3 className="text-sm font-medium mb-2 mt-4 text-text-secondary border-b border-border pb-1">{t('stageB.semanticBrush')}</h3>
            <SemanticBrushPanel 
              onBrushModeChange={(mode) => {}} 
              onBrushSizeChange={(size) => {}} 
              onEdgeSnapChange={(enabled) => {}} 
              onJointExpansionChange={(enabled) => {}} 
              currentBrushMode="head" 
              currentBrushSize={20} 
              edgeSnapEnabled={true} 
              jointExpansionEnabled={true} 
            />
            
            <h3 className="text-sm font-medium mb-2 mt-4 text-text-secondary border-b border-border pb-1">{t('stageB.autoMesh')}</h3>
            <AutoMeshPanel />
          </>
        );
      case 'C':
        return (
          <>
            <GridSettings />
            <h3 className="text-sm font-medium mb-2 text-text-secondary border-b border-border pb-1">{t('stageC.boneHierarchy')}</h3>
            <BoneHierarchy />
            
            <h3 className="text-sm font-medium mb-2 mt-4 text-text-secondary border-b border-border pb-1">{t('stageC.mode')}</h3>
            <RiggingModePanel 
              currentMode="add" 
              onModeChange={(mode) => {}} 
              onToggleWeightVisualization={() => {}} 
              weightVisualization={false} 
            />
            
            <h3 className="text-sm font-medium mb-2 mt-4 text-text-secondary border-b border-border pb-1">{t('stageC.mirrorSymmetry')}</h3>
            <MirrorSymmetryPanel />
          </>
        );
      case 'D':
        return (
          <>
            <GridSettings />
            <h3 className="text-sm font-medium mb-2 text-text-secondary border-b border-border pb-1">{t('stageD.poseControl')}</h3>
            <PoseControlPanel />
            
            <h3 className="text-sm font-medium mb-2 mt-4 text-text-secondary border-b border-border pb-1">{t('stageD.animationMode')}</h3>
            <AnimationModePanel 
              animationMode="pose" 
              onAnimationModeChange={(mode) => {}} 
              onionSkinEnabled={false} 
              onOnionSkinEnabledChange={(enabled) => {}} 
              onionSkinFrames={3} 
              onOnionSkinFramesChange={(frames) => {}} 
              onPlayAnimation={() => {}} 
              onStopAnimation={() => {}} 
            />
            
            <h3 className="text-sm font-medium mb-2 mt-4 text-text-secondary border-b border-border pb-1">{t('stageD.timeline')}</h3>
            <TimelinePanel />
            
            <h3 className="text-sm font-medium mb-2 mt-4 text-text-secondary border-b border-border pb-1">{t('stageD.clipManager')}</h3>
            <ClipManager />
          </>
        );
      default:
        return <div>{t('common.notImplemented')}</div>;
    }
  };

  return (
    <div className="w-80 h-full bg-surface border-l border-border p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">{t('panel.properties')}</h2>
      {renderPanelContent()}
    </div>
  );
};
