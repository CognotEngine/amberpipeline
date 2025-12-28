import React, { useEffect, useRef, useState } from 'react';
import { StopCircle, RefreshCcw } from 'lucide-react';
import { Task } from '../utils/utils';
import { EnterAnimation, ExitAnimation } from '../../../lib/animations';

interface TaskListProps {
  tasks: Task[];
  onTaskCancel: (taskId: string) => void;
  onTaskRetry: (taskId: string) => void;
}

/**
 * 任务列表组件
 * 显示任务列表，支持取消和重试操作
 * 包含任务加入和消失的动画效果
 */
const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onTaskCancel, 
  onTaskRetry 
}) => {
  // 任务列表容器引用
  const taskListContainerRef = useRef<HTMLDivElement>(null);
  
  // 跟踪正在移除的任务
  const [removedTasks, setRemovedTasks] = useState<Set<string>>(new Set());
  
  // 跟踪新添加的任务（用于进入动画）
  const [newTasks, setNewTasks] = useState<Set<string>>(new Set());
  
  // 跟踪上一次的任务列表
  const prevTasksRef = useRef<Task[]>([]);

  // 获取任务状态对应的样式
  const getTaskStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'error':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // 自动滚动任务列表到底部
  const scrollTaskListToBottom = () => {
    if (taskListContainerRef.current) {
      taskListContainerRef.current.scrollTop = taskListContainerRef.current.scrollHeight;
    }
  };

  // 检测任务变化并应用动画
  useEffect(() => {
    const currentTaskIds = new Set(tasks.map(task => task.id));
    const prevTaskIds = new Set(prevTasksRef.current.map(task => task.id));
    
    // 找出新添加的任务
    const newlyAddedTasks = tasks.filter(task => !prevTaskIds.has(task.id));
    if (newlyAddedTasks.length > 0) {
      setNewTasks(prev => new Set([...prev, ...newlyAddedTasks.map(task => task.id)]));
      
      // 动画结束后移除新任务标记
      const timer = setTimeout(() => {
        setNewTasks(prev => {
          const updated = new Set(prev);
          newlyAddedTasks.forEach(task => updated.delete(task.id));
          return updated;
        });
      }, 300); // 与CSS动画持续时间一致
      
      return () => clearTimeout(timer);
    }
    
    // 找出被移除的任务
    const removedTaskIds = Array.from(prevTaskIds).filter(id => !currentTaskIds.has(id));
    if (removedTaskIds.length > 0) {
      setRemovedTasks(prev => new Set([...prev, ...removedTaskIds]));
      
      // 动画结束后移除任务
      const timer = setTimeout(() => {
        setRemovedTasks(prev => {
          const updated = new Set(prev);
          removedTaskIds.forEach(id => updated.delete(id));
          return updated;
        });
      }, 300); // 与CSS动画持续时间一致
      
      return () => clearTimeout(timer);
    }
    
    prevTasksRef.current = tasks;
  }, [tasks]);
  
  // 监听任务变化，自动滚动到底部
  useEffect(() => {
    scrollTaskListToBottom();
  }, [tasks]);

  // 获取任务状态文本
  const getTaskStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中';
      case 'processing':
        return '处理中';
      case 'completed':
        return '已完成';
      case 'error':
        return '出错';
      default:
        return '未知';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 任务列表头部 */}
      <div className="h-10 px-4 flex items-center justify-between border-b border-[#3E3E3E]">
        <h4 className="text-[13px] font-bold text-white">任务列表</h4>
        <span className="text-[12px] text-white">
          {tasks.filter(t => t.status === 'processing').length} 个任务正在运行
        </span>
      </div>
      
      {/* 任务列表内容 */}
      <div 
        ref={taskListContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#252525]"
      >
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-white bg-[#252525]">
            暂无任务
          </div>
        ) : (
          <div>
            {/* 显示当前任务列表 */}
            {tasks.map((task) => (
              <div 
                key={task.id}
                className={`p-3 rounded-[2px] border bg-[#252525] ${getTaskStatusStyle(task.status)} ${newTasks.has(task.id) ? EnterAnimation.LIST_ENTER : ''}`}
              >
                {/* 任务信息 */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-medium">{task.filename}</span>
                    <span className="text-[12px]">{getTaskStatusText(task.status)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {/* 处理中任务显示进度 */}
                    {task.status === 'processing' && (
                      <span className="text-[12px]">{task.progress}%</span>
                    )}
                    
                    {/* 出错任务显示重试按钮 */}
                    {task.status === 'error' && (
                      <button
                        className="w-5 h-5 flex items-center justify-center text-xs rounded-[2px] hover:bg-current/20 transition-all"
                        onClick={() => onTaskRetry(task.id)}
                        title="重试任务"
                      >
                        <RefreshCcw size={12} />
                      </button>
                    )}
                    
                    {/* 进行中任务显示取消按钮 */}
                    {(task.status === 'processing' || task.status === 'pending') && (
                      <button
                        className="w-5 h-5 flex items-center justify-center text-xs rounded-[2px] hover:bg-current/20 transition-all"
                        onClick={() => onTaskCancel(task.id)}
                        title="取消任务"
                      >
                        <StopCircle size={12} />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* 进度条 */}
                {task.status === 'processing' && (
                  <div className="w-full h-1 bg-current/20 rounded-[2px] overflow-hidden">
                    <div 
                      className="h-full bg-current transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                )}
                
                {/* 错误信息 */}
                {task.status === 'error' && task.message && (
                  <div className="text-[12px] text-current mt-1">
                    {task.message}
                  </div>
                )}
              </div>
            ))}
            
            {/* 显示正在移除的任务（用于退出动画） */}
            {Array.from(removedTasks).map((taskId) => {
              // 从之前的任务列表中查找任务信息
              const task = prevTasksRef.current.find(t => t.id === taskId);
              if (!task) return null;
              
              return (
                <div 
                  key={`${taskId}-exiting`}
                  className={`p-3 rounded-[2px] border bg-[#252525] ${getTaskStatusStyle(task.status)} ${ExitAnimation.LIST_EXIT}`}
                >
                  {/* 任务信息 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-medium">{task.filename}</span>
                      <span className="text-[12px]">{getTaskStatusText(task.status)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* 处理中任务显示进度 */}
                      {task.status === 'processing' && (
                        <span className="text-[12px]">{task.progress}%</span>
                      )}
                      
                      {/* 错误信息 */}
                      {task.status === 'error' && task.message && (
                        <div className="text-[12px] text-current">
                          {task.message}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* 进度条 */}
                  {task.status === 'processing' && (
                    <div className="w-full h-1 bg-current/20 rounded-[2px] overflow-hidden">
                      <div 
                        className="h-full bg-current transition-all duration-300"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;