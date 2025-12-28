import { useState, useCallback, useEffect } from 'react';
import { useSingleShortcut } from '../../../hooks/useShortcut';

/**
 * Canvas变换控制的Hook
 * 提供缩放、平移、坐标转换等核心逻辑
 */
export function useCanvasTransform() {
  // 缩放比例
  const [scale, setScale] = useState(1);
  
  // 平移偏移量
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  
  // 拖动状态
  const [isDragging, setIsDragging] = useState(false);
  const [startDragPos, setStartDragPos] = useState({ x: 0, y: 0 });
  const [startOffset, setStartOffset] = useState({ x: 0, y: 0 });
  
  // 空格键状态
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  
  // 背景类型
  const [backgroundType, setBackgroundType] = useState<'grid' | 'black' | 'white'>('grid');
  
  // 计算画布变换样式
  const transformStyle = {
    transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
    transformOrigin: 'center center'
  };
  
  // 计算背景类名
  const backgroundClass = (() => {
    switch (backgroundType) {
      case 'black':
        return 'bg-black';
      case 'white':
        return 'bg-white';
      case 'grid':
      default:
        return 'bg-gray-200';
    }
  })();
  
  /**
   * 处理鼠标滚轮事件 - 缩放
   */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    // 只有按下Ctrl键时才允许缩放
    if (!e.ctrlKey) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    
    // 计算鼠标在画布上的位置
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(8, scale * scaleFactor));
    
    // 计算缩放前后鼠标位置的变化，保持鼠标位置不变
    const prevX = (mouseX - (rect.width / 2 - offset.x * scale)) / scale;
    const prevY = (mouseY - (rect.height / 2 - offset.y * scale)) / scale;
    
    // 更新缩放比例和偏移量
    setScale(newScale);
    setOffset({
      x: (mouseX - prevX * newScale - (rect.width / 2 - offset.x * newScale)) / newScale,
      y: (mouseY - prevY * newScale - (rect.height / 2 - offset.y * newScale)) / newScale
    });
  }, [scale, offset]);
  
  /**
   * 开始拖动
   */
  const startDrag = useCallback((e: React.MouseEvent) => {
    // 只有在按下空格键或中键时才允许拖动
    if (!e.ctrlKey && e.button !== 1 && !isSpacePressed) return;
    
    setIsDragging(true);
    setStartDragPos({ x: e.clientX, y: e.clientY });
    setStartOffset({ x: offset.x, y: offset.y });
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grab';
  }, [isSpacePressed, offset]);
  
  /**
   * 拖动中
   */
  const onDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startDragPos.x;
    const deltaY = e.clientY - startDragPos.y;
    
    setOffset({
      x: startOffset.x + deltaX / scale,
      y: startOffset.y + deltaY / scale
    });
  }, [isDragging, startDragPos, startOffset, scale]);
  
  /**
   * 结束拖动
   */
  const endDrag = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    }
  }, [isDragging]);
  
  /**
   * 放大画布
   */
  const zoomIn = useCallback(() => {
    setScale(prev => Math.max(0.1, Math.min(8, prev * 1.1)));
  }, []);
  
  /**
   * 缩小画布
   */
  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(0.1, Math.min(8, prev * 0.9)));
  }, []);
  
  /**
   * 适应画布
   */
  const fitCanvas = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);
  
  /**
   * 设置缩放比例
   */
  const setScaleValue = useCallback((newScale: number) => {
    setScale(Math.max(0.1, Math.min(8, newScale)));
  }, []);
  
  /**
   * 切换背景类型
   */
  const toggleBackground = useCallback(() => {
    const types: Array<'grid' | 'black' | 'white'> = ['grid', 'black', 'white'];
    const currentIndex = types.indexOf(backgroundType);
    const safeIndex = currentIndex >= 0 ? currentIndex : 0;
    setBackgroundType(types[(safeIndex + 1) % types.length]);
  }, [backgroundType]);
  
  /**
   * 设置背景类型
   */
  const setBackgroundTypeValue = useCallback((type: 'grid' | 'black' | 'white') => {
    setBackgroundType(type);
  }, []);
  
  // 使用自定义快捷键Hook处理键盘事件
  useSingleShortcut('D', toggleBackground, { preventDefault: true });
  
  // 空格键处理
  useSingleShortcut(' ', () => setIsSpacePressed(true), { event: 'keydown' });
  useSingleShortcut(' ', () => setIsSpacePressed(false), { event: 'keyup' });
  
  // 组件挂载时添加鼠标事件监听
  useEffect(() => {
    document.addEventListener('mousedown', startDrag as any);
    document.addEventListener('mousemove', onDrag as any);
    document.addEventListener('mouseup', endDrag);
    
    return () => {
      document.removeEventListener('mousedown', startDrag as any);
      document.removeEventListener('mousemove', onDrag as any);
      document.removeEventListener('mouseup', endDrag);
    };
  }, [startDrag, onDrag, endDrag]);
  
  // 导出的状态和方法
  return {
    scale,
    offset,
    transformStyle,
    backgroundType,
    backgroundClass,
    isDragging,
    isSpacePressed,
    handleWheel,
    startDrag,
    onDrag,
    endDrag,
    zoomIn,
    zoomOut,
    fitCanvas,
    setScale: setScaleValue,
    toggleBackground,
    setBackgroundType: setBackgroundTypeValue
  };
}