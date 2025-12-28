import * as React from 'react';
import { cn } from '@/lib/utils';
import { sx } from '@/themes/themeUtils';

export interface SemanticTooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  semantic?: string[];
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
}

/**
 * 语义化提示组件
 * 功能：提供符合主题样式的悬停提示，支持多种位置和延迟
 * 使用示例：
 * <SemanticTooltip content="这是一个提示" position="top">
 *   <button>悬停查看提示</button>
 * </SemanticTooltip>
 */
const SemanticTooltip = React.forwardRef<HTMLDivElement, SemanticTooltipProps>(
  ({ 
    className, 
    content,
    position = 'top',
    delay = 200,
    semantic = [],
    children,
    isOpen: controlledIsOpen,
    onOpenChange,
    ...props 
  }, ref) => {
    // 内部状态管理
    const [internalIsOpen, setInternalIsOpen] = React.useState(false);
    const [timer, setTimer] = React.useState<NodeJS.Timeout | null>(null);
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    // 确定是否使用受控模式
    const isControlled = controlledIsOpen !== undefined;
    const isVisible = isControlled ? controlledIsOpen : internalIsOpen;

    // 打开提示
    const openTooltip = () => {
      const newIsOpen = true;
      if (!isControlled) {
        setInternalIsOpen(newIsOpen);
      }
      onOpenChange?.(newIsOpen);
    };

    // 关闭提示
    const closeTooltip = () => {
      const newIsOpen = false;
      if (!isControlled) {
        setInternalIsOpen(newIsOpen);
      }
      onOpenChange?.(newIsOpen);
    };

    // 处理鼠标进入事件
    const handleMouseEnter = () => {
      if (timer) {
        clearTimeout(timer);
      }
      const newTimer = setTimeout(() => {
        openTooltip();
      }, delay);
      setTimer(newTimer);
    };

    // 处理鼠标离开事件
    const handleMouseLeave = () => {
      if (timer) {
        clearTimeout(timer);
        setTimer(null);
      }
      closeTooltip();
    };

    // 获取位置相关的样式
    const getPositionStyles = () => {
      switch (position) {
        case 'top':
          return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
        case 'bottom':
          return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
        case 'left':
          return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
        case 'right':
          return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
        default:
          return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      }
    };

    // 获取箭头样式
    const getArrowStyles = () => {
      switch (position) {
        case 'top':
          return 'top-full left-1/2 transform -translate-x-1/2 -mt-1';
        case 'bottom':
          return 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1';
        case 'left':
          return 'left-full top-1/2 transform -translate-y-1/2 -ml-1';
        case 'right':
          return 'right-full top-1/2 transform -translate-y-1/2 -mr-1';
        default:
          return 'top-full left-1/2 transform -translate-x-1/2 -mt-1';
      }
    };

    // 合并所有样式
    const tooltipStyles = sx(
      [...semantic, 'bg.elevated text.textPrimary px-3 py-1.5 text-sm font-medium shadow-lg z-50 pointer-events-none opacity-0 invisible transition-all duration-200 ease-in-out'],
      {
        'absolute': true,
        'opacity-100 visible': isVisible,
      },
      getPositionStyles()
    );

    // 箭头样式
    const arrowStyles = sx(
      ['absolute w-2 h-2 bg.elevated transform rotate-45'],
      undefined,
      getArrowStyles()
    );

    return (
      <div
        ref={ref}
        className={cn('relative inline-block', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
        {isVisible && (
          <>
            <div ref={tooltipRef} className={tooltipStyles} role="tooltip">
              {content}
            </div>
            <div className={arrowStyles} />
          </>
        )}
      </div>
    );
  }
);
SemanticTooltip.displayName = 'SemanticTooltip';

export { SemanticTooltip };
