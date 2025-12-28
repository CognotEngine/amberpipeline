/**
 * 动画组件统一导出
 * 功能：统一导出所有动画组件和工具函数，提供一致的导入接口
 */

export { Animated } from './Animated';
export type { AnimatedProps, AnimationType } from './Animated';
export { AnimatedContainer } from './AnimatedContainer';
export type { AnimatedContainerProps } from './AnimatedContainer';
export { FadeIn } from './FadeIn';
export type { FadeInProps } from './FadeIn';

// 导出所有动画工具
export { Animations } from '../../lib/animations';
