import React from 'react';
import { WorkflowStatus } from '../utils/utils';

interface WorkflowStatusDisplayProps {
  // 工作流状态
  workflowStatus: WorkflowStatus;
}

/**
 * 工作流状态显示组件
 * 显示工作流的统计信息，包括任务总数、已处理、失败和队列数量
 */
const WorkflowStatusDisplay: React.FC<WorkflowStatusDisplayProps> = ({ workflowStatus }) => {
  return (
    <div className="workflow-status p-4 mt-2 space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-400">任务总数:</span>
        <span className="text-white">{workflowStatus.total_files}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">已处理任务:</span>
        <span className="text-white">{workflowStatus.processed_files.length}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">失败任务:</span>
        <span className="text-white">{workflowStatus.failed_files.length}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-400">当前队列:</span>
        <span className="text-white">{workflowStatus.processing_queue.length}</span>
      </div>

      <style>{`
        .workflow-status {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default WorkflowStatusDisplay;