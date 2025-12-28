/**
 * AI模型相关类型定义
 * 为复杂的AI数据流提供完整的类型安全支持
 */

/**
 * AI模型基础信息
 */
export interface AIModelInfo {
  name: string
  version: string
  type: 'segmentation' | 'depth' | 'pose' | 'classification'
  device: 'cpu' | 'cuda' | 'mps'
  memoryUsage: number // MB
  inferenceTime: number // ms
  isLoaded: boolean
}

/**
 * AI推理请求参数
 */
export interface AIInferenceParams {
  imagePath: string
  modelName?: string
  device?: 'cpu' | 'cuda' | 'mps'
  options?: Record<string, any>
}

/**
 * AI推理结果基础接口
 */
export interface AIInferenceResult<T = any> {
  success: boolean
  data?: T
  error?: string
  inferenceTime?: number
  metadata?: {
    model: string
    device: string
    memoryUsage: number
    [key: string]: any
  }
}

/**
 * SAM分割结果
 */
export interface SAMSegmentationResult {
  masks: ArrayBuffer[]
  scores: number[]
  stability_scores: number[]
  areas: number[]
  bbox: number[][] // [x, y, width, height]
  segments: Array<{
    id: number
    mask: ArrayBuffer
    score: number
    stability: number
    area: number
    bbox: [number, number, number, number]
    label?: string
  }>
}

/**
 * 深度估计结果
 */
export interface DepthEstimationResult {
  depthMap: ArrayBuffer
  minDepth: number
  maxDepth: number
  resolution: {
    width: number
    height: number
  }
  metadata: {
    focalLength?: number
    baseline?: number
    model: string
  }
}

/**
 * 人物分层结果
 */
export interface CharacterLayeringResult {
  layers: Array<{
    id: string
    name: string
    type: 'background' | 'body' | 'face' | 'hair' | 'clothing' | 'accessories'
    mask: ArrayBuffer
    confidence: number
    bbox: [number, number, number, number]
    area: number
  }>
  totalLayers: number
  faceDetected: boolean
  hairSeparated: boolean
  metadata: {
    faceDetectionConfidence?: number
    segmentationQuality: number
    model: string
  }
}

/**
 * 骨骼绑定结果
 */
export interface SkeletonBindingResult {
  joints: Array<{
    id: number
    name: string
    x: number
    y: number
    confidence: number
    parentId?: number
    children: number[]
  }>
  connections: Array<{
    from: number
    to: number
    weight: number
    type: 'parent' | 'child' | 'sibling'
  }>
  rig: {
    rootJoint: number
    jointCount: number
    hierarchy: Record<number, number[]>
  }
  metadata: {
    bindingStrength: number
    autoAligned: boolean
    model: string
  }
}

/**
 * 任务状态
 */
export interface AITaskStatus {
  id: string
  type: 'segmentation' | 'depth' | 'layering' | 'binding'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  progress: number // 0-100
  message?: string
  result?: AIInferenceResult
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  estimatedTime?: number // 预计完成时间（秒）
}

/**
 * 系统状态
 */
export interface AISystemStatus {
  gpuAvailable: boolean
  gpuMemory: {
    total: number
    used: number
    free: number
  }
  systemMemory: {
    total: number
    used: number
    free: number
  }
  cpuUsage: number // 百分比
  activeTasks: number
  queueSize: number
  models: AIModelInfo[]
}

/**
 * 错误类型
 */
export interface AIError {
  code: string
  message: string
  details?: any
  retryable: boolean
  suggestedActions?: string[]
}

/**
 * API响应统一格式
 */
export interface AIAPIResponse<T = any> {
  success: boolean
  data?: T
  error?: AIError
  timestamp: string
  requestId: string
}

/**
 * 推理配置
 */
export interface AIInferenceConfig {
  timeout: number // 毫秒
  retryCount: number
  retryDelay: number // 毫秒
  batchSize: number
  devicePreference: 'auto' | 'cpu' | 'cuda' | 'mps'
  precision: 'fp16' | 'fp32' | 'int8'
  optimization: {
    enableTensorRT: boolean
    enableONNX: boolean
    enableQuantization: boolean
  }
}