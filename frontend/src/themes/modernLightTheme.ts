import type { ThemeConfig } from './types';

// 现代风格浅色主题配置
export const modernLightTheme: ThemeConfig = {
  name: '浅色主题',
  id: 'modern-light',
  isDark: false,
  
  // 布局系统 - 增强视觉引导性
  layout: {
    gridColumns: 12,
    gridGutter: 20, // 增加间距，增强内容区分
    containerMaxWidth: 1600, // 增加容器宽度，适合专业软件使用场景
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 28,
      xl: 40,
      xxl: 56
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      xxl: '1536px'
    }
  },
  
  colors: {
    // 背景颜色 - 现代渐变风格
    background: '#F5F7FA', // 柔和的灰蓝色背景
    surface: '#FFFFFF',    // 纯白卡片表面
    surfaceElevated: '#FFFFFF', // 悬浮卡片表面

    // 边框颜色 - 细腻的边框
    border: '#E2E8F0',     // 柔和的边框
    borderLight: '#F1F5F9',
    borderDark: '#CBD5E1',

    // 文本颜色 - 高对比度
    textPrimary: '#1E293B', // 深色主文本
    textSecondary: '#64748B', // 次要文本
    textTertiary: '#94A3B8', // 辅助文本
    textInverse: '#FFFFFF',

    // 强调色 - 现代渐变蓝紫色
    accent: '#6366F1',       // 靛蓝色，现代感强
    accentLight: '#818CF8',
    accentDark: '#4F46E5',

    // 功能颜色 - 柔和的色调
    success: '#10B981',    // 翠绿色
    warning: '#F59E0B',    // 琥珀色
    error: '#EF4444',      // 红色
    info: '#3B82F6',       // 蓝色

    // 状态颜色 - 悬浮效果
    disabled: '#E2E8F0',
    hover: '#F8FAFC',      // 悬浮时背景
    active: '#EEF2FF'      // 激活时背景
  },
  
  typography: {
    // 字体资源本地化 - 仅使用本地引用的Inter字体
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px'
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  
  // 组件特定样式
  components: {
    // 手风琴组件
    accordion: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E2E8F0',
      textColor: '#1E293B',
      iconColor: '#6366F1',
      hoverBackgroundColor: '#F8FAFC',
      activeBackgroundColor: '#EEF2FF',
      activeBorderColor: '#6366F1',
      activeTextColor: '#6366F1'
    },
    
    // 按钮设计 - 现代简洁风格
    button: {
      padding: {
        sm: '6px 12px',
        md: '8px 16px',
        lg: '10px 20px'
      },
      borderRadius: 6, // 统一圆角风格
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: 0,
      
      // 主按钮样式
      primary: {
        backgroundColor: '#6366F1', // 使用主题accent颜色
        hoverBackgroundColor: '#4F46E5',
        textColor: '#FFFFFF',
        borderColor: 'transparent'
      },
      
      // 次要按钮样式
      secondary: {
        backgroundColor: '#F8FAFC',
        hoverBackgroundColor: '#EEF2FF',
        textColor: '#1E293B',
        borderColor: '#E2E8F0'
      },
      
      // 危险按钮样式
      destructive: {
        backgroundColor: '#EF4444',
        hoverBackgroundColor: '#DC2626',
        textColor: '#FFFFFF',
        borderColor: 'transparent'
      },
      
      // 成功按钮样式
      success: {
        backgroundColor: '#10B981',
        hoverBackgroundColor: '#059669',
        textColor: '#FFFFFF',
        borderColor: 'transparent'
      },
      
      // 禁用按钮样式
      disabled: {
        backgroundColor: '#E2E8F0',
        textColor: '#94A3B8',
        borderColor: 'transparent',
        opacity: 0.6
      }
    },
    
    // 卡片组件样式
    card: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E2E8F0',
      borderRadius: 8,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    
    // 输入组件样式
    input: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E2E8F0',
      textColor: '#1E293B',
      placeholderColor: '#94A3B8',
      hoverBorderColor: '#CBD5E1',
      focusBorderColor: '#6366F1',
      focusBoxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)'
    },
    
    // 标签组件样式
    label: {
      textColor: '#1E293B',
      fontWeight: 500,
      fontSize: '14px'
    },
    
    // 分隔线样式
    divider: {
      color: '#E2E8F0',
      opacity: 0.8
    },
    
    // 菜单组件样式
    menu: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E2E8F0',
      borderRadius: 6,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
    },
    
    // 选择项样式
    selectItem: {
      textColor: '#1E293B',
      hoverBackgroundColor: '#F8FAFC',
      activeBackgroundColor: '#EEF2FF',
      activeTextColor: '#6366F1'
    },
    
    // 切换开关样式
    switch: {
      backgroundColor: '#E2E8F0',
      checkedBackgroundColor: '#6366F1',
      thumbBackgroundColor: '#FFFFFF'
    },
    
    // 滑块样式
    slider: {
      backgroundColor: '#E2E8F0',
      thumbBackgroundColor: '#FFFFFF',
      thumbBorderColor: '#6366F1',
      fillColor: '#6366F1'
    },
    
    // 进度条样式
    progress: {
      height: {
        small: '4px',
        medium: '8px',
        large: '12px'
      },
      borderRadius: 'md',
      backgroundColor: '#E2E8F0',
      fillColor: '#6366F1',
      secondaryFillColor: '#CBD5E1'
    },
    
    // 提示框样式
    alert: {
      padding: '12px 16px',
      borderRadius: 'md',
      backgroundColor: '#FFFFFF',
      borderColor: '#E2E8F0',
      
      // 变体样式
      default: {
        backgroundColor: '#FFFFFF',
        textColor: '#1E293B',
        borderColor: '#E2E8F0',
        iconColor: '#3B82F6'
      },
      destructive: {
        backgroundColor: '#FEF2F2',
        textColor: '#EF4444',
        borderColor: '#FEE2E2',
        iconColor: '#EF4444'
      },
      warning: {
        backgroundColor: '#FFFBEB',
        textColor: '#F59E0B',
        borderColor: '#FEF3C7',
        iconColor: '#F59E0B'
      },
      success: {
        backgroundColor: '#F0FDF4',
        textColor: '#10B981',
        borderColor: '#D1FAE5',
        iconColor: '#10B981'
      },
      info: {
        backgroundColor: '#EFF6FF',
        textColor: '#3B82F6',
        borderColor: '#DBEAFE',
        iconColor: '#3B82F6'
      }
    },
    
    // 工具提示样式
    tooltip: {
      backgroundColor: '#1E293B',
      textColor: '#FFFFFF',
      borderColor: 'transparent',
      borderRadius: 'sm',
      padding: '6px 8px',
      fontSize: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
    }
  },
  
  // 视觉效果配置
  effects: {
    // 阴影效果 - 现代专业软件风格，增强深度感
    shadow: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
      md: '0 4px 12px rgba(0, 0, 0, 0.1)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.15)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.2)'
    },
    
    // 过渡效果 - 流畅交互反馈，增强用户体验
    transition: {
      duration: 0.2,
      timingFunction: 'ease-in-out',
      hover: {
        duration: 0.12,
        timingFunction: 'ease-out'
      },
      focus: {
        duration: 0.1,
        timingFunction: 'ease-out'
      },
      transform: {
        duration: 0.2,
        timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
      }
    },
    
    // 透明度配置
    opacity: {
      disabled: 0.6,
      hover: 0.8,
      active: 0.9
    },
    
    // 圆角配置 - 统一的圆角风格
    borderRadius: {
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px'
    },
    
    // 玻璃态效果 - 现代UI风格
    glass: {
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }
  },
  
  // 图标配置 - 使用本地图标
  icons: {
    prefix: 'icon-',
    useLocalAssets: true
  }
};