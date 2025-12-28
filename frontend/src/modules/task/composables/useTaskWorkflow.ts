import { useState, useCallback, useEffect } from 'react';
import { Task, WorkflowStatus, FileTypeStats, updateFileTypeStats } from '../utils/utils';
import { apiService } from '../../../lib/api';

interface TaskWorkflowOptions {
  onTaskCancel?: (taskId: string) => void;
  onTaskRetry?: (taskId: string) => void;
  autoUpdate?: boolean;
  updateInterval?: number;
}

/**
 * 任务工作流Hook
 * 功能：封装任务区标签的自动工作流和任务列表管理逻辑
 */
export const useTaskWorkflow = (
  initialTasks: Task[] = [],
  options: TaskWorkflowOptions = {}
) => {
  const { 
    onTaskCancel, 
    onTaskRetry, 
    autoUpdate = true, 
    updateInterval = 1000 
  } = options;

  // 任务列表 - 只在初始渲染时使用initialTasks，避免无限循环
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  
  // 工作流状态
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus>({
    is_running: false,
    processing_queue: [],
    processed_files: [],
    failed_files: [],
    total_files: 0,
    success_rate: 0,
    batch_config: {
      max_parallel_tasks: 0,
      current_running_tasks: 0
    }
  });

  // 文件类型统计
  const [fileTypeStats, setFileTypeStats] = useState<FileTypeStats>({
    chr: 0,
    ui: 0,
    env: 0,
    prp: 0
  });

  /**
   * 获取工作流状态
   */
  const fetchWorkflowStatus = useCallback(async () => {
    try {
      const response = await apiService.getWorkflowStatus();
      setWorkflowStatus(response);
      // 更新文件类型统计
      setFileTypeStats(updateFileTypeStats(response));
    } catch (error) {
      // 减少错误日志输出频率，只在控制台显示一次
      console.error('获取工作流状态失败:', error);
    }
  }, []);

  /**
   * 启动工作流
   */
  const startWorkflow = useCallback(async () => {
    try {
      await apiService.startWorkflow();
      await fetchWorkflowStatus();
    } catch (error) {
      console.error('启动工作流失败:', error);
    }
  }, [fetchWorkflowStatus]);

  /**
   * 停止工作流
   */
  const stopWorkflow = useCallback(async () => {
    try {
      await apiService.stopWorkflow();
      await fetchWorkflowStatus();
    } catch (error) {
      console.error('停止工作流失败:', error);
    }
  }, [fetchWorkflowStatus]);

  /**
   * 清除工作流历史
   */
  const clearWorkflowHistory = useCallback(async () => {
    try {
      await apiService.clearWorkflowHistory();
      await fetchWorkflowStatus();
      // 重置文件类型统计
      setFileTypeStats({
        chr: 0,
        ui: 0,
        env: 0,
        prp: 0
      });
    } catch (error) {
      console.error('清除工作流历史失败:', error);
    }
  }, [fetchWorkflowStatus]);

  /**
   * 取消任务
   */
  const cancelTask = useCallback((taskId: string) => {
    if (onTaskCancel) {
      onTaskCancel(taskId);
    }
    // 更新本地任务状态
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: 'error', message: '任务已取消' } : task
      )
    );
  }, [onTaskCancel]);

  /**
   * 重试任务
   */
  const retryTask = useCallback((taskId: string) => {
    if (onTaskRetry) {
      onTaskRetry(taskId);
    }
    // 更新本地任务状态
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: 'pending', progress: 0, message: undefined } : task
      )
    );
  }, [onTaskRetry]);

  /**
   * 添加任务
   */
  const addTask = useCallback((task: Omit<Task, 'id' | 'timestamp'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    return newTask;
  }, []);

  /**
   * 更新任务
   */
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updates, timestamp: Date.now() } : task
      )
    );
  }, []);

  /**
   * 删除任务
   */
  const removeTask = useCallback((taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  /**
   * 清除所有任务
   */
  const clearAllTasks = useCallback(() => {
    setTasks([]);
  }, []);

  // 初始化时获取工作流状态
  useEffect(() => {
    fetchWorkflowStatus();
  }, [fetchWorkflowStatus]);

  // 自动更新工作流状态
  useEffect(() => {
    if (!autoUpdate) return;

    const intervalId = setInterval(() => {
      fetchWorkflowStatus();
    }, updateInterval);

    return () => clearInterval(intervalId);
  }, [autoUpdate, updateInterval, fetchWorkflowStatus]);

  // 当初始任务变化时更新本地任务列表 - 注释掉这个useEffect以避免无限循环
  // useEffect(() => {
  //   setTasks(initialTasks);
  // }, [initialTasks]);

  return {
    // 状态
    tasks,
    workflowStatus,
    fileTypeStats,
    
    // 操作方法
    fetchWorkflowStatus,
    startWorkflow,
    stopWorkflow,
    clearWorkflowHistory,
    cancelTask,
    retryTask,
    addTask,
    updateTask,
    removeTask,
    clearAllTasks,
    
    // 操作别名（保持向后兼容）
    onTaskCancel: cancelTask,
    onTaskRetry: retryTask
  };
};
