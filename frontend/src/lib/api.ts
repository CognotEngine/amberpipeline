/**
 * FastAPI API Client
 * 封装与FastAPI后端的所有通信逻辑，提供统一的API调用接口
 */

// API基础URL
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

// 定义API错误类型
export interface ApiError {
  status: number;
  message: string;
  detail?: any;
}

/**
 * 创建API错误对象
 * @param status HTTP状态码
 * @param message 错误消息
 * @param detail 错误详情
 * @returns ApiError 错误对象
 */
function createApiError(status: number, message: string, detail?: any): ApiError {
  return {
    status,
    message,
    detail
  };
}

/**
 * 通用的API请求处理函数
 * @param endpoint API端点
 * @param options 请求选项
 * @param controller AbortController实例，用于取消请求
 * @returns Promise<T> 请求结果
 */
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {},
  controller?: AbortController
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // 设置默认请求头
  const headersInit: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> || {}),
  };
  
  // 过滤掉undefined值，确保headers符合HeadersInit类型要求
  const filteredHeaders = Object.fromEntries(
    Object.entries(headersInit).filter(([_, value]) => value !== undefined)
  );
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: filteredHeaders,
      signal: controller?.signal,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw createApiError(
        response.status,
        errorData.detail || `HTTP error! status: ${response.status}`,
        errorData
      );
    }
    
    // 处理空响应
    if (response.status === 204) {
      return {} as T;
    }
    
    return response.json();
  } catch (error) {
    console.error(`API请求失败 (${endpoint}):`, error);
    
    // 重新抛出错误，保留原始错误类型
    if (error instanceof Error) {
      // 如果是AbortError，直接抛出
      if (error.name === 'AbortError') {
        throw error;
      }
      // 否则抛出API错误
      throw createApiError(0, error.message);
    }
    
    throw error;
  }
}

/**
 * 上传文件到后端
 * @param endpoint API端点
 * @param file 文件对象
 * @param params 查询参数
 * @param controller AbortController实例，用于取消请求
 * @returns Promise<T> 请求结果
 */
async function uploadFile<T>(
  endpoint: string, 
  file: File, 
  params?: Record<string, any>,
  controller?: AbortController
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  
  // 添加查询参数
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch(url.toString(), {
      method: 'POST',
      body: formData,
      signal: controller?.signal,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw createApiError(
        response.status,
        errorData.detail || `HTTP error! status: ${response.status}`,
        errorData
      );
    }
    
    return response.json();
  } catch (error) {
    console.error(`文件上传失败 (${endpoint}):`, error);
    
    // 重新抛出错误，保留原始错误类型
    if (error instanceof Error) {
      // 如果是AbortError，直接抛出
      if (error.name === 'AbortError') {
        throw error;
      }
      // 否则抛出API错误
      throw createApiError(0, error.message);
    }
    
    throw error;
  }
}

// 定义API响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// 定义工作流状态类型
export interface WorkflowStatus {
  is_running: boolean;
  processing_queue: string[];
  processed_files: any[];
  failed_files: any[];
  total_files: number;
  success_rate: number;
  batch_config: {
    max_parallel_tasks: number;
    current_running_tasks: number;
  };
}

// 定义批量配置类型
export interface BatchConfig {
  max_parallel_tasks: number;
}

// 定义文件处理结果类型
export interface ProcessFileResult {
  filename: string;
  status: string;
  result?: any;
}

/**
 * FastAPI API Client
 * 提供与FastAPI后端通信的所有接口
 */
