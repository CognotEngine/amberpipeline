// 布局配置接口
export interface LayoutConfig {
  gridColumns: number;
  gridGutter: number;
  containerMaxWidth: number;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
}

// 排版配置接口
export interface TypographyConfig {
  fontFamily: string;
  fontSize?: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
    '3xl'?: string;
    '4xl'?: string;
    '5xl'?: string;
  };
  lineHeight?: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  fontWeight?: {
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

// 组件样式配置接口
export interface ComponentStyles {
  [key: string]: any;
}

// 视觉效果配置接口
export interface EffectsConfig {
  shadow?: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  transition?: {
    duration: number;
    timingFunction: string;
    hover?: {
      duration: number;
      timingFunction: string;
    };
    focus?: {
      duration: number;
      timingFunction: string;
    };
    transform?: {
      duration: number;
      timingFunction: string;
    };
  };
  opacity?: {
    disabled: number;
    hover: number;
    active: number;
  };
  borderRadius?: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  glass?: {
    background: string;
    backdropFilter: string;
    border: string;
  };
}

// 图标配置接口
export interface IconsConfig {
  prefix: string;
  useLocalAssets: boolean;
}

// 主题颜色配置接口
export interface ThemeColors {
  // 背景颜色
  background: string;
  surface: string;
  surfaceElevated: string;
  
  // 边框颜色
  border: string;
  borderLight: string;
  borderDark: string;
  
  // 文本颜色
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // 强调色
  accent: string;
  accentLight: string;
  accentDark: string;
  
  // 功能颜色
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // 状态颜色
  disabled: string;
  hover: string;
  active: string;
}

// 主题配置接口
export interface ThemeConfig {
  name: string;
  id: string;
  isDark: boolean;
  colors: ThemeColors;
  layout?: LayoutConfig;
  typography?: TypographyConfig;
  components?: ComponentStyles;
  effects?: EffectsConfig;
  icons?: IconsConfig;
}

// 主题管理状态接口
export interface ThemeState {
  currentTheme: string;
  themes: ThemeConfig[];
}