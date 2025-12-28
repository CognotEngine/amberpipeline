import React, { createContext, useContext, ReactNode } from 'react';
import { CanvasSettings, useCanvasSettings } from '../../../composables/useCanvasSettings';

// 定义主题上下文类型
interface CanvasThemeContextType {
  settings: CanvasSettings;
  updateSettings: (updates: Partial<CanvasSettings>) => void;
  resetSettings: () => void;
}

// 创建主题上下文
const CanvasThemeContext = createContext<CanvasThemeContextType | undefined>(undefined);

// 定义主题提供者属性类型
interface CanvasThemeProviderProps {
  children: ReactNode;
  canvasType?: string;
}

/**
 * 画布主题提供者组件
 * 功能：提供画布主题设置的上下文，支持跨组件共享
 */
export const CanvasThemeProvider: React.FC<CanvasThemeProviderProps> = ({ 
  children, 
  canvasType 
}) => {
  // 使用画布设置hook
  const { settings, updateSettings, resetSettings } = useCanvasSettings(canvasType);

  return (
    <CanvasThemeContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </CanvasThemeContext.Provider>
  );
};

/**
 * 使用画布主题上下文的hook
 * 功能：在组件中访问画布主题设置
 */
export const useCanvasTheme = () => {
  const context = useContext(CanvasThemeContext);
  if (context === undefined) {
    throw new Error('useCanvasTheme must be used within a CanvasThemeProvider');
  }
  return context;
};
