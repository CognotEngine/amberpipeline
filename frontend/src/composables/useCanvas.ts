/**
 * 画布操作逻辑封装
 * 功能：封装缩放、平移、旋转等画布操作，以及画布状态管理
 */
import { useState, useCallback, useRef, useEffect } from 'react';

// 定义画布变换状态类型
export interface CanvasTransform {
  scale: number;
  x: number;
  y: number;
  rotation: number;
}

// 定义画布配置类型
export interface CanvasConfig {
  minScale: number;
  maxScale: number;
  scaleStep: number;
  enableRotation?: boolean;
  enablePan?: boolean;
  enableZoom?: boolean;
  enableKeyboardControls?: boolean;
  keyboardPanSpeed?: number;
}

// 定义画布坐标类型
export interface CanvasPoint {
  x: number;
  y: number;
}

// 定义画布背景类型
export type CanvasBackgroundType = 'grid' | 'black' | 'white';

/**
 * 画布操作Hook
 * @param config 画布配置
 * @returns 画布相关的状态和方法
 */
export const useCanvas = (config: CanvasConfig) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [transform, setTransform] = useState<CanvasTransform>({
    scale: 1,
    x: 0,
    y: 0,
    rotation: 0
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  
  // 背景类型
  const [backgroundType, setBackgroundType] = useState<CanvasBackgroundType>('grid');
  
  // 空格键状态（用于平移）
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  const keyboardPanSpeed = config.keyboardPanSpeed || 10;
  
  // 计算背景类名
  const backgroundClass = (() => {
    switch (backgroundType) {
      case 'black':
        return 'bg-black';
      case 'white':
        return 'bg-white';
      case 'grid':
        // 使用CSS渐变实现棋盘格背景
        return 'bg-[repeating-conic-gradient(#1E1E1E_0_25%,#151515_0_50%)_50%/20px_20px]';
      default:
        return 'bg-background';
    }
  })();
  
  // 计算画布变换样式
  const transformStyle = {
    transform: `scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotation}rad)`,
    transformOrigin: 'center center'
  };
  
  /**
   * 重置画布变换
   */
  const resetTransform = useCallback(() => {
    setTransform({
      scale: 1,
      x: 0,
      y: 0,
      rotation: 0
    });
  }, []);
  
  /**
   * 切换背景类型
   */
  const toggleBackground = useCallback(() => {
    const types: Array<CanvasBackgroundType> = ['grid', 'black', 'white'];
    const currentIndex = types.indexOf(backgroundType);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    setBackgroundType(types[(safeIndex + 1) % types.length]);
  }, [backgroundType]);
  
  /**
   * 设置背景类型
   */
  const setBackgroundTypeValue = useCallback((type: CanvasBackgroundType) => {
    setBackgroundType(type);
  }, []);
  
  /**
   * 设置画布缩放
   * @param scale 缩放比例
   */
  const setScale = useCallback((scale: number) => {
    const clampedScale = Math.max(
      config.minScale,
      Math.min(config.maxScale, scale)
    );
    
    setTransform(prev => ({
      ...prev,
      scale: clampedScale
    }));
  }, [config.minScale, config.maxScale]);
  
  /**
   * 缩放画布
   * @param delta 缩放增量
   * @param center 缩放中心点坐标
   */
  const zoom = useCallback((delta: number, center?: { x: number; y: number }) => {
    if (!config.enableZoom) return;
    
    setTransform(prev => {
      const newScale = Math.max(
        config.minScale,
        Math.min(config.maxScale, prev.scale + delta * config.scaleStep)
      );
      
      // 如果提供了中心点，则基于该点进行缩放
      if (center) {
        const scaleRatio = newScale / prev.scale;
        
        return {
          ...prev,
          scale: newScale,
          x: center.x - (center.x - prev.x) * scaleRatio,
          y: center.y - (center.y - prev.y) * scaleRatio
        };
      }
      
      return {
        ...prev,
        scale: newScale
      };
    });
  }, [config.enableZoom, config.minScale, config.maxScale, config.scaleStep]);
  
  /**
   * 平移画布
   * @param deltaX X方向平移量
   * @param deltaY Y方向平移量
   */
  const pan = useCallback((deltaX: number, deltaY: number) => {
    if (!config.enablePan) return;
    
    setTransform(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  }, [config.enablePan]);
  
  /**
   * 设置画布旋转
   * @param rotation 旋转角度（弧度）
   */
  const setRotation = useCallback((rotation: number) => {
    if (!config.enableRotation) return;
    
    setTransform(prev => ({
      ...prev,
      rotation
    }));
  }, [config.enableRotation]);
  
  /**
   * 旋转画布
   * @param delta 旋转增量（弧度）
   */
  const rotate = useCallback((delta: number) => {
    if (!config.enableRotation) return;
    
    setTransform(prev => ({
      ...prev,
      rotation: prev.rotation + delta
    }));
  }, [config.enableRotation]);
  

  
  /**
   * 拖动中
   * @param event 鼠标事件
   */
  const drag = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    // 获取鼠标或触摸位置
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    // 计算移动距离
    const deltaX = clientX - lastMousePos.x;
    const deltaY = clientY - lastMousePos.y;
    
    // 平移画布
    pan(deltaX, deltaY);
    
    // 更新最后位置
    setLastMousePos({ x: clientX, y: clientY });
    
    // 阻止默认事件
    event.preventDefault();
  }, [isDragging, lastMousePos, pan]);
  
  /**
   * 结束拖动
   */
  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  /**
   * 调整画布大小
   */
  const resizeCanvas = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setCanvasSize({ width, height });
      
      if (canvasRef.current) {
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    }
  }, []);
  
  /**
   * 应用变换到画布上下文
   * @param ctx 画布上下文
   */
  const applyTransform = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.translate(transform.x + canvasSize.width / 2, transform.y + canvasSize.height / 2);
    ctx.rotate(transform.rotation);
    ctx.scale(transform.scale, transform.scale);
    ctx.translate(-canvasSize.width / 2, -canvasSize.height / 2);
  }, [transform, canvasSize]);
  
  /**
   * 清除画布
   * @param ctx 画布上下文
   * @param color 清除颜色
   */
  const clearCanvas = useCallback((ctx: CanvasRenderingContext2D, color?: string) => {
    if (color) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    } else {
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    }
  }, [canvasSize]);
  
  /**
   * 将屏幕坐标转换为画布坐标
   * @param screenX 屏幕X坐标
   * @param screenY 屏幕Y坐标
   * @returns 画布坐标
   */
  const screenToCanvas = useCallback((screenX: number, screenY: number): CanvasPoint => {
    // 计算相对于容器的坐标
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: 0, y: 0 };
    
    const relativeX = screenX - containerRect.left;
    const relativeY = screenY - containerRect.top;
    
    // 应用变换的逆操作
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    const rotatedX = (relativeX - transform.x - centerX) / transform.scale;
    const rotatedY = (relativeY - transform.y - centerY) / transform.scale;
    
    const cos = Math.cos(-transform.rotation);
    const sin = Math.sin(-transform.rotation);
    
    return {
      x: rotatedX * cos - rotatedY * sin + centerX,
      y: rotatedX * sin + rotatedY * cos + centerY
    };
  }, [transform, canvasSize]);
  
  /**
   * 将画布坐标转换为屏幕坐标
   * @param canvasX 画布X坐标
   * @param canvasY 画布Y坐标
   * @returns 屏幕坐标
   */
  const canvasToScreen = useCallback((canvasX: number, canvasY: number): CanvasPoint => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;
    
    const translatedX = canvasX - centerX;
    const translatedY = canvasY - centerY;
    
    // 应用旋转
    const cos = Math.cos(transform.rotation);
    const sin = Math.sin(transform.rotation);
    
    const rotatedX = translatedX * cos - translatedY * sin;
    const rotatedY = translatedX * sin + translatedY * cos;
    
    // 应用缩放和平移
    const screenX = rotatedX * transform.scale + transform.x + centerX;
    const screenY = rotatedY * transform.scale + transform.y + centerY;
    
    // 转换为屏幕坐标
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: screenX, y: screenY };
    
    return {
      x: screenX + containerRect.left,
      y: screenY + containerRect.top
    };
  }, [transform, canvasSize]);
  
  /**
   * 键盘事件处理
   * @param event 键盘事件
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!config.enableKeyboardControls) return;
    
    let deltaX = 0;
    let deltaY = 0;
    let deltaRotation = 0;
    
    const panSpeed = keyboardPanSpeed / transform.scale;
    const rotationSpeed = 0.1;
    
    switch (event.key) {
      case 'ArrowUp':
        deltaY = -panSpeed;
        break;
      case 'ArrowDown':
        deltaY = panSpeed;
        break;
      case 'ArrowLeft':
        deltaX = -panSpeed;
        break;
      case 'ArrowRight':
        deltaX = panSpeed;
        break;
      case 'q':
      case 'Q':
        deltaRotation = -rotationSpeed;
        break;
      case 'e':
      case 'E':
        deltaRotation = rotationSpeed;
        break;
      case 'D':
      case 'd':
        // D键切换背景
        toggleBackground();
        event.preventDefault();
        return;
      case ' ':
        // 空格键按下，准备平移
        setIsSpacePressed(true);
        event.preventDefault();
        return;
      default:
        return;
    }
    
    if (deltaX !== 0 || deltaY !== 0) {
      pan(deltaX, deltaY);
    }
    
    if (deltaRotation !== 0) {
      rotate(deltaRotation);
    }
    
    event.preventDefault();
  }, [config.enableKeyboardControls, keyboardPanSpeed, transform.scale, pan, rotate, toggleBackground]);
  
  /**
   * 键盘抬起事件处理
   * @param event 键盘事件
   */
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    // 空格键释放，结束平移状态
    if (event.key === ' ') {
      setIsSpacePressed(false);
      event.preventDefault();
    }
  }, []);
  
  /**
   * 窗口大小变化时调整画布
   */
  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // 初始化画布大小
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);
  
  /**
   * 设置全局鼠标事件监听
   */
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => drag(event as any);
    const handleMouseUp = () => endDrag();
    const handleTouchMove = (event: TouchEvent) => drag(event as any);
    const handleTouchEnd = () => endDrag();
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, drag, endDrag]);
  
  /**
   * 设置键盘事件监听
   */
  useEffect(() => {
    if (config.enableKeyboardControls) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [config.enableKeyboardControls, handleKeyDown, handleKeyUp]);
  
  /**
   * 开始拖动
   * @param event 鼠标事件
   */
  const startDrag = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!config.enablePan) return;
    
    // 只有在按下空格键、Ctrl键或中键时才允许拖动
    if ('touches' in event) {
      // 触摸事件默认允许拖动
    } else if (!event.ctrlKey && event.button !== 1 && !isSpacePressed) {
      return;
    }
    
    setIsDragging(true);
    
    // 获取鼠标或触摸位置
    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
    
    setLastMousePos({ x: clientX, y: clientY });
    
    // 阻止默认事件
    event.preventDefault();
  }, [config.enablePan, isSpacePressed]);
  
  return {
    // 引用
    canvasRef,
    containerRef,
    
    // 状态
    transform,
    isDragging,
    canvasSize,
    backgroundType,
    backgroundClass,
    isSpacePressed,
    transformStyle,
    
    // 方法
    resetTransform,
    setScale,
    zoom,
    pan,
    setRotation,
    rotate,
    startDrag,
    drag,
    endDrag,
    resizeCanvas,
    applyTransform,
    clearCanvas,
    screenToCanvas,
    canvasToScreen,
    handleKeyDown,
    toggleBackground,
    setBackgroundType: setBackgroundTypeValue,
    
    // 快捷方法（兼容useCanvasTransform）
    zoomIn: () => zoom(config.scaleStep),
    zoomOut: () => zoom(-config.scaleStep),
    fitCanvas: resetTransform
  };
};