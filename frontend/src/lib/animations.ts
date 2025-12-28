/**
 * 语义化动画令牌和过渡工具
 * 提供统一的动画和过渡效果配置，确保应用中动画的一致性
 */

/**
 * 过渡时长枚举
 */
export const TransitionDuration = {
  FAST: 'duration-150',
  MEDIUM: 'duration-200',
  SLOW: 'duration-300',
  VERY_SLOW: 'duration-500',
};

/**
 * 过渡缓动函数枚举
 */
export const TransitionEasing = {
  EASE: 'ease',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  LINEAR: 'linear',
};

/**
 * 过渡属性枚举
 */
export const TransitionProperty = {
  ALL: 'transition-all',
  COLORS: 'transition-colors',
  OPACITY: 'transition-opacity',
  TRANSFORM: 'transition-transform',
  SHADOW: 'transition-shadow',
  BACKGROUND: 'transition-background',
};

/**
 * 语义化过渡效果组合
 * 用于不同场景的标准过渡配置
 */
export const Transition = {
  /** 基本过渡效果 - 中等速度 */
  BASE: `${TransitionProperty.ALL} ${TransitionDuration.MEDIUM} ${TransitionEasing.EASE_IN_OUT}`,
  
  /** 快速过渡 - 用于微交互 */
  FAST: `${TransitionProperty.ALL} ${TransitionDuration.FAST} ${TransitionEasing.EASE_IN_OUT}`,
  
  /** 慢速过渡 - 用于重要状态变化 */
  SLOW: `${TransitionProperty.ALL} ${TransitionDuration.SLOW} ${TransitionEasing.EASE_IN_OUT}`,
  
  /** 颜色变化过渡 */
  COLOR: `${TransitionProperty.COLORS} ${TransitionDuration.MEDIUM} ${TransitionEasing.EASE_IN_OUT}`,
  
  /** 透明度变化过渡 */
  OPACITY: `${TransitionProperty.OPACITY} ${TransitionDuration.MEDIUM} ${TransitionEasing.EASE_IN_OUT}`,
  
  /** 变换过渡 */
  TRANSFORM: `${TransitionProperty.TRANSFORM} ${TransitionDuration.MEDIUM} ${TransitionEasing.EASE_IN_OUT}`,
  
  /** 阴影过渡 */
  SHADOW: `${TransitionProperty.SHADOW} ${TransitionDuration.MEDIUM} ${TransitionEasing.EASE_IN_OUT}`,
  
  /** 背景变化过渡 */
  BACKGROUND: `${TransitionProperty.BACKGROUND} ${TransitionDuration.MEDIUM} ${TransitionEasing.EASE_IN_OUT}`,
};

/**
 * 动画效果枚举
 */
export const Animation = {
  /** 旋转动画 */
  SPIN: 'animate-spin',
  
  /** 脉冲动画 */
  PULSE: 'animate-pulse',
  
  /** 弹跳动画 */
  BOUNCE: 'animate-bounce',
  
  /** 闪烁动画 */
  BLINK: 'animate-blink',
  
  /** 摇摆动画 */
  WIGGLE: 'animate-wiggle',
};

/**
 * 进入动画类名
 */
export const EnterAnimation = {
  /** 淡入 */
  FADE_IN: 'animate-fadeIn',
  
  /** 上滑淡入 */
  SLIDE_UP: 'animate-slideUp',
  
  /** 下滑淡入 */
  SLIDE_DOWN: 'animate-slideDown',
  
  /** 左滑淡入 */
  SLIDE_LEFT: 'animate-slideLeft',
  
  /** 右滑淡入 */
  SLIDE_RIGHT: 'animate-slideRight',
  
  /** 缩放淡入 */
  SCALE_IN: 'animate-scaleIn',
  
  /** 淡入淡出容器 - 用于图像加载 */
  FADE_IN_CONTAINER: 'animate-fadeInContainer',
  
  /** 列表展开进入 - 用于列表项加入 */
  LIST_ENTER: 'animate-listEnter',
};

/**
 * 退出动画类名
 */
export const ExitAnimation = {
  /** 淡出 */
  FADE_OUT: 'animate-fadeOut',
  
  /** 下滑淡出 */
  SLIDE_DOWN: 'animate-slideDownOut',
  
  /** 上滑淡出 */
  SLIDE_UP: 'animate-slideUpOut',
  
  /** 右滑淡出 */
  SLIDE_RIGHT: 'animate-slideRightOut',
  
  /** 左滑淡出 */
  SLIDE_LEFT: 'animate-slideLeftOut',
  
  /** 缩放淡出 */
  SCALE_OUT: 'animate-scaleOut',
  
  /** 列表展开退出 - 用于列表项消失 */
  LIST_EXIT: 'animate-listExit',
};

/**
 * 条件动画工具函数
 * @param isActive 是否激活动画
 * @param animationClass 动画类名
 * @returns 动画类名字符串或空字符串
 */
export const conditionalAnimation = (
  isActive: boolean | undefined,
  animationClass: string
): string => {
  return isActive ? animationClass : '';
};

/**
 * 获取元素进入或退出动画类名
 * @param isEntering 是否进入
 * @param animationType 动画类型
 * @returns 动画类名字符串
 */
export const getAnimationClass = (
  isEntering: boolean,
  animationType?: keyof typeof EnterAnimation
): string => {
  if (!animationType) {
    return isEntering ? EnterAnimation.FADE_IN : ExitAnimation.FADE_OUT;
  }
  
  const animationMap: Record<string, string> = {
    [EnterAnimation.FADE_IN]: ExitAnimation.FADE_OUT,
    [EnterAnimation.SLIDE_UP]: ExitAnimation.SLIDE_DOWN,
    [EnterAnimation.SLIDE_DOWN]: ExitAnimation.SLIDE_UP,
    [EnterAnimation.SLIDE_LEFT]: ExitAnimation.SLIDE_RIGHT,
    [EnterAnimation.SLIDE_RIGHT]: ExitAnimation.SLIDE_LEFT,
    [EnterAnimation.SCALE_IN]: ExitAnimation.SCALE_OUT,
    [EnterAnimation.LIST_ENTER]: ExitAnimation.LIST_EXIT,
  };
  
  return isEntering ? animationType : animationMap[animationType] || ExitAnimation.FADE_OUT;
};

/**
 * 防抖动画工具函数
 * 用于避免频繁触发的动画效果
 * @param condition 触发条件
 * @param animationClass 动画类名
 * @returns 动画类名字符串或空字符串
 */
export const debouncedAnimation = (
  condition: boolean | undefined,
  animationClass: string
): string => {
  return condition ? animationClass : '';
};

/**
 * 组合多个动画类名
 * @param animations 动画类名数组
 * @returns 组合后的类名字符串
 */
export const combineAnimations = (...animations: string[]): string => {
  return animations.filter(Boolean).join(' ');
};

/**
 * 导出所有动画和过渡工具的集合
 */
export const Animations = {
  Duration: TransitionDuration,
  Easing: TransitionEasing,
  Property: TransitionProperty,
  Transition: Transition,
  Animation: Animation,
  EnterAnimation: EnterAnimation,
  ExitAnimation: ExitAnimation,
  conditional: conditionalAnimation,
  getClass: getAnimationClass,
  debounced: debouncedAnimation,
  combine: combineAnimations,
};

/**
 * 动画和过渡工具的默认导出
 */
export default Animations;