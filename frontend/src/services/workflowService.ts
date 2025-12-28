/**
 * 工作流数据访问层
 * 功能：封装工作流相关的API调用与React Query结合，提供统一的数据访问接口
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { QUERY_KEYS } from '../lib/queryClient';
import { handleApiError } from '../lib/errorHandler';
import type { WorkflowStatus, BatchConfig } from '../lib/api';

/**
 * 获取工作流状态查询
 * @returns 工作流状态查询钩子
 */
export const useWorkflowStatusQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.WORKFLOW_STATUS],
    queryFn: async (): Promise<WorkflowStatus> => {
      const response = await apiClient.getWorkflowStatus();
      return response;
    },
    staleTime: 500, // 工作流状态变化较快，缓存时间较短
    refetchInterval: 1000, // 每秒刷新一次
    refetchIntervalInBackground: true,
  });
};

/**
 * 启动工作流变更
 * @returns 启动工作流变更钩子
 */
export const useStartWorkflowMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.startWorkflow();
      return response;
    },
    onSuccess: () => {
      // 成功后更新相关查询
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKFLOW_STATUS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_QUEUE] });
    },
    onError: (error) => {
      handleApiError(error, { source: 'workflowService', function: 'useStartWorkflowMutation', endpoint: '/workflow/start', method: 'POST' });
      throw error;
    },
  });
};

/**
 * 停止工作流变更
 * @returns 停止工作流变更钩子
 */
export const useStopWorkflowMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.stopWorkflow();
      return response;
    },
    onSuccess: () => {
      // 成功后更新相关查询
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKFLOW_STATUS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_QUEUE] });
    },
    onError: (error) => {
      handleApiError(error, { source: 'workflowService', function: 'useStopWorkflowMutation', endpoint: '/workflow/stop', method: 'POST' });
      throw error;
    },
  });
};

/**
 * 获取批处理配置查询
 * @returns 批处理配置查询钩子
 */
export const useBatchConfigQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.MODEL_CONFIG, 'batch'],
    queryFn: async (): Promise<BatchConfig> => {
      const response = await apiClient.getBatchConfig();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5分钟缓存
  });
};

/**
 * 设置批处理配置变更
 * @returns 设置批处理配置变更钩子
 */
export const useSetBatchConfigMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (maxParallelTasks: number) => {
      const response = await apiClient.setBatchConfig(maxParallelTasks);
      return response;
    },
    onSuccess: () => {
      // 成功后更新相关查询
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODEL_CONFIG, 'batch'] });
    },
    onError: (error) => {
      handleApiError(error, { source: 'workflowService', function: 'useSetBatchConfigMutation', endpoint: '/workflow/set-batch-config', method: 'POST' });
      throw error;
    },
  });
};

/**
 * 处理文件变更
 * @returns 处理文件变更钩子
 */
export const useProcessFileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (filename: string) => {
      const response = await apiClient.processFile(filename);
      return response;
    },
    onSuccess: (_, filename) => {
      // 成功后更新相关查询
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKFLOW_STATUS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_QUEUE] });
      // 更新特定文件的处理结果
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.IMAGE_PROCESSING, filename] });
    },
    onError: (error, filename) => {
      handleApiError(error, { source: 'workflowService', function: 'useProcessFileMutation', endpoint: `/workflow/process-file/${filename}`, method: 'POST' });
      throw error;
    },
  });
};

/**
 * 清除工作流历史变更
 * @returns 清除工作流历史变更钩子
 */
export const useClearWorkflowHistoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.clearWorkflowHistory();
      return response;
    },
    onSuccess: () => {
      // 成功后更新相关查询
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKFLOW_STATUS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASK_QUEUE] });
    },
    onError: (error) => {
      handleApiError(error, { source: 'workflowService', function: 'useClearWorkflowHistoryMutation', endpoint: '/workflow/clear-history', method: 'POST' });
      throw error;
    },
  });
};

/**
 * 生成元数据变更
 * @returns 生成元数据变更钩子
 */
export const useGenerateMetadataMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.generateMetadata();
      return response;
    },
    onSuccess: () => {
      // 成功后更新相关查询
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.WORKFLOW_STATUS] });
    },
    onError: (error) => {
      handleApiError(error, { source: 'workflowService', function: 'useGenerateMetadataMutation', endpoint: '/workflow/generate-metadata', method: 'POST' });
      throw error;
    },
  });
};

/**
 * 获取任务队列查询
 * @returns 任务队列查询钩子
 */
export const useTaskQueueQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.TASK_QUEUE],
    queryFn: async () => {
      // 模拟任务队列查询，实际应该调用后端API
      return [];
    },
    staleTime: 1000, // 1秒缓存
    refetchInterval: 2000, // 每2秒刷新一次
  });
};
