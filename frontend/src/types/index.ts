/**
 * 统一类型导出文件
 * 功能：集中管理所有类型定义，提供统一的导入接口
 */

// 导出AI相关类型
export * from './ai';

// 移除electron相关类型导入

// 导出组件相关类型
export type {
  CanvasTransform,
  CanvasConfig,
  CanvasPoint,
  CanvasBackgroundType
} from '../composables/useCanvas';

export type {
  AIProcessResult,
  AIProcessParams
} from '../composables/useAIProcess';

export type {
  AIWorkflowConfig,
  AIWorkflowState
} from '../composables/useAIWorkflow';

export type {
  User,
  UserSettings,
  LoginParams,
  RegisterParams
} from '../composables/useUser';

export type {
  Project,
  ProjectConfig,
  ProjectSettings,
  ProjectMetadata
} from '../composables/useProject';

// 导出API相关类型
export type { 
  ApiError, 
  ApiResponse, 
  BatchConfig, 
  ProcessFileResult 
} from '../lib/api';

// 导出系统状态类型
export interface SystemStatus {
  gpuLoad: number;
  vramUsage: {
    used: number;
    total: number;
  };
  fps: number;
  errorCount: number;
  warningCount: number;
}

// 导出错误处理相关类型
export type {
  ErrorType,
  ErrorLevel,
  ErrorContext,
  AppError
} from '../lib/errorHandler';

// 导出任务相关类型
export interface Task {
  id: string;
  filename: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message?: string;
  timestamp: number; // 添加时间戳字段，用于显示消息时间
}

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
}

export interface FileTypeStats {
  chr: number;
  ui: number;
  env: number;
  prp: number;
}

export interface TextureType {
  baseColor: boolean;
  normal: boolean;
  roughness: boolean;
  emissive: boolean;
  metallic: boolean;
}

// 导出动画相关类型
export type {
  AnimationType,
  AnimatedProps
} from '../components/animation/Animated';

export type {
  FadeInProps
} from '../components/animation/FadeIn';

// 导出主题相关类型
export type {
  ThemeConfig,
  LayoutConfig,
  TypographyConfig,
  ComponentStyles,
  EffectsConfig,
  IconsConfig,
  ThemeColors,
  ThemeState
} from '../themes/types';

// 导出工具函数类型
// themeUtils.ts没有导出类型，所以这里不需要导出任何类型

// 导出语义化组件类型
export type {
  SemanticButton
} from '../components/semantic/SemanticButton';

export type {
  SemanticAlert
} from '../components/semantic/SemanticAlert';

export type {
  SemanticProgress
} from '../components/semantic/SemanticProgress';

export type {
  SemanticTooltip
} from '../components/semantic/SemanticTooltip';


