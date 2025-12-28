import React, { createContext, useContext, ReactNode, useCallback, useEffect } from 'react';
import { CanvasState, CanvasProvider, useCanvasContext } from './CanvasContext';
import { useHistory } from './useHistory';

/**
 * 带历史记录的画布上下文类型
 */
interface CanvasContextWithHistoryType {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  saveHistory: (description?: string) => void;
}

// 创建历史记录上下文
const CanvasHistoryContext = createContext<CanvasContextWithHistoryType | undefined>(undefined);

/**
 * 带历史记录的画布 Provider
 */
interface CanvasProviderWithHistoryProps {
  children: ReactNode;
  initialState?: Partial<CanvasState>;
}

export const CanvasProviderWithHistory: React.FC<CanvasProviderWithHistoryProps> = ({ 
  children, 
  initialState 
}) => {
  return (
    <CanvasProvider initialState={initialState}>
      <HistoryWrapper>{children}</HistoryWrapper>
    </CanvasProvider>
  );
};

/**
 * 历史记录包装器
 * 在 CanvasProvider 内部使用，提供历史记录功能
 */
const HistoryWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { state, dispatch } = useCanvasContext();
  
  // 创建一个设置状态的函数
  const setState = useCallback((newState: CanvasState) => {
    // 通过 dispatch 多个 action 来恢复状态
    // 这是一个简化的实现，实际应该根据状态差异来优化
    
    // 恢复图层
    dispatch({ type: 'RESET_CANVAS' });
    newState.layers.forEach(layer => {
      dispatch({ type: 'ADD_LAYER', payload: layer });
    });
    
    // 恢复选中的图层
    if (newState.selectedLayerId) {
      dispatch({ type: 'SET_SELECTED_LAYER', payload: newState.selectedLayerId });
    }
    
    // 恢复其他状态
    dispatch({ type: 'SET_ZOOM', payload: newState.zoom });
    dispatch({ type: 'SET_PAN_POSITION', payload: newState.panPosition });
    dispatch({ type: 'SET_ACTIVE_TOOL', payload: newState.activeTool });
    dispatch({ type: 'SET_STAGE', payload: newState.stage });
  }, [dispatch]);
  
  // 使用历史记录 Hook
  const {
    saveHistory,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo
  } = useHistory(state, setState, {
    maxHistorySize: 50,
    debounceMs: 300
  });
  
  // 监听状态变化，自动保存历史记录
  useEffect(() => {
    // 只在图层、选中状态等关键状态变化时保存
    saveHistory();
  }, [
    state.layers.length,
    state.selectedLayerId,
    // 可以根据需要添加更多依赖
  ]);
  
  const value: CanvasContextWithHistoryType = {
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory,
    saveHistory
  };
  
  return (
    <CanvasHistoryContext.Provider value={value}>
      {children}
    </CanvasHistoryContext.Provider>
  );
};

/**
 * 使用历史记录上下文的 Hook
 */
export const useCanvasHistory = () => {
  const context = useContext(CanvasHistoryContext);
  if (context === undefined) {
    throw new Error('useCanvasHistory must be used within a CanvasProviderWithHistory');
  }
  return context;
};
