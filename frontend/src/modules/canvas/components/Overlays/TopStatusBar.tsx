import React from 'react';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '../../../../i18n';

interface TopStatusBarProps {
  /** SAM模型运行状态 */
  modelStatus: 'idle' | 'loading' | 'running' | 'error' | 'success';
  /** 选中的图层名称 */
  selectedLayerName?: string;
  /** 处理进度 */
  progress?: number;
}

/**
 * 顶部状态栏组件
 * 功能：显示当前SAM模型的运行状态、选中的图层名称和处理进度
 */
export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  modelStatus,
  selectedLayerName = '未选择图层',
  progress = 0
}) => {
  const { t } = useTranslation();
  
  // 获取状态图标和文本
  const getStatusInfo = () => {
    switch (modelStatus) {
      case 'idle':
        return { icon: <CheckCircle2 size={16} />, text: t('precision-cut.status.idle'), className: 'text-green-500' };
      case 'loading':
        return { icon: <Loader2 size={16} className="animate-spin" />, text: t('precision-cut.status.loading'), className: 'text-blue-500' };
      case 'running':
        return { icon: <Loader2 size={16} className="animate-spin" />, text: t('precision-cut.status.running'), className: 'text-blue-500' };
      case 'error':
        return { icon: <XCircle size={16} />, text: t('precision-cut.status.error'), className: 'text-red-500' };
      case 'success':
        return { icon: <CheckCircle2 size={16} />, text: t('precision-cut.status.success'), className: 'text-green-500' };
      default:
        return { icon: <CheckCircle2 size={16} />, text: t('precision-cut.status.idle'), className: 'text-gray-500' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="top-status-bar bg-surface border-b border-border p-2 flex items-center justify-between absolute top-0 left-0 right-0 z-50 shadow-md">
      {/* 左侧：模型状态 */}
      <div className="flex items-center space-x-2">
        <div className={cn("flex items-center space-x-1", statusInfo.className)}>
          {statusInfo.icon}
          <span className="text-sm font-medium">{statusInfo.text}</span>
        </div>
        
        {/* 进度条（仅在处理中显示） */}
        {(modelStatus === 'loading' || modelStatus === 'running') && (
          <div className="flex items-center space-x-2 ml-4">
            <div className="w-40 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-text-secondary">{progress}%</span>
          </div>
        )}
      </div>
      
      {/* 右侧：选中图层信息 */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-text-secondary">图层:</span>
          <span className="text-sm font-medium text-text-primary">{selectedLayerName}</span>
        </div>
        
        {/* SAM模型信息 */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-text-secondary">模型:</span>
          <span className="text-sm font-medium text-text-primary">SAM v1.0</span>
        </div>
      </div>
    </div>
  );
};
