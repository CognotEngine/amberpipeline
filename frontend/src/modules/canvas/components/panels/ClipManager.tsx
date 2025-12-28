import React from 'react';
import { useTranslation } from '../../../../i18n';
import { useCanvasContext } from '../../composables/CanvasContext';
import { Button } from '@/components/ui/button';

/**
 * 动画剪辑管理器组件
 * 功能：管理动画剪辑，设置循环播放、帧率，以及关键帧插值
 */
export const ClipManager: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  
  // 动画设置
  const [animationSettings, setAnimationSettings] = React.useState({
    fps: 24,
    loop: true,
    interpolation: 'linear' as 'linear' | 'bezier'
  });
  
  // 创建新动画剪辑
  const createNewAnimation = (name: string) => {
    dispatch({
      type: 'ADD_ANIMATION',
      payload: {
        name,
        duration: 2.0, // 默认2秒
        keyframes: [],
        loop: animationSettings.loop,
        fps: animationSettings.fps
      }
    });
  };
  
  // 设置活跃动画
  const setActiveAnimation = (animationId: string) => {
    dispatch({ type: 'SET_ACTIVE_ANIMATION', payload: animationId });
  };
  
  // 更新动画设置
  const updateAnimationSetting = (setting: keyof typeof animationSettings, value: any) => {
    setAnimationSettings(prev => ({ ...prev, [setting]: value }));
    
    // 如果当前有活跃动画，同步更新
    if (state.activeAnimationId) {
      const activeAnimation = state.animations.find(a => a.id === state.activeAnimationId);
      if (activeAnimation) {
        dispatch({
          type: 'UPDATE_ANIMATION',
          payload: {
            id: state.activeAnimationId,
            updates: { [setting]: value }
          }
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 动画剪辑列表 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">{t('stageD.animations')}</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => createNewAnimation(`动画 ${state.animations.length + 1}`)}
          >
            {t('stageD.newAnimation')}
          </Button>
        </div>
        
        {state.animations.length === 0 ? (
          <div className="text-sm text-text-secondary text-center py-4">
            {t('stageD.noAnimations')}
          </div>
        ) : (
          state.animations.map((animation) => (
            <div key={animation.id} className="p-2 border border-border rounded">
              <div className="flex items-center justify-between">
                <div
                  className={`flex-1 cursor-pointer text-sm truncate ${
                    state.activeAnimationId === animation.id ? 'font-medium text-primary' : ''
                  }`}
                  onClick={() => setActiveAnimation(animation.id)}
                >
                  {animation.name}
                </div>
                <div className="text-xs text-text-secondary">
                  {animation.duration}s
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* 动画设置 */}
      <div className="pt-2 border-t border-border">
        <h4 className="text-sm font-medium mb-2">{t('stageD.animationSettings')}</h4>
        
        {/* 帧率设置 */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-medium">{t('stageD.fps')}</label>
            <span className="text-xs text-text-secondary">{animationSettings.fps} FPS</span>
          </div>
          <input
            type="range"
            value={animationSettings.fps}
            min={12}
            max={60}
            step={1}
            onChange={(e) => updateAnimationSetting('fps', parseInt(e.target.value))}
            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer"
          />
        </div>
        
        {/* 循环播放 */}
        <div className="mb-3 flex items-center justify-between">
          <label className="text-xs font-medium">{t('stageD.loop')}</label>
          <button
            className={`px-2 py-1 text-xs rounded ${animationSettings.loop ? 'bg-primary text-white' : 'bg-surface-hover text-text-primary'}`}
            onClick={() => updateAnimationSetting('loop', !animationSettings.loop)}
          >
            {animationSettings.loop ? 'ON' : 'OFF'}
          </button>
        </div>
        
        {/* 关键帧插值 */}
        <div className="mb-3">
          <label className="text-xs font-medium mb-1 block">{t('stageD.interpolation')}</label>
          <select
            value={animationSettings.interpolation}
            onChange={(e) => updateAnimationSetting('interpolation', e.target.value)}
            className="w-full text-sm border border-border rounded px-2 py-1 bg-background"
          >
            <option value="linear">{t('stageD.linear')}</option>
            <option value="bezier">{t('stageD.bezier')}</option>
          </select>
        </div>
      </div>
      
      {/* 导出设置 */}
      <div className="pt-2 border-t border-border">
        <h4 className="text-sm font-medium mb-2">{t('stageD.exportSettings')}</h4>
        
        {/* 导出格式选择 */}
        <div className="mb-3">
          <label className="text-xs font-medium mb-1 block">{t('stageD.exportFormat')}</label>
          <select defaultValue="gif" className="w-full text-sm border border-border rounded px-2 py-1 bg-background">
            <option value="gif">GIF</option>
            <option value="mp4">MP4</option>
            <option value="json">JSON</option>
            <option value="spine">Spine</option>
          </select>
        </div>
        
        {/* 导出按钮 */}
        <Button variant="outline" size="sm" className="w-full text-xs">
          {t('stageD.exportAnimation')}
        </Button>
      </div>
    </div>
  );
};
