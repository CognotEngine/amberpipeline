import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import {
  switchTheme,
  getCurrentTheme,
  getAllThemes,
  getCurrentThemeId,
  addThemeListener
} from './themeManager';
import type { ThemeConfig } from './types';

// ThemeContext 接口定义
export interface ThemeContextType {
  currentTheme: string;
  currentThemeConfig: ThemeConfig | undefined;
  themes: ThemeConfig[];
  switchTheme: (themeId: string) => void;
  getCurrentTheme: () => ThemeConfig | undefined;
  getAllThemes: () => ThemeConfig[];
  getCurrentThemeId: () => string;
}

// 创建 ThemeContext
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ThemeProvider 组件属性接口
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider 组件
 * 提供全局主题管理功能
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 使用useState来存储当前主题ID，当主题变化时会触发重新渲染
  const [currentThemeId, setCurrentThemeId] = useState(getCurrentThemeId());

  // 监听主题变化，更新状态
  useEffect(() => {
    const unsubscribe = addThemeListener((themeId) => {
      setCurrentThemeId(themeId);
    });
    return unsubscribe;
  }, []);

  // 创建上下文值
  const contextValue: ThemeContextType = {
    currentTheme: currentThemeId,
    currentThemeConfig: getCurrentTheme(),
    themes: getAllThemes(),
    switchTheme,
    getCurrentTheme,
    getAllThemes,
    getCurrentThemeId
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * useTheme Hook
 * 用于在组件中访问主题上下文
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * useThemeConfig Hook
 * 用于在组件中访问当前主题配置
 */
export const useThemeConfig = (): ThemeConfig | undefined => {
  return useTheme().currentThemeConfig;
};

/**
 * useThemeSwitcher Hook
 * 用于在组件中切换主题
 */
export const useThemeSwitcher = (): ((themeId: string) => void) => {
  return useTheme().switchTheme;
};
