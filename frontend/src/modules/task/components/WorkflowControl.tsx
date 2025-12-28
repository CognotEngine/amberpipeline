import React from 'react';
import { Play, StopCircle, RefreshCcw } from 'lucide-react';

interface WorkflowControlProps {
  // 工作流是否正在运行
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onClearHistory: () => void;
}

/**
 * 工作流控制组件
 * 提供工作流的启动、停止、清除历史记录和刷新状态功能
 */
const WorkflowControl: React.FC<WorkflowControlProps> = ({
  isRunning,
  onStart,
  onStop,
  onClearHistory
}) => {
  // 处理启动工作流
  const handleStartWorkflow = () => {
    onStart();
  };

  // 处理停止工作流
  const handleStopWorkflow = () => {
    onStop();
  };

  // 处理清除历史记录
  const handleClearHistory = () => {
    onClearHistory();
  };



  return (
    <div className="workflow-control h-10 px-4 flex items-center justify-between min-w-0 border-b border-[#333333] pb-4 bg-[#252525]">
      <div className="flex items-center space-x-2 whitespace-nowrap">
        <span className="text-sm font-medium text-white">自动工作流:</span>
        <span 
          className={`text-xs px-2 py-1 rounded-full ${
            isRunning ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          {isRunning ? '运行中' : '已停止'}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <button
          className="flex items-center space-x-1 text-xs bg-[#2A2A2A] hover:bg-[#333333] px-3 py-1 rounded-lg transition-all border border-[#333333] hover:border-[#444444]"
          onClick={isRunning ? handleStopWorkflow : handleStartWorkflow}
        >
          {isRunning ? (
            <>
              <StopCircle className="w-4 h-4" color="#ffffff" />
              <span>关闭监控</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" color="#ffffff" />
              <span>启动监控</span>
            </>
          )}
        </button>
        
        <button
          className="flex items-center space-x-1 text-xs bg-[#2A2A2A] hover:bg-[#333333] px-3 py-1 rounded-lg transition-all border border-[#333333] hover:border-[#444444]"
          onClick={handleClearHistory}
          title="清除历史记录"
        >
          <RefreshCcw className="w-4 h-4" color="#ffffff" />
          <span>清除</span>
        </button>
        

      </div>

      <style>{`
        .workflow-control {
          transition: all 0.2s ease;
        }

        button {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default WorkflowControl;