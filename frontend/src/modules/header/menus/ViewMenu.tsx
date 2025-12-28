import React, { useState } from 'react';
import { useTranslation } from '../../../i18n';
import { 
  ZoomIn, ZoomOut, Home, Eye, ArrowLeftRight, ArrowUpDown, 
  RefreshCcw, Clock 
} from 'lucide-react';
import { Menu } from '../components/Menu';
import { MenuItem } from '../components/MenuItem';
import { Modal } from '../../../components/common/Modal';
import { TaskModule } from '../../../modules/task/TaskModule';
import { WorkflowControl, WorkflowStatusDisplay, FileTypeStats, WorkflowResults, TechPanel } from '../../../modules/task/components/TaskPanel';
import { TaskList } from '../../../modules/task/components/TaskPanel';
import { useTaskWorkflow } from '../../../modules/task/composables/useTaskWorkflow';
import type { Task } from '../../../modules/task/utils/utils';

interface ViewMenuProps {
  /** 当前是否激活 */
  isActive: boolean;
  /** 菜单激活状态变化事件 */
  onToggle: () => void;
}

/**
 * 查看菜单组件
 * 功能：提供查看相关操作，包括缩放控制、显示设置、自动工作流和任务列表等
 */
export const ViewMenu: React.FC<ViewMenuProps> = ({
  isActive,
  onToggle
}) => {
  const { t } = useTranslation();
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showTaskListModal, setShowTaskListModal] = useState(false);

  // 使用任务工作流Hook获取工作流状态和统计信息
  const { 
    tasks: currentTasks,
    workflowStatus,
    fileTypeStats,
    startWorkflow,
    stopWorkflow,
    clearWorkflowHistory,
    cancelTask,
    retryTask
  } = useTaskWorkflow([], {
    onTaskCancel: (taskId) => console.log('取消任务:', taskId),
    onTaskRetry: (taskId) => console.log('重试任务:', taskId)
  });

  return (
    <>
      <Menu name={t('menu.view')} isActive={isActive} onToggle={onToggle}>
        <MenuItem
          title={t('view.zoomIn') || '放大'}
          icon={ZoomIn}
          shortcut="Ctrl++"
          onClick={() => {
            onToggle();
            // 这里可以添加具体的放大逻辑
            console.log('放大');
          }}
        />
        <MenuItem
          title={t('view.zoomOut') || '缩小'}
          icon={ZoomOut}
          shortcut="Ctrl+-"
          onClick={() => {
            onToggle();
            // 这里可以添加具体的缩小逻辑
            console.log('缩小');
          }}
        />
        <MenuItem
          title={t('view.zoomFit') || '适应屏幕'}
          icon={Home}
          onClick={() => {
            onToggle();
            // 这里可以添加具体的适应屏幕逻辑
            console.log('适应屏幕');
          }}
        />
        <MenuItem isSeparator />
        <MenuItem
          title={t('view.showGrid') || '显示网格'}
          icon={Eye}
          onClick={() => {
            onToggle();
            // 这里可以添加具体的显示网格逻辑
            console.log('显示网格');
          }}
        />
        <MenuItem
          title={t('view.showRulers') || '显示标尺'}
          icon={ArrowLeftRight}
          onClick={() => {
            onToggle();
            // 这里可以添加具体的显示标尺逻辑
            console.log('显示标尺');
          }}
        />
        <MenuItem
          title={t('view.showGuides') || '显示辅助线'}
          icon={ArrowUpDown}
          onClick={() => {
            onToggle();
            // 这里可以添加具体的显示辅助线逻辑
            console.log('显示辅助线');
          }}
        />
        <MenuItem isSeparator />
        <MenuItem
          title={t('menu.autoWorkflow') || '自动工作流'}
          icon={RefreshCcw}
          onClick={() => {
            onToggle();
            setShowWorkflowModal(true);
          }}
        />
        <MenuItem
          title={t('task-list.title') || '任务列表'}
          icon={Clock}
          onClick={() => {
            onToggle();
            setShowTaskListModal(true);
          }}
        />
      </Menu>

      {/* 自动工作流模态对话框 */}
      <Modal
        visible={showWorkflowModal}
        title={t('menu.autoWorkflow') || '自动工作流'}
        onClose={() => setShowWorkflowModal(false)}
        className="max-w-2xl max-h-[80vh] overflow-auto"
      >
        <div className="h-[60vh] overflow-auto p-4">
          <TechPanel defaultOpen={true} bordered={true}>
            {/* 工作流控制、状态和统计信息 - 水平排列 */}
            <div className="flex flex-row flex-wrap gap-4 mb-4">
              <WorkflowControl 
                isRunning={workflowStatus.is_running} 
                onStart={startWorkflow} 
                onStop={stopWorkflow} 
                onClearHistory={clearWorkflowHistory}
              />
              <WorkflowStatusDisplay workflowStatus={workflowStatus} />
              <FileTypeStats stats={fileTypeStats} />
            </div>
            <WorkflowResults workflowStatus={workflowStatus} />
          </TechPanel>
        </div>
      </Modal>

      {/* 任务列表模态对话框 */}
      <Modal
        visible={showTaskListModal}
        title={t('task-list.title') || '任务列表'}
        onClose={() => setShowTaskListModal(false)}
        className="max-w-2xl max-h-[80vh] overflow-auto"
      >
        <div className="h-[60vh] overflow-auto p-4">
          <TechPanel defaultOpen={true} bordered={true}>
            <TaskList 
              tasks={currentTasks}
              onTaskCancel={cancelTask}
              onTaskRetry={retryTask}
            />
          </TechPanel>
        </div>
      </Modal>
    </>
  );
};
