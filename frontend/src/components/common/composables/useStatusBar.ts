import { useState, useEffect, useCallback } from 'react';

// 系统状态接口
export interface SystemStatus {
  gpuLoad: number;
  vramUsage: {
    used: number;
    total: number;
  };
  fps: number;
  errorCount: number;
  warningCount: number;
}

interface StatusBarOptions {
  updateInterval?: number;
  autoUpdate?: boolean;
}

/**
 * 状态栏Hook
 * 功能：封装状态栏的系统状态显示和实时数据更新逻辑
 */
export const useStatusBar = (
  initialStatus: SystemStatus,
  _externalTasks?: any[], // 不再使用外部任务
  options: StatusBarOptions = {}
) => {
  const { 
    updateInterval = 1000,
    autoUpdate = true
  } = options;

  // 系统状态
  const [status, setStatus] = useState<SystemStatus>(initialStatus);

  // 更新系统状态
  const updateStatus = useCallback((newStatus: Partial<SystemStatus>) => {
    setStatus(prev => ({ ...prev, ...newStatus }));
  }, []);

  // 模拟实时数据更新
  useEffect(() => {
    if (!autoUpdate) return;

    const intervalId = setInterval(() => {
      // 这里可以替换为真实的系统数据获取逻辑
      setStatus(prevStatus => ({
        ...prevStatus,
        gpuLoad: Math.random() * 100,
        vramUsage: {
          ...prevStatus.vramUsage,
          used: Math.random() * prevStatus.vramUsage.total
        },
        fps: 60 - Math.random() * 20
      }));
    }, updateInterval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoUpdate, updateInterval]);

  return {
    status,
    updateStatus
  };
};
