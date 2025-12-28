import React, { useState, useRef, useEffect } from 'react';
import { CanvasTransform } from './CanvasTransform';
import { CanvasBackground } from './CanvasBackground';
import { useCanvasContext } from '../../composables/CanvasContext';

interface StageARendererProps {
  imagePath: string;
  transform: { scale: number; translateX: number; translateY: number };
  onProcessingChange?: (isProcessing: boolean) => void;
}

/**
 * Stage A渲染器组件
 * 功能：实现复杂背景分层，包括智能框选、深度标记和实时修复功能
 */
export const StageARenderer: React.FC<StageARendererProps> = ({
  imagePath,
  transform
}) => {
  const { state } = useCanvasContext();
  
  // 从全局状态获取SAM选择模式
  const { samSelectionMode } = state;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // 图像尺寸
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  // 加载图像并获取尺寸
  useEffect(() => {
    if (imagePath) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
      };
      img.src = imagePath;
    }
  }, [imagePath]);
  
  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {/* 1. 背景层 - 经典灰白格子 */}
      <CanvasBackground size={20} />
      
      {/* 2. Canvas变换容器 */}
      <CanvasTransform
        transform={transform}
        imageWidth={imageSize.width}
        imageHeight={imageSize.height}
      >
        {/* 3. 原始图像层 */}
        {imagePath && (
          <img
            ref={imageRef}
            src={imagePath}
            alt="原始图像"
            className="max-w-full max-h-full object-contain z-10"
          />
        )}
        
        {/* 4. 背景图层 */}
        {state.layers
          .filter(layer => layer.type === 'background' && layer.visible)
          .map(layer => (
            <div 
              key={layer.id}
              className="relative z-20"
              style={{ 
                opacity: layer.opacity,
                zIndex: layer.zIndex
              }}
            >
              <img 
                src={layer.imagePath} 
                alt={`背景层 ${layer.name}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ))
        }
        
        {/* 5. 对象图层 */}
        {state.layers
          .filter(layer => layer.type === 'object' && layer.visible)
          .map(layer => (
            <div 
              key={layer.id}
              className="relative z-30"
              style={{ 
                opacity: layer.opacity,
                zIndex: layer.zIndex
              }}
            >
              <img 
                src={layer.imagePath} 
                alt={`对象层 ${layer.name}`}
                className="max-w-full max-h-full object-contain"
              />
              {/* 图层名称指示器 */}
              <div className="absolute top-2 left-2 bg-primary text-white text-xs px-1 rounded">
                {layer.name}
              </div>
            </div>
          ))
        }
        
        {/* 6. 选中图层高亮 */}
        {state.selectedLayerId && (
          <div className="selected-layer-highlight absolute inset-0 border-2 border-accent z-40 pointer-events-none"></div>
        )}
      </CanvasTransform>
      
      {/* 7. 交互控制层 */}
      <div 
        className="absolute inset-0 z-50"
        style={{ 
          cursor: samSelectionMode === 'lasso' ? 'crosshair' : 'default'
        }}
      />
    </div>
  );
};