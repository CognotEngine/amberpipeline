/**
 * 全局快捷键管理Hook
 * 封装键盘事件监听，支持组合键和单个键的处理
 */
import { useEffect, useCallback } from 'react';

// 定义快捷键组合类型
export interface ShortcutCombo {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

// 定义快捷键处理器类型
export type ShortcutHandler = (event: KeyboardEvent) => void;

// 定义快捷键配置类型
export interface ShortcutConfig {
  combo: ShortcutCombo | string;
  handler: ShortcutHandler;
  event?: 'keydown' | 'keyup';
  preventDefault?: boolean;
}

/**
 * 将快捷键字符串解析为ShortcutCombo对象
 * 支持格式如: 'Ctrl+Shift+A', 'F', 'Alt+Z'
 */
function parseShortcutString(shortcutStr: string): ShortcutCombo {
  const parts = shortcutStr.split('+');
  const key = parts.pop()?.trim() || '';
  
  return {
    key: key.toLowerCase(),
    ctrl: parts.includes('Ctrl') || parts.includes('Control'),
    shift: parts.includes('Shift'),
    alt: parts.includes('Alt'),
    meta: parts.includes('Meta') || parts.includes('Cmd')
  };
}

/**
 * 检查键盘事件是否匹配快捷键组合
 */
function isShortcutMatch(event: KeyboardEvent, combo: ShortcutCombo): boolean {
  const normalizedKey = event.key.toLowerCase();
  
  return (
    normalizedKey === combo.key &&
    (combo.ctrl === event.ctrlKey) &&
    (combo.shift === event.shiftKey) &&
    (combo.alt === event.altKey) &&
    (combo.meta === event.metaKey)
  );
}

/**
 * 全局快捷键管理Hook
 * @param shortcuts 快捷键配置数组
 * @param deps 依赖项数组，当依赖项变化时重新注册快捷键
 */
export function useShortcut(
  shortcuts: ShortcutConfig[],
  deps: any[] = []
): void {
  // 处理键盘事件
  const handleKeyEvent = useCallback((event: KeyboardEvent) => {
    shortcuts.forEach(config => {
      // 解析快捷键组合
      const combo = typeof config.combo === 'string' 
        ? parseShortcutString(config.combo)
        : config.combo;
      
      // 检查事件类型是否匹配
      if (event.type !== config.event) return;
      
      // 检查快捷键是否匹配
      if (isShortcutMatch(event, combo)) {
        // 阻止默认行为（如果配置了）
        if (config.preventDefault) {
          event.preventDefault();
          event.stopPropagation();
        }
        
        // 调用处理函数
        config.handler(event);
      }
    });
  }, [shortcuts]);

  useEffect(() => {
    // 获取所有需要监听的事件类型
    const eventTypes = Array.from(
      new Set(shortcuts.map(config => config.event || 'keydown'))
    );
    
    // 添加事件监听器
    eventTypes.forEach(eventType => {
      document.addEventListener(eventType, handleKeyEvent);
    });
    
    // 清理事件监听器
    return () => {
      eventTypes.forEach(eventType => {
        document.removeEventListener(eventType, handleKeyEvent);
      });
    };
  }, [handleKeyEvent, deps]); // 依赖项变化时重新注册
}

/**
 * 创建单个快捷键的Hook
 * 方便只注册一个快捷键的场景
 */
export function useSingleShortcut(
  combo: ShortcutCombo | string,
  handler: ShortcutHandler,
  options: Omit<ShortcutConfig, 'combo' | 'handler'> = {}
): void {
  useShortcut([{ combo, handler, ...options }], [combo, handler, options]);
}
