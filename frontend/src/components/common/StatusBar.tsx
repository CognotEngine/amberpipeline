import React, { useState, useEffect } from 'react';
import { Cpu, MemoryStick, Zap, AlertTriangle, XCircle } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { sx } from '@/themes/themeUtils';
import { useStatusBar } from './composables/useStatusBar';
import { useCanvasContext } from '../../modules/canvas/composables/CanvasContext';

export interface SystemStatus {
  gpuLoad: number;
  vramUsage: {
    used: number;
    total: number;
  };
  fps: number;
  errorCount: number;
  warningCount: number;
}



interface StatusBarProps {
  status: SystemStatus;
}

/**
 * 状态栏组件
 * 功能：显示系统状态信息，包括GPU使用率、内存占用、FPS帧率等，以及画布相关状态
 */
export const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // 使用状态栏Hook
  const { 
    status: currentStatus
  } = useStatusBar(status, [], {
    updateInterval: 1000,
    autoUpdate: true
  });

  // Animation playback effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && state.stage === 'D') {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.1;
          if (next >= state.animationDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, state.stage, state.animationDuration]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (time: number) => {
    setCurrentTime(time);
    dispatch({ type: 'SET_CURRENT_TIME', payload: time });
  };

  const handleZoomChange = (zoom: number) => {
    dispatch({ type: 'SET_ZOOM', payload: zoom });
  };

  const getStageSpecificContent = () => {
    switch (state.stage) {
      case 'A':
        return (
          <div className={sx(['flex', 'items-center', 'space-x-4'])}>
            <div className={sx(['text-xs', 'text.textSecondary'])}>
              {t('canvas.status.layers')}: {state.layers.length}
            </div>
            <div className={sx(['text-xs', 'text.textSecondary'])}>
              {t('canvas.status.selectedLayer')}: {state.selectedLayerId || t('canvas.status.none')}
            </div>
            <div className={sx(['text-xs', 'text.textSecondary'])}>
              {t('canvas.status.inpaintMode')}: {state.inpaintMode ? t('common.on') : t('common.off')}
            </div>
          </div>
        );
      
      case 'B':
        return (
          <div className={sx(['flex', 'items-center', 'space-x-4'])}>
            <div className={sx(['text-xs', 'text.textSecondary'])}>
              {t('canvas.status.parts')}: {state.parts.length}
            </div>
            <div className={sx(['text-xs', 'text.textSecondary'])}>
              {t('canvas.status.selectedPart')}: {state.selectedPartId || t('canvas.status.none')}
            </div>
            <div className={sx(['text-xs', 'text.textSecondary'])}>
              {t('canvas.status.brushMode')}: {state.brushMode || t('canvas.status.none')}
            </div>
          </div>
        );
      
      case 'C':
        return (
          <div className={sx(['flex', 'items-center', 'space-x-4'])}>
            <div className={sx(['text-xs', 'text.textSecondary'])}>
              {t('canvas.status.bones')}: {state.bones.length}
            </div>
            <div className={sx(['text-xs', 'text.textSecondary'])}>
              {t('canvas.status.selectedBone')}: {state.selectedBoneId || t('canvas.status.none')}
            </div>
            <div className={sx(['text-xs', 'text.textSecondary'])}>
              {t('canvas.status.weightMode')}: {state.weightPaintMode ? t('common.on') : t('common.off')}
            </div>
          </div>
        );
      
      case 'D':
        return (
          <div className={sx(['flex', 'items-center', 'space-x-4', 'flex-1'])}>
            <button
              className={sx(['px-2', 'py-1', 'bg.accent', 'text.white', 'rounded', 'hover:bg.accent-hover', 'transition-colors'])} 
              onClick={handlePlay}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            
            <div className={sx(['flex', 'items-center', 'space-x-2'])}>
              <span className={sx(['text-xs', 'text.textSecondary'])}>{t('canvas.time')}:</span>
              <input
                type="range"
                min="0"
                max={state.animationDuration}
                step="0.1"
                value={currentTime}
                onChange={(e) => handleTimeChange(parseFloat(e.target.value))}
                className={sx(['w-24', 'h-1', 'bg.border', 'rounded-full', 'overflow-hidden'])} 
              />
              <span className={sx(['text-xs', 'text.textSecondary'])}>
                {currentTime.toFixed(1)}s / {state.animationDuration}s
              </span>
            </div>
            
            <div className={sx(['flex', 'items-center', 'space-x-2'])}>
              <span className={sx(['text-xs', 'text.textSecondary'])}>{t('canvas.fps')}:</span>
              <select
                value={state.fps}
                onChange={(e) => dispatch({ type: 'SET_FPS', payload: parseInt(e.target.value) })}
                className={sx(['px-2', 'py-0.5', 'bg.surface', 'text.textPrimary', 'rounded', 'text-xs', 'border', 'border.border'])} 
              >
                <option value={24}>24</option>
                <option value={30}>30</option>
                <option value={60}>60</option>
              </select>
            </div>
            
            <div className={sx(['flex', 'items-center', 'space-x-2'])}>
              <span className={sx(['text-xs', 'text.textSecondary'])}>{t('canvas.onionSkin')}:</span>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={state.onionSkinFrames}
                onChange={(e) => dispatch({ type: 'SET_ONION_SKIN_FRAMES', payload: parseInt(e.target.value) })}
                className={sx(['w-20', 'h-1', 'bg.border', 'rounded-full', 'overflow-hidden'])} 
              />
              <span className={sx(['text-xs', 'text.textSecondary'])}>{state.onionSkinFrames}</span>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={sx(['bg.surface', 'border-t', 'border.default', 'overflow-hidden'])}>
      {/* 主状态栏 */}
      <div className={sx(['h-[22px]', 'flex', 'items-center', 'justify-between', 'px-4', 'text-xs', 'text.textSecondary'])}>
        {/* 左侧系统信息 */}
        <div className={sx(['flex', 'items-center', 'space-x-4'])}>
          {/* GPU使用率 */}
          <div className={sx(['flex', 'items-center', 'space-x-1'])}>
            <Zap size={12} className={sx(['text.textPrimary'])} />
            <span>{currentStatus.gpuLoad.toFixed(0)}%</span>
          </div>
          
          {/* 内存占用 */}
          <div className={sx(['flex', 'items-center', 'space-x-1'])}>
            <MemoryStick size={12} className={sx(['text.textPrimary'])} />
            <span>{currentStatus.vramUsage.used.toFixed(1)}/{currentStatus.vramUsage.total} GB</span>
          </div>
          
          {/* FPS帧率 */}
          <div className={sx(['flex', 'items-center', 'space-x-1'])}>
            <Cpu size={12} className={sx(['text.textPrimary'])} />
            <span>{currentStatus.fps.toFixed(0)} FPS</span>
          </div>
        </div>
        
        {/* 中间画布状态信息 - 来自BottomPanel */}
        <div className={sx(['flex', 'items-center', 'space-x-4', 'mx-auto'])}>
          {/* 进度指示器 */}
          {state.isProcessing && (
            <div className={sx(['flex', 'items-center', 'space-x-2'])}>
              <div className={sx(['w-3', 'h-3', 'border-2', 'border.accent', 'border-t-transparent', 'rounded-full', 'animate-spin'])}></div>
              <span className={sx(['text-xs', 'text.accent'])}>{state.processingMessage}</span>
            </div>
          )}
          
          {/* 阶段特定内容 */}
          {getStageSpecificContent()}
          
          {/* 通用控制 */}
          <div className={sx(['flex', 'items-center', 'space-x-4'])}>
            <div className={sx(['flex', 'items-center', 'space-x-2'])}>
              <span className={sx(['text-xs', 'text.textSecondary'])}>{t('canvas.zoom')}:</span>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={state.zoom}
                onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
                className={sx(['w-20', 'h-1', 'bg.border', 'rounded-full', 'overflow-hidden'])} 
              />
              <span className={sx(['text-xs', 'text.textSecondary'])}>{(state.zoom * 100).toFixed(0)}%</span>
            </div>
            
            <div className={sx(['text-xs', 'text.textSecondary'])}>
              {t('canvas.cursor')}: ({state.cursorPosition.x}, {state.cursorPosition.y})
            </div>
            
            <div className={sx(['text-xs', 'text.textSecondary'])}>
              {t('canvas.canvasSize')}: {state.canvasSize.width} × {state.canvasSize.height}
            </div>
          </div>
        </div>
        
        {/* 右侧错误和警告信息 */}
        <div className={sx(['flex', 'items-center', 'space-x-4'])}>
          {currentStatus.warningCount > 0 && (
            <div className={sx(['flex', 'items-center', 'space-x-1', 'cursor-pointer', 'hover:text.textPrimary', 'transition-colors'])}>
              <AlertTriangle size={12} className={sx(['text.warning'])} />
              <span className={sx(['text.warning'])}>{currentStatus.warningCount}</span>
            </div>
          )}
          
          {currentStatus.errorCount > 0 && (
            <div className={sx(['flex', 'items-center', 'space-x-1', 'cursor-pointer', 'hover:text.textPrimary', 'transition-colors'])}>
              <XCircle size={12} className={sx(['text.error'])} />
              <span className={sx(['text.error'])}>{currentStatus.errorCount}</span>
            </div>
          )}
          
          {/* 错误报告图标 */}
          <button
            className={sx(['flex', 'items-center', 'space-x-1', 'text.textSecondary', 'hover:text.textPrimary', 'transition-colors', 'cursor-pointer'])}
            title={t('common.error')}
          >
            <AlertTriangle size={12} />
            <span>{t('common.error')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};