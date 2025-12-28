/**
 * SAM工作流Hook
 * 处理SAM精细抠图模式的所有逻辑
 */
import { useState, useCallback } from 'react';

// 定义SAM模式的状态接口
export interface PrecisionCutState {
  imagePath: string;
  historyStack: any[];
  layerVisibility: {
    original: boolean;
    mask: boolean;
    result: boolean;
  };
  segmentedImagePath: string;
  isProcessing: boolean;
  currentTaskId: string;
  processingProgress: number;
  processingStatus: string;
  interactiveMode: boolean;
  foregroundPoints: Array<{x: number, y: number}>;
  backgroundPoints: Array<{x: number, y: number}>;
}

/**
 * SAM工作流Hook
 * @param initialState 初始状态
 * @returns SAM工作流API
 */
export const useSamWorkflow = (
  initialState: Partial<PrecisionCutState> = {}
) => {
  // 初始化SAM模式的状态
  const [state, setState] = useState<PrecisionCutState>({
    imagePath: initialState.imagePath || '',
    historyStack: initialState.historyStack || [],
    layerVisibility: initialState.layerVisibility || {
      original: true,
      mask: true,
      result: false
    },
    segmentedImagePath: initialState.segmentedImagePath || '',
    isProcessing: initialState.isProcessing || false,
    currentTaskId: initialState.currentTaskId || '',
    processingProgress: initialState.processingProgress || 0,
    processingStatus: initialState.processingStatus || '',
    interactiveMode: initialState.interactiveMode || false,
    foregroundPoints: initialState.foregroundPoints || [],
    backgroundPoints: initialState.backgroundPoints || []
  });

  // 处理状态变化
  const [processingChange, setProcessingChange] = useState(false);

  /**
   * 设置图像路径
   */
  const setImagePath = useCallback((path: string) => {
    setState(prev => ({ ...prev, imagePath: path }));
  }, []);

  /**
   * 设置处理状态
   */
  const setProcessing = useCallback((isProcessing: boolean) => {
    setState(prev => ({ ...prev, isProcessing }));
    setProcessingChange(isProcessing);
  }, []);

  /**
   * 设置处理进度
   */
  const setProcessingProgress = useCallback((progress: number) => {
    setState(prev => ({ ...prev, processingProgress: Math.max(0, Math.min(100, progress)) }));
  }, []);

  /**
   * 设置处理状态信息
   */
  const setProcessingStatus = useCallback((status: string) => {
    setState(prev => ({ ...prev, processingStatus: status }));
  }, []);

  /**
   * 设置当前任务ID
   */
  const setCurrentTaskId = useCallback((taskId: string) => {
    setState(prev => ({ ...prev, currentTaskId: taskId }));
  }, []);

  /**
   * 设置分割后的图像路径
   */
  const setSegmentedImagePath = useCallback((path: string) => {
    setState(prev => ({ ...prev, segmentedImagePath: path }));
  }, []);

  /**
   * 切换图层可见性
   */
  const toggleLayerVisibility = useCallback((
    layer: keyof PrecisionCutState['layerVisibility'], 
    visible?: boolean
  ) => {
    setState(prev => ({
      ...prev,
      layerVisibility: {
        ...prev.layerVisibility,
        [layer]: visible !== undefined ? visible : !prev.layerVisibility[layer]
      }
    }));
  }, []);

  /**
   * 切换交互式模式
   */
  const toggleInteractiveMode = useCallback((mode?: boolean) => {
    setState(prev => ({
      ...prev,
      interactiveMode: mode !== undefined ? mode : !prev.interactiveMode
    }));
  }, []);

  /**
   * 添加前景点
   */
  const addForegroundPoint = useCallback((point: {x: number, y: number}) => {
    setState(prev => ({
      ...prev,
      foregroundPoints: [...prev.foregroundPoints, point]
    }));
  }, []);

  /**
   * 添加背景点
   */
  const addBackgroundPoint = useCallback((point: {x: number, y: number}) => {
    setState(prev => ({
      ...prev,
      backgroundPoints: [...prev.backgroundPoints, point]
    }));
  }, []);

  /**
   * 清除所有点
   */
  const clearPoints = useCallback(() => {
    setState(prev => ({
      ...prev,
      foregroundPoints: [],
      backgroundPoints: []
    }));
  }, []);

  /**
   * 清除前景点
   */
  const clearForegroundPoints = useCallback(() => {
    setState(prev => ({
      ...prev,
      foregroundPoints: []
    }));
  }, []);

  /**
   * 清除背景点
   */
  const clearBackgroundPoints = useCallback(() => {
    setState(prev => ({
      ...prev,
      backgroundPoints: []
    }));
  }, []);

  /**
   * 处理图像分割
   */
  const processSegmentation = useCallback(async () => {
    try {
      setProcessing(true);
      setProcessingProgress(0);
      setProcessingStatus('开始分割...');

      // 模拟处理过程
      const taskId = `task-${Date.now()}`;
      setCurrentTaskId(taskId);

      // 这里应该调用实际的SAM分割API
      // 模拟处理进度
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setProcessingProgress(i);
        setProcessingStatus(`处理中... ${i}%`);
      }

      // 模拟分割完成
      setProcessingStatus('分割完成');
      setSegmentedImagePath(`segmented-${Date.now()}.png`); // 模拟分割后的图像路径

    } catch (error) {
      console.error('分割失败:', error);
      setProcessingStatus('分割失败');
    } finally {
      setProcessing(false);
      setProcessingProgress(100);
    }
  }, [setProcessing, setProcessingProgress, setProcessingStatus, setCurrentTaskId, setSegmentedImagePath]);

  return {
    // 状态
    state,
    processingChange,

    // 方法
    setImagePath,
    setProcessing,
    setProcessingProgress,
    setProcessingStatus,
    setCurrentTaskId,
    setSegmentedImagePath,
    toggleLayerVisibility,
    toggleInteractiveMode,
    addForegroundPoint,
    addBackgroundPoint,
    clearPoints,
    clearForegroundPoints,
    clearBackgroundPoints,
    processSegmentation
  };
};