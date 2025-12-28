/**
 * 语义化属性面板组件
 * 功能：根据当前选中的上下文动态切换功能组件
 */
import React, { ReactNode } from 'react';
import { sx, useComponentStyle } from '@/themes/themeUtils';

interface SemanticPropertyPanelProps {
  /** 面板标题 */
  title?: string;
  /** 面板内容 */
  children: ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 面板宽度 */
  width?: string;
}

/**
 * 语义化属性面板组件
 * 提供统一的属性面板样式和布局
 */
export const SemanticPropertyPanel: React.FC<SemanticPropertyPanelProps> = ({
  title,
  children,
  className = '',
  width = 'w-80',
}) => {
  const panelStyles = useComponentStyle({ component: 'panel', variant: 'property' });
  
  return (
    <div 
      className={sx(
        [
          panelStyles,
          width,
          'h-full',
          'bg-surface',
          'border-l',
          'border-border',
          'p-4',
          'overflow-y-auto',
          className
        ]
      )}
    >
      {title && (
        <h2 className={sx([
          'text-lg',
          'font-semibold',
          'mb-4',
          'text-text-primary'
        ])}>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

/**
 * 属性面板分组组件
 * 用于在属性面板中创建分组
 */
export const PropertyGroup: React.FC<{
  title: string;
  children: ReactNode;
  className?: string;
}> = ({ title, children, className = '' }) => {
  return (
    <div className={sx(['mb-4', className])}>
      <h3 className={sx([
        'text-sm',
        'font-medium',
        'mb-2',
        'text-text-secondary',
        'border-b',
        'border-border',
        'pb-1'
      ])}>
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
};

/**
 * 属性面板字段组件
 * 用于在属性面板中创建字段
 */
export const PropertyField: React.FC<{
  label: string;
  children: ReactNode;
  className?: string;
  labelClassName?: string;
}> = ({ label, children, className = '', labelClassName = '' }) => {
  return (
    <div className={sx(['mb-3', className])}>
      {label && (
        <label className={sx([
          'text-xs',
          'text-text-tertiary',
          'mb-1',
          'block',
          labelClassName
        ])}>
          {label}
        </label>
      )}
      <div>{children}</div>
    </div>
  );
};