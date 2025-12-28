import React, { useState, useRef, useEffect } from 'react';
import { CanvasBackground } from './CanvasBackground';
import { CanvasTransform } from './CanvasTransform';

import { useCanvasContext } from '../../composables/CanvasContext';

interface StageDRendererProps {
  imagePath: string;
  transform: { scale: number; translateX: number; translateY: number };
  onProcessingChange?: (isProcessing: boolean) => void;
}

// 动画模式类型
type AnimationMode = 'pose' | 'keyframe' | 'onion' | 'play';

/**
 * Stage D渲染器组件
 * 功能：实现动画制作，包括姿态调整、关键帧记录、洋葱皮预览等功能
 */
export const StageDRenderer: React.FC<StageDRendererProps> = ({
  imagePath,
  transform,
  onProcessingChange
}) => {
  const { state, dispatch } = useCanvasContext();
  
  // 本地状态
  const [animationMode, setAnimationMode] = useState<AnimationMode>('pose');
  const [onionSkinEnabled, setOnionSkinEnabled] = useState(false);
  const [onionSkinFrames, setOnionSkinFrames] = useState(3);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const animationRef = useRef<number | null>(null);
  
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
   * 处理画布点击事件 - 姿态调整或关键帧操作
   */
  const handleCanvasClick = (e: React.MouseEvent) => {
    const imageCoords = convertToImageCoordinates(e.clientX, e.clientY);
    if (!imageCoords) return;
    
    const { x, y } = imageCoords;
    
    if (animationMode === 'pose') {
      // 姿态调整模式
      adjustPose(x, y);
    } else if (animationMode === 'keyframe') {
      // 关键帧模式
      addKeyframe();
    }
  };
  
  /**
   * 处理鼠标按下事件 - 开始拖拽
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (animationMode !== 'pose') return;
    
    const imageCoords = convertToImageCoordinates(e.clientX, e.clientY);
    if (!imageCoords) return;
    
    setIsDragging(true);
    setDragStart(imageCoords);
  };
  
  /**
   * 处理鼠标移动事件 - 拖拽调整姿态
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || animationMode !== 'pose') return;
    
    const imageCoords = convertToImageCoordinates(e.clientX, e.clientY);
    if (!imageCoords) return;
    
    // 计算拖拽偏移量
    const deltaX = imageCoords.x - dragStart.x;
    const deltaY = imageCoords.y - dragStart.y;
    
    // 实时调整骨骼姿态
    adjustPoseRealTime(deltaX, deltaY);
  };
  
  /**
   * 处理鼠标释放事件 - 结束拖拽
   */
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    setDragStart(null);
    
    // 记录关键帧（如果处于关键帧模式）
    if (animationMode === 'keyframe') {
      recordCurrentPose();
    }
  };
  
  /**
   * 调整姿态（IK/FK混合）
   */
  const adjustPose = async (x: number, y: number) => {
    if (!state.selectedPointId) return;
    
    try {
      onProcessingChange?.(true);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: true, 
          progress: 0, 
          message: '正在调整姿态...' 
        } 
      });
      
      // 移除Electron API调用，使用本地姿态调整逻辑
      // TODO: 替换为实际的姿态调整API调用
      
      // 模拟姿态调整结果
      const result = {
        success: true,
        newPose: [{
          id: state.selectedPointId,
          x: x,
          y: y,
          rotation: 0
        }]
      };
      
      if (result.success && result.newPose) {
        // 更新骨骼点位置
        result.newPose.forEach((pose: any) => {
          dispatch({
            type: 'UPDATE_SKELETON_POINT',
            payload: {
              id: pose.id,
              updates: {
                x: pose.x,
                y: pose.y,
                rotation: pose.rotation
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
          message: '姿态调整完成' 
        } 
      });
    } catch (error) {
      console.error('姿态调整失败:', error);
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 0, 
          message: '姿态调整失败' 
        } 
      });
    }
  };
  
  /**
   * 实时调整姿态（拖拽时）
   */
  const adjustPoseRealTime = (deltaX: number, deltaY: number) => {
    if (!state.selectedPointId) return;
    
    const selectedPoint = state.skeletonPoints.find(p => p.id === state.selectedPointId);
    if (!selectedPoint) return;
    
    // 实时更新骨骼点位置
    dispatch({
      type: 'UPDATE_SKELETON_POINT',
      payload: {
        id: state.selectedPointId,
        updates: {
          x: selectedPoint.x + deltaX,
          y: selectedPoint.y + deltaY
        }
      }
    });
  };
  
  /**
   * 添加关键帧
   */
  const addKeyframe = async () => {
    if (!state.activeAnimationId) return;
    
    try {
      onProcessingChange?.(true);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: true, 
          progress: 0, 
          message: '正在添加关键帧...' 
        } 
      });
      
      // 获取当前骨骼状态
      const currentPose = state.skeletonPoints.map(point => ({
        id: point.id,
        x: point.x,
        y: point.y,
        rotation: point.rotation || 0,
        scale: point.scale || 1
      }));
      
      // 创建新的关键帧
      const newKeyframe = {
        id: `keyframe-${Date.now()}`,
        time: state.currentTime,
        properties: {
          pose: currentPose
        },
        interpolation: 'linear' as const
      };
      
      // 获取当前动画
      const activeAnimation = state.animations.find(a => a.id === state.activeAnimationId);
      if (activeAnimation) {
        // 更新动画的关键帧列表
        dispatch({
          type: 'UPDATE_ANIMATION',
          payload: {
            id: state.activeAnimationId,
            updates: {
              keyframes: [...activeAnimation.keyframes, newKeyframe]
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
          message: '关键帧添加完成' 
        } 
      });
    } catch (error) {
      console.error('添加关键帧失败:', error);
      onProcessingChange?.(false);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 0, 
          message: '关键帧添加失败' 
        } 
      });
    }
  };
  
  /**
   * 记录当前姿态为关键帧
   */
  const recordCurrentPose = () => {
    if (!state.activeAnimationId) return;
    
    const activeAnimation = state.animations.find(a => a.id === state.activeAnimationId);
    if (!activeAnimation) return;
    
    // 获取当前骨骼状态
    const currentPose = state.skeletonPoints.map(point => ({
      id: point.id,
      x: point.x,
      y: point.y,
      rotation: point.rotation || 0,
      scale: point.scale || 1
    }));
    
    // 创建新的关键帧
    const newKeyframe = {
      id: `keyframe-${Date.now()}`,
      time: state.currentTime,
      properties: {
        pose: currentPose
      },
      interpolation: 'linear' as const
    };
    
    // 更新动画的关键帧列表
    dispatch({
      type: 'UPDATE_ANIMATION',
      payload: {
        id: state.activeAnimationId,
        updates: {
          keyframes: [...activeAnimation.keyframes, newKeyframe]
        }
      }
    });
  };
  
  /**
   * 播放动画
   */
  const playAnimation = () => {
    if (!state.activeAnimationId || state.isPlaying) return;
    
    dispatch({ type: 'TOGGLE_PLAYING', payload: true });
    
    const activeAnimation = state.animations.find(a => a.id === state.activeAnimationId);
    if (!activeAnimation) return;
    
    const startTime = Date.now();
    const duration = activeAnimation.duration * 1000; // 转换为毫秒
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 更新时间
      const currentTime = progress * activeAnimation.duration;
      dispatch({ type: 'SET_CURRENT_TIME', payload: currentTime });
      
      // 插值计算当前姿态
      interpolatePose(currentTime);
      
      if (progress < 1 && state.isPlaying) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // 动画结束
        dispatch({ type: 'TOGGLE_PLAYING', payload: false });
        if (activeAnimation.loop) {
          // 如果循环播放，重新开始
          setTimeout(() => playAnimation(), 0);
        }
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };
  
  /**
   * 停止动画
   */
  const stopAnimation = () => {
    dispatch({ type: 'TOGGLE_PLAYING', payload: false });
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  };
  
  /**
   * 插值计算姿态
   */
  const interpolatePose = (time: number) => {
    if (!state.activeAnimationId) return;
    
    const activeAnimation = state.animations.find(a => a.id === state.activeAnimationId);
    if (!activeAnimation || activeAnimation.keyframes.length === 0) return;
    
    // 找到当前时间附近的关键帧
    let prevKeyframe = activeAnimation.keyframes[0];
    let nextKeyframe = activeAnimation.keyframes[activeAnimation.keyframes.length - 1];
    
    for (let i = 0; i < activeAnimation.keyframes.length - 1; i++) {
      if (time >= activeAnimation.keyframes[i].time && time <= activeAnimation.keyframes[i + 1].time) {
        prevKeyframe = activeAnimation.keyframes[i];
        nextKeyframe = activeAnimation.keyframes[i + 1];
        break;
      }
    }
    
    // 计算插值因子
    const timeDiff = nextKeyframe.time - prevKeyframe.time;
    const factor = timeDiff === 0 ? 0 : (time - prevKeyframe.time) / timeDiff;
    
    // 应用插值到骨骼点
    prevKeyframe.properties.pose.forEach((prevBone: any) => {
      const nextBone = nextKeyframe.properties.pose.find((b: any) => b.id === prevBone.id);
      if (nextBone) {
        const interpolatedX = prevBone.x + (nextBone.x - prevBone.x) * factor;
        const interpolatedY = prevBone.y + (nextBone.y - prevBone.y) * factor;
        const interpolatedRotation = prevBone.rotation + (nextBone.rotation - prevBone.rotation) * factor;
        const interpolatedScale = prevBone.scale + (nextBone.scale - prevBone.scale) * factor;
        
        dispatch({
          type: 'UPDATE_SKELETON_POINT',
          payload: {
            id: prevBone.id,
            updates: {
              x: interpolatedX,
              y: interpolatedY,
              rotation: interpolatedRotation,
              scale: interpolatedScale
            }
          }
        });
      }
    });
  };
  
  /**
   * 生成洋葱皮预览
   */
  const generateOnionSkin = () => {
    if (!state.activeAnimationId || !onionSkinEnabled) return [];
    
    const activeAnimation = state.animations.find(a => a.id === state.activeAnimationId);
    if (!activeAnimation) return [];
    
    const onionFrames = [];
    
    // 生成前后帧的洋葱皮
    for (let i = 1; i <= onionSkinFrames; i++) {
      const prevTime = state.currentTime - (i / activeAnimation.fps);
      const nextTime = state.currentTime + (i / activeAnimation.fps);
      
      if (prevTime >= 0) {
        onionFrames.push({
          time: prevTime,
          opacity: 0.3 / i, // 距离越远，透明度越低
          color: '#FF6B6B' // 红色表示过去帧
        });
      }
      
      if (nextTime <= activeAnimation.duration) {
        onionFrames.push({
          time: nextTime,
          opacity: 0.3 / i, // 距离越远，透明度越低
          color: '#4ECDC4' // 青色表示未来帧
        });
      }
    }
    
    return onionFrames;
  };
  
  // 清理动画循环
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  const generatedOnionSkinFrames = generateOnionSkin();
  
  return (
    <div 
      ref={containerRef}
      className="stage-d-container relative w-full h-full"
      onClick={handleCanvasClick}
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
        {/* 3. 洋葱皮预览层 */}
        {onionSkinEnabled && generatedOnionSkinFrames.map((frame, index) => (
          <div key={index} className="absolute inset-0 z-5" style={{ opacity: frame.opacity }}>
            <div 
              className="w-full h-full"
              style={{
                backgroundColor: frame.color,
                mixBlendMode: 'screen'
              }}
            />
          </div>
        ))}
        
        {/* 4. 原始图像层 */}
        {imagePath && (
          <img 
            ref={imageRef}
            src={imagePath} 
            alt="原图像"
            className="max-w-full max-h-full object-contain z-10"
            onLoad={handleImageLoad}
          />
        )}
        
        {/* 5. 骨骼动画层 */}
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
                stroke="#FFFFFF"
                strokeWidth="2"
                className="cursor-pointer hover:fill-accent"
                onClick={() => dispatch({ type: 'SET_SELECTED_POINT', payload: point.id })}
              />
            ))}
          </svg>
        </div>
      </CanvasTransform>
    </div>
  );
};