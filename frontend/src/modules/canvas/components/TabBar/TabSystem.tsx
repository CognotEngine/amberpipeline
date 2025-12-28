import React, { useRef, useState } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Circle, Bone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Input } from '../../../../components/ui';
import { sx } from '../../../../themes/themeUtils';
import { useTranslation } from '../../../../i18n';

// 定义Tab接口
export interface Tab {
  id: string;
  title: string;
  mode: 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'animation';
  content: any;
}

// 标签系统配置选项
interface TabSystemOptions {
  /** 是否显示滚动按钮 */
  showScrollButtons?: boolean;
  /** 是否允许标签页重命名 */
  allowRename?: boolean;
  /** 标签页最大宽度 */
  maxTabWidth?: number;
  /** 标签页最小宽度 */
  minTabWidth?: number;
}

// 标签系统属性接口
export interface TabSystemProps {
  /** 标签页列表 */
  tabs: Tab[];
  /** 当前激活的标签页ID */
  activeTabId: string;
  /** 标签系统配置选项 */
  options?: TabSystemOptions;
  /** 自定义样式 */
  className?: string;
  /** 标签页创建回调 */
  onTabCreate?: () => void;
  /** 标签页关闭回调 */
  onTabClose?: (tabId: string) => void;
  /** 标签页选择回调 */
  onTabSelect?: (tabId: string) => void;
  /** 标签页重命名回调 */
  onTabRename?: (tabId: string, newTitle: string) => void;
}

/**
 * 标签系统组件
 * 功能：管理多个标签页，支持滚动、关闭、重命名、模式切换等功能
 * 特点：可复用、支持自定义样式和事件回调、响应式设计
 * 
 * @example
 * ```tsx
 * import { TabSystem } from './components/TabBar/TabSystem';
 * 
 * const tabs = [
 *   { id: 'tab-1', title: '文档1', mode: 'precision-cut', content: {} },
 *   { id: 'tab-2', title: '文档2', mode: 'character-layer', content: {} }
 * ];
 * 
 * const App = () => {
 *   const [activeTabId, setActiveTabId] = useState('tab-1');
 *   
 *   const handleTabCreate = () => {
 *     // 创建新标签页逻辑
 *   };
 *   
 *   const handleTabClose = (tabId: string) => {
 *     // 关闭标签页逻辑
 *   };
 *   
 *   const handleTabSelect = (tabId: string) => {
 *     setActiveTabId(tabId);
 *   };
 *   
 *   const handleTabRename = (tabId: string, newTitle: string) => {
 *     // 重命名标签页逻辑
 *   };
 *   
 *   return (
 *     <TabSystem
 *       tabs={tabs}
 *       activeTabId={activeTabId}
 *       currentMode="precision-cut"
 *       options={{
 *         showScrollButtons: true,
 *         allowRename: true,
 *         maxTabWidth: 200,
 *         minTabWidth: 80
 *       }}
 *       className="custom-tab-system"
 *       onTabCreate={handleTabCreate}
 *       onTabClose={handleTabClose}
 *       onTabSelect={handleTabSelect}
 *       onTabRename={handleTabRename}
 *     />
 *   );
 * };
 * ```
 */
