/**
 * 骨骼绑定工作流Hook
 * 处理骨骼点的创建、连接、选择等逻辑
 */
import { useState, useCallback } from 'react';

// 定义骨骼点接口
export interface SkeletonPoint {
  id: string;
  x: number;
  y: number;
  type: string;
  connectedTo?: string[];
}

// 定义骨骼绑定状态接口
export interface SkeletonBindingState {
  imagePath: string;
  skeletonPoints: SkeletonPoint[];
  isAddingPoints: boolean;
  selectedPointId: string | null;
  showConnections: boolean;
  historyStack: any[];
}

// 定义历史记录操作接口
interface HistoryAction {
  type: string;
  timestamp: number;
}

// 添加骨骼点历史操作
interface AddPointAction extends HistoryAction {
  type: 'add-point';
  point: SkeletonPoint;
}

// 选择骨骼点历史操作
interface SelectPointAction extends HistoryAction {
  type: 'select-point';
  previousPointId: string | null;
  newPointId: string | null;
}

// 切换添加模式历史操作
interface ToggleAddModeAction extends HistoryAction {
  type: 'toggle-add-mode';
  previousMode: boolean;
  newMode: boolean;
}

// 连接骨骼点历史操作
interface ConnectPointsAction extends HistoryAction {
  type: 'connect-points';
  pointId1: string;
  pointId2: string;
  previousConnections1: string[];
  previousConnections2: string[];
}

// 联合所有历史操作类型
type AnyHistoryAction = AddPointAction | SelectPointAction | ToggleAddModeAction | ConnectPointsAction;

/**
 * 骨骼绑定工作流Hook
 * 处理骨骼点的创建、连接、选择等逻辑
 */
