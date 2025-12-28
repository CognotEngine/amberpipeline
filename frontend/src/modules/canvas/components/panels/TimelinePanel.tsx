import React from 'react';
import { useTranslation } from '../../../../i18n';
import { useCanvasContext } from '../../composables/CanvasContext';

/**
 * 时间轴控制面板组件
 * 功能：提供动画时间轴控制和关键帧管理
 */
export const TimelinePanel: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();

  // 获取当前活动动画
  const activeAnimation = state.animations.find(a => a.id === state.activeAnimationId);
  if (!activeAnimation) {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-text-secondary">{t('stageD.timeline')}</h4>
        <div className="text-xs text-text-tertiary">{t('stageD.noAnimationSelected')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-text-secondary">{t('stageD.timeline')}</h4>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <div className="text-xs text-text-secondary">{t('stageD.timeline')}</div>
          <div className="flex-1">
            <input
              type="range"
              min="0"
              max={activeAnimation.duration}
              step="0.1"
              value={state.currentTime}
              onChange={(e) => dispatch({ type: 'SET_CURRENT_TIME', payload: parseFloat(e.target.value) })}
              className="w-full accent-accent"
            />
          </div>
          <div className="text-xs text-text-secondary min-w-[40px] text-right">
            {state.currentTime.toFixed(1)}s
          </div>
        </div>
        
        {/* 关键帧标记 */}
        <div className="mt-2 h-4 relative bg-surface-elevated rounded overflow-hidden">
          {activeAnimation.keyframes.map((keyframe, index) => {
            const position = (keyframe.time / activeAnimation.duration) * 100;
            return (
              <div
                key={keyframe.id}
                className="absolute w-2 h-2 bg-accent rounded-full transform -translate-x-1 -translate-y-1 cursor-pointer hover:scale-150 transition-transform"
                style={{ left: `${position}%`, top: '50%' }}
                title={`${t('stageD.keyframe')} ${index + 1}: ${keyframe.time.toFixed(2)}s`}
              />
            );
          })}
        </div>
        
        {/* 时间轴信息 */}
        <div className="flex justify-between text-xs text-text-tertiary">
          <div>
            {t('stageD.duration')}: {activeAnimation.duration}s
          </div>
          <div>
            {t('stageD.fps')}: {activeAnimation.fps}
          </div>
          <div>
            {t('stageD.keyframes')}: {activeAnimation.keyframes.length}
          </div>
        </div>
      </div>
    </div>
  );
};
