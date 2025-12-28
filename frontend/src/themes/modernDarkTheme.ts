import type { ThemeConfig } from './types';

// Adobe风格现代深色主题配置
export const modernDarkTheme: ThemeConfig = {
  name: '深色主题',
  id: 'modern-dark',
  isDark: true,
  
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
    // 基础配色方案 - 专业深灰背景，减少视觉疲劳
    background: '#1A1A1A', // 柔和深灰色背景，专业且舒适
    surface: '#252525',    // 深灰色卡片，增加深度
    surfaceElevated: '#2F2F2F', // 悬浮卡片 - 稍浅灰色，增强层级
    
    // 边框颜色 - 细腻的灰色边框，增强层次感
    border: '#333333',     // 中灰色边框，与新背景协调
    borderLight: '#404040', // 浅灰色边框
    borderDark: '#252525',  // 深灰色边框
    
    // 文本颜色 - 分级配色，增强可读性
    textPrimary: '#FFFFFF', // 纯白色主文本，提高对比度
    textSecondary: '#E0E0E0', // 浅灰色次要文本
    textTertiary: '#B0B0B0', // 中灰色辅助文本
    textInverse: '#111827',
    
    // 强调色 - 专业AI设计软件配色
    accent: '#4A90E2',      // 现代蓝色 - 主强调色，专业且科技感
    accentLight: '#6AA9F4',  // 浅蓝色
    accentDark: '#357ABD',   // 深蓝色
    
    // 功能颜色 - 专业软件风格，符合WCAG标准
    success: '#50E3C2',     // 清新绿色，成功状态
    warning: '#FBBF24',    // 亮黄色警告，提高可见度
    error: '#EF4444',      // 亮红色错误，符合WCAG对比度
    info: '#3B82F6',       // 亮蓝色信息，专业感
    
    // 状态颜色 - 悬浮和激活效果，增强交互反馈
    disabled: '#404040',
    hover: '#333333',      // 悬浮时背景 - 稍浅灰色，提供清晰反馈
    active: '#3A3A3A'      // 激活时背景 - 中灰色
  },
  
  typography: {
    // 字体资源本地化 - 仅使用本地引用的Inter字体
    fontFamily: 'Inter, sans-serif',
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
    // 属性面板组件
    panel: {
      property: {
        backgroundColor: '#252525',
        borderColor: '#333333',
        textColor: '#FFFFFF',
        padding: '16px',
        borderRadius: '0px',
        fontWeight: 400,
        borderLeft: '1px solid #333333'
      }
    },
    
    // 手风琴组件 - 仅在此使用琥珀绿色
    accordion: {
      backgroundColor: '#1A1A1A',
      borderColor: '#333333',
      textColor: '#FFFFFF',
      iconColor: '#00C896',
      hoverBackgroundColor: '#2A2A2A',
      activeBackgroundColor: '#242424',
      activeBorderColor: '#00C896',
      activeTextColor: '#00C896'
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
        backgroundColor: '#4A90E2', // 使用主题accent颜色
        hoverBackgroundColor: '#357ABD',
        textColor: '#FFFFFF',
        borderColor: 'transparent'
      },
      
      // 次要按钮样式
      secondary: {
        backgroundColor: '#2F2F2F',
        hoverBackgroundColor: '#3A3A3A',
        textColor: '#FFFFFF',
        borderColor: '#404040'
      },
      
      // 危险按钮样式
      destructive: {
        backgroundColor: '#E74C3C',
        hoverBackgroundColor: '#C0392B',
        textColor: '#FFFFFF',
        borderColor: 'transparent'
      },
      
      // 成功按钮样式
      success: {
        backgroundColor: '#50E3C2',
        hoverBackgroundColor: '#38B2AC',
        textColor: '#FFFFFF',
        borderColor: 'transparent'
      },
      
      // 禁用按钮样式
      disabled: {
        backgroundColor: '#404040',
        textColor: '#999999',
        borderColor: 'transparent',
        opacity: 0.6
      }
    },
    
    // 卡片组件样式
    card: {
      backgroundColor: '#252525',
      borderColor: '#333333',
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
    },
    
    // 输入组件样式
    input: {
      backgroundColor: '#252525',
      borderColor: '#333333',
      textColor: '#FFFFFF',
      placeholderColor: '#808080',
      hoverBorderColor: '#404040',
      focusBorderColor: '#4A90E2',
      focusBoxShadow: '0 0 0 2px rgba(74, 144, 226, 0.2)'
    },
    
    // 标签组件样式
    label: {
      textColor: '#CCCCCC',
      fontWeight: 500,
      fontSize: '14px'
    },
    
    // 分隔线样式
    divider: {
      color: '#333333',
      opacity: 0.8
    },
    
    // 菜单组件样式
    menu: {
      backgroundColor: '#252525',
      borderColor: '#333333',
      borderRadius: 6,
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
    },
    
    // 选择项样式
    selectItem: {
      textColor: '#FFFFFF',
      hoverBackgroundColor: '#333333',
      activeBackgroundColor: '#2F2F2F',
      activeTextColor: '#4A90E2'
    },
    
    // 切换开关样式
    switch: {
      backgroundColor: '#404040',
      checkedBackgroundColor: '#4080FF',
      thumbBackgroundColor: '#FFFFFF'
    },
    
    // 滑块样式
    slider: {
      backgroundColor: '#404040',
      thumbBackgroundColor: '#FFFFFF',
      thumbBorderColor: '#4080FF',
      fillColor: '#4080FF'
    },
    
    // 进度条样式
    progress: {
      height: {
        small: '4px',
        medium: '8px',
        large: '12px'
      },
      borderRadius: 'md',
      backgroundColor: '#333333',
      fillColor: '#4080FF',
      secondaryFillColor: '#404040'
    },
    
    // 提示框样式
    alert: {
      padding: '12px 16px',
      borderRadius: 'md',
      backgroundColor: '#252525',
      borderColor: '#333333',
      
      // 变体样式
      default: {
        backgroundColor: '#252525',
        textColor: '#FFFFFF',
        borderColor: '#333333',
        iconColor: '#3B82F6'
      },
      destructive: {
        backgroundColor: '#372C2C',
        textColor: '#EF4444',
        borderColor: '#7F1D1D',
        iconColor: '#EF4444'
      },
      warning: {
        backgroundColor: '#383527',
        textColor: '#FBBF24',
        borderColor: '#78350F',
        iconColor: '#FBBF24'
      },
      success: {
        backgroundColor: '#27382E',
        textColor: '#10B981',
        borderColor: '#065F46',
        iconColor: '#10B981'
      },
      info: {
        backgroundColor: '#273338',
        textColor: '#3B82F6',
        borderColor: '#1E40AF',
        iconColor: '#3B82F6'
      }
    },
    
    // 工具提示样式
    tooltip: {
      backgroundColor: '#1A1A1A',
      textColor: '#FFFFFF',
      borderColor: '#333333',
      borderRadius: 'sm',
      padding: '6px 8px',
      fontSize: '12px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
    }
  },
  
  // 视觉效果配置
  effects: {
    // 阴影效果 - 现代专业软件风格，增强深度感
    shadow: {
      sm: '0 1px 3px rgba(0, 0, 0, 0.4)',
      md: '0 4px 12px rgba(0, 0, 0, 0.4)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.5)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.6)'
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
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }
  },
  
  // 图标配置 - 使用本地图标
  icons: {
    prefix: 'icon-',
    useLocalAssets: true
  }
};