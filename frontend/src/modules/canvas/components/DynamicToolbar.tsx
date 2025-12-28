import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button, Card } from '@/components/ui';
import { useTranslation } from '../../../i18n';
import { useCanvasContext } from '../composables/CanvasContext';
import { sx } from '@/themes/themeUtils';
import type { ToolDefinition } from '../composables/useTools';

/**
 * 动态工具栏组件
 * 根据当前画布阶段显示相应的工具
 */
interface DynamicToolbarProps {
  /** 所有可用工具列表 */
  tools: ToolDefinition[];
  /** 是否显示工具栏 */
  visible?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 定位位置：top-left, top-right, bottom-left, bottom-right */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** 只显示特定阶段的工具 */
  filterStage?: string;
  /** 自定义工具选择处理函数 */
  onToolSelect?: (toolId: string) => void;
}

export const DynamicToolbar: React.FC<DynamicToolbarProps> = ({
  tools,
  visible = true,
  className = '',
  position = 'top-left',
  filterStage,
  onToolSelect
}) => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();

  // 过滤显示的工具
  const filteredTools = React.useMemo(() => {
    const currentStage = filterStage || state.activeStage;
    return tools.filter(tool => 
      !tool.stage || tool.stage === currentStage
    );
  }, [tools, filterStage, state.activeStage]);

  // 处理工具选择
  const handleToolSelect = (toolId: string) => {
    if (onToolSelect) {
      onToolSelect(toolId);
    } else {
      // 默认行为：设置为活跃工具
      dispatch({ type: 'SET_ACTIVE_TOOL', payload: toolId });
    }

    // 执行工具自定义操作
    const selectedTool = tools.find(tool => tool.id === toolId);
    if (selectedTool?.action) {
      selectedTool.action();
    }
  };

  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查是否在输入框等元素中按下按键
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // 查找匹配的工具
      const matchedTool = filteredTools.find(tool => 
        tool.shortcut.toLowerCase() === e.key.toLowerCase()
      );

      if (matchedTool) {
        e.preventDefault();
        handleToolSelect(matchedTool.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredTools]);

  // 如果不可见或没有工具，不渲染组件
  if (!visible || filteredTools.length === 0) return null;

  // 位置样式映射
  const positionClass = {
    'top-left': sx(['top-4', 'left-4']),
    'top-right': sx(['top-4', 'right-4']),
    'bottom-left': sx(['bottom-4', 'left-4']),
    'bottom-right': sx(['bottom-4', 'right-4'])
  };

  return (
    <Card 
      className={cn(
        sx([
          'absolute', 
          'bg.surface', 
          'border', 
          'border.border', 
          'rounded-lg', 
          'p-2', 
          'space-y-2', 
          'shadow-md', 
          'z-20',
          'transition-all',
          'duration-200',
          'hover:shadow-lg'
        ]),
        positionClass[position],
        className
      )}
    >
      <div className={sx(['text-xs', 'text.text-secondary', 'mb-2'])}>{t('common.tools')}</div>
      {filteredTools.map((tool) => {
        const IconComponent = tool.icon;
        return (
          <Button
            key={tool.id}
            variant={state.activeTool === tool.id ? 'primary' : 'secondary'}
            size="small"
            className={sx([
              'w-8', 
              'h-8', 
              'rounded', 
              'hover:bg.hover', 
              'transition-all', 
              'duration-200', 
              'transform', 
              'hover:scale-105'
            ])}
            onClick={() => handleToolSelect(tool.id)}
            title={`${tool.name} ${tool.shortcut ? `(${tool.shortcut})` : ''}`}
          >
            <IconComponent size={18} className="text-current" />
          </Button>
        );
      })}
    </Card>
  );
};

export default DynamicToolbar;