/**
 * 动画组件封装
 * 功能：提供统一的动画效果应用接口，支持各种进入、退出和状态动画
 */
import React, { useEffect, useState, ReactNode } from 'react';
import { Animations } from '../../lib/animations';

// 定义动画类型
export type AnimationType = keyof typeof Animations.EnterAnimation;

export interface AnimatedProps {
  /** 子组件 */
  children: ReactNode;
  /** 动画类型 */
  type?: AnimationType;
  /** 是否激活动画 */
  animate?: boolean;
  /** 动画延迟时间（毫秒） */
  delay?: number;
  /** 动画持续时间（毫秒） */
  duration?: number;
  /** 自定义类名 */
  className?: string;
  /** 动画完成回调 */
  onAnimationComplete?: () => void;
  /** 初始是否可见 */
  initialVisible?: boolean;
}

/**
 * 动画组件
 * 用于为子组件添加各种动画效果
 */
export const Animated: React.FC<AnimatedProps> = ({
  children,
  type = 'FADE_IN',
  animate = true,
  delay = 0,
  duration,
  className = '',
  onAnimationComplete,
  initialVisible = false
}) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationClass = Animations.EnterAnimation[type];

  useEffect(() => {
    if (animate) {
      setIsAnimating(true);
      
      // 添加延迟后显示元素并激活动画
      const delayTimer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      // 动画完成后回调
      const durationTimer = setTimeout(() => {
        setIsAnimating(false);
        onAnimationComplete?.();
      }, (duration || 500) + delay);

      return () => {
        clearTimeout(delayTimer);
        clearTimeout(durationTimer);
      };
    }
  }, [animate, delay, duration, onAnimationComplete]);

  // 构建最终的类名
  const finalClassName = `${className} ${isVisible ? animationClass : ''} ${isAnimating ? 'opacity-100' : 'opacity-0'}`;

  return (
    <div className={finalClassName}>
      {children}
    </div>
  );
};

export default Animated;
