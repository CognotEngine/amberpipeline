import React from 'react';
import { WorkflowStatus } from '../utils/utils';
import { getTextureType, getTextureTypeName } from '../utils/utils';

interface WorkflowResultsProps {
  // 工作流状态
  workflowStatus: WorkflowStatus;
}

/**
 * 工作流结果组件
 * 显示处理结果，包括处理中、已完成和失败的文件
 */
const WorkflowResults: React.FC<WorkflowResultsProps> = ({ workflowStatus }) => {
  return (
    <div className="workflow-results flex-1 overflow-y-auto p-4 space-y-3">
      <h4 className="text-sm font-medium text-white mb-3">处理结果</h4>
      
      {/* 处理中文件 */}
      {workflowStatus.processing_queue.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-400 mb-1">处理中</div>
          {workflowStatus.processing_queue.map((filename) => (
            <div 
              key={filename}
              className="p-2 rounded-lg bg-[#2A2A2A] border border-[#333333] text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-white">{filename}</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">处理中</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 已完成文件 */}
      {workflowStatus.processed_files.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-400 mb-1">已完成</div>
          {workflowStatus.processed_files.slice(-5).reverse().map((file) => (
            <div 
              key={file.filename}
              className="p-2 rounded-lg bg-[#2A2A2A] border border-[#333333] text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-white">{file.filename}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">已完成</span>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                    {getTextureTypeName(file.filename)}
                  </span>
                </div>
              </div>
              
              {/* 显示生成的纹理类型 */}
              <div className="mt-1 flex flex-wrap gap-1">
                {getTextureType(file.filename).baseColor && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">基础颜色</span>
                )}
                {getTextureType(file.filename).normal && (
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">法线</span>
                )}
                {getTextureType(file.filename).roughness && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">粗糙度</span>
                )}
                {getTextureType(file.filename).emissive && (
                  <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">自发光</span>
                )}
                {getTextureType(file.filename).metallic && (
                  <span className="text-xs bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">金属度</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 失败文件 */}
      {workflowStatus.failed_files.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-400 mb-1">处理失败</div>
          {workflowStatus.failed_files.slice(-5).reverse().map((file) => (
            <div 
              key={file.filename}
              className="p-2 rounded-lg bg-[#2A2A2A] border border-[#333333] text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-white">{file.filename}</span>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">处理失败</span>
              </div>
              {file.error && (
                <div className="mt-1 text-xs text-red-400">
                  {file.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* 无结果提示 */}
      {workflowStatus.processing_queue.length === 0 && 
       workflowStatus.processed_files.length === 0 && 
       workflowStatus.failed_files.length === 0 && (
        <div className="text-center py-8 text-gray-500 text-sm">
          暂无处理结果
        </div>
      )}

      <style>{`
        .workflow-results {
          max-height: 300px;
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default WorkflowResults;