export const apiClient = {
  // 通用HTTP方法
  get: <T = any>(endpoint: string, controller?: AbortController) => 
    fetchApi<T>(endpoint, { method: 'GET' }, controller),
  
  post: <T = any>(endpoint: string, data?: any, controller?: AbortController) => 
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }, controller),
  
  put: <T = any>(endpoint: string, data?: any, controller?: AbortController) => 
    fetchApi<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, controller),
  
  delete: <T = any>(endpoint: string, controller?: AbortController) => 
    fetchApi<T>(endpoint, { method: 'DELETE' }, controller),
  
  login: <T = any>(endpoint: string, data?: any, controller?: AbortController) => 
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, controller),

  // 根路径
  getRoot: (controller?: AbortController) => 
    fetchApi<{ message: string; version: string; endpoints: string[] }>('/', {}, controller),
  
  // 图像分割
  segmentImage: (
    file: File, 
    points?: string, 
    point_labels?: string,
    controller?: AbortController
  ) => 
    uploadFile<{ success: boolean; image: string }>('/segment', file, { points, point_labels }, controller),
  
  // 生成法线贴图
  generateNormalMap: (
    file: File, 
    strength?: number,
    controller?: AbortController
  ) => 
    uploadFile<{ success: boolean; image: string }>('/generate-normal-map', file, { strength }, controller),
  
  // Inpainting 图像修复
  performInpaint: async (
    imagePath: string,
    maskPath: string,
    method: string = 'telea',
    radius: number = 3,
    padding: number = 10,
    controller?: AbortController
  ) => {
    // 将 base64 图像转换为 File 对象
    const imageFile = await fetch(imagePath).then(r => r.blob()).then(b => new File([b], 'image.png'));
    const maskFile = await fetch(maskPath).then(r => r.blob()).then(b => new File([b], 'mask.png'));
    
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('mask', maskFile);
    
    const url = new URL(`${API_BASE_URL}/inpaint`);
    url.searchParams.append('method', method);
    url.searchParams.append('radius', String(radius));
    url.searchParams.append('padding', String(padding));
    
    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        body: formData,
        signal: controller?.signal,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw createApiError(
          response.status,
          errorData.detail || `HTTP error! status: ${response.status}`,
          errorData
        );
      }
      
      return response.json();
    } catch (error) {
      console.error('Inpainting failed:', error);
      throw error;
    }
  },
  
  // 获取可用的 Inpainting 方法
  getInpaintingMethods: (controller?: AbortController) =>
    fetchApi<{ success: boolean; methods: string[]; descriptions: Record<string, string> }>('/inpaint/methods', {}, controller),
  
  // 工作流管理
  startWorkflow: (controller?: AbortController) => 
    fetchApi<{ success: boolean; message: string }>('/workflow/start', { method: 'POST' }, controller),
  
  stopWorkflow: (controller?: AbortController) => 
    fetchApi<{ success: boolean; message: string }>('/workflow/stop', { method: 'POST' }, controller),
  
  getWorkflowStatus: (controller?: AbortController) => 
    fetchApi<WorkflowStatus>('/workflow/status', {}, controller),
  
  processFile: (
    filename: string,
    controller?: AbortController
  ) => 
    fetchApi<ProcessFileResult>(`/workflow/process-file/${filename}`, { method: 'POST' }, controller),
  
  clearWorkflowHistory: (controller?: AbortController) => 
    fetchApi<{ success: boolean; message: string }>('/workflow/clear-history', { method: 'POST' }, controller),
  
  generateMetadata: (controller?: AbortController) => 
    fetchApi<{ success: boolean; message: string; metadata: any }>('/workflow/generate-metadata', { method: 'POST' }, controller),
  
  getBatchConfig: (controller?: AbortController) => 
    fetchApi<BatchConfig>('/workflow/get-batch-config', {}, controller),
  
  setBatchConfig: (
    max_parallel_tasks: number,
    controller?: AbortController
  ) => 
    fetchApi<{ success: boolean; message: string; batch_config: BatchConfig }>('/workflow/set-batch-config', {
      method: 'POST',
      body: JSON.stringify({ max_parallel_tasks }),
    }, controller),

  // 通用AI处理方法
  processAI: (
    endpoint: string,
    formData: FormData,
    controller?: AbortController
  ) =>
    fetchApi<{ success: boolean; data?: any; error?: string; processId?: string }>(endpoint, {
      method: 'POST',
      body: formData,
    }, controller),
  
  // 语义分割相关API
  performEdgeSnap: async (
    imagePath: string,
    points: Array<{x: number, y: number}>,
    mode: 'foreground' | 'background',
    controller?: AbortController
  ) => {
    const imageFile = await fetch(imagePath).then(r => r.blob()).then(b => new File([b], 'image.png'));
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('points', JSON.stringify(points));
    formData.append('mode', mode);
    
    return fetchApi<{ success: boolean; snappedPoints: Array<{x: number, y: number}> }>('/semantic/edge-snap', {
      method: 'POST',
      body: formData,
    }, controller);
  },
  
  performJointExpansion: async (
    imagePath: string,
    bbox: {x: number, y: number, width: number, height: number},
    mode: 'foreground' | 'background',
    controller?: AbortController
  ) => {
    const imageFile = await fetch(imagePath).then(r => r.blob()).then(b => new File([b], 'image.png'));
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('bbox', JSON.stringify(bbox));
    formData.append('mode', mode);
    
    return fetchApi<{ success: boolean; expandedMask: string }>('/semantic/joint-expansion', {
      method: 'POST',
      body: formData,
    }, controller);
  },
  
  applyPartPreset: async (
    imagePath: string,
    presetId: string,
    controller?: AbortController
  ) => {
    const imageFile = await fetch(imagePath).then(r => r.blob()).then(b => new File([b], 'image.png'));
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('preset_id', presetId);
    
    return fetchApi<{ success: boolean; parts: Array<{name: string; type: string; mask: string}> }>('/semantic/apply-preset', {
      method: 'POST',
      body: formData,
    }, controller);
  },
  
  processSemanticBrush: async (
    imagePath: string,
    strokes: Array<{x: number, y: number, mode: string, size: number}>,
    controller?: AbortController
  ) => {
    const imageFile = await fetch(imagePath).then(r => r.blob()).then(b => new File([b], 'image.png'));
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('strokes', JSON.stringify(strokes));
    
    return fetchApi<{ success: boolean; mask: string }>('/semantic/process-brush', {
      method: 'POST',
      body: formData,
    }, controller);
  },
};

// 导出API基础URL，方便其他模块使用
export { API_BASE_URL };

// 导出apiService作为apiClient的别名，兼容现有代码
export const apiService = apiClient;
