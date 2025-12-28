/**
 * 淡入动画组件
 * 功能：为子组件提供简单的淡入动画效果
 */
import React, { ReactNode } from 'react';
import { Animations } from '../../lib/animations';

// 定义淡入动画属性类型
export interface FadeInProps {
  /** 子组件 */
  children: ReactNode;
  /** 是否可见 */
  visible?: boolean;
  /** 动画延迟时间（毫秒） */
  delay?: number;
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 自定义类名 */
  className?: string;
  /** 动画完成回调 */
  onAnimationComplete?: () => void;
}

/**
 * 淡入动画组件
 * 用于为子组件添加简单的淡入动画效果
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  visible = true,
  delay = 0,
  duration,
  className = '',
  onAnimationComplete
}) => {
  // 处理动画完成事件
  const handleAnimationEnd = () => {
    onAnimationComplete?.();
  };

  // 构建最终的类名
  const finalClassName = `${className} ${visible ? Animations.EnterAnimation.FADE_IN : Animations.ExitAnimation.FADE_OUT}`;

  return (
    <div 
      className={finalClassName}
      onAnimationEnd={handleAnimationEnd}
      style={{
        ...(delay > 0 ? { animationDelay: `${delay}ms` } : undefined),
        ...(duration ? { animationDuration: `${duration}ms` } : undefined)
      }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
