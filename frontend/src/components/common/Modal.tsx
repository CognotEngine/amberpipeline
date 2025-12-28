import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { sx } from '@/themes/themeUtils';
import { cn } from '@/lib/utils';
import { injectModalStyles } from './Modal.styles';

/**
 * 模态框尺寸类型
 */
export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';

/**
 * 模态框动画类型
 */
export type ModalAnimation = 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'none';

export interface ModalProps {
  /** 是否显示模态框 */
  visible: boolean;
  /** 模态框标题 */
  title?: string;
  /** 是否显示关闭按钮 */
  showClose?: boolean;
  /** 是否点击遮罩层关闭 */
  closeOnClickOverlay?: boolean;
  /** 是否按ESC键关闭 */
  closeOnEsc?: boolean;
  /** 关闭事件处理函数 */
  onClose?: () => void;
  /** 额外的CSS类名 */
  className?: string;
  /** 子元素 */
  children?: React.ReactNode;
  /** 底部内容 */
  footer?: React.ReactNode;
  /** 模态框尺寸 */
  size?: ModalSize;
  /** 是否垂直居中 */
  centered?: boolean;
  /** 是否可拖拽 */
  draggable?: boolean;
  /** 是否可调整大小 */
  resizable?: boolean;
  /** 自定义头部内边距 */
  headerPadding?: string;
  /** 自定义内容内边距 */
  contentPadding?: string;
  /** 自定义底部内边距 */
  footerPadding?: string;
  /** 打开动画 */
  openAnimation?: ModalAnimation;
  /** 关闭动画 */
  closeAnimation?: ModalAnimation;
  /** 动画持续时间（毫秒） */
  animationDuration?: number;
  /** 模态框层级 */
  zIndex?: number;
  /** 是否允许内容滚动 */
  scrollable?: boolean;
  /** 内容最大高度 */
  maxHeight?: string;
  /** ARIA标签 */
  ariaLabel?: string;
  /** ARIA描述 */
  ariaDescribedBy?: string;
}

/**
 * 模态框组件
 * 功能：提供高度可自定义的模态框，支持多种尺寸、动画、拖拽、键盘快捷键等功能
 */
