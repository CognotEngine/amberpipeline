import { useState, useEffect } from 'react';
import { modernDarkTheme } from './modernDarkTheme';
import { modernLightTheme } from './modernLightTheme';
import type { ThemeConfig, ThemeState } from './types';

/**
 * 主题管理器
 * 负责主题的初始化、切换和持久化
 */

// 初始化所有主题
const allThemes: ThemeConfig[] = [
  modernDarkTheme,
  modernLightTheme
];

// 主题状态
let themeState: ThemeState = {
  currentTheme: 'modern-dark',
  themes: allThemes
};

// 主题状态监听器
let themeListeners: ((theme: string) => void)[] = [];

/**
 * 添加主题变化监听器
 */
export function addThemeListener(listener: (theme: string) => void): () => void {
  themeListeners.push(listener);
  return () => {
    const index = themeListeners.indexOf(listener);
    if (index > -1) {
      themeListeners.splice(index, 1);
    }
  };
}

/**
 * 通知所有监听器主题变化
 */
function notifyThemeChange(themeId: string): void {
  themeListeners.forEach(listener => listener(themeId));
}

/**
 * 初始化主题系统
 * 从本地存储加载主题偏好，并应用主题
 */
export function initializeTheme(): void {
  // 从本地存储加载主题偏好
  const savedTheme = localStorage.getItem('theme-preference');
  if (savedTheme) {
    themeState.currentTheme = savedTheme;
  } else {
    // 检测系统主题偏好
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeState.currentTheme = prefersDark ? 'modern-dark' : 'modern-light';
  }

  // 应用主题
  applyTheme(themeState.currentTheme);
  
  // 监听系统主题变化
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    // 只有在没有手动设置主题偏好时，才跟随系统主题变化
    if (!localStorage.getItem('theme-preference')) {
      const newTheme = e.matches ? 'modern-dark' : 'modern-light';
      themeState.currentTheme = newTheme;
      applyTheme(newTheme);
      notifyThemeChange(newTheme);
    }
  };
  
  // 添加事件监听
  mediaQuery.addEventListener('change', handleSystemThemeChange);
  
  // 保存监听器，以便在需要时移除
  (window as any).__systemThemeListener = handleSystemThemeChange;
}

/**
 * 应用指定主题
 * @param themeId 主题ID
 */
export function applyTheme(themeId: string): void {
  const theme = allThemes.find(t => t.id === themeId);
  if (!theme) {
    console.warn(`主题 ${themeId} 不存在`);
    return;
  }

  const root = document.documentElement;

  // 设置CSS变量
  const colors = theme.colors;
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-surface-elevated', colors.surfaceElevated);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-border-light', colors.borderLight);
  root.style.setProperty('--color-border-dark', colors.borderDark);
  root.style.setProperty('--color-text-primary', colors.textPrimary);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-text-tertiary', colors.textTertiary);
  root.style.setProperty('--color-text-inverse', colors.textInverse);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-light', colors.accentLight);
  root.style.setProperty('--color-accent-dark', colors.accentDark);
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-error', colors.error);
  root.style.setProperty('--color-info', colors.info);
  root.style.setProperty('--color-disabled', colors.disabled);
  root.style.setProperty('--color-hover', colors.hover);
  root.style.setProperty('--color-active', colors.active);
  
  // 添加基础颜色变量（对应semanticClasses中的映射）
  root.style.setProperty('--surface', colors.surface);
  root.style.setProperty('--surface-elevated', colors.surfaceElevated);
  root.style.setProperty('--text-primary', colors.textPrimary);
  root.style.setProperty('--text-secondary', colors.textSecondary);
  root.style.setProperty('--text-tertiary', colors.textTertiary);
  root.style.setProperty('--text-inverse', colors.textInverse);
  root.style.setProperty('--border', colors.border);
  
  // 设置圆角变量
  root.style.setProperty('--radius', '6px');
  
  // 添加input和ring变量
  root.style.setProperty('--input', colors.border);
  root.style.setProperty('--ring', colors.accent);
  
  // 兼容Tailwind CSS变量
  root.style.setProperty('--background', colors.background);
  root.style.setProperty('--foreground', colors.textPrimary);
  root.style.setProperty('--border', colors.border);
  root.style.setProperty('--card', colors.surface);
  root.style.setProperty('--card-foreground', colors.textPrimary);
  root.style.setProperty('--primary', colors.accent);
  root.style.setProperty('--primary-foreground', colors.textInverse);
  root.style.setProperty('--secondary', colors.surfaceElevated);
  root.style.setProperty('--secondary-foreground', colors.textPrimary);
  root.style.setProperty('--accent', colors.accent);
  root.style.setProperty('--accent-foreground', colors.textInverse);
  root.style.setProperty('--destructive', colors.error);
  root.style.setProperty('--destructive-foreground', colors.textInverse);
  root.style.setProperty('--muted', colors.surfaceElevated);
  root.style.setProperty('--muted-foreground', colors.textSecondary);
  root.style.setProperty('--popover', colors.surface);
  root.style.setProperty('--popover-foreground', colors.textPrimary);

  // 设置字体
  if (theme.typography?.fontFamily) {
    root.style.setProperty('--font-family', theme.typography.fontFamily);
  }

  // 添加 header 和 footer 的特殊颜色变量
  if (theme.isDark) {
    // 深色主题
    root.style.setProperty('--color-header', colors.surface);
    root.style.setProperty('--color-header-hover', colors.hover);
    root.style.setProperty('--color-footer', colors.surface);
  } else {
    // 浅色主题
    root.style.setProperty('--color-header', colors.surfaceElevated);
    root.style.setProperty('--color-header-hover', colors.hover);
    root.style.setProperty('--color-footer', colors.surfaceElevated);
  }

  // 设置 body 背景色
  document.body.style.backgroundColor = colors.background;
  document.body.style.color = colors.textPrimary;
}

/**
 * 切换主题
 * @param themeId 要切换的主题ID
 */
export function switchTheme(themeId: string): void {
  const theme = allThemes.find(t => t.id === themeId);
  if (theme) {
    themeState.currentTheme = themeId;
    applyTheme(themeId);
    notifyThemeChange(themeId);
    saveThemePreference();
  } else {
    console.warn(`主题 ${themeId} 不存在`);
  }
}

/**
 * 保存主题偏好到本地存储
 */
export function saveThemePreference(): void {
  localStorage.setItem('theme-preference', themeState.currentTheme);
}

/**
 * 获取当前主题配置
 * @returns 当前主题配置对象
 */
export function getCurrentTheme(): ThemeConfig | undefined {
  return allThemes.find(t => t.id === themeState.currentTheme);
}

/**
 * 获取当前主题ID
 */
export function getCurrentThemeId(): string {
  return themeState.currentTheme;
}

/**
 * 获取所有可用主题
 */
export function getAllThemes(): ThemeConfig[] {
  return allThemes;
}

/**
 * 自定义React Hook用于主题管理
 */
export function useTheme(): {
  currentTheme: string;
  themes: ThemeConfig[];
  switchTheme: (themeId: string) => void;
  getCurrentTheme: () => ThemeConfig | undefined;
} {
  const [currentTheme, setCurrentTheme] = useState(themeState.currentTheme);

  useEffect(() => {
    // 添加主题变化监听器
    const unsubscribe = addThemeListener((themeId) => {
      setCurrentTheme(themeId);
    });

    return unsubscribe;
  }, []);

  return {
    currentTheme,
    themes: allThemes,
    switchTheme,
    getCurrentTheme
  };
}