export const TabSystem: React.FC<TabSystemProps> = ({
  tabs,
  activeTabId,
  options = {},
  className,
  onTabCreate,
  onTabClose,
  onTabSelect,
  onTabRename
}) => {
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>('');
  const { t } = useTranslation();

  // 解析选项，设置默认值
  const {
    showScrollButtons = true,
    allowRename = true,
    maxTabWidth = 200,
    minTabWidth = 80
  } = options;

  /**
   * 滚动标签页列表
   */
  const scrollTabs = (direction: 'left' | 'right') => {
    if (!tabContainerRef.current) return;
    
    const scrollAmount = 200;
    const currentScroll = tabContainerRef.current.scrollLeft;
    
    tabContainerRef.current.scrollTo({
      left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  };

  /**
   * 新建标签页
   */
  const handleCreateNewTab = () => {
    onTabCreate?.();
  };

  /**
   * 关闭标签页
   */
  const handleCloseTab = (tabId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onTabClose?.(tabId);
    
    // 如果关闭的是正在编辑的标签页，取消编辑
    if (editingTabId === tabId) {
      setEditingTabId(null);
    }
  };

  /**
   * 选择标签页
   */
  const handleSelectTab = (tabId: string) => {
    onTabSelect?.(tabId);
  };

  /**
   * 处理鼠标滚轮事件，切换标签页
   */
  const handleWheel = (event: React.WheelEvent) => {
    // 阻止默认滚动行为
    event.preventDefault();
    
    // 获取当前激活标签页的索引
    const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
    if (currentIndex === -1) return;
    
    // 计算下一个要激活的标签页索引 - 移除首尾循环
    let nextIndex;
    if (event.deltaY > 0) {
      // 向下滚动，切换到下一个标签页，如果已经是最后一个则不切换
      nextIndex = Math.min(currentIndex + 1, tabs.length - 1);
    } else {
      // 向上滚动，切换到上一个标签页，如果已经是第一个则不切换
      nextIndex = Math.max(currentIndex - 1, 0);
    }
    
    // 只有当索引发生变化时才切换标签页
    if (nextIndex !== currentIndex) {
      handleSelectTab(tabs[nextIndex].id);
    }
  };

  /**
   * 开始编辑标签页标题
   */
  const handleStartRename = (tabId: string, currentTitle: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!allowRename) return;
    
    setEditingTabId(tabId);
    setEditingTitle(currentTitle);
    
    // 使用setTimeout确保输入框在DOM中渲染后再聚焦
    setTimeout(() => {
      const inputElement = document.getElementById(`tab-title-input-${tabId}`) as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
        inputElement.select();
      }
    }, 0);
  };

  /**
   * 完成编辑标签页标题
   */
  const handleFinishRename = () => {
    if (editingTabId && editingTitle.trim() && onTabRename) {
      onTabRename(editingTabId, editingTitle.trim());
    }
    setEditingTabId(null);
  };

  /**
   * 处理编辑输入框的键盘事件
   */
  const handleRenameKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleFinishRename();
    } else if (event.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  /**
   * 获取模式对应的图标组件
   */
  const getModeIconComponent = (mode: string) => {
    switch (mode) {
      case 'precision-cut':
        return <Circle className={sx(['w-2', 'h-2', 'fill.accent'])} />;
      case 'character-layer':
        return <div className={sx(['w-2', 'h-2', 'bg-info', 'rounded-full'])} />;
      case 'skeleton-binding':
        return <Bone className={sx(['w-3', 'h-3', 'text.warning'])} />;
      case 'animation':
        return <div className={sx(['w-2', 'h-2', 'bg-success', 'rounded-full'])} />;
      default:
        return <div className={sx(['w-2', 'h-2', 'bg.text-tertiary', 'rounded-full'])} />;
    }
  };

  return (
    <div className={cn(
      sx(['tab-system', 'bg.surface', 'border-b', 'border.border', 'flex', 'items-center', 'px-2', 'h-10', 'overflow-hidden']),
      className
    )}>
      {/* 标签页滚动控制按钮 */}
      {showScrollButtons && (
        <>
          <Button
            variant="secondary"
            size="small"
            className={sx(['w-8', 'h-8', 'flex', 'items-center', 'justify-center', 'text.text-tertiary', 'hover:text.accent', 'transition-colors'])}
            onClick={() => scrollTabs('left')}
            title={t('common.scrollLeft')}
          >
            <ChevronLeft size={16} />
          </Button>
          
          <Button
            variant="secondary"
            size="small"
            className={sx(['w-8', 'h-8', 'flex', 'items-center', 'justify-center', 'text.text-tertiary', 'hover:text.accent', 'transition-colors'])}
            onClick={() => scrollTabs('right')}
            title={t('common.scrollRight')}
          >
            <ChevronRight size={16} />
          </Button>
        </>
      )}
      
      {/* 标签页容器 */}
      <div ref={tabContainerRef} className={sx(['flex-1', 'flex', 'space-x-1', 'overflow-x-auto', 'overflow-y-hidden', 'whitespace-nowrap', 'scrollbar-hide'])} onWheel={handleWheel}>
        {tabs.map((tab) => (
          <div 
            key={tab.id}
            className={cn(
              sx(['flex', 'items-center', 'px-3', 'py-1.5', 'cursor-pointer', 'transition-all', 'duration-200', 'relative', 'group', 'rounded-t-md', 'min-w-[80px]', 'max-w-[200px]']),
              tab.id === activeTabId 
                ? sx(['bg.background', 'text.text-primary', 'border-x', 'border-t', 'border.border', '-mb-px', 'shadow-sm']) 
                : sx(['bg.surface-elevated', 'text.text-secondary', 'hover:bg.hover']),
              `min-w-[${minTabWidth}px]`,
              `max-w-[${maxTabWidth}px]`
            )}
            onClick={() => handleSelectTab(tab.id)}
          >
            {/* 模式图标指示器 */}
            <div className={sx(['mr-2', 'flex', 'items-center', 'justify-center'])}>
              {getModeIconComponent(tab.mode)}
            </div>
            
            {/* 标签页标题 - 支持编辑 */}
            {editingTabId === tab.id ? (
              <Input
                id={`tab-title-input-${tab.id}`}
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleFinishRename}
                onKeyDown={handleRenameKeyDown}
                className={cn(
                  sx(['w-full', 'text-sm', 'px-1', 'py-0.5', 'border-none', 'bg.transparent', 'outline-none', 'focus:ring-1', 'focus:ring-accent']),
                  'min-w-[60px]'
                )}
                autoFocus
              />
            ) : (
              <button
                className={sx(['text-sm', 'truncate', 'max-w-full', 'hover:bg.hover', 'hover:bg-opacity-30', 'rounded-lg', 'px-2', 'py-0.5', 'transition-colors', 'text.text-primary', 'focus:outline-none', 'focus:ring-1', 'focus:ring-accent'])}
                onDoubleClick={(e) => handleStartRename(tab.id, tab.title, e)}
                title={allowRename ? t('common.doubleClickToRename') : ''}
              >
                {tab.title}
              </button>
            )}
            
            {/* 关闭按钮 - 仅在悬停时显示 */}
            <Button
              variant="secondary"
              size="small"
              className={cn(
                sx(['w-4', 'h-4', 'flex', 'items-center', 'justify-center', 'rounded-full', 'text.text-tertiary', 'hover:bg.error', 'hover:text.white', 'transition-all', 'duration-200', 'transform', 'hover:scale-110']),
                'opacity-0 group-hover:opacity-100'
              )}
              onClick={(e) => handleCloseTab(tab.id, e)}
              title={t('common.close')}
            >
              <X size={12} />
            </Button>
          </div>
        ))}
      </div>
      
      {/* 新建标签页按钮 */}
      <Button
        variant="secondary"
        size="small"
        className={sx(['ml-2', 'w-8', 'h-8', 'flex', 'items-center', 'justify-center', 'text.text-secondary', 'hover:bg.hover', 'hover:text.text-primary', 'transition-colors', 'rounded-full'])}
        onClick={handleCreateNewTab}
        title={t('common.add')}
      >
        <Plus size={16} />
      </Button>
    </div>
  );
};