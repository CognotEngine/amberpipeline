import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '../lib/queryClient'
import { useState, useTransition } from 'react'
import { apiService } from '../lib/api'
import { useAppStore } from '../stores/appStore'

/**
 * AI模型状态接口
 */
interface AIModelStatus {
  isLoaded: boolean
  modelName: string
  device: 'cpu' | 'cuda' | 'mps'
  memoryUsage: number
  inferenceTime: number
}

/**
 * AI推理结果接口
 */
interface AIInferenceResult {
  success: boolean
  data?: any
  error?: string
  inferenceTime?: number
  metadata?: Record<string, any>
}

/**
 * 使用AI模型状态查询
 * 获取当前AI模型的加载状态和性能信息
 */
export function useAIModelStatus() {
  return useQuery({
    queryKey: [QUERY_KEYS.MODEL_STATUS],
    queryFn: async (): Promise<AIModelStatus> => {
      // 模拟API调用，实际应该调用后端
      return {
        isLoaded: true,
        modelName: 'SAM ViT-H',
        device: 'cuda',
        memoryUsage: 2.1,
        inferenceTime: 0
      }
    },
    staleTime: 30 * 1000, // 30秒缓存
  })
}

/**
 * 使用SAM分割Mutation
 * React 19 Actions集成，处理异步分割操作
 */
export function useSamSegmentation() {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<AIInferenceResult | null>(null)
  
  // 使用appStore更新模型状态
  const setSamModelProcessing = useAppStore((state) => state.setSamModelProcessing)
  const setSamModelError = useAppStore((state) => state.setSamModelError)

  const mutation = useMutation({
    mutationKey: [QUERY_KEYS.SAM_SEGMENTATION],
    mutationFn: async (params: {
      file: File
      points?: Array<{ x: number; y: number; label: 0 | 1 }>
      bbox?: { x: number; y: number; width: number; height: number }
      mode: 'auto' | 'interactive'
    }): Promise<AIInferenceResult> => {
      // 处理点坐标和标签
      let pointsStr: string | undefined;
      let pointLabelsStr: string | undefined;
      
      if (params.points && params.points.length > 0) {
        pointsStr = params.points.map(p => `${p.x},${p.y}`).join(';');
        pointLabelsStr = params.points.map(p => `${p.label}`).join(';');
      }
      
      // 调用真实后端API
      const response = await apiService.segmentImage(params.file, pointsStr, pointLabelsStr);
      
      return {
        success: response.success,
        data: {
          mask: response.image, // Base64编码的图像数据
          segments: [] // 后端目前没有返回segments信息，可以根据实际情况扩展
        },
        inferenceTime: 0, // 后端可以添加推理时间返回
        metadata: {
          model: 'SAM 2',
          pointsUsed: params.points?.length || 0,
          bboxUsed: !!params.bbox
        }
      };
    },
    onMutate: () => {
      // 开始处理时更新状态
      setSamModelProcessing(true)
      setSamModelError(null)
    },
    onSuccess: (_data) => {
      // 成功后更新相关查询
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODEL_STATUS] })
      setSamModelProcessing(false)
      setSamModelError(null)
    },
    onError: (error) => {
      console.error('SAM分割失败:', error)
      setSamModelProcessing(false)
      setSamModelError(error instanceof Error ? error.message : '未知错误')
    }
  })

  /**
   * React 19 Action: 执行SAM分割
   * 使用useTransition处理异步状态
   */
  const performSegmentation = async (params: Parameters<typeof mutation.mutate>[0]) => {
    startTransition(async () => {
      try {
        const result = await mutation.mutateAsync(params)
        setResult(result)
      } catch (error) {
        setResult({
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        })
      }
    })
  }

  return {
    performSegmentation,
    result,
    isPending,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: () => {
      setResult(null)
      mutation.reset()
      setSamModelProcessing(false)
      setSamModelError(null)
    }
  }
}

/**
 * 使用法线贴图生成Mutation
 * 处理法线贴图生成的异步状态
 */
