import React from 'react';
import { useCanvasContext } from '../composables/CanvasContext';

interface GridOverlayProps {
  width: number;
  height: number;
  transform: { scale: number; translateX: number; translateY: number };
}

/**
 * 网格覆盖层组件
 * 功能：在画布上显示可配置的网格系统，支持吸附功能
 */
const GridOverlay: React.FC<GridOverlayProps> = ({ 
  width, 
  height, 
  transform 
}) => {
  const { state } = useCanvasContext();
  
  const { showGrid, gridSize } = state;
  
  if (!showGrid) return null;
  
  // 计算网格线在缩放后的实际间距
  const scaledGridSize = gridSize * transform.scale;
  
  // 生成垂直线
  const verticalLines = [];
  for (let x = 0; x <= width; x += gridSize) {
    const scaledX = x * transform.scale + transform.translateX;
    if (scaledX >= 0 && scaledX <= width) {
      verticalLines.push(
        <line
          key={`v-${x}`}
          x1={scaledX}
          y1={0}
          x2={scaledX}
          y2={height}
          stroke="rgba(100, 100, 100, 0.3)"
          strokeWidth={x % (gridSize * 5) === 0 ? 0.5 : 0.25}
        />
      );
    }
  }
  
  // 生成水平线
  const horizontalLines = [];
  for (let y = 0; y <= height; y += gridSize) {
    const scaledY = y * transform.scale + transform.translateY;
    if (scaledY >= 0 && scaledY <= height) {
      horizontalLines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={scaledY}
          x2={width}
          y2={scaledY}
          stroke="rgba(100, 100, 100, 0.3)"
          strokeWidth={y % (gridSize * 5) === 0 ? 0.5 : 0.25}
        />
      );
    }
  }
  
  return (
    <svg 
      className="absolute inset-0 pointer-events-none z-10"
      width={width}
      height={height}
    >
      <defs>
        <pattern
          id="grid-pattern"
          width={scaledGridSize}
          height={scaledGridSize}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={scaledGridSize / 2}
            cy={scaledGridSize / 2}
            r="1"
            fill="rgba(150, 150, 150, 0.4)"
          />
        </pattern>
      </defs>
      
      {/* 主网格线 */}
      <g>
        {verticalLines}
        {horizontalLines}
      </g>
      
      {/* 网格点 */}
      <rect
        width={width}
        height={height}
        fill="url(#grid-pattern)"
        opacity={0.6}
      />
      
      {/* 坐标轴 */}
      <line
        x1={transform.translateX}
        y1={0}
        x2={transform.translateX}
        y2={height}
        stroke="rgba(200, 50, 50, 0.5)"
        strokeWidth={1}
      />
      <line
        x1={0}
        y1={transform.translateY}
        x2={width}
        y2={transform.translateY}
        stroke="rgba(50, 200, 50, 0.5)"
        strokeWidth={1}
      />
    </svg>
  );
};

export default GridOverlay;