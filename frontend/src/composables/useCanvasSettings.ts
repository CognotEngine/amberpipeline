import { useState, useEffect } from 'react';

// 定义画布设置类型
export interface CanvasSettings {
  gridSize: number;
  contrast: 'low' | 'medium' | 'high' | 'custom';
  customContrast: { light: string; dark: string };
  backgroundStyle: 'grid' | 'solid' | 'gradient';
  solidColor: string;
  gradientColors: [string, string];
  showGrid: boolean;
  gridOpacity: number;
  enableFocusMode: boolean;
  enableEyeProtection: boolean;
}

// 默认画布设置
export const defaultCanvasSettings: CanvasSettings = {
  gridSize: 40,
  contrast: 'low',
  customContrast: { light: '#252525', dark: '#202020' },
  backgroundStyle: 'grid',
  solidColor: '#1E1E1E',
  gradientColors: ['#1E1E1E', '#252525'],
  showGrid: true,
  gridOpacity: 1,
  enableFocusMode: false,
  enableEyeProtection: false,
};

// 定义画布类型特定的默认设置
const canvasTypeDefaults: Record<string, Partial<CanvasSettings>> = {
  'precision-cut': {
    gridSize: 60,
  },
  'character-layer': {
    gridSize: 40,
  },
  'skeleton-binding': {
    gridSize: 50,
  },
  'animation': {
    gridSize: 45,
  },
};

/**
 * 画布设置管理hook
 * 功能：管理画布的视觉设置，支持本地存储保存
 */
export const useCanvasSettings = (canvasType?: string) => {
  // 从本地存储加载设置
  const loadSettings = (): CanvasSettings => {
    const savedSettings = localStorage.getItem('canvasSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // 合并默认设置和保存的设置
        return {
          ...defaultCanvasSettings,
          ...canvasTypeDefaults[canvasType || ''],
          ...parsed,
        };
      } catch (error) {
        console.error('Failed to parse canvas settings:', error);
      }
    }
    // 返回默认设置
    return {
      ...defaultCanvasSettings,
      ...canvasTypeDefaults[canvasType || ''],
    };
  };

  // 初始化设置
  const [settings, setSettings] = useState<CanvasSettings>(loadSettings);

  // 保存设置到本地存储
  const saveSettings = (newSettings: CanvasSettings) => {
    localStorage.setItem('canvasSettings', JSON.stringify(newSettings));
  };

  // 当设置变化时保存到本地存储
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // 更新设置
  const updateSettings = (updates: Partial<CanvasSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updates,
    }));
  };

  // 重置设置到默认值
  const resetSettings = () => {
    const newSettings = {
      ...defaultCanvasSettings,
      ...canvasTypeDefaults[canvasType || ''],
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
};
