import React from 'react';
import { useTranslation } from '../../../i18n';
import { 
  ZoomIn, ZoomOut, Home, Eye, ArrowLeftRight, ArrowUpDown, 
  RefreshCcw, Clock 
} from 'lucide-react';
import { Menu } from '../components/Menu';
import { MenuItem } from '../components/MenuItem';
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
            // 自动工作流功能待实现
            console.log('自动工作流功能');
          }}
        />
        <MenuItem
          title={t('task-list.title') || '任务列表'}
          icon={Clock}
          onClick={() => {
            onToggle();
            // 任务列表功能待实现
            console.log('任务列表功能');
          }}
        />
      </Menu>
    </>
  );
};
