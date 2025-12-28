import React from 'react';

interface InteractivePoint {
  x: number;
  y: number;
}

interface InteractiveOverlayProps {
  /** 前景点数组 */
  foregroundPoints: InteractivePoint[];
  /** 背景点数组 */
  backgroundPoints: InteractivePoint[];
  /** 套索点数组 */
  lassoPoints?: InteractivePoint[];
  /** 是否激活套索 */
  isLassoActive?: boolean;
  /** 图像宽度 */
  imageWidth?: number;
  /** 图像高度 */
  imageHeight?: number;
}

/**
 * 交互辅助层组件
 * 功能：绘制用户点击的正负反馈点和套索路径
 */
export const InteractiveOverlay: React.FC<InteractiveOverlayProps> = ({
  foregroundPoints,
  backgroundPoints,
  lassoPoints = [],
  isLassoActive = false,
  imageWidth,
  imageHeight
}) => {
  return (
    <svg 
      className="interactive-overlay max-w-full max-h-full absolute top-0 left-0 pointer-events-none z-30"
      width={imageWidth || '100%'} 
      height={imageHeight || '100%'}
    >
      {/* 套索路径 */}
      {isLassoActive && lassoPoints.length > 1 && (
        <path
          d={`M ${lassoPoints[0].x} ${lassoPoints[0].y} ${lassoPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')}`}
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.8"
        />
      )}
      
      {/* 前景点（绿色） */}
      {foregroundPoints.map((point, index) => (
        <g key={`fg-${index}`} transform={`translate(${point.x}, ${point.y})`}>
          <circle 
            cx="0" 
            cy="0" 
            r="8" 
            fill="#22c55e" 
            stroke="white" 
            strokeWidth="2"
            filter="drop-shadow(0 0 3px rgba(0,0,0,0.5))"
          />
          <text 
            x="0" 
            y="3" 
            fill="white" 
            fontSize="10" 
            fontWeight="bold" 
            textAnchor="middle" 
            dominantBaseline="middle"
          >
            1
          </text>
        </g>
      ))}
      
      {/* 背景点（红色） */}
      {backgroundPoints.map((point, index) => (
        <g key={`bg-${index}`} transform={`translate(${point.x}, ${point.y})`}>
          <circle 
            cx="0" 
            cy="0" 
            r="8" 
            fill="#ef4444" 
            stroke="white" 
            strokeWidth="2"
            filter="drop-shadow(0 0 3px rgba(0,0,0,0.5))"
          />
          <text 
            x="0" 
            y="3" 
            fill="white" 
            fontSize="10" 
            fontWeight="bold" 
            textAnchor="middle" 
            dominantBaseline="middle"
          >
            0
          </text>
        </g>
      ))}
    </svg>
  );
};
