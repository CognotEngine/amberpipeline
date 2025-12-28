/**
 * AI工作流逻辑封装
 * 功能：封装AI图像处理的完整工作流程，包括任务管理、状态跟踪和结果处理
 */
import { useState, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAIProcess, AIProcessResult, AIProcessParams } from './useAIProcess';
import type { Task } from '../types';
import { QUERY_KEYS } from '../lib/queryClient';

// 定义AI工作流配置类型
export interface AIWorkflowConfig {
  autoProcess?: boolean;
  maxConcurrentTasks?: number;
}

// 定义AI工作流状态类型
export interface AIWorkflowState {
  isRunning: boolean;
  currentTask?: Task;
  queuedTasks: Task[];
  completedTasks: Task[];
  failedTasks: Task[];
  totalProgress: number;
}

/**
 * AI工作流Hook
 * @param config 工作流配置
 * @returns AI工作流相关的状态和方法
 */
export const useAIWorkflow = (config: AIWorkflowConfig = {}) => {
  const {
    autoProcess = true,
    // maxConcurrentTasks = 1
  } = config;

  const queryClient = useQueryClient();
  const { process, cancelProcess, isProcessing, progress, result, error } = useAIProcess();

  // 工作流状态
  const [workflowState, setWorkflowState] = useState<AIWorkflowState>({
    isRunning: false,
    queuedTasks: [],
    completedTasks: [],
    failedTasks: [],
    totalProgress: 0
  });

  /**
   * 创建任务
   * @param params AI处理参数
   * @param filename 文件名
   * @returns 创建的任务
   */
  const createTask = useCallback((params: AIProcessParams, filename: string = 'AI处理图像'): Task => {
    const task: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename,
      progress: 0,
      status: 'pending',
      message: undefined,
      timestamp: Date.now()
    };

    // 存储参数到任务的扩展属性中
    (task as any).aiParams = params;

    setWorkflowState(prev => {
      const newState = {
        ...prev,
        queuedTasks: [...prev.queuedTasks, task]
      };
      
      // 更新React Query缓存
      queryClient.setQueryData([QUERY_KEYS.TASK_QUEUE], newState.queuedTasks);
      
      return newState;
    });

    return task;
  }, [queryClient]);

  /**
   * 更新任务状态
   * @param taskId 任务ID
   * @param updates 更新内容
   */
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    const updateTaskInList = (tasks: Task[]) => 
      tasks.map(task => 
        task.id === taskId ? { ...task, ...updates, timestamp: Date.now() } : task
      );

    setWorkflowState(prev => {
      let newState: AIWorkflowState;
      
      // 检查当前任务
      if (prev.currentTask?.id === taskId) {
        newState = {
          ...prev,
          currentTask: { ...prev.currentTask, ...updates, timestamp: Date.now() }
        };
      } else {
        // 检查其他列表
        newState = {
          ...prev,
          queuedTasks: updateTaskInList(prev.queuedTasks),
          completedTasks: updateTaskInList(prev.completedTasks),
          failedTasks: updateTaskInList(prev.failedTasks)
        };
      }
      
      // 更新React Query缓存
      queryClient.setQueryData([QUERY_KEYS.TASK_QUEUE], newState.queuedTasks);
      queryClient.setQueryData([QUERY_KEYS.WORKFLOW_STATUS], (old: any) => ({
        ...old,
        completed_tasks: newState.completedTasks.length,
        total_tasks: newState.queuedTasks.length + newState.completedTasks.length + newState.failedTasks.length + (newState.currentTask ? 1 : 0),
        progress: newState.totalProgress
      }));
      
      return newState;
    });
  }, [queryClient]);

  /**
   * 移除任务
   * @param taskId 任务ID
   */
  const removeTask = useCallback((taskId: string) => {
    setWorkflowState(prev => {
      const newState = {
        ...prev,
        queuedTasks: prev.queuedTasks.filter(task => task.id !== taskId),
        completedTasks: prev.completedTasks.filter(task => task.id !== taskId),
        failedTasks: prev.failedTasks.filter(task => task.id !== taskId)
      };
      
      // 更新React Query缓存
      queryClient.setQueryData([QUERY_KEYS.TASK_QUEUE], newState.queuedTasks);
      queryClient.setQueryData([QUERY_KEYS.WORKFLOW_STATUS], (old: any) => ({
        ...old,
        total_tasks: newState.queuedTasks.length + newState.completedTasks.length + newState.failedTasks.length + (newState.currentTask ? 1 : 0)
      }));
      
      return newState;
    });
  }, [queryClient]);

  /**
   * 开始处理下一个任务
   */
  const processNextTask = useCallback(async () => {
    setWorkflowState(prev => {
      if (prev.queuedTasks.length === 0 || prev.isRunning) {
        return prev;
      }

      // 获取下一个任务
      const [nextTask, ...remainingTasks] = prev.queuedTasks;

      const newState: AIWorkflowState = {
        ...prev,
        isRunning: true,
        currentTask: {
          ...nextTask,
          status: 'processing' as const,
          timestamp: Date.now()
        },
        queuedTasks: remainingTasks
      };
      
      // 更新React Query缓存
      queryClient.setQueryData([QUERY_KEYS.TASK_QUEUE], newState.queuedTasks);
      queryClient.setQueryData([QUERY_KEYS.WORKFLOW_STATUS], (old: any) => ({
        ...old,
        is_running: true,
        current_task: newState.currentTask?.id,
        total_tasks: newState.queuedTasks.length + newState.completedTasks.length + newState.failedTasks.length + 1
      }));
      
      return newState;
    });
  }, [queryClient]);

  /**
   * 计算总进度
   */
  const calculateTotalProgress = useCallback(() => {
    setWorkflowState(prev => {
      const totalTasks = 
        prev.queuedTasks.length + 
        prev.completedTasks.length + 
        prev.failedTasks.length + 
        (prev.currentTask ? 1 : 0);

      if (totalTasks === 0) {
        const newState = { ...prev, totalProgress: 0 };
        
        // 更新React Query缓存
        queryClient.setQueryData([QUERY_KEYS.WORKFLOW_STATUS], (old: any) => ({
          ...old,
          progress: 0
        }));
        
        return newState;
      }

      const completedTasks = prev.completedTasks.length;
      const failedTasks = prev.failedTasks.length;
      const currentProgress = prev.currentTask ? prev.currentTask.progress / 100 : 0;

      const totalProgress = Math.min(100, Math.round(
        ((completedTasks + failedTasks + currentProgress) / totalTasks) * 100
      ));

      const newState = { ...prev, totalProgress };
      
      // 更新React Query缓存
      queryClient.setQueryData([QUERY_KEYS.WORKFLOW_STATUS], (old: any) => ({
        ...old,
        progress: totalProgress
      }));
      
      return newState;
    });
  }, [queryClient]);

  /**
   * 执行当前任务
   */
  const executeCurrentTask = useCallback(async () => {
    setWorkflowState(prev => {
      if (!prev.currentTask) return prev;

      const task = prev.currentTask;
      
      // 获取AI处理参数
      const aiParams = (task as any).aiParams;
      
      // 执行AI处理
      process('/process-image', aiParams).then((result: AIProcessResult) => {
        if (result.success) {
          // 任务成功完成
          updateTask(task.id, {
            status: 'completed',
            progress: 100,
            message: '处理成功'
          });

          setWorkflowState(prevState => {
            const newState = {
              ...prevState,
              completedTasks: [...prevState.completedTasks, prevState.currentTask!],
              currentTask: undefined
            };
            
            // 更新React Query缓存
            queryClient.setQueryData([QUERY_KEYS.WORKFLOW_STATUS], (old: any) => ({
              ...old,
              completed_tasks: newState.completedTasks.length,
              current_task: undefined,
              is_running: newState.isRunning && newState.queuedTasks.length > 0
            }));
            
            return newState;
          });
        } else {
          // 任务失败
          updateTask(task.id, {
            status: 'error',
            message: result.error || '处理失败'
          });

          setWorkflowState(prevState => {
            const newState = {
              ...prevState,
              failedTasks: [...prevState.failedTasks, prevState.currentTask!],
              currentTask: undefined
            };
            
            // 更新React Query缓存
            queryClient.setQueryData([QUERY_KEYS.WORKFLOW_STATUS], (old: any) => ({
              ...old,
              current_task: undefined,
              is_running: newState.isRunning && newState.queuedTasks.length > 0
            }));
            
            return newState;
          });
        }

        // 更新总进度
        calculateTotalProgress();

        // 如果自动处理，继续处理下一个任务
        if (autoProcess) {
          processNextTask();
        } else {
          setWorkflowState(prevState => {
            const newState = { ...prevState, isRunning: false };
            
            // 更新React Query缓存
            queryClient.setQueryData([QUERY_KEYS.WORKFLOW_STATUS], (old: any) => ({
              ...old,
              is_running: false
            }));
            
            return newState;
          });
        }
      });

      return prev;
    });
  }, [autoProcess, process, updateTask, processNextTask, queryClient, calculateTotalProgress]);

  /**
   * 取消当前任务
   */
  const cancelCurrentTask = useCallback(async () => {
    setWorkflowState(prev => {
      if (!prev.currentTask) return prev;

      const task = prev.currentTask;
      
      // 取消AI处理
      if (result?.processId) {
        cancelProcess(result.processId);
      }

      // 更新任务状态
      updateTask(task.id, {
        status: 'error',
        message: '任务已取消'
      });

      // 将任务移至失败列表
      const newState = {
        ...prev,
        isRunning: false,
        failedTasks: [...prev.failedTasks, prev.currentTask!],
        currentTask: undefined
      };
      
      // 更新React Query缓存
      queryClient.setQueryData([QUERY_KEYS.WORKFLOW_STATUS], (old: any) => ({
        ...old,
        is_running: false,
        current_task: undefined
      }));
      
      return newState;
    });
  }, [cancelProcess, result, updateTask, queryClient]);

  /**
   * 开始工作流
   */
  const startWorkflow = useCallback(async () => {
    if (workflowState.isRunning) return;

    setWorkflowState(prev => {
      const newState = { ...prev, isRunning: true };
      
      // 更新React Query缓存
      queryClient.setQueryData([QUERY_KEYS.WORKFLOW_STATUS], (old: any) => ({
        ...old,
        is_running: true
      }));
      
      return newState;
    });
    
    processNextTask();
  }, [workflowState.isRunning, processNextTask, queryClient]);

  /**
   * 停止工作流
   */
  const stopWorkflow = useCallback(async () => {
    setWorkflowState(prev => {
      const newState = { ...prev, isRunning: false };
      
      // 更新React Query缓存
      queryClient.setQueryData([QUERY_KEYS.WORKFLOW_STATUS], (old: any) => ({
        ...old,
        is_running: false
      }));
      
      return newState;
    });
  }, [queryClient]);

  /**
   * 重置工作流
   */
  const resetWorkflow = useCallback(async () => {
    // 取消当前任务
    if (workflowState.currentTask) {
      cancelCurrentTask();
    }

    // 重置所有状态
    const newState: AIWorkflowState = {
      isRunning: false,
      queuedTasks: [],
      completedTasks: [],
      failedTasks: [],
      totalProgress: 0
    };
    
    setWorkflowState(newState);
    
    // 更新React Query缓存
    queryClient.setQueryData([QUERY_KEYS.TASK_QUEUE], []);
    queryClient.setQueryData([QUERY_KEYS.WORKFLOW_STATUS], (old: any) => ({
      ...old,
      is_running: false,
      current_task: undefined,
      progress: 0,
      completed_tasks: 0,
      total_tasks: 0
    }));
    
    // 使相关查询失效，强制刷新
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_QUEUE] });
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKFLOW_STATUS] });
  }, [workflowState.currentTask, cancelCurrentTask, queryClient]);

  /**
   * 重试失败的任务
   * @param taskId 任务ID
   */
  const retryTask = useCallback((taskId: string) => {
    setWorkflowState(prev => {
      // 查找失败的任务
      const failedTask = prev.failedTasks.find(task => task.id === taskId);
      if (!failedTask) return prev;

      // 获取原始AI参数
      const aiParams = (failedTask as any).aiParams;

      // 创建新任务
      const newTask: Task = {
        ...failedTask,
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        progress: 0,
        message: undefined,
        timestamp: Date.now()
      };

      // 重新附加AI参数
      (newTask as any).aiParams = aiParams;

      // 从失败列表移除原任务，添加新任务到队列
      const newState = {
        ...prev,
        queuedTasks: [...prev.queuedTasks, newTask],
        failedTasks: prev.failedTasks.filter(task => task.id !== taskId)
      };
      
      // 更新React Query缓存
      queryClient.setQueryData([QUERY_KEYS.TASK_QUEUE], newState.queuedTasks);
      
      return newState;
    });
  }, [queryClient]);

  // 监听当前任务状态变化，更新进度
  useEffect(() => {
    if (workflowState.currentTask) {
      updateTask(workflowState.currentTask.id, {
        progress,
        status: isProcessing ? 'processing' : workflowState.currentTask.status
      });
    }
  }, [progress, isProcessing, workflowState.currentTask, updateTask]);

  // 当当前任务被设置时，执行任务
  useEffect(() => {
    if (workflowState.currentTask && !isProcessing) {
      executeCurrentTask();
    }
  }, [workflowState.currentTask, isProcessing, executeCurrentTask]);

  return {
    // 工作流状态
    workflowState,
    isProcessing,
    currentProgress: progress,
    currentResult: result,
    currentError: error,

    // 工作流方法
    createTask,
    updateTask,
    removeTask,
    startWorkflow,
    stopWorkflow,
    resetWorkflow,
    cancelCurrentTask,
    retryTask,
    processNextTask
  };
};
