/**
 * AI处理逻辑封装
 * 功能：封装与FastAPI后端通信的逻辑，包括图像生成、处理和状态管理
 */
import { useState, useCallback, useEffect } from 'react';
import { useAIProcessMutation } from '../services/aiProcessService';

// 定义AI处理结果类型
export interface AIProcessResult {
  success: boolean;
  data?: any;
  error?: string;
  processId?: string;
}

// 定义AI处理参数类型
export interface AIProcessParams {
  image?: File;
  prompt?: string;
  parameters?: Record<string, any>;
}

/**
 * AI处理逻辑Hook
 * @returns AI处理相关的状态和方法
 */
export const useAIProcess = () => {
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AIProcessResult | null>(null);
  
  // 使用AI处理数据访问层
  const aiProcessMutation = useAIProcessMutation();
  
  // 模拟进度更新（实际项目中可以通过WebSocket或SSE实现）
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (aiProcessMutation.isPending) {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);
    } else if (aiProcessMutation.isSuccess) {
      setProgress(100);
    } else if (aiProcessMutation.isError) {
      setProgress(0);
    }
    
    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [aiProcessMutation.isPending, aiProcessMutation.isSuccess, aiProcessMutation.isError]);
  
  // 监听成功和错误状态
  useEffect(() => {
    if (aiProcessMutation.isSuccess) {
      setResult({
        success: true,
        data: aiProcessMutation.data.data,
        processId: aiProcessMutation.data.processId
      });
    } else if (aiProcessMutation.isError) {
      setResult({
        success: false,
        error: aiProcessMutation.error instanceof Error ? aiProcessMutation.error.message : '未知错误'
      });
    }
  }, [aiProcessMutation.isSuccess, aiProcessMutation.isError, aiProcessMutation.data, aiProcessMutation.error]);
  
  /**
   * 处理AI请求
   * @param endpoint 后端API端点
   * @param params 处理参数
   * @returns 处理结果
   */
  const process = useCallback(async (
    endpoint: string,
    params: AIProcessParams
  ): Promise<AIProcessResult> => {
    try {
      const response = await aiProcessMutation.mutateAsync({ endpoint, aiParams: params });
      return {
        success: true,
        data: response.data,
        processId: response.processId
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      return {
        success: false,
        error: errorMessage
      };
    }
  }, [aiProcessMutation]);
  
  /**
   * 取消处理
   * @param processId 处理ID
   * @returns 取消结果
   */
  const cancelProcess = useCallback(async (processId?: string): Promise<boolean> => {
    if (!processId) return false;
    
    try {
      // 使用AI处理数据访问层取消请求
      const response = await aiProcessMutation.mutateAsync({
        endpoint: `/cancel-process`,
        aiParams: { parameters: { processId } }
      });
      
      return response.success;
    } catch (err) {
      console.error('取消处理失败:', err);
      return false;
    }
  }, [aiProcessMutation]);
  
  /**
   * 获取处理状态
   * @param processId 处理ID
   * @returns 处理状态
   */
  const getProcessStatus = useCallback(async (processId?: string): Promise<any> => {
    if (!processId) return null;
    
    try {
      // 使用AI处理数据访问层获取处理状态
      const response = await aiProcessMutation.mutateAsync({
        endpoint: `/process-status/${processId}`,
        aiParams: {}
      });
      
      return response;
    } catch (err) {
      console.error('获取处理状态失败:', err);
      return null;
    }
  }, [aiProcessMutation]);
  
  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    aiProcessMutation.reset();
    setProgress(0);
    setResult(null);
  }, [aiProcessMutation]);
  
  return {
    isProcessing: aiProcessMutation.isPending,
    progress,
    result,
    error: aiProcessMutation.error instanceof Error ? aiProcessMutation.error.message : null,
    process,
    cancelProcess,
    getProcessStatus,
    reset
  };
};