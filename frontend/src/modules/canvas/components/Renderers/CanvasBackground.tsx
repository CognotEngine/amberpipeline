import React from 'react';
import { sx } from '../../../../themes/themeUtils';

interface CanvasBackgroundProps {
  /** 背景大小 */
  size?: number;
  /** 额外的CSS类名 */
  className?: string;
}

/**
 * 画布背景组件
 * 功能：提供经典的灰白格子背景，用于观察透明度
 * 适配：根据当前主题自动调整颜色
 */
export const CanvasBackground: React.FC<CanvasBackgroundProps> = ({
  size = 20,
  className = ''
}) => {
  return (
    <div 
      className={sx(['canvas-background', 'absolute', 'inset-0', 'z-0', className])}
      style={{
        backgroundImage: `linear-gradient(45deg, rgba(200, 200, 200, 0.15) 25%, transparent 25%, transparent 75%, rgba(200, 200, 200, 0.15) 75%, rgba(200, 200, 200, 0.15)), linear-gradient(45deg, rgba(200, 200, 200, 0.15) 25%, transparent 25%, transparent 75%, rgba(200, 200, 200, 0.15) 75%, rgba(200, 200, 200, 0.15))`,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `0 0, ${size / 2}px ${size / 2}px`
      }}
    />
  );
};
