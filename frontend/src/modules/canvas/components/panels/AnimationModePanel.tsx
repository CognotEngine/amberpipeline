import React from 'react';
import { useTranslation } from '../../../../i18n';
import { useCanvasContext } from '../../composables/CanvasContext';

/**
 * 动画模式控制面板组件
 * 功能：提供动画模式切换、播放控制和洋葱皮设置
 */
interface AnimationModePanelProps {
  animationMode: string;
  onAnimationModeChange: (mode: string) => void;
  onionSkinEnabled: boolean;
  onOnionSkinEnabledChange: (enabled: boolean) => void;
  onionSkinFrames: number;
  onOnionSkinFramesChange: (frames: number) => void;
  onPlayAnimation: () => void;
  onStopAnimation: () => void;
}

export const AnimationModePanel: React.FC<AnimationModePanelProps> = ({
  animationMode,
  onAnimationModeChange,
  onionSkinEnabled,
  onOnionSkinEnabledChange,
  onionSkinFrames,
  onOnionSkinFramesChange,
  onPlayAnimation,
  onStopAnimation
}) => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-text-secondary">{t('stageD.animationMode')}</h4>
      
      <div className="grid grid-cols-2 gap-1">
        <button
          className={`px-2 py-1 text-xs rounded transition-colors ${animationMode === 'pose' ? 'bg-accent text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
          onClick={() => onAnimationModeChange('pose')}
        >
          {t('stageD.pose')}
        </button>
        <button
          className={`px-2 py-1 text-xs rounded transition-colors ${animationMode === 'keyframe' ? 'bg-accent text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
          onClick={() => onAnimationModeChange('keyframe')}
        >
          {t('stageD.keyframe')}
        </button>
        <button
          className={`px-2 py-1 text-xs rounded transition-colors ${animationMode === 'onion' ? 'bg-accent text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
          onClick={() => onAnimationModeChange('onion')}
        >
          {t('stageD.onionSkin')}
        </button>
        <button
          className={`px-2 py-1 text-xs rounded transition-colors ${animationMode === 'play' ? 'bg-accent text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
          onClick={() => onAnimationModeChange('play')}
        >
          {t('stageD.play')}
        </button>
      </div>
      
      <div className="flex space-x-2">
        <button
          className="px-2 py-1 text-xs bg-accent text-white rounded hover:bg-accent-hover transition-colors"
          onClick={state.isPlaying ? onStopAnimation : onPlayAnimation}
          disabled={!state.activeAnimationId}
        >
          {state.isPlaying ? '⏸️' : '▶️'}
        </button>
        <button
          className="px-2 py-1 text-xs bg-accent text-white rounded hover:bg-accent-hover transition-colors"
          onClick={() => dispatch({ type: 'SET_CURRENT_TIME', payload: 0 })}
        >
          ⏹️
        </button>
      </div>
      
      {animationMode === 'onion' && (
        <div className="space-y-2">
          <label className="flex items-center text-xs">
            <input
              type="checkbox"
              checked={onionSkinEnabled}
              onChange={(e) => onOnionSkinEnabledChange(e.target.checked)}
              className="mr-2 accent-accent"
            />
            {t('stageD.enableOnionSkin')}
          </label>
          
          {onionSkinEnabled && (
            <div>
              <div className="flex items-center justify-between text-xs text-text-tertiary mb-1">
                <span>{t('stageD.onionSkinFrames')}</span>
                <span>{onionSkinFrames}</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={onionSkinFrames}
                onChange={(e) => onOnionSkinFramesChange(parseInt(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          )}
        </div>
      )}
      
      <div className="mt-3 text-xs text-text-secondary">
        {t('stageD.time')}: {state.currentTime.toFixed(2)}s / {state.animations.find(a => a.id === state.activeAnimationId)?.duration?.toFixed(2) || '0.00'}s
      </div>
    </div>
  );
};
