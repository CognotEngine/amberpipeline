import React, { useRef } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Circle, Bone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../../../../components/ui';
import { sx } from '../../../../themes/themeUtils';

// 定义Tab接口
interface Tab {
  id: string;
  title: string;
  mode: 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'animation';
  content: any;
}

interface TabSystemProps {
  tabs: Tab[];
  activeTabId: string;
  currentMode: 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'animation';
  onTabCreate?: () => void;
  onTabClose?: (tabId: string) => void;
  onTabSelect?: (tabId: string) => void;
  onModeChange?: (mode: 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'animation') => void;
}

/**
 * 标签系统组件
 * 功能：管理多个标签页，支持滚动、关闭、模式切换等功能
 */
export const TabSystem: React.FC<TabSystemProps> = ({
  tabs,
  activeTabId,
  onTabCreate,
  onTabClose,
  onTabSelect
}) => {
  const tabContainerRef = useRef<HTMLDivElement>(null);

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
  };

  /**
   * 选择标签页
   */
  const handleSelectTab = (tabId: string) => {
    onTabSelect?.(tabId);
  };

  /**
   * 获取模式对应的图标
   */
  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'precision-cut':
        return 'sam';
      case 'character-layer':
        return 'layer';
      case 'skeleton-binding':
        return 'skeleton';
      default:
        return 'unknown';
    }
  };

  /**
   * 获取模式对应的颜色
   */
  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'precision-cut':
        return 'bg-accent/20 text-accent';
      case 'character-layer':
        return 'bg-info/20 text-info';
      case 'skeleton-binding':
        return 'bg-warning/20 text-warning';
      default:
        return 'bg-text-tertiary/20 text-text-tertiary';
    }
  };

  /**
   * 获取模式对应的中文名称
   */
  const getModeName = (mode: string) => {
    switch (mode) {
      case 'precision-cut':
        return '背景分层';
      case 'character-layer':
        return '部位拆解';
      case 'skeleton-binding':
        return '骨骼绑定';
      case 'animation':
        return '骨骼动画';
      default:
        return '未知';
    }
  };

  /**
   * 获取活动标签页
   * 暂时注释掉未使用的变量
   */
  // const activeTab = tabs.find(tab => tab.id === activeTabId) || null;

  return (
    <div className={sx(['tab-system', 'bg.surface', 'border-b', 'border.border', 'flex', 'items-center', 'px-2', 'h-10', 'overflow-hidden'])}>
      {/* 标签页滚动控制按钮 */}
      <Button
        variant="secondary"
        size="small"
        className={sx(['w-8', 'h-8', 'flex', 'items-center', 'justify-center', 'text.text-tertiary', 'hover:text.accent', 'transition-colors'])}
        onClick={() => scrollTabs('left')}
      >
        <ChevronLeft size={16} />
      </Button>
      
      <Button
        variant="secondary"
        size="small"
        className={sx(['w-8', 'h-8', 'flex', 'items-center', 'justify-center', 'text.text-tertiary', 'hover:text.accent', 'transition-colors'])}
        onClick={() => scrollTabs('right')}
      >
        <ChevronRight size={16} />
      </Button>
      
      {/* 标签页容器 */}
      <div ref={tabContainerRef} className={sx(['flex-1', 'flex', 'space-x-1', 'overflow-x-auto', 'whitespace-nowrap', 'scrollbar-hide'])}>
        {tabs.map((tab) => (
          <div 
            key={tab.id}
            className={cn(
              sx(['flex', 'items-center', 'px-4', 'py-2', 'cursor-pointer', 'transition-all', 'duration-300', 'relative', 'group']),
              tab.id === activeTabId 
                ? sx(['text.accent', 'bg.surface-elevated']) 
                : sx(['text.text-secondary', 'hover:text.text-primary', 'hover:bg.surface-elevated/50'])
            )}
            onClick={() => handleSelectTab(tab.id)}
          >
            {/* 模式图标指示器 */}
            {getModeIcon(tab.mode) === 'sam' && (
              <div className={sx(['mr-2'])}>
                <Circle className={sx(['w-2', 'h-2', 'fill.accent'])} />
              </div>
            )}
            {getModeIcon(tab.mode) === 'skeleton' && (
              <div className={sx(['mr-2'])}>
                <Bone className={sx(['w-3', 'h-3', 'text.warning'])} />
              </div>
            )}
            
            {/* 标签页标题 */}
            <span className={sx(['text-sm', 'truncate', 'max-w-[150px]', 'hover:bg.hover', 'hover:bg-opacity-30', 'rounded-lg', 'px-2', 'py-0.5', 'transition-colors', 'text.text-primary'])}>
              {getModeName(tab.mode)}
            </span>
            
            {/* 关闭按钮 - 只在鼠标悬浮时显示 */}
            <Button
              variant="secondary"
              size="small"
              className={sx(['ml-2', 'w-5', 'h-5', 'flex', 'items-center', 'justify-center', 'rounded-full', 'opacity-0', 'group-hover:opacity-100', 'hover:bg.hover', 'transition-all', 'duration-200'])}
              onClick={(e) => handleCloseTab(tab.id, e)}
              title="关闭标签页"
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
        className={sx(['w-8', 'h-8', 'flex', 'items-center', 'justify-center', 'text.text-tertiary', 'hover:text.accent', 'hover:bg.surface-elevated', 'rounded', 'transition-colors', 'ml-2'])}
        onClick={handleCreateNewTab}
        title="新建标签页"
      >
        <Plus size={16} />
      </Button>
    </div>
  );
};