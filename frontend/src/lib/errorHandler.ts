/**
 * 错误处理与日志记录机制
 * 功能：统一处理应用中的错误，提供一致的错误记录和报告机制
 */

// 定义错误类型
export type ErrorType = 'api' | 'validation' | 'network' | 'auth' | 'unknown';

// 定义错误级别
export type ErrorLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

// 定义错误上下文
export interface ErrorContext {
  source: string;
  component?: string;
  function?: string;
  endpoint?: string;
  method?: string;
  params?: Record<string, any>;
  userId?: string;
  timestamp: number;
  additionalData?: Record<string, any>;
}

// 定义错误信息
export interface AppError {
  id: string;
  type: ErrorType;
  level: ErrorLevel;
  message: string;
  originalError?: Error;
  context: ErrorContext;
  stack?: string;
}

/**
 * 创建错误ID
 * @returns 唯一的错误ID
 */
function createErrorId(): string {
  return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 格式化错误信息
 * @param error 原始错误
 * @returns 格式化后的错误信息
 */
export function formatError(error: any): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  return '未知错误';
}

/**
 * 记录错误
 * @param error 原始错误
 * @param type 错误类型
 * @param level 错误级别
 * @param context 错误上下文
 * @returns 创建的错误对象
 */
export function logError(
  error: any,
  type: ErrorType = 'unknown',
  level: ErrorLevel = 'error',
  context: Partial<ErrorContext> = {}
): AppError {
  const message = formatError(error);
  const appError: AppError = {
    id: createErrorId(),
    type,
    level,
    message,
    originalError: error instanceof Error ? error : undefined,
    context: {
      source: 'frontend',
      timestamp: Date.now(),
      ...context
    },
    stack: error instanceof Error ? error.stack : undefined
  };

  // 根据错误级别记录日志
  switch (level) {
    case 'critical':
      console.error('[CRITICAL]', appError);
      // 这里可以添加错误报告机制，例如发送到Sentry、LogRocket等
      break;
    case 'error':
      console.error('[ERROR]', appError);
      break;
    case 'warn':
      console.warn('[WARN]', appError);
      break;
    case 'info':
      console.info('[INFO]', appError);
      break;
    case 'debug':
      console.debug('[DEBUG]', appError);
      break;
  }

  return appError;
}

/**
 * 处理API错误
 * @param error 原始错误
 * @param context 错误上下文
 * @returns 处理后的错误对象
 */
export function handleApiError(
  error: any,
  context: Partial<ErrorContext> = {}
): AppError {
  let errorType: ErrorType = 'api';
  let errorLevel: ErrorLevel = 'error';

  // 根据错误类型进行分类
  if (error?.status === 401 || error?.message?.includes('认证') || error?.message?.includes('token')) {
    errorType = 'auth';
    errorLevel = 'warn';
  } else if (error?.status === 400 || error?.message?.includes('验证')) {
    errorType = 'validation';
    errorLevel = 'warn';
  } else if (error?.name === 'AbortError') {
    errorType = 'api';
    errorLevel = 'info';
  } else if (error?.message?.includes('network') || error?.message?.includes('NetworkError')) {
    errorType = 'network';
    errorLevel = 'warn';
  }

  return logError(error, errorType, errorLevel, {
    method: context.method || 'GET',
    ...context
  });
}

/**
 * 处理验证错误
 * @param error 原始错误
 * @param context 错误上下文
 * @returns 处理后的错误对象
 */
export function handleValidationError(
  error: any,
  context: Partial<ErrorContext> = {}
): AppError {
  return logError(error, 'validation', 'warn', context);
}

/**
 * 处理网络错误
 * @param error 原始错误
 * @param context 错误上下文
 * @returns 处理后的错误对象
 */
export function handleNetworkError(
  error: any,
  context: Partial<ErrorContext> = {}
): AppError {
  return logError(error, 'network', 'error', context);
}

/**
 * 处理认证错误
 * @param error 原始错误
 * @param context 错误上下文
 * @returns 处理后的错误对象
 */
export function handleAuthError(
  error: any,
  context: Partial<ErrorContext> = {}
): AppError {
  return logError(error, 'auth', 'warn', context);
}

/**
 * 错误报告服务
 * 功能：提供错误报告的统一接口
 */
export const errorReporter = {
  /**
   * 报告错误
   * @param error 错误对象
   * @returns Promise<boolean> 报告是否成功
   */
  report: async (error: AppError): Promise<boolean> => {
    try {
      // 这里可以实现错误报告逻辑，例如发送到后端或第三方服务
      console.log('Reporting error:', error.id);
      
      // 模拟API调用
      // await fetch('/api/error-report', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(error)
      // });
      
      return true;
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
      return false;
    }
  },
  
  /**
   * 批量报告错误
   * @param errors 错误对象数组
   * @returns Promise<boolean> 报告是否成功
   */
  reportBatch: async (errors: AppError[]): Promise<boolean> => {
    try {
      console.log('Reporting batch errors:', errors.length);
      // 这里可以实现批量错误报告逻辑
      return true;
    } catch (reportError) {
      console.error('Failed to report batch errors:', reportError);
      return false;
    }
  }
};
