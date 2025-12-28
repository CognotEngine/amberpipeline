import React from 'react';
import { TaskPanel } from './components/TaskPanel';
import type { Task } from './utils/utils';
import { useTaskWorkflow } from './composables/useTaskWorkflow';

interface TaskModuleProps {
  tasks: Task[];
  onTaskCancel?: (taskId: string) => void;
  onTaskRetry?: (taskId: string) => void;
}

/**
 * 任务模块组件
 * 功能：管理任务列表和工作流状态，提供自动工作流控制
 */
export const TaskModule: React.FC<TaskModuleProps> = ({
  tasks,
  onTaskCancel,
  onTaskRetry
}) => {
  // 使用任务工作流Hook
  const { 
    tasks: currentTasks,
    workflowStatus,
    fileTypeStats,
    startWorkflow,
    stopWorkflow,
    clearWorkflowHistory,
    cancelTask,
    retryTask
  } = useTaskWorkflow(tasks, {
    onTaskCancel,
    onTaskRetry
  });

  return (
    <TaskPanel
        tasks={currentTasks}
        workflowStatus={workflowStatus}
        fileTypeStats={fileTypeStats}
        onTaskCancel={cancelTask}
        onTaskRetry={retryTask}
        onStartWorkflow={startWorkflow}
        onStopWorkflow={stopWorkflow}
        onClearWorkflowHistory={clearWorkflowHistory}
      />
  );
};