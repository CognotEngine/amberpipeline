import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, StopCircle, RefreshCcw, 
  ChevronDown, ChevronUp 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Task, WorkflowStatus, FileTypeStats } from '../utils/utils';
import { useTranslation } from '../../../i18n';
import { Button, Card } from '../../../components/ui';
import { sx } from '../../../themes/themeUtils';

interface TaskPanelProps {
  tasks: Task[];
  workflowStatus: WorkflowStatus;
  fileTypeStats: FileTypeStats;
  onTaskCancel?: (taskId: string) => void;
  onTaskRetry?: (taskId: string) => void;
  onStartWorkflow?: () => void;
  onStopWorkflow?: () => void;
  onClearWorkflowHistory?: () => void;
}

/**
 * 任务面板组件
 * 功能：提供任务列表和工作流控制的统一界面
 */
export const TaskPanel: React.FC<TaskPanelProps> = ({
  tasks,
  workflowStatus,
  fileTypeStats,
  onTaskCancel,
  onTaskRetry,
  onStartWorkflow,
  onStopWorkflow,
  onClearWorkflowHistory
}) => {
  const { t } = useTranslation();
  // 标签切换状态 - 默认显示任务列表
  const [activeTab, setActiveTab] = useState<'automation' | 'tasks'>('tasks');
  // 最小化状态 - 默认不最小化
  const [isMinimized, setIsMinimized] = useState(false);

  // 面板高度控制
  const [panelHeight, setPanelHeight] = useState(160); // 默认高度4rem
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(0);

  /**
   * 切换活动标签
   */
  const switchTab = (tab: 'automation' | 'tasks') => {
    setActiveTab(tab);
  };

  /**
   * 切换最小化状态
   */
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  /**
   * 开始拖动
   */
  const startDrag = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartHeight(panelHeight);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
  }, [panelHeight]);

  /**
   * 拖动中
   */
  const onDrag = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaY = e.clientY - startY; // 反转拖动方向，使向上拖动时高度增加
    const newHeight = Math.max(80, Math.min(400, startHeight + deltaY)); // 限制高度在80px-400px之间
    
    setPanelHeight(newHeight);
  }, [isDragging, startY, startHeight]);

  /**
   * 结束拖动
   */
  const endDrag = useCallback(() => {
    setIsDragging(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  /**
   * 处理取消任务
   */
  const handleCancelTask = (taskId: string) => {
    if (onTaskCancel) {
      onTaskCancel(taskId);
    }
  };

  /**
   * 处理重试任务
   */
  const handleRetryTask = (taskId: string) => {
    if (onTaskRetry) {
      onTaskRetry(taskId);
    }
  };

  /**
   * 启动工作流
   */
  const startWorkflow = () => {
    if (onStartWorkflow) {
      onStartWorkflow();
    }
  };

  /**
   * 停止工作流
   */
  const stopWorkflow = () => {
    if (onStopWorkflow) {
      onStopWorkflow();
    }
  };

  /**
   * 清除工作流历史
   */
  const clearWorkflowHistory = () => {
    if (onClearWorkflowHistory) {
      onClearWorkflowHistory();
    }
  };

  // 添加全局事件监听
  useEffect(() => {
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);

    return () => {
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', endDrag);
    };
  }, [onDrag, endDrag]);

  return (
    <Card 
      className={sx(['bg.surface', 'border', 'border.border', 'text.text-primary', 'transition-all', 'duration-300', 'flex', 'flex-col', 'rounded-t-[2px]', 'overflow-hidden', 'shadow-xl', 'relative', 'z-10'])}
    >
      {/* 标签内容区域 - 向上展开 */}
      <div 
        className={cn(
          sx(['bg.background', 'overflow-hidden', 'flex', 'flex-col', 'transition-all', 'duration-300']),
          isMinimized && 'h-0',
          !isMinimized && 'overflow-y-auto'
        )}
        style={{
          height: !isMinimized ? `${panelHeight}px` : '0px',
          transformOrigin: 'bottom'
        }}
      >
        {/* 自动化标签内容 */}
        {activeTab === 'automation' && (
          <div className={sx(['flex-1', 'flex', 'flex-col', 'bg.background'])}>
            <TechPanel defaultOpen={true} bordered={true}>
              {/* 工作流控制、状态和统计信息 - 水平排列 */}
              <div className={sx(['flex', 'flex-row', 'flex-wrap', 'gap-4', 'mb-4'])}>
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
        )}
        
        {/* 任务列表标签内容 */}
        {activeTab === 'tasks' && (
          <div className={sx(['flex-1', 'flex', 'flex-col', 'bg.surface'])}>
            <TechPanel defaultOpen={true} bordered={true}>
              <TaskList 
                tasks={tasks}
                onTaskCancel={handleCancelTask}
                onTaskRetry={handleRetryTask}
              />
            </TechPanel>
          </div>
        )}
      </div>
      
      {/* 底部区域头部：标签切换 + 最小化按钮 */}
      <div className={sx(['h-8', 'flex', 'items-center', 'justify-between', 'px-3', 'border-t', 'border.border', 'bg.surface'])}>
        {/* 标签切换 - 类似于网页窗口标签 */}
        <div className={sx(['flex', 'items-center', 'space-x-1'])}>
          {/* 自动工作流标签 */}
          <div
            className={cn(
              sx(['flex', 'items-center', 'space-x-2', 'px-3', 'py-1.5', 'rounded-b-md', 'cursor-pointer', 'transition-all', 'duration-200', 'whitespace-nowrap']),
              activeTab === 'automation'
                ? sx(['bg.background', 'text.text-primary', 'border-x', 'border-b', 'border.border', '-mt-px', 'shadow-sm'])
                : sx(['bg.surface-elevated', 'text.text-secondary', 'hover:bg.hover'])
            )}
          >
            <button
                className={sx(['text-xs'])}
                onClick={() => switchTab('automation')}
              >
                {t('workflow.title')}
              </button>
          </div>
          {/* 任务列表标签 */}
          <div
            className={cn(
              sx(['flex', 'items-center', 'space-x-2', 'px-3', 'py-1.5', 'rounded-b-md', 'cursor-pointer', 'transition-all', 'duration-200', 'whitespace-nowrap']),
              activeTab === 'tasks'
                ? sx(['bg.background', 'text.text-primary', 'border-x', 'border-b', 'border.border', '-mt-px', 'shadow-sm'])
                : sx(['bg.surface-elevated', 'text.text-secondary', 'hover:bg.hover'])
            )}
          >
            <button
                className={sx(['text-xs'])}
                onClick={() => switchTab('tasks')}
              >
                {t('task-list.title')}
              </button>
            {tasks.length > 0 && (
              <span className={sx(['ml-2', 'text-xs', 'bg.accent', 'text.white', 'px-1.5', 'py-0.5', 'rounded-full'])}>
                {tasks.length}
              </span>
            )}
          </div>
          {/* 最小化按钮 - 放在标签切换栏右侧，图标根据状态变化 */}
          <Button
            variant="secondary"
            size="small"
            className={sx(['w-6', 'h-6', 'flex', 'items-center', 'justify-center', 'text.text-secondary', 'hover:text.text-primary', 'rounded-full', 'hover:bg.hover', 'transition-all', 'ml-2'])}
            onClick={toggleMinimize}
            title={isMinimized ? t('common.open') : t('common.close')}
          >
            {/* 展开状态显示向上箭头，收起状态显示向下箭头 */}
            {isMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </Button>
        </div>
      </div>
      
      {/* 拖动条 - 放在底部 */}
      <div 
        className={sx(['h-2', 'bg.surface-elevated', 'cursor-row-resize', 'hover:bg.hover', 'transition-all'])}
        onMouseDown={startDrag}
      />
    </Card>
  );
};

// 子组件导出（完整版本）
export interface TechPanelProps {
  title?: string; // 标题变为可选
  defaultOpen?: boolean;
  bordered?: boolean;
  children: React.ReactNode;
}

export const TechPanel: React.FC<TechPanelProps> = ({ title, defaultOpen = true, bordered = false, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn(sx(['mb-4', 'bg.surface']), bordered && sx(['border', 'border.border', 'rounded-lg']))}>
      {/* 只有当提供了title时才显示标题栏 */}
      {title && (
        <div 
          className={sx(['flex', 'items-center', 'justify-between', 'px-4', 'py-2', 'bg.surface', 'border-b', 'border.border', 'cursor-pointer'])}
          onClick={() => setIsOpen(!isOpen)}
        >
          <h4 className={sx(['text-sm', 'font-medium', 'text.text-primary'])}>{title}</h4>
          <ChevronDown 
            size={16} 
            className={cn(
              sx(['text.text-secondary', 'transition-transform']),
              isOpen && sx(['transform', 'rotate-180'])
            )}
          />
        </div>
      )}
      <div className={cn(sx(['p-4']), title ? (isOpen ? "block" : "hidden") : "block")}>
        {children}
      </div>
    </div>
  );
};

export interface WorkflowControlProps {
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onClearHistory: () => void;
}

export const WorkflowControl: React.FC<WorkflowControlProps> = ({
  isRunning,
  onStart,
  onStop,
  onClearHistory
}) => {
  const { t } = useTranslation();
  return (
    <div className={sx(['mb-4'])}>
      <div className={sx(['flex', 'space-x-2', 'mb-3'])}>
        <Button
          variant={isRunning ? "destructive" : "success"}
          size="small"
          className={sx(['px-3', 'py-1.5', 'text-sm', 'rounded', 'flex', 'items-center', 'gap-2', 'transition-colors', 'text.text-inverse'])}
          onClick={isRunning ? onStop : onStart}
        >
          {isRunning ? <StopCircle size={14} /> : <Play size={14} />}
          {isRunning ? t('workflow.stop') : t('workflow.start')}
        </Button>
        <Button
          variant="secondary"
          size="small"
          className={sx(['px-3', 'py-1.5', 'text-sm', 'bg.surface-elevated', 'hover:bg.hover', 'text.text-inverse', 'rounded', 'flex', 'items-center', 'gap-2', 'transition-colors'])}
          onClick={onClearHistory}
        >
          <RefreshCcw size={14} />
          {t('workflow.clear-history')}
        </Button>
      </div>
      <div className={sx(['text-xs', 'text.text-secondary'])}>
        {t('workflow.status', { status: isRunning ? t('workflow.status.running') : t('workflow.status.stopped') })}
      </div>
    </div>
  );
};

export interface WorkflowStatusDisplayProps {
  workflowStatus: WorkflowStatus;
}

export const WorkflowStatusDisplay: React.FC<WorkflowStatusDisplayProps> = ({ workflowStatus }) => {
  const { t } = useTranslation();
  return (
    <div className={sx(['mb-4'])}>
      <h5 className={sx(['text-sm', 'font-medium', 'text.text-primary', 'mb-2'])}>{t('workflow-status.title')}</h5>
      <div className={sx(['flex', 'items-center', 'gap-4', 'text-xs', 'text.text-secondary'])}>
        <div>{t('workflow-status.total-files')}: {workflowStatus.total_files || 0}</div>
        <div>{t('workflow-status.processed')}: {(workflowStatus.processed_files || []).length}</div>
        <div>{t('workflow-status.failed')}: {(workflowStatus.failed_files || []).length}</div>
        <div>{t('workflow-status.success-rate')}: {(workflowStatus.success_rate || 0 * 100).toFixed(1)}%</div>
      </div>
    </div>
  );
};

export interface FileTypeStatsProps {
  stats: FileTypeStats;
}

export const FileTypeStats: React.FC<FileTypeStatsProps> = ({ stats }) => {
  const { t } = useTranslation();
  return (
    <div className={sx(['mb-4'])}>
      <h5 className={sx(['text-sm', 'font-medium', 'text.text-primary', 'mb-2'])}>{t('file-stats.title')}</h5>
      <div className={sx(['flex', 'items-center', 'gap-4', 'text-xs', 'text.text-secondary'])}>
        <div>{t('file-stats.character')}: {stats.chr}</div>
        <div>{t('file-stats.ui')}: {stats.ui}</div>
        <div>{t('file-stats.environment')}: {stats.env}</div>
        <div>{t('file-stats.prop')}: {stats.prp}</div>
      </div>
    </div>
  );
};

export interface WorkflowResultsProps {
  workflowStatus: WorkflowStatus;
}

export const WorkflowResults: React.FC<WorkflowResultsProps> = ({ workflowStatus }) => {
  const { t } = useTranslation();
  return (
    <div>
      <h5 className={sx(['text-sm', 'font-medium', 'text.text-primary', 'mb-2'])}>{t('workflow-results.title')}</h5>
      <div className={sx(['text-xs', 'text.text-secondary'])}>
        {((workflowStatus.processed_files || []).length > 0) ? (
          <div>{t('workflow-results.recent-results')}</div>
        ) : (
          <div>{t('workflow-results.no-results')}</div>
        )}
      </div>
    </div>
  );
};

export interface TaskListProps {
  tasks: Task[];
  onTaskCancel?: (taskId: string) => void;
  onTaskRetry?: (taskId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskCancel, onTaskRetry }) => {
  const { t, language } = useTranslation();
  const taskListRef = React.useRef<HTMLDivElement>(null);

  // 当任务列表更新时，自动滚动到底部
  React.useEffect(() => {
    if (taskListRef.current && tasks.length > 0) {
      taskListRef.current.scrollTop = taskListRef.current.scrollHeight;
    }
  }, [tasks]);

  /**
   * 格式化时间戳为可读时间
   */
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    // 使用当前语言环境格式化时间
    const langMap: Record<string, string> = {
      'zh-CN': 'zh-CN',
      'en': 'en-US',
      'ja': 'ja-JP'
    };
    return date.toLocaleTimeString(langMap[language] || 'zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div>
      {tasks.length > 0 ? (
        <div ref={taskListRef} className={sx(['space-y-2', 'max-h-40', 'overflow-y-auto'])}>
          {tasks.map((task) => (
            <div key={task.id} className={sx(['flex', 'items-center', 'justify-between', 'p-2', 'bg.surface', 'rounded', 'border', 'border.border'])}>
              <div className={sx(['flex-1', 'min-w-0'])}>
                <div className={sx(['flex', 'items-center', 'gap-2', 'flex-wrap'])}>
                  <span className={sx(['text-xs', 'text.text-tertiary', 'whitespace-nowrap'])}>[{formatTime(task.timestamp)}]</span>
                  <span className={sx(['text-xs', 'text.text-primary', 'truncate', 'min-w-[120px]'])}>{task.filename}</span>
                  {task.message && (
                    <span className={sx(['text-xs', 'text.text-secondary', 'whitespace-nowrap', 'overflow-hidden', 'text-ellipsis', 'max-w-[200px]'])}>{task.message}</span>
                  )}
                  <span className={sx(['text-xs', 'text.text-secondary', 'ml-auto'])}>{t(`task.status.${task.status}`)}</span>
                </div>
              </div>
              <div className={sx(['flex', 'space-x-1', 'ml-2'])}>
                {task.status !== 'completed' && (
                  <Button
                    variant="destructive"
                    size="small"
                    className={sx(['px-2', 'py-1', 'text-xs', 'bg.error', 'hover:bg.error/80', 'text.text-inverse', 'rounded'])}
                    onClick={() => onTaskCancel?.(task.id)}
                  >
                    {t('task.action.cancel')}
                  </Button>
                )}
                {task.status === 'error' && (
                  <Button
                    variant="primary"
                    size="small"
                    className={sx(['px-2', 'py-1', 'text-xs', 'bg.accent', 'hover:bg.accent/80', 'text.text-inverse', 'rounded'])}
                    onClick={() => onTaskRetry?.(task.id)}
                  >
                    {t('task.action.retry')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={sx(['text-xs', 'text.text-secondary', 'text-center', 'py-4'])}>
          {t('task-list.no-tasks')}
        </div>
      )}
    </div>
  );
};