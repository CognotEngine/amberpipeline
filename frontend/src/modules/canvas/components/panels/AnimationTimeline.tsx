import React from 'react';
import { useTranslation } from '../../../../i18n';
import { Button, Slider, Input } from '../../../../components/ui';
import { Play, Pause, FastForward, Rewind, Plus, Delete } from 'lucide-react';
import { sx } from '../../../../themes/themeUtils';
import { cn } from '../../../../lib/utils';

interface Keyframe {
  id: string;
  time: number;
  interpolation: 'linear' | 'bezier';
}

interface AnimationClip {
  id: string;
  name: string;
  duration: number;
  keyframes: Keyframe[];
}

interface AnimationTimelineProps {
  currentTime: number;
  currentAnimation: AnimationClip | null;
  isPlaying: boolean;
  frameRate: number;
  onPlayPause: () => void;
  onRewind: () => void;
  onFastForward: () => void;
  onTimeChange: (time: number) => void;
  onFrameRateChange: (frameRate: number) => void;
  onAddKeyframe: () => void;
  onDeleteKeyframe: (keyframeId: string) => void;
  onKeyframeSelect: (keyframeId: string) => void;
  selectedKeyframeId: string | null;
}

/**
 * 动画时间轴组件
 * 功能：用于管理关键帧和动画剪辑
 */
export const AnimationTimeline: React.FC<AnimationTimelineProps> = ({
  currentTime,
  currentAnimation,
  isPlaying,
  frameRate,
  onPlayPause,
  onRewind,
  onFastForward,
  onTimeChange,
  onFrameRateChange,
  onAddKeyframe,
  onDeleteKeyframe,
  onKeyframeSelect,
  selectedKeyframeId
}) => {
  const { t } = useTranslation();
  const duration = currentAnimation?.duration || 10;

  return (
    <div className={sx(['space-y-3', 'p-4', 'bg.surface', 'border', 'border.border', 'rounded-lg'])}>
      {/* 时间轴控制 */}
      <div className={sx(['flex', 'items-center', 'justify-between', 'space-x-2'])}>
        <div className={sx(['flex', 'items-center', 'space-x-1'])}>
          <Button
            variant="secondary"
            size="small"
            onClick={onRewind}
            className={sx(['w-8', 'h-8', 'p-0'])} 
          >
            <Rewind className="w-4 h-4" />
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={onPlayPause}
            className={sx(['w-8', 'h-8', 'p-0'])} 
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={onFastForward}
            className={sx(['w-8', 'h-8', 'p-0'])} 
          >
            <FastForward className="w-4 h-4" />
          </Button>
        </div>
        
        {/* 帧速率设置 */}
        <div className={sx(['flex', 'items-center', 'space-x-2'])}>
          <label className={sx(['text-xs', 'text.text-secondary'])}>{t('animation.timeline.fps')}</label>
          <Input
            type="number"
            min={1}
            max={60}
            value={frameRate}
            onChange={(e) => onFrameRateChange(parseInt(e.target.value) || 30)}
            className={sx(['w-16', 'text-xs'])} 
          />
        </div>
        
        {/* 当前时间 */}
        <div className={sx(['text-xs', 'text.text-secondary'])}>
          {currentTime.toFixed(2)}s / {duration.toFixed(2)}s
        </div>
      </div>
      
      {/* 时间轴滑块 */}
      <div className={sx(['relative'])}>
        <Slider
          value={[currentTime]}
          min={0}
          max={duration}
          step={0.1}
          onValueChange={(value) => onTimeChange(value[0])}
          className={sx(['h-2'])} 
        />
        
        {/* 关键帧标记 */}
        {currentAnimation?.keyframes.map((keyframe) => (
          <div
            key={keyframe.id}
            className={cn(
              sx([
                'absolute', 
                'top-1/2', 
                '-translate-y-1/2', 
                'w-2', 
                'h-6', 
                'bg.accent', 
                'border', 
                'border.white', 
                'rounded', 
                'cursor-pointer', 
                'transition-all', 
                'duration-200',
                'hover:scale-y-125',
                'shadow-md'
              ]),
              selectedKeyframeId === keyframe.id && sx(['scale-y-150', 'bg.error'])
            )}
            style={{ left: `${(keyframe.time / duration) * 100}%` }}
            onClick={() => onKeyframeSelect(keyframe.id)}
          />
        ))}
      </div>
      
      {/* 关键帧操作 */}
      <div className={sx(['flex', 'items-center', 'justify-between', 'space-x-2'])}>
        <Button
          variant="secondary"
          size="small"
          className={sx(['flex', 'items-center', 'gap-1'])} 
          onClick={onAddKeyframe}
        >
          <Plus className="w-4 h-4" />
          {t('animation.timeline.add-keyframe')}
        </Button>
        
        {selectedKeyframeId && (
          <Button
            variant="destructive"
            size="small"
            className={sx(['flex', 'items-center', 'gap-1'])} 
            onClick={() => onDeleteKeyframe(selectedKeyframeId)}
          >
            <Delete className="w-4 h-4" />
            {t('animation.timeline.delete-keyframe')}
          </Button>
        )}
        
        {/* 插值类型选择 */}
        <div className={sx(['flex', 'items-center', 'space-x-2'])}>
          <label className={sx(['text-xs', 'text.text-secondary'])}>{t('animation.timeline.interpolation')}</label>
          <select className={sx(['text-xs', 'bg.background', 'border', 'border.border', 'rounded', 'p-1'])}>
            <option value="linear">{t('animation.timeline.linear')}</option>
            <option value="bezier">{t('animation.timeline.bezier')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};
