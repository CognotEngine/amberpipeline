import React, { useState, useRef, useCallback } from 'react';
import { CanvasBackground } from './CanvasBackground';
import { CanvasTransform } from './CanvasTransform';
import { useCanvasContext } from '../../composables/CanvasContext';
import { apiService } from '../../../../lib/api';

interface StageBRendererProps {
  imagePath: string;
  transform: { scale: number; translateX: number; translateY: number };
  onProcessingChange?: (isProcessing: boolean) => void;
}

// 语义涂抹模式类型
type SemanticBrushMode = 'head' | 'body' | 'leftArm' | 'rightArm' | 'leftLeg' | 'rightLeg' | 'eraser';

// 部位颜色映射
const partColors = {
  head: '#FF6B6B',
  body: '#4ECDC4',
  leftArm: '#45B7D1',
  rightArm: '#96CEB4',
  leftLeg: '#FFEAA7',
  rightLeg: '#DDA0DD',
  eraser: '#FFFFFF'
};

/**
 * Stage B渲染器组件
 * 功能：实现人物部位拆解，包括语义涂抹、边缘自动吸附、关节补全等功能
 */
export const StageBRenderer: React.FC<StageBRendererProps> = ({
  imagePath,
  transform,
  onProcessingChange
}) => {
  const { state, dispatch } = useCanvasContext();
  
  // 本地状态
  const [brushMode, setBrushMode] = useState<SemanticBrushMode>('head');
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushStrokes, setBrushStrokes] = useState<Array<{x: number, y: number, mode: SemanticBrushMode, size: number}>>([]);
  const [edgeSnapEnabled, setEdgeSnapEnabled] = useState(true);
  const [jointExpansionEnabled, setJointExpansionEnabled] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
  // 图像尺寸
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  // 获取图像尺寸
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
  };
  
  /**
   * 将浏览器坐标转换为原始图像像素坐标
   */
  const convertToImageCoordinates = (clientX: number, clientY: number): {x: number, y: number} | null => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    
    // 计算点击位置相对于容器的坐标
    const containerX = clientX - rect.left;
    const containerY = clientY - rect.top;
    
    // 计算容器中心坐标
    const containerCenterX = rect.width / 2;
    const containerCenterY = rect.height / 2;
    
    // 计算图像中心到点击位置的偏移量（考虑缩放和平移）
    const offsetX = (containerX - containerCenterX) / transform.scale - transform.translateX;
    const offsetY = (containerY - containerCenterY) / transform.scale - transform.translateY;
    
    // 计算最终图像像素坐标
    const imageX = offsetX;
    const imageY = offsetY;
    
    return { x: imageX, y: imageY };
  };
  
  /**
   * 处理鼠标按下事件 - 开始绘制
   */
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const imageCoords = convertToImageCoordinates(e.clientX, e.clientY);
    if (!imageCoords) return;
    
    setIsDrawing(true);
    
    // 添加笔触点
    const newStroke = {
      x: imageCoords.x,
      y: imageCoords.y,
      mode: brushMode,
      size: brushSize
    };
    
    setBrushStrokes(prev => [...prev, newStroke]);
    
    // 如果启用了边缘自动吸附，调用SAM模型进行边缘优化
    if (edgeSnapEnabled) {
      performEdgeSnap(imageCoords.x, imageCoords.y);
    }
  }, [brushMode, brushSize, edgeSnapEnabled, transform]);
  
  /**
   * 处理鼠标移动事件 - 持续绘制
   */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDrawing) return;
    
    const imageCoords = convertToImageCoordinates(e.clientX, e.clientY);
    if (!imageCoords) return;
    
    // 添加连续的笔触点
    const newStroke = {
      x: imageCoords.x,
      y: imageCoords.y,
      mode: brushMode,
      size: brushSize
    };
    
    setBrushStrokes(prev => [...prev, newStroke]);
  }, [isDrawing, brushMode, brushSize, transform]);
  
  /**
   * 计算笔触的边界框
   */
  const calculateStrokeBoundingBox = (strokes: Array<{x: number, y: number, mode: SemanticBrushMode, size: number}>) => {
    if (strokes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
    
    const minX = Math.min(...strokes.map(s => s.x - s.size / 2));
    const minY = Math.min(...strokes.map(s => s.y - s.size / 2));
    const maxX = Math.max(...strokes.map(s => s.x + s.size / 2));
    const maxY = Math.max(...strokes.map(s => s.y + s.size / 2));
    
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };
  
  /**
   * 执行边缘自动吸附
   */
  const performEdgeSnap = useCallback(async (x: number, y: number) => {
    if (!imagePath) return;
    
    try {
      onProcessingChange?.(true);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: true, 
          progress: 0, 
          message: '正在执行边缘吸附...' 
        } 
      });
      
      // 使用FastAPI API调用SAM模型进行边缘优化
      const result = await apiService.performEdgeSnap(
        imagePath,
        [{ x, y }],
        brushMode !== 'eraser' ? 'foreground' : 'background'
      );
      
      if (result.success && result.snappedPoints) {
        // 更新笔触点位置
        setBrushStrokes(prev => {
          const newStrokes = [...prev];
          if (newStrokes.length > 0) {
            const lastIndex = newStrokes.length - 1;
            newStrokes[lastIndex] = {
              ...newStrokes[lastIndex],
              x: result.snappedPoints[0].x,
              y: result.snappedPoints[0].y
            };
          }
          return newStrokes;
        });
      }
      
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 100, 
          message: '边缘吸附完成' 
        } 
      });
    } catch (error) {
      console.error('边缘吸附失败:', error);
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 0, 
          message: '边缘吸附失败' 
        } 
      });
    }
  }, [imagePath, brushMode, onProcessingChange, dispatch]);
  
  /**
   * 执行关节补全
   */
  const performJointExpansion = useCallback(async () => {
    if (!imagePath || brushStrokes.length === 0) return;
    
    try {
      onProcessingChange?.(true);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: true, 
          progress: 0, 
          message: '正在执行关节补全...' 
        } 
      });
      
      // 获取当前笔触的边界框
      const bbox = calculateStrokeBoundingBox(brushStrokes);
      
      // 使用FastAPI API调用关节补全算法
      const result = await apiService.performJointExpansion(
        imagePath,
        bbox,
        brushMode !== 'eraser' ? 'foreground' : 'background'
      );
      
      if (result.success && result.expandedMask) {
        // 创建新的图层用于关节补全结果
        dispatch({
          type: 'ADD_LAYER',
          payload: {
            name: `关节补全 ${state.layers.length + 1}`,
            type: 'character',
            zIndex: state.layers.length,
            opacity: 1,
            visible: true,
            locked: false,
            imagePath: result.expandedMask,
            maskPath: result.expandedMask,
            properties: {
              partType: brushMode,
              jointExpansion: true
            }
          }
        });
      }
      
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 100, 
          message: '关节补全完成' 
        } 
      });
    } catch (error) {
      console.error('关节补全失败:', error);
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 0, 
          message: '关节补全失败' 
        } 
      });
    }
  }, [imagePath, brushStrokes, brushMode, state.layers.length, onProcessingChange, dispatch, calculateStrokeBoundingBox]);
  
  /**
   * 处理语义涂抹
   */
  const processSemanticBrush = useCallback(async () => {
    if (!imagePath || brushStrokes.length === 0) return;
    
    try {
      onProcessingChange?.(true);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: true, 
          progress: 0, 
          message: '正在处理语义涂抹...' 
        } 
      });
      
      // 使用FastAPI API调用语义涂抹算法
      const result = await apiService.processSemanticBrush(
        imagePath,
        brushStrokes
      );
      
      if (result.success && result.mask) {
        // 创建新的图层用于语义涂抹结果
        dispatch({
          type: 'ADD_LAYER',
          payload: {
            name: `语义涂抹 ${state.layers.length + 1}`,
            type: 'character',
            zIndex: state.layers.length,
            opacity: 1,
            visible: true,
            locked: false,
            imagePath: result.mask,
            maskPath: result.mask,
            properties: {
              partType: brushMode,
              semanticBrush: true
            }
          }
        });
        
        // 清空当前笔触，准备新的涂抹
        setBrushStrokes([]);
      }
      
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 100, 
          message: '语义涂抹处理完成' 
        } 
      });
    } catch (error) {
      console.error('语义涂抹处理失败:', error);
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 0, 
          message: '语义涂抹处理失败' 
        } 
      });
    }
  }, [imagePath, brushStrokes, brushMode, state.layers.length, onProcessingChange, dispatch]);
  
  /**
   * 处理鼠标释放事件 - 结束绘制
   */
  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    // 处理语义涂抹
    if (brushStrokes.length > 0) {
      processSemanticBrush();
    }
    
    // 如果启用了关节补全，处理当前笔触区域
    if (jointExpansionEnabled && brushStrokes.length > 0) {
      performJointExpansion();
    }
  }, [isDrawing, jointExpansionEnabled, brushStrokes, processSemanticBrush, performJointExpansion]);
  
  /**
   * 应用部位预设
   */
  const applyPartPreset = async (presetId: string) => {
    if (!imagePath) return;
    
    try {
      onProcessingChange?.(true);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: true, 
          progress: 0, 
          message: '正在应用部位预设...' 
        } 
      });
      
      // 使用FastAPI API调用部位分割算法
      const result = await apiService.applyPartPreset(imagePath, presetId);
      
      if (result.success && result.parts) {
        // 为每个部位创建图层
        result.parts.forEach((part: any, index: number) => {
          dispatch({
            type: 'ADD_LAYER',
            payload: {
              name: `${part.name} ${index + 1}`,
              type: 'character',
              zIndex: state.layers.length + index,
              opacity: 1,
              visible: true,
              locked: false,
              imagePath: part.mask,
              maskPath: part.mask,
              properties: {
                partType: part.type,
                presetId: presetId,
                feathering: 3,
                dilation: 5
              }
            }
          });
        });
      }
      
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 100, 
          message: '部位预设应用完成' 
        } 
      });
    } catch (error) {
      console.error('应用部位预设失败:', error);
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 0, 
          message: '部位预设应用失败' 
        } 
      });
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="stage-b-container relative w-full h-full"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 1. 背景层 */}
      <CanvasBackground size={20} />
      
      {/* 2. 图像变换容器 */}
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
            alt="原图像"
            className="max-w-full max-h-full object-contain z-10"
            onLoad={handleImageLoad}
          />
        )}
        
        {/* 4. 部位图层 */}
        {state.layers
          .filter(layer => layer.type === 'character' && layer.visible)
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
                alt={`部位层 ${layer.name}`}
                className="max-w-full max-h-full object-contain"
              />
              {/* 部位类型指示器 */}
              <div className="absolute top-2 left-2 bg-primary text-white text-xs px-1 rounded">
                {layer.properties?.partType || '未知'}
              </div>
            </div>
          ))
        }
        
        {/* 5. 交互覆盖层 - 显示笔触 */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          <svg width="100%" height="100%" className="absolute inset-0">
            {brushStrokes.map((stroke, index) => (
              <circle
                key={index}
                cx={stroke.x}
                cy={stroke.y}
                r={stroke.size / 2}
                fill={partColors[stroke.mode]}
                opacity={0.7}
              />
            ))}
          </svg>
        </div>
      </CanvasTransform>
    </div>
  );
};