export function useNormalMapGeneration() {
  const queryClient = useQueryClient()
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<AIInferenceResult | null>(null)
  
  // 使用appStore更新模型状态
  const setSamModelProcessing = useAppStore((state) => state.setSamModelProcessing)
  const setSamModelError = useAppStore((state) => state.setSamModelError)

  const mutation = useMutation({
    mutationKey: [QUERY_KEYS.IMAGE_PROCESSING],
    mutationFn: async (params: {
      file: File
      strength?: number
    }): Promise<AIInferenceResult> => {
      // 调用真实后端API
      const response = await apiService.generateNormalMap(params.file, params.strength);
      
      return {
        success: response.success,
        data: {
          normalMap: response.image, // Base64编码的图像数据
        },
        inferenceTime: 0,
        metadata: {
          model: 'Normal Map Generator',
          strength: params.strength || 1.0
        }
      };
    },
    onMutate: () => {
      // 开始处理时更新状态
      setSamModelProcessing(true)
      setSamModelError(null)
    },
    onSuccess: (_data) => {
      // 成功后更新相关查询
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.MODEL_STATUS] })
      setSamModelProcessing(false)
      setSamModelError(null)
    },
    onError: (error) => {
      console.error('法线贴图生成失败:', error)
      setSamModelProcessing(false)
      setSamModelError(error instanceof Error ? error.message : '未知错误')
    }
  })

  /**
   * React 19 Action: 执行法线贴图生成
   * 使用useTransition处理异步状态
   */
  const generateNormalMap = async (params: Parameters<typeof mutation.mutate>[0]) => {
    startTransition(async () => {
      try {
        const result = await mutation.mutateAsync(params)
        setResult(result)
      } catch (error) {
        setResult({
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        })
      }
    })
  }

  return {
    generateNormalMap,
    result,
    isPending,
    isLoading: mutation.isPending,
    error: mutation.error,
    reset: () => {
      setResult(null)
      mutation.reset()
      setSamModelProcessing(false)
      setSamModelError(null)
    }
  }
}

/**
 * 使用深度估计Mutation
 * 处理深度图生成
 */
export function useDepthEstimation() {
  return useMutation({
    mutationKey: [QUERY_KEYS.DEPTH_ESTIMATION],
    mutationFn: async (_imagePath: string): Promise<AIInferenceResult> => {
      // 模拟深度估计API调用
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              depthMap: new ArrayBuffer(2048),
              minDepth: 0.1,
              maxDepth: 10.0,
              resolution: { width: 512, height: 512 }
            },
            inferenceTime: 0.8,
            metadata: {
              model: 'DepthAnything V2',
              resolution: '512x512'
            }
          })
        }, 800)
      })
    }
  })
}

/**
 * 使用人物分层Mutation
 * 处理人物结构分层
 */
export function useCharacterLayering() {
  return useMutation({
    mutationKey: [QUERY_KEYS.CHARACTER_LAYER],
    mutationFn: async (params: {
      imagePath: string
      layerCount: number
      faceDetection: boolean
      hairSeparation: boolean
      clothingDetails: 'low' | 'medium' | 'high'
    }): Promise<AIInferenceResult> => {
      // 模拟人物分层API调用
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              layers: [
                { id: 1, type: 'background', confidence: 0.95 },
                { id: 2, type: 'body', confidence: 0.92 },
                { id: 3, type: 'face', confidence: 0.98 },
                { id: 4, type: 'hair', confidence: 0.89 }
              ],
              maskCount: params.layerCount
            },
            inferenceTime: 2.1,
            metadata: {
              faceDetected: params.faceDetection,
              hairSeparated: params.hairSeparation,
              detailLevel: params.clothingDetails
            }
          })
        }, 2100)
      })
    }
  })
}

/**
 * 使用骨骼绑定Mutation
 * 处理3D骨骼绑定
 */
export function useSkeletonBinding() {
  return useMutation({
    mutationKey: [QUERY_KEYS.SKELETON_BINDING],
    mutationFn: async (params: {
      imagePath: string
      jointCount: number
      bindingStrength: number
      autoAlign: boolean
    }): Promise<AIInferenceResult> => {
      // 模拟骨骼绑定API调用
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: {
              joints: Array.from({ length: params.jointCount }, (_, i) => ({
                id: i + 1,
                x: Math.random() * 512,
                y: Math.random() * 512,
                confidence: Math.random() * 0.3 + 0.7
              })),
              connections: [
                { from: 1, to: 2, weight: 0.9 },
                { from: 2, to: 3, weight: 0.85 },
                { from: 3, to: 4, weight: 0.92 }
              ]
            },
            inferenceTime: 1.5,
            metadata: {
              jointCount: params.jointCount,
              bindingStrength: params.bindingStrength,
              autoAligned: params.autoAlign
            }
          })
        }, 1500)
      })
    }
  })
}

/**
 * 使用任务状态查询
 * 获取特定任务的状态
 */
export function useTaskStatus(taskId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.TASK_STATUS(taskId),
    queryFn: async () => {
      // 模拟任务状态查询
      return {
        id: taskId,
        status: 'processing' as const,
        progress: 75,
        message: '正在处理中...',
        result: null
      }
    },
    enabled: !!taskId,
    refetchInterval: 1000, // 每秒刷新一次
  })
}

/**
 * 使用系统信息查询
 * 获取GPU、内存等系统状态
 */
export function useSystemInfo() {
  return useQuery({
    queryKey: [QUERY_KEYS.SYSTEM_INFO],
    queryFn: async () => {
      // 模拟系统信息获取
      return {
        platform: 'win32',
        arch: 'x64',
        gpuAvailable: true,
        gpuMemory: 8.0,
        systemMemory: 16.0,
        cpuCores: 8
      }
    },
    staleTime: 60 * 1000, // 1分钟缓存
  })
}