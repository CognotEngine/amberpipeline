import { getCurrentTheme } from './themeManager';
import { cn } from '@/lib/utils';
import type { ThemeConfig } from './types';

/**
 * 获取当前主题配置
 * @returns 当前主题配置对象
 */
export const useCurrentTheme = (): ThemeConfig => {
  return getCurrentTheme() || {
    name: '深色主题',
    id: 'modern-dark',
    isDark: true,
    colors: {
      background: '#0A0A0A',
      surface: '#151515',
      surfaceElevated: '#1E1E1E',
      border: '#2D2D2D',
      borderLight: '#3A3A3A',
      borderDark: '#1A1A1A',
      textPrimary: '#F8F9FA',
      textSecondary: '#D1D5DB',
      textTertiary: '#9CA3AF',
      textInverse: '#111827',
      accent: '#00C896',
      accentLight: '#33D1A0',
      accentDark: '#00A87C',
      success: '#00C896',
      warning: '#FBBF24',
      error: '#EF4444',
      info: '#3B82F6',
      disabled: '#4B5563',
      hover: '#262626',
      active: '#333333'
    },
    typography: {
      fontFamily: 'Inter, sans-serif'
    }
  };
};

/**
 * 语义化主题样式类名映射
 * 提供直观的语义化标记，自动映射到当前主题的具体样式
 */
export const semanticClasses = {
  // 布局容器
  container: 'max-w-[1440px] mx-auto px-4',
  
  // 背景色
  bg: {
    primary: 'bg-background',
    surface: 'bg-surface',
    elevated: 'bg-surface-elevated',
    accent: 'bg-accent',
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    info: 'bg-info'
  },
  
  // 文本色
  text: {
    primary: 'text-text-primary',
    secondary: 'text-text-secondary',
    tertiary: 'text-text-tertiary',
    inverse: 'text-text-inverse',
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-info'
  },
  
  // 边框
  border: {
    default: 'border border-border',
    light: 'border border-border-light',
    dark: 'border border-border-dark',
    accent: 'border border-accent',
    rounded: 'rounded-md',
    roundedLg: 'rounded-lg',
    roundedSm: 'rounded-sm'
  },
  
  // 间距
  spacing: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  },
  
  // 状态效果
  state: {
    hover: 'hover:bg-hover transition-all',
    active: 'active:bg-active transition-all',
    focus: 'focus:outline-none focus:ring-2 focus:ring-accent/50',
    disabled: 'opacity-70 cursor-not-allowed',
    transition: 'transition-all duration-200 ease-in-out'
  },
  
  // 阴影
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  },
  
  // 排版
  typography: {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-bold',
    h3: 'text-xl font-semibold',
    h4: 'text-lg font-medium',
    body: 'text-base',
    small: 'text-sm',
    caption: 'text-xs'
  }
};

/**
 * 组件样式生成器
 * 根据组件类型、变体和状态自动生成主题样式类名
 */
export const getComponentStyle = ({
  component,
  variant = 'default',
  size = 'medium',
  state = ''
}: {
  component: string;
  variant?: string;
  size?: string;
  state?: string;
}): string => {
  const theme = getCurrentTheme();
  const componentConfig = theme?.components?.[component] || {};
  
  // 基础样式
  let styles: string[] = [];
  
  // 添加组件通用样式
  if (componentConfig.padding) {
    styles.push(componentConfig.padding[size] || componentConfig.padding.medium || '');
  }
  
  if (componentConfig.borderRadius) {
    styles.push(`rounded-${componentConfig.borderRadius}`);
  }
  
  if (componentConfig.fontWeight) {
    styles.push(`font-${componentConfig.fontWeight}`);
  }
  
  // 添加变体样式
  const variantStyles = componentConfig[variant as keyof typeof componentConfig] as any;
  if (variantStyles) {
    if (variantStyles.backgroundColor) {
      styles.push(`bg-[${variantStyles.backgroundColor}]`);
    }
    if (variantStyles.textColor) {
      styles.push(`text-[${variantStyles.textColor}]`);
    }
    if (variantStyles.borderColor) {
      styles.push(`border-[${variantStyles.borderColor}]`);
    }
  }
  
  // 为滑块组件添加特殊样式
  if (component === 'slider' && theme) {
    const sliderConfig = componentConfig as any;
    if (sliderConfig) {
      // 滑块轨道样式
      styles.push(
        `w-full h-2 bg-[${theme.colors.disabled}] rounded-full appearance-none cursor-pointer`,
        `focus:outline-none focus:ring-2 focus:ring-[${theme.colors.accent}]/50`
      );
      
      // 滑块头样式
      styles.push(
        '[&::-webkit-slider-thumb]:w-4',
        '[&::-webkit-slider-thumb]:h-4',
        '[&::-webkit-slider-thumb]:bg-white',
        '[&::-webkit-slider-thumb]:border-2',
        `[&::-webkit-slider-thumb]:border-[${theme.colors.accent}]`,
        '[&::-webkit-slider-thumb]:rounded-full',
        '[&::-webkit-slider-thumb]:appearance-none',
        '[&::-webkit-slider-thumb]:cursor-pointer',
        '[&::-webkit-slider-thumb]:shadow-md',
        `[&::-webkit-slider-thumb]:hover:bg-[${theme.colors.accent}]/20`,
        '[&::-webkit-slider-thumb]:active:scale-110',
        '[&::-moz-range-thumb]:w-4',
        '[&::-moz-range-thumb]:h-4',
        '[&::-moz-range-thumb]:bg-white',
        '[&::-moz-range-thumb]:border-2',
        `[&::-moz-range-thumb]:border-[${theme.colors.accent}]`,
        '[&::-moz-range-thumb]:rounded-full',
        '[&::-moz-range-thumb]:appearance-none',
        '[&::-moz-range-thumb]:cursor-pointer',
        '[&::-moz-range-thumb]:shadow-md',
        `[&::-moz-range-thumb]:hover:bg-[${theme.colors.accent}]/20`,
        '[&::-moz-range-thumb]:active:scale-110'
      );
    }
  }
  
  // 添加状态样式
  if (state && variantStyles?.[state]) {
    const stateVariantStyles = variantStyles[state];
    if (stateVariantStyles.backgroundColor) {
      styles.push(`${state}:bg-[${stateVariantStyles.backgroundColor}]`);
    }
    if (stateVariantStyles.textColor) {
      styles.push(`${state}:text-[${stateVariantStyles.textColor}]`);
    }
  }
  
  return styles.filter(Boolean).join(' ');
};

/**
 * 语义化样式生成器
 * 将语义化标记转换为实际的主题样式类名
 */
export const getSemanticStyle = (semanticTag: string): string => {
  // 支持点分隔的语义化标记，如 'bg.surface' 或 'text.primary'
  const parts = semanticTag.split('.');
  
  // 首先检查静态语义化类映射
  let current: any = semanticClasses;
  let foundInStatic = true;
  
  for (const part of parts) {
    if (!current[part]) {
      foundInStatic = false;
      break;
    }
    current = current[part];
  }
  
  // 如果在静态映射中找到，直接返回
  if (foundInStatic && typeof current === 'string') {
    return current;
  }
  
  // 否则检查主题配置，支持动态语义化标记
  const theme = getCurrentTheme();
  
  // 处理颜色相关的语义化标记，如 'bg.surface'、'text.primary' 等
  if (parts.length === 2 && theme) {
    const [type, name] = parts;
    
    // 背景色
    if (type === 'bg' && theme.colors[name as keyof typeof theme.colors]) {
      return `bg-[${theme.colors[name as keyof typeof theme.colors]}]`;
    }
    
    // 文本色
    if (type === 'text' && theme.colors[name as keyof typeof theme.colors]) {
      return `text-[${theme.colors[name as keyof typeof theme.colors]}]`;
    }
    
    // 边框色
    if (type === 'border' && theme.colors[name as keyof typeof theme.colors]) {
      return `border-[${theme.colors[name as keyof typeof theme.colors]}]`;
    }
  }
  
  // 处理边框宽度
  if (parts.length === 1 && parts[0].startsWith('border-')) {
    return semanticTag;
  }
  
  // 处理其他通用样式
  return semanticTag;
};

/**
 * 合并语义化样式与自定义样式
 * @param semanticTags 语义化标记数组
 * @param customClasses 自定义样式类名
 * @returns 合并后的样式类名
 */
export const mergeSemanticStyles = (semanticTags: string[], customClasses?: string): string => {
  const semanticStyles = semanticTags.map(tag => getSemanticStyle(tag)).filter(Boolean).join(' ');
  return cn(semanticStyles, customClasses);
};

/**
 * 组件样式 Hook
 * 在组件中使用，根据组件类型和变体自动生成样式
 */
export const useComponentStyle = ({
  component,
  variant = 'default',
  size = 'medium',
  customClasses = ''
}: {
  component: string;
  variant?: string;
  size?: string;
  customClasses?: string;
}): string => {
  const baseStyle = getComponentStyle({ component, variant, size });
  return cn(baseStyle, customClasses);
};

/**
 * 主题样式工具函数集合
 * 提供便捷的方式在组件中使用主题样式
 */
export const theme = {
  /**
   * 获取当前主题配置
   */
  config: useCurrentTheme,
  
  /**
   * 组件样式生成器
   */
  component: useComponentStyle,
  
  /**
   * 语义化样式生成器
   */
  semantic: (tags: string | string[]) => {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    return tagArray.map(getSemanticStyle).filter(Boolean).join(' ');
  },
  
  /**
   * 合并样式工具
   */
  merge: cn
};

/**
 * 统一的样式生成函数，支持多种调用方式
 * 功能：合并了原s()和sx()函数的所有功能，提供一致的API体验
 * 
 * @param input 样式输入，可以是字符串、字符串数组、对象或条件样式对象
 * @param conditionalStyles 条件样式对象（可选）
 * @param customClasses 自定义样式类名（可选）
 * @returns 生成的样式类名
 */
export const sx = (
  input?: string | string[] | Record<string, boolean>,
  conditionalStyles?: Record<string, boolean>,
  customClasses?: string
): string => {
  const styles = [];
  
  // 处理输入参数
  if (input) {
    let inputStyles = '';
    
    if (typeof input === 'string') {
      // 字符串输入：可能是语义化标记或直接类名
      if (input.includes('.')) {
        inputStyles = getSemanticStyle(input);
      } else {
        inputStyles = input;
      }
    } else if (Array.isArray(input)) {
      // 字符串数组：逐个处理每个标记
      inputStyles = input.map(item => {
        if (typeof item === 'string') {
          if (item.includes('.')) {
            return getSemanticStyle(item);
          }
          return item;
        }
        return '';
      }).filter(Boolean).join(' ');
    } else if (typeof input === 'object') {
      // 对象输入：条件样式或直接样式映射
      inputStyles = Object.entries(input)
        .filter(([_, value]) => value)
        .map(([key, _]) => {
          if (key.includes('.')) {
            return getSemanticStyle(key);
          }
          return key;
        })
        .filter(Boolean)
        .join(' ');
    }
    
    styles.push(inputStyles);
  }
  
  // 添加额外的条件样式（保持向后兼容）
  if (conditionalStyles) {
    const conditionalStylesStr = Object.entries(conditionalStyles)
      .filter(([_, value]) => value)
      .map(([key, _]) => key)
      .join(' ');
    styles.push(conditionalStylesStr);
  }
  
  // 添加自定义样式
  if (customClasses) {
    styles.push(customClasses);
  }
  
  return cn(...styles);
};

/**
 * 兼容旧版代码的样式生成函数
 * 功能：与原s()函数功能相同，内部调用统一的sx()函数
 * @deprecated 建议使用sx()函数替代
 */
export const s = sx;
