import React from 'react';
import { Minimize, Maximize, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WindowControlsProps {
  className?: string;
}

/**
 * 窗口控制组件
 * 功能：提供窗口最小化、最大化、关闭等控制按钮
 */
export const WindowControls: React.FC<WindowControlsProps> = ({ className }) => {
  /**
   * 最小化窗口
   */
  const handleMinimize = () => {
    // 在浏览器环境中，最小化功能由浏览器自身处理
    console.log('Minimize window requested');
  };

  /**
   * 最大化/还原窗口
   */
  const handleMaximize = () => {
    // 在浏览器环境中，最大化功能由浏览器自身处理
    console.log('Maximize window requested');
  };

  /**
   * 关闭窗口
   */
  const handleClose = () => {
    // 在浏览器环境中，关闭功能由浏览器自身处理
    console.log('Close window requested');
  };

  return (
    <div className={cn("window-controls flex items-center gap-1 h-full", className)}>
      {/* 窗口控制按钮 */}
      <div className="window-buttons flex gap-1">
        <button 
          className="w-6 h-6 flex items-center justify-center text-textSecondary hover:bg-surface-elevated rounded transition-colors"
          onClick={handleMinimize}
          title="最小化"
        >
          <Minimize size={12} />
        </button>
        <button 
          className="w-6 h-6 flex items-center justify-center text-textSecondary hover:bg-surface-elevated rounded transition-colors"
          onClick={handleMaximize}
          title="最大化"
        >
          <Maximize size={12} />
        </button>
        <button 
          className="w-6 h-6 flex items-center justify-center text-textSecondary hover:bg-danger rounded transition-colors"
          onClick={handleClose}
          title="关闭"
        >
          <X size={12} />
        </button>
      </div>

      {/* 窗口控制样式已合并到Tailwind CSS类中 */}
    </div>
  );
};