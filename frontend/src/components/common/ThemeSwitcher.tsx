import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/themes/themeManager';

interface ThemeSwitcherProps {
  className?: string;
}

/**
 * 主题切换器组件
 * 功能：提供主题选择和预览功能，支持现代深色和浅色主题
 */
export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
  const { currentTheme, themes, switchTheme } = useTheme();

  /**
   * 获取主题预览样式
   * @param theme 主题配置对象
   * @returns 预览样式对象
   */
  const getPreviewStyle = (theme: typeof themes[0]) => {
    return {
      background: theme.colors.background,
      '--preview-surface': theme.colors.surface,
      '--preview-accent': theme.colors.accent,
      '--preview-text': theme.colors.textPrimary
    } as React.CSSProperties;
  };

  /**
   * 获取主题描述
   * @param themeId 主题ID
   * @returns 主题描述文本
   */
  const getThemeDescription = (themeId: string): string => {
    const descriptions: Record<string, string> = {
      'modern-dark': '现代深色主题，卡片化设计，悬浮效果',
      'modern-light': '现代浅色主题，卡片化设计，悬浮效果'
    };
    return descriptions[themeId] || '自定义主题';
  };

  /**
   * 选择主题
   * @param themeId 要切换的主题ID
   */
  const selectTheme = (themeId: string): void => {
    switchTheme(themeId);
  };

  return (
    <div className={cn("p-6 bg-background rounded-xl", className)}>
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-semibold text-text-primary mb-2">主题设置</h3>
        <p className="text-sm text-text-secondary">选择您喜欢的界面风格</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={cn(
              "bg-surface border-2 border-border rounded-xl cursor-pointer transition-all duration-300 ease-in-out overflow-hidden shadow-sm hover:shadow-lg",
              currentTheme === theme.id 
                ? "border-accent shadow-md shadow-accent/20"
                : "hover:border-accent hover:-translate-y-1"
            )}
            onClick={() => selectTheme(theme.id)}
          >
            <div className="h-30 p-4 flex gap-3 items-center justify-center" style={getPreviewStyle(theme)}>
              <div className="w-15 h-15 bg-[var(--preview-surface)] rounded-lg shadow-sm transition-all duration-300 hover:scale-105 hover:-translate-y-1"></div>
              <div className="w-20 h-10 bg-[var(--preview-accent)] rounded-full opacity-80 transition-all duration-300 hover:scale-105 hover:-translate-y-2"></div>
              <div className="w-12.5 h-12.5 bg-[var(--preview-text)] rounded-full opacity-60 transition-all duration-300 hover:scale-105 hover:-translate-y-1.5"></div>
            </div>
            
            <div className="p-4 border-t border-border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-base font-semibold text-text-primary">{theme.name}</span>
                {currentTheme === theme.id && (
                  <span className="text-xs px-3 py-1 bg-accent text-white rounded-full font-medium">当前</span>
                )}
              </div>
              <p className="text-xs text-text-secondary m-0 leading-relaxed">{getThemeDescription(theme.id)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};