import { useCallback, useRef, useEffect } from 'react';
import { CanvasState } from './CanvasContext';

/**
 * 历史记录项
 */
interface HistoryEntry {
  state: CanvasState;
  timestamp: number;
  description?: string;
}

/**
 * 历史记录配置
 */
interface HistoryConfig {
  maxHistorySize?: number; // 最大历史记录数量
  debounceMs?: number; // 防抖延迟（毫秒）
}

/**
 * 撤销重做 Hook
 * 提供完整的历史记录管理功能
 */
export function useHistory(
  currentState: CanvasState,
  setState: (state: CanvasState) => void,
  config: HistoryConfig = {}
) {
  const { maxHistorySize = 50, debounceMs = 300 } = config;
  
  // 历史记录栈
  const historyRef = useRef<HistoryEntry[]>([]);
  
  // 当前历史记录索引
  const historyIndexRef = useRef<number>(-1);
  
  // 防抖定时器
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 是否正在执行撤销/重做操作
  const isUndoRedoRef = useRef<boolean>(false);
  
  /**
   * 保存当前状态到历史记录
   */
  const saveHistory = useCallback((description?: string) => {
    // 如果正在执行撤销/重做，不保存历史记录
    if (isUndoRedoRef.current) {
      return;
    }
    
    // 清除防抖定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // 设置防抖定时器
    debounceTimerRef.current = setTimeout(() => {
      const entry: HistoryEntry = {
        state: JSON.parse(JSON.stringify(currentState)),
        timestamp: Date.now(),
        description
      };
      
      // 如果不是在历史记录的末尾，删除后面的记录
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      }
      
      // 添加新记录
      historyRef.current.push(entry);
      
      // 限制历史记录数量
      if (historyRef.current.length > maxHistorySize) {
        historyRef.current.shift();
      } else {
        historyIndexRef.current++;
      }
    }, debounceMs);
  }, [currentState, debounceMs, maxHistorySize]);
  
  /**
   * 撤销操作
   */
  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      const entry = historyRef.current[historyIndexRef.current];
      if (entry) {
        setState(entry.state);
      }
      // 延迟重置标志，确保状态更新完成
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [setState]);
  
  /**
   * 重做操作
   */
  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current++;
      const entry = historyRef.current[historyIndexRef.current];
      if (entry) {
        setState(entry.state);
      }
      // 延迟重置标志，确保状态更新完成
      setTimeout(() => {
        isUndoRedoRef.current = false;
      }, 0);
    }
  }, [setState]);
  
  /**
   * 清除历史记录
   */
  const clearHistory = useCallback(() => {
    historyRef.current = [];
    historyIndexRef.current = -1;
  }, []);
  
  /**
   * 检查是否可以撤销
   */
  const canUndo = historyIndexRef.current > 0;
  
  /**
   * 检查是否可以重做
   */
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;
  
  /**
   * 获取历史记录信息
   */
  const getHistoryInfo = useCallback(() => {
    return {
      currentIndex: historyIndexRef.current,
      totalEntries: historyRef.current.length,
      canUndo,
      canRedo
    };
  }, [canUndo, canRedo]);
  
  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  return {
    saveHistory,
    undo,
    redo,
    clearHistory,
    canUndo,
    canRedo,
    getHistoryInfo
  };
}
