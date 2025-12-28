import React, { useState, useRef } from 'react';
import { CanvasBackground } from './CanvasBackground';
import { CanvasTransform } from './CanvasTransform';
import { useCanvasContext } from '../../composables/CanvasContext';
import { RiggingToolbar } from '../Overlays/RiggingToolbar';
import { WeightEditPanel } from '../panels/WeightEditPanel';
import { sx } from '../../../../themes/themeUtils';

interface StageCRendererProps {
  imagePath: string;
  transform: { scale: number; translateX: number; translateY: number };
  onProcessingChange?: (isProcessing: boolean) => void;
}

// 骨骼绘制模式类型
type SkeletonMode = 'add' | 'connect' | 'weight' | 'ik';

/**
 * Stage C渲染器组件
 * 功能：实现骨骼绑定，包括骨骼绘制、权重可视化、IK链配置等功能
 */
export const StageCRenderer: React.FC<StageCRendererProps> = ({
  imagePath,
  transform,
  onProcessingChange
}) => {
  const { state, dispatch } = useCanvasContext();
  
  // 本地状态
  const [skeletonMode, setSkeletonMode] = useState<SkeletonMode>('add');
  const [weightVisualization, setWeightVisualization] = useState(false);
  const [selectedBoneId, setSelectedBoneId] = useState<string | null>(null);
  // 权重编辑相关状态
  const [brushStrength, setBrushStrength] = useState(0.5);
  const [brushRadius, setBrushRadius] = useState(20);
  // 拖拽状态 - 暂时注释掉未使用的变量
  // const [isDragging, setIsDragging] = useState(false);
  // const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  
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
   * 处理画布点击事件 - 添加骨骼点或连接骨骼
   */
  const handleCanvasClick = (e: React.MouseEvent) => {
    const imageCoords = convertToImageCoordinates(e.clientX, e.clientY);
    if (!imageCoords) return;
    
    const { x, y } = imageCoords;
    
    if (skeletonMode === 'add') {
      // 添加新的骨骼点
      addSkeletonPoint(x, y);
    } else if (skeletonMode === 'connect') {
      // 连接骨骼点
      connectSkeletonPoints(x, y);
    } else if (skeletonMode === 'weight') {
      // 权重编辑模式
      selectSkeletonPoint(x, y);
    }
  };
  
  /**
   * 添加骨骼点
   */
  const addSkeletonPoint = async (x: number, y: number) => {
    try {
      onProcessingChange?.(true);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: true, 
          progress: 0, 
          message: '正在添加骨骼点...' 
        } 
      });
      
      // 添加骨骼点
      dispatch({
        type: 'ADD_SKELETON_POINT',
        payload: {
          x,
          y,
          name: `关节${state.skeletonPoints.length + 1}`
        }
      });
      
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 100, 
          message: '骨骼点添加完成' 
        } 
      });
    } catch (error) {
      console.error('添加骨骼点失败:', error);
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 0, 
          message: '骨骼点添加失败' 
        } 
      });
    }
  };
  
  /**
   * 连接骨骼点
   */
  const connectSkeletonPoints = async (x: number, y: number) => {
    try {
      // 查找最近的骨骼点
      const nearestPoint = findNearestSkeletonPoint(x, y);
      if (!nearestPoint) {
        // 如果没有找到，创建新点
        addSkeletonPoint(x, y);
        return;
      }
      
      // 如果已经有选中的点，连接它们
      if (state.selectedPointId) {
        const selectedPoint = state.skeletonPoints.find(p => p.id === state.selectedPointId);
        if (selectedPoint && selectedPoint.id !== nearestPoint.id) {
          // 连接两个点
          dispatch({
            type: 'UPDATE_SKELETON_POINT',
            payload: {
              id: selectedPoint.id,
              updates: {
                childrenIds: [...(selectedPoint.childrenIds || []), nearestPoint.id]
              }
            }
          });
          
          dispatch({
            type: 'UPDATE_SKELETON_POINT',
            payload: {
              id: nearestPoint.id,
              updates: {
                parentId: selectedPoint.id
              }
            }
          });
          
          dispatch({ type: 'SET_SELECTED_POINT', payload: null });
        }
      } else {
        // 选择这个点
        dispatch({ type: 'SET_SELECTED_POINT', payload: nearestPoint.id });
      }
    } catch (error) {
      console.error('连接骨骼点失败:', error);
    }
  };
  
  /**
   * 选择骨骼点进行权重编辑
   */
  const selectSkeletonPoint = (x: number, y: number) => {
    const nearestPoint = findNearestSkeletonPoint(x, y);
    if (nearestPoint) {
      dispatch({ type: 'SET_SELECTED_POINT', payload: nearestPoint.id });
      setSelectedBoneId(nearestPoint.id);
    }
  };
  
  /**
   * 查找最近的骨骼点
   */
  const findNearestSkeletonPoint = (x: number, y: number) => {
    if (state.skeletonPoints.length === 0) return null;
    
    let nearest = state.skeletonPoints[0];
    let minDistance = Math.sqrt(Math.pow(nearest.x - x, 2) + Math.pow(nearest.y - y, 2));
    
    state.skeletonPoints.forEach(point => {
      const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });
    
    return minDistance < 50 ? nearest : null; // 阈值：50像素
  };
  
  /**
   * 生成IK链
   */
  const generateIKChain = async (startPointId: string, endPointId: string) => {
    try {
      onProcessingChange?.(true);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: true, 
          progress: 0, 
          message: '正在生成IK链...' 
        } 
      });
      
      // 移除Electron API调用，使用本地IK生成逻辑
      // TODO: 替换为实际的IK生成API调用
      
      // 模拟IK链生成结果
      const result = {
        success: true,
        ikChain: [{ id: startPointId, rotation: 0, scale: 1 }, { id: endPointId, rotation: 0, scale: 1 }]
      };
      
      if (result.success && result.ikChain) {
        // 更新骨骼点以包含IK约束
        result.ikChain.forEach((ikPoint: any) => {
          dispatch({
            type: 'UPDATE_SKELETON_POINT',
            payload: {
              id: ikPoint.id,
              updates: {
                rotation: ikPoint.rotation,
                scale: ikPoint.scale
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
          message: 'IK链生成完成' 
        } 
      });
    } catch (error) {
      console.error('生成IK链失败:', error);
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 0, 
          message: 'IK链生成失败' 
        } 
      });
    }
  };
  
  /**
   * 计算自动权重
   */
  const calculateAutoWeights = async () => {
    if (!selectedBoneId) return;
    
    try {
      onProcessingChange?.(true);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: true, 
          progress: 0, 
          message: '正在计算自动权重...' 
        } 
      });
      
      // 移除Electron API调用，使用本地权重计算逻辑
      // TODO: 替换为实际的权重计算API调用
      
      // 模拟权重计算结果
      const result = {
        success: true,
        weights: { 'vertex-1': 0.5, 'vertex-2': 0.5, 'vertex-3': 0.5 }
      };
      
      if (result.success && result.weights) {
        // 更新骨骼点的权重信息
        dispatch({
          type: 'UPDATE_SKELETON_POINT',
          payload: {
            id: selectedBoneId,
            updates: {
              weights: result.weights
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
          message: '自动权重计算完成' 
        } 
      });
    } catch (error) {
      console.error('自动权重计算失败:', error);
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 0, 
          message: '自动权重计算失败' 
        } 
      });
    }
  };
  
  return (
    <div 
      ref={containerRef}
      className="stage-c-container relative w-full h-full"
      onClick={handleCanvasClick}
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
        
        {/* 4. 骨骼图层 */}
        <div className="absolute inset-0 z-20">
          <svg width="100%" height="100%" className="absolute inset-0">
            {/* 绘制骨骼连接 */}
            {state.skeletonPoints.map(point => {
              if (point.parentId) {
                const parent = state.skeletonPoints.find(p => p.id === point.parentId);
                if (parent) {
                  return (
                    <line
                      key={`bone-${point.id}`}
                      x1={parent.x}
                      y1={parent.y}
                      x2={point.x}
                      y2={point.y}
                      stroke="#4ECDC4"
                      strokeWidth="3"
                      className="cursor-pointer hover:stroke-accent"
                      onClick={() => setSelectedBoneId(point.id)}
                    />
                  );
                }
              }
              return null;
            })}
            
            {/* 绘制骨骼点 */}
            {state.skeletonPoints.map(point => (
              <circle
                key={point.id}
                cx={point.x}
                cy={point.y}
                r={state.selectedPointId === point.id ? "8" : "6"}
                fill={state.selectedPointId === point.id ? "#FF6B6B" : "#45B7D1"}
                stroke={selectedBoneId === point.id ? "#FFD93D" : "#FFFFFF"}
                strokeWidth={selectedBoneId === point.id ? "3" : "2"}
                className="cursor-pointer hover:fill-accent"
                onClick={() => dispatch({ type: 'SET_SELECTED_POINT', payload: point.id })}
              />
            ))}
            
            {/* 权重可视化 */}
            {weightVisualization && state.skeletonPoints.map(point => {
              if (point.weights) {
                return Object.entries(point.weights).map(([vertexId, weight]) => {
                  const vertex = parseVertexId(vertexId);
                  if (vertex) {
                    return (
                      <circle
                        key={`weight-${point.id}-${vertexId}`}
                        cx={vertex.x}
                        cy={vertex.y}
                        r="3"
                        fill={getWeightColor(weight as number)}
                        opacity="0.7"
                      />
                    );
                  }
                  return null;
                });
              }
              return null;
            })}
          </svg>
        </div>
      </CanvasTransform>
      
      {/* 6. 权重编辑面板 */}
      {skeletonMode === 'weight' && (
        <div className={sx(['absolute', 'top-4', 'right-4', 'max-w-xs'])}>
          <WeightEditPanel
            brushStrength={brushStrength}
            brushRadius={brushRadius}
            onBrushStrengthChange={setBrushStrength}
            onBrushRadiusChange={setBrushRadius}
            onAutoWeightCalculation={calculateAutoWeights}
            onClearWeights={() => console.log('清除权重')}
          />
        </div>
      )}
      
      {/* 7. IK链生成按钮 */}
      {selectedBoneId && skeletonMode === 'ik' && (
        <div className={sx(['absolute', 'top-4', 'right-4', 'bg.surface', 'border', 'border.border', 'rounded-lg', 'p-2', 'shadow-md', 'z-50'])}>
          <button
            className={sx(['w-full', 'px-3', 'py-1', 'text-xs', 'bg.accent', 'text.white', 'rounded', 'hover:bg.accent-dark', 'transition-colors'])} 
            onClick={() => {
              // 这里可以实现IK链生成逻辑
              const selectedPoint = state.skeletonPoints.find(p => p.id === selectedBoneId);
              if (selectedPoint) {
                // 找到链的末端点
                const endPoints = findEndPoints(selectedPoint.id, state.skeletonPoints);
                if (endPoints.length > 0) {
                  generateIKChain(selectedBoneId, endPoints[0]);
                }
              }
            }}
            disabled={state.processingStatus.isProcessing}
          >
            {state.processingStatus.isProcessing ? '生成中...' : '生成IK链'}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * 解析顶点ID
 */
const parseVertexId = (vertexId: string): {x: number, y: number} | null => {
  const parts = vertexId.split('-');
  if (parts.length === 2) {
    const x = parseInt(parts[0]);
    const y = parseInt(parts[1]);
    if (!isNaN(x) && !isNaN(y)) {
      return { x, y };
    }
  }
  return null;
};

/**
 * 获取权重颜色（热力图）
 */
const getWeightColor = (weight: number): string => {
  // 从蓝色（低权重）到红色（高权重）
  const r = Math.round(weight * 255);
  const b = Math.round((1 - weight) * 255);
  return `rgb(${r}, 0, ${b})`;
};

/**
 * 查找端点（没有子节点的点）
 */
const findEndPoints = (startId: string, skeletonPoints: any[] = []): string[] => {
  const startPoint = skeletonPoints.find(p => p.id === startId);
  if (!startPoint) return [];
  
  const endPoints: string[] = [];
  
  const findEnds = (pointId: string, visited: Set<string> = new Set()): void => {
    if (visited.has(pointId)) return;
    visited.add(pointId);
    
    const point = skeletonPoints.find(p => p.id === pointId);
    if (!point) return;
    
    const children = point.childrenIds || [];
    if (children.length === 0) {
      endPoints.push(pointId);
      return;
    }
    
    children.forEach((childId: string) => findEnds(childId, visited));
  };
  
  findEnds(startId);
  return endPoints;
};