import { QueryClient, QueryClientConfig } from '@tanstack/react-query'

/**
 * TanStack Query 配置
 * 专门为AI模型推理优化，处理异步状态、缓存和重试
 */
const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // 默认的查询配置
      staleTime: 5 * 60 * 1000, // 5分钟缓存
      gcTime: 10 * 60 * 1000, // 10分钟垃圾回收
      retry: 3, // 重试3次
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 指数退避
      
      // AI推理相关的特殊配置
      refetchOnWindowFocus: false, // 窗口聚焦时不重新获取，避免中断推理
      refetchOnReconnect: true, // 重新连接时获取
      refetchOnMount: false, // 挂载时不重新获取
      
      // 错误处理
      throwOnError: true, // 抛出错误以便统一处理
    },
    mutations: {
      // 默认的变更配置
      retry: 1, // 变更操作重试1次
      
      // AI模型推理的特殊配置
      onError: (error) => {
        console.error('AI推理失败:', error)
      },
    },
  },
}

/**
 * 创建QueryClient实例
 * 用于管理AI模型推理的异步状态
 */
export const queryClient = new QueryClient(queryConfig)

/**
 * AI推理相关的查询键常量
 */
export const QUERY_KEYS = {
  // 模型状态
  MODEL_STATUS: 'model-status',
  MODEL_CONFIG: 'model-config',
  
  // 图像处理
  IMAGE_PROCESSING: 'image-processing',
  SAM_SEGMENTATION: 'sam-segmentation',
  DEPTH_ESTIMATION: 'depth-estimation',
  CHARACTER_LAYER: 'character-layer',
  SKELETON_BINDING: 'skeleton-binding',
  
  // 任务管理
  TASK_QUEUE: 'task-queue',
  TASK_STATUS: (id: string) => ['task-status', id],
  WORKFLOW_STATUS: 'workflow-status',
  
  // 文件管理
  FILE_LIST: 'file-list',
  FILE_METADATA: (path: string) => ['file-metadata', path],
  
  // 系统状态
  SYSTEM_INFO: 'system-info',
  GPU_STATUS: 'gpu-status',
  MEMORY_USAGE: 'memory-usage',
} as const

/**
 * 查询键类型
 */
export type QueryKeys = typeof QUERY_KEYS