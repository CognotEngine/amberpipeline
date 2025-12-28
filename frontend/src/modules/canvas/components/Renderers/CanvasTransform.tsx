import React from 'react';

interface CanvasTransformProps {
  /** 变换属性：缩放比例和位移 */
  transform: { scale: number; translateX: number; translateY: number };
  /** 子元素 */
  children: React.ReactNode;
  /** 图像宽度 */
  imageWidth?: number;
  /** 图像高度 */
  imageHeight?: number;
}

/**
 * 画布变换组件
 * 功能：封装画布的缩放和平移功能，提供语义化的组件接口
 */
export const CanvasTransform: React.FC<CanvasTransformProps> = ({
  transform,
  children,
  imageWidth,
  imageHeight
}) => {
  return (
    <div 
      className="canvas-transform-container absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      style={{
        transform: `translate(-50%, -50%) scale(${transform.scale}) translate(${transform.translateX}px, ${transform.translateY}px)`,
        transition: 'transform 0.1s ease-out',
        // 根据图像尺寸设置容器大小，确保正确的变换原点
        width: imageWidth || 'auto',
        height: imageHeight || 'auto',
      }}
    >
      {children}
    </div>
  );
};