export const Modal: React.FC<ModalProps> = ({
  visible,
  title = '设置',
  showClose = true,
  closeOnClickOverlay = true,
  closeOnEsc = true,
  onClose,
  className,
  children,
  footer,
  size = 'medium',
  centered = true,
  draggable = false,
  resizable = false,
  headerPadding = 'p-4',
  contentPadding = 'p-6',
  footerPadding = 'p-4',
  openAnimation = 'fadeIn',
  animationDuration = 200,
  zIndex = 50,
  scrollable = true,
  maxHeight = '80vh',
  ariaLabel,
  ariaDescribedBy
}) => {
  // 注入样式
  useEffect(() => {
    injectModalStyles();
  }, []);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<HTMLButtonElement>(null);
  const initialFocusRef = useRef<Element | null>(null);

  // 处理关闭事件
  const handleClose = () => {
    onClose?.();
  };

  // 处理遮罩层点击
  const handleOverlayClick = () => {
    if (closeOnClickOverlay) {
      handleClose();
    }
  };

  // 处理内容区域点击，阻止冒泡
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 处理键盘事件
  const handleKeyDown = (e: KeyboardEvent) => {
    if (closeOnEsc && e.key === 'Escape') {
      handleClose();
    }
    // Tab键导航
    if (e.key === 'Tab') {
      handleTabNavigation(e);
    }
  };

  // 处理Tab键导航
  const handleTabNavigation = (e: KeyboardEvent) => {
    if (!modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])' 
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  // 处理拖拽开始
  const handleDragStart = (e: React.MouseEvent) => {
    if (!draggable) return;
    
    setIsDragging(true);
    const rect = modalRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // 处理拖拽移动
  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 处理调整大小开始
  const handleResizeStart = () => {
    if (!resizable) return;
    setIsResizing(true);
  };

  // 处理调整大小结束
  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // 焦点管理
  useEffect(() => {
    if (visible) {
      // 保存当前焦点元素
      initialFocusRef.current = document.activeElement;
      
      // 聚焦到模态框内的第一个可聚焦元素
      const focusableElement = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])' 
      ) as HTMLElement;
      
      if (focusableElement) {
        focusableElement.focus();
      }
      
      // 添加键盘事件监听
      document.addEventListener('keydown', handleKeyDown);
      
      // 添加拖拽事件监听
      if (draggable) {
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
      }
      
      // 添加调整大小事件监听
      if (resizable) {
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', handleResizeEnd);
      }
    } else {
      // 恢复之前的焦点
      if (initialFocusRef.current) {
        (initialFocusRef.current as HTMLElement).focus();
      }
      
      // 移除事件监听
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    }
    
    return () => {
      // 清理事件监听
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [visible, closeOnEsc, draggable, resizable]);

  // 处理调整大小移动
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing || !modalRef.current) return;
    
    const rect = modalRef.current.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    const newHeight = e.clientY - rect.top;
    
    if (newWidth > 300 && newHeight > 200) {
      modalRef.current.style.width = `${newWidth}px`;
      modalRef.current.style.height = `${newHeight}px`;
    }
  };

  // 获取尺寸相关的类名
  const getSizeClass = () => {
    const sizeClasses = {
      small: 'max-w-sm',
      medium: 'max-w-md',
      large: 'max-w-2xl',
      fullscreen: 'max-w-full max-h-full w-full h-full rounded-none'
    };
    return sizeClasses[size] || 'max-w-md';
  };

  // 获取动画相关的类名
  const getAnimationClass = () => {
    return openAnimation === 'none' ? '' : `animate-${openAnimation}`;
  };

  // 如果不可见，返回null
  if (!visible) {
    return null;
  }

  return (
    <div 
      className={cn(
        sx([`fixed inset-0 z-${zIndex} flex items-center justify-center bg-black/50`]),
        getAnimationClass(),
        className
      )}
      onClick={handleOverlayClick}
      style={{
        animationDuration: `${animationDuration}ms`
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabel ? undefined : 'modal-title'}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
    >
      <div 
        ref={modalRef}
        className={cn(
          sx('bg-surface border border-border rounded-lg shadow-xl w-full'),
          getSizeClass(),
          centered ? 'flex flex-col' : '',
          scrollable ? 'overflow-hidden' : ''
        )}
        onClick={handleContentClick}
        style={{
          maxHeight,
          left: position.x > 0 ? `${position.x}px` : 'auto',
          top: position.y > 0 ? `${position.y}px` : 'auto',
          position: draggable ? 'absolute' : 'relative',
          animationDuration: `${animationDuration}ms`
        }}
        tabIndex={-1}
      >
        {/* 调整大小手柄 */}
        {resizable && (
          <div 
            className="absolute bottom-0 right-0 w-4 h-4 bg-accent cursor-se-resize"
            onMouseDown={handleResizeStart}
          />
        )}
        
        {/* 模态框头部 */}
        <div 
          className={cn(
            sx('flex items-center justify-between border-b border-border'),
            headerPadding,
            draggable && 'cursor-move user-select-none'
          )}
          onMouseDown={handleDragStart}
        >
          <h3 
            id={ariaLabel ? undefined : 'modal-title'}
            className={sx('text-text-primary text-sm font-medium')}
          >
            {title}
          </h3>
          {showClose && (
            <button 
              ref={focusRef}
              className={sx('text-text-secondary hover:text-text-primary text-sm p-1 rounded-full hover:bg-hover transition-all')} 
              onClick={handleClose}
              aria-label="关闭"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        {/* 模态框内容 */}
        <div 
          className={cn(
            contentPadding,
            scrollable && 'overflow-y-auto',
            centered && 'flex-1'
          )}
        >
          {children}
        </div>
        
        {/* 模态框底部 */}
        {footer && (
          <div className={cn(
            sx('flex justify-end border-t border-border space-x-2'),
            footerPadding
          )}>
            {footer}
          </div>
        )}
        
        {/* 默认底部按钮 */}
        {!footer && (
          <div className={cn(
            sx('flex justify-end border-t border-border space-x-2'),
            footerPadding
          )}>
            <button 
              className={sx('px-4 py-2 text-sm text-text-primary bg-surface-elevated hover:bg-hover border rounded-lg transition-all')} 
              onClick={handleClose}
            >
              关闭
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