export const useRiggingWorkflow = (initialState: Partial<SkeletonBindingState> = {}) => {
  // 创建状态
  const [state, setState] = useState<SkeletonBindingState>({
    imagePath: initialState.imagePath || '',
    skeletonPoints: initialState.skeletonPoints || [],
    isAddingPoints: initialState.isAddingPoints || false,
    selectedPointId: initialState.selectedPointId || null,
    showConnections: initialState.showConnections || true,
    historyStack: initialState.historyStack || []
  });

  // 历史记录索引
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);

  /**
   * 添加历史记录
   */
  const addToHistory = useCallback((action: AnyHistoryAction) => {
    setState(prevState => {
      // 如果当前不在历史栈的末尾，截断历史栈
      let newHistoryStack = prevState.historyStack;
      if (historyIndex !== null && historyIndex < prevState.historyStack.length - 1) {
        newHistoryStack = prevState.historyStack.slice(0, historyIndex + 1);
      }
      
      // 添加新操作
      return {
        ...prevState,
        historyStack: [...newHistoryStack, action]
      };
    });
    
    // 更新历史索引
    setHistoryIndex(state.historyStack.length);
  }, [historyIndex, state.historyStack.length]);

  /**
   * 添加骨骼点
   */
  const addPoint = useCallback((x: number, y: number) => {
    // 创建新的骨骼点
    const newPoint: SkeletonPoint = {
      id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x,
      y,
      type: 'joint',
      connectedTo: []
    };

    // 添加到骨骼点列表
    setState(prevState => ({
      ...prevState,
      skeletonPoints: [...prevState.skeletonPoints, newPoint]
    }));

    // 记录历史操作
    const action: AddPointAction = {
      type: 'add-point',
      timestamp: Date.now(),
      point: newPoint
    };
    addToHistory(action);

    return newPoint;
  }, [addToHistory]);

  /**
   * 选择骨骼点
   */
  const selectPoint = useCallback((pointId: string | null) => {
    // 记录历史操作
    const action: SelectPointAction = {
      type: 'select-point',
      timestamp: Date.now(),
      previousPointId: state.selectedPointId,
      newPointId: pointId
    };
    addToHistory(action);

    // 更新选中的点
    setState(prevState => ({
      ...prevState,
      selectedPointId: pointId
    }));
  }, [state.selectedPointId, addToHistory]);

  /**
   * 切换添加模式
   */
  const toggleAddMode = useCallback(() => {
    // 记录历史操作
    const action: ToggleAddModeAction = {
      type: 'toggle-add-mode',
      timestamp: Date.now(),
      previousMode: state.isAddingPoints,
      newMode: !state.isAddingPoints
    };
    addToHistory(action);

    // 切换添加模式
    setState(prevState => ({
      ...prevState,
      isAddingPoints: !prevState.isAddingPoints
    }));
  }, [state.isAddingPoints, addToHistory]);

  /**
   * 连接骨骼点
   */
  const connectPoints = useCallback((id1: string, id2: string) => {
    // 查找两个点
    const point1 = state.skeletonPoints.find(p => p.id === id1);
    const point2 = state.skeletonPoints.find(p => p.id === id2);

    if (!point1 || !point2) return;

    // 保存之前的连接状态
    const previousConnections1 = [...(point1.connectedTo || [])];
    const previousConnections2 = [...(point2.connectedTo || [])];

    // 更新状态中的连接
    setState(prevState => {
      const newPoints = prevState.skeletonPoints.map(point => {
        if (point.id === id1) {
          return {
            ...point,
            connectedTo: [...(point.connectedTo || []), id2]
          };
        }
        if (point.id === id2) {
          return {
            ...point,
            connectedTo: [...(point.connectedTo || []), id1]
          };
        }
        return point;
      });

      return {
        ...prevState,
        skeletonPoints: newPoints
      };
    });

    // 记录历史操作
    const action: ConnectPointsAction = {
      type: 'connect-points',
      timestamp: Date.now(),
      pointId1: id1,
      pointId2: id2,
      previousConnections1,
      previousConnections2
    };
    addToHistory(action);
  }, [state.skeletonPoints, addToHistory]);

  /**
   * 断开骨骼点连接
   */
  const disconnectPoints = useCallback((id1: string, id2: string) => {
    // 查找两个点
    const point1 = state.skeletonPoints.find(p => p.id === id1);
    const point2 = state.skeletonPoints.find(p => p.id === id2);

    if (!point1 || !point2) return;

    // 保存之前的连接状态
    const previousConnections1 = [...(point1.connectedTo || [])];
    const previousConnections2 = [...(point2.connectedTo || [])];

    // 更新状态中的连接
    setState(prevState => {
      const newPoints = prevState.skeletonPoints.map(point => {
        if (point.id === id1) {
          return {
            ...point,
            connectedTo: (point.connectedTo || []).filter(id => id !== id2)
          };
        }
        if (point.id === id2) {
          return {
            ...point,
            connectedTo: (point.connectedTo || []).filter(id => id !== id1)
          };
        }
        return point;
      });

      return {
        ...prevState,
        skeletonPoints: newPoints
      };
    });

    // 记录历史操作
    const action: ConnectPointsAction = {
      type: 'connect-points',
      timestamp: Date.now(),
      pointId1: id1,
      pointId2: id2,
      previousConnections1,
      previousConnections2
    };
    addToHistory(action);
  }, [state.skeletonPoints, addToHistory]);

  /**
   * 设置图像路径
   */
  const setImagePath = useCallback((imagePath: string) => {
    setState(prevState => ({
      ...prevState,
      imagePath
    }));
  }, []);

  /**
   * 切换显示连接
   */
  const toggleShowConnections = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      showConnections: !prevState.showConnections
    }));
  }, []);

  /**
   * 删除骨骼点
   */
  const deletePoint = useCallback((pointId: string) => {
    setState(prevState => {
      const newPoints = prevState.skeletonPoints.filter(p => p.id !== pointId);
      
      // 同时删除所有相关的连接
      const updatedPoints = newPoints.map(point => ({
        ...point,
        connectedTo: (point.connectedTo || []).filter(id => id !== pointId)
      }));

      return {
        ...prevState,
        skeletonPoints: updatedPoints,
        selectedPointId: prevState.selectedPointId === pointId ? null : prevState.selectedPointId
      };
    });
  }, []);

  /**
   * 移动骨骼点
   */
  const movePoint = useCallback((pointId: string, x: number, y: number) => {
    setState(prevState => {
      const newPoints = prevState.skeletonPoints.map(point => {
        if (point.id === pointId) {
          return {
            ...point,
            x,
            y
          };
        }
        return point;
      });

      return {
        ...prevState,
        skeletonPoints: newPoints
      };
    });
  }, []);

  /**
   * 获取骨骼点
   */
  const getPoint = useCallback((pointId: string) => {
    return state.skeletonPoints.find(p => p.id === pointId);
  }, [state.skeletonPoints]);

  /**
   * 获取所有骨骼点
   */
  const getAllPoints = useCallback(() => {
    return state.skeletonPoints;
  }, [state.skeletonPoints]);

  /**
   * 获取选中的骨骼点
   */
  const getSelectedPoint = useCallback(() => {
    if (!state.selectedPointId) return null;
    return state.skeletonPoints.find(p => p.id === state.selectedPointId);
  }, [state.skeletonPoints, state.selectedPointId]);

  /**
   * 检查两个点是否连接
   */
  const arePointsConnected = useCallback((id1: string, id2: string) => {
    const point1 = state.skeletonPoints.find(p => p.id === id1);
    const point2 = state.skeletonPoints.find(p => p.id === id2);

    if (!point1 || !point2) return false;

    return (point1.connectedTo || []).includes(id2) && (point2.connectedTo || []).includes(id1);
  }, [state.skeletonPoints]);

  /**
   * 获取点的所有连接
   */
  const getPointConnections = useCallback((pointId: string) => {
    const point = state.skeletonPoints.find(p => p.id === pointId);
    return point ? (point.connectedTo || []) : [];
  }, [state.skeletonPoints]);

  /**
   * 清除所有骨骼点
   */
  const clearAllPoints = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      skeletonPoints: [],
      selectedPointId: null
    }));
  }, []);

  return {
    // 状态
    state,
    historyIndex,

    // 方法
    addPoint,
    selectPoint,
    toggleAddMode,
    connectPoints,
    disconnectPoints,
    setImagePath,
    toggleShowConnections,
    deletePoint,
    movePoint,
    getPoint,
    getAllPoints,
    getSelectedPoint,
    arePointsConnected,
    getPointConnections,
    clearAllPoints
  };
};