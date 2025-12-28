/**
 * AI处理数据访问层
 * 功能：封装AI处理相关的API调用与React Query结合，提供统一的数据访问接口
 */
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { handleApiError } from '../lib/errorHandler';
import type { AIProcessParams } from '../composables/useAIProcess';

/**
 * AI处理变更
 * @returns AI处理变更钩子
 */
export const useAIProcessMutation = () => {
  return useMutation({
    mutationFn: async (params: { endpoint: string; aiParams: AIProcessParams }) => {
      const { endpoint, aiParams } = params;
      
      // 创建FormData
      const formData = new FormData();
      
      // 添加参数到FormData
      if (aiParams.image) {
        formData.append('image', aiParams.image);
      }
      
      if (aiParams.prompt) {
        formData.append('prompt', aiParams.prompt);
      }
      
      if (aiParams.parameters) {
        formData.append('parameters', JSON.stringify(aiParams.parameters));
      }
      
      // 调用API
      const response = await apiClient.processAI(endpoint, formData);
      return response;
    },
    onError: (error, { endpoint }) => {
      handleApiError(error, { source: 'aiProcessService', function: 'useAIProcessMutation', endpoint, method: 'POST' });
      throw error;
    },
  });
};

/**
 * 图像分割变更
 * @returns 图像分割变更钩子
 */
export const useSegmentImageMutation = () => {
  return useMutation({
    mutationFn: async (params: {
      file: File;
      points?: string;
      point_labels?: string;
    }) => {
      const { file, points, point_labels } = params;
      const response = await apiClient.segmentImage(file, points, point_labels);
      return response;
    },
    onError: (error) => {
      handleApiError(error, { source: 'aiProcessService', function: 'useSegmentImageMutation', endpoint: '/segment', method: 'POST' });
      throw error;
    },
  });
};

/**
 * 法线贴图生成变更
 * @returns 法线贴图生成变更钩子
 */
export const useGenerateNormalMapMutation = () => {
  return useMutation({
    mutationFn: async (params: {
      file: File;
      strength?: number;
    }) => {
      const { file, strength } = params;
      const response = await apiClient.generateNormalMap(file, strength);
      return response;
    },
    onError: (error) => {
      handleApiError(error, { source: 'aiProcessService', function: 'useGenerateNormalMapMutation', endpoint: '/generate-normal-map', method: 'POST' });
      throw error;
    },
  });
};
