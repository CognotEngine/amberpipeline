// 任务接口定义
export interface Task {
  id: string;
  filename: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  timestamp: number; // 添加时间戳字段，用于显示消息时间
}

// 工作流状态接口定义
export interface WorkflowStatus {
  is_running: boolean;
  processing_queue: string[];
  processed_files: Array<{
    filename: string;
    status: string;
    start_time: number;
    end_time: number | null;
    processes: Array<{
      name: string;
      status: string;
      error: string | null;
    }>;
    error: string | null;
  }>;
  failed_files: Array<{
    filename: string;
    status: string;
    start_time: number;
    end_time: number | null;
    processes: Array<{
      name: string;
      status: string;
      error: string | null;
    }>;
    error: string | null;
  }>;
  total_files: number;
  success_rate: number;
  batch_config: {
    max_parallel_tasks: number;
    current_running_tasks: number;
  };
}

// 文件类型统计接口定义
export interface FileTypeStats {
  chr: number;
  ui: number;
  env: number;
  prp: number;
}

// 纹理类型接口定义
export interface TextureType {
  baseColor: boolean;
  normal: boolean;
  roughness: boolean;
  emissive: boolean;
  metallic: boolean;
}

/**
 * 获取文件的纹理类型
 * @param filename 文件名
 * @returns 纹理类型对象
 */
export const getTextureType = (filename: string): TextureType => {
  const type: TextureType = {
    baseColor: false,
    normal: false,
    roughness: false,
    emissive: false,
    metallic: false
  };
  
  const lowerFilename = filename.toLowerCase();
  
  if (lowerFilename.includes('_bc') || (!lowerFilename.includes('_normal') && 
      !lowerFilename.includes('_r') && !lowerFilename.includes('_e') && 
      !lowerFilename.includes('_m'))) {
    type.baseColor = true;
  }
  if (lowerFilename.includes('_normal') || lowerFilename.includes('_n')) type.normal = true;
  if (lowerFilename.includes('_r')) type.roughness = true;
  if (lowerFilename.includes('_e')) type.emissive = true;
  if (lowerFilename.includes('_m')) type.metallic = true;
  
  return type;
};

/**
 * 获取纹理类型的显示名称
 * @param filename 文件名
 * @returns 纹理类型显示名称
 */
export const getTextureTypeName = (filename: string): string => {
  const textureType = getTextureType(filename);
  
  if (textureType.normal) {
    return '法线贴图';
  } else if (textureType.roughness) {
    return '粗糙度贴图';
  } else if (textureType.emissive) {
    return '自发光贴图';
  } else if (textureType.metallic) {
    return '金属度贴图';
  } else {
    return '基础颜色贴图';
  }
};

/**
 * 更新文件类型统计
 * @param workflowStatus 工作流状态
 * @returns 文件类型统计结果
 */
export const updateFileTypeStats = (workflowStatus: WorkflowStatus): FileTypeStats => {
  const stats: FileTypeStats = {
    chr: 0,
    ui: 0,
    env: 0,
    prp: 0
  };
  
  // 统计已处理文件
  if (workflowStatus.processed_files) {
    workflowStatus.processed_files.forEach(file => {
      if (file.filename.toLowerCase().startsWith('chr_')) {
        stats.chr++;
      } else if (file.filename.toLowerCase().startsWith('ui_')) {
        stats.ui++;
      } else if (file.filename.toLowerCase().startsWith('env_')) {
        stats.env++;
      } else if (file.filename.toLowerCase().startsWith('prp_')) {
        stats.prp++;
      }
    });
  }
  
  // 统计失败文件
  if (workflowStatus.failed_files) {
    workflowStatus.failed_files.forEach(file => {
      if (file.filename.toLowerCase().startsWith('chr_')) {
        stats.chr++;
      } else if (file.filename.toLowerCase().startsWith('ui_')) {
        stats.ui++;
      } else if (file.filename.toLowerCase().startsWith('env_')) {
        stats.env++;
      } else if (file.filename.toLowerCase().startsWith('prp_')) {
        stats.prp++;
      }
    });
  }
  
  return stats;
};