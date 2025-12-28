/**
 * 动画容器组件
 * 功能：为子组件提供统一的进入和退出动画效果
 */
import React, { ReactNode } from 'react';
import { Animations } from '../../lib/animations';

// 定义动画容器属性类型
export interface AnimatedContainerProps {
  /** 子组件 */
  children: ReactNode;
  /** 动画类型 */
  animation?: keyof typeof Animations.EnterAnimation;
  /** 是否可见 */
  visible?: boolean;
  /** 动画延迟时间（毫秒） */
  delay?: number;
  /** 自定义类名 */
  className?: string;
  /** 动画完成回调 */
  onAnimationComplete?: () => void;
}

/**
 * 动画容器组件
 * 用于为子组件添加统一的进入和退出动画效果
 */
export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'FADE_IN',
  visible = true,
  delay = 0,
  className = '',
  onAnimationComplete
}) => {
  // 获取进入和退出动画类名
  const animationClass = visible 
    ? Animations.EnterAnimation[animation] 
    : Animations.ExitAnimation[animation as keyof typeof Animations.ExitAnimation] || Animations.ExitAnimation.FADE_OUT;

  // 处理动画完成事件
  const handleAnimationEnd = () => {
    onAnimationComplete?.();
  };

  // 构建最终的类名
  const finalClassName = `${className} ${animationClass} ${delay > 0 ? `delay-${delay}` : ''}`;

  return (
    <div 
      className={finalClassName}
      onAnimationEnd={handleAnimationEnd}
      style={delay > 0 ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};

export default AnimatedContainer;
