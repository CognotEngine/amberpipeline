/**
 * 翻译钩子函数
 */
import { useCallback } from 'react';
import { LanguageCode } from './types';
import { resources } from './resources';
import { useAppStore } from '../stores/appStore';

/**
 * 翻译钩子，用于在组件中获取翻译文本
 * @returns 翻译函数和语言切换函数
 */
export const useTranslation = () => {
  // 从全局状态获取语言
  const language = useAppStore(state => state.language);
  const setLanguage = useAppStore(state => state.setLanguage);

  /**
   * 翻译函数
   * @param key 翻译键
   * @param options 翻译选项，用于替换占位符
   * @returns 翻译后的文本
   */
  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    // 获取当前语言的翻译资源
    const translation = resources[language]?.translation;
    if (!translation) return key;
    
    let translationValue: any;
    
    // 1. 首先尝试直接查找完整的键
    if (key in translation && typeof translation[key] === 'string') {
      translationValue = translation[key];
    } else {
      // 2. 如果直接查找失败，尝试解析嵌套键
      const keys = key.split('.');
      let current: string | Record<string, any> = translation;
      let found = true;
      
      for (const k of keys) {
        // 只有当current是对象时才能继续遍历
        if (current && typeof current === 'object' && !Array.isArray(current) && k in current) {
          // 使用类型断言处理嵌套对象或字符串
          current = current[k] as string | Record<string, any>;
        } else {
          found = false;
          break;
        }
      }
      
      // 确保最终值是字符串
      translationValue = found && typeof current === 'string' ? current : key;
    }
    
    // 替换占位符
    let result = translationValue;
    if (options) {
      Object.entries(options).forEach(([placeholder, value]) => {
        result = result.replace(`{{${placeholder}}}`, String(value));
      });
    }

    return result;
  }, [language]);

  /**
   * 切换语言
   * @param newLanguage 新语言代码
   */
  const changeLanguage = useCallback((newLanguage: LanguageCode) => {
    setLanguage(newLanguage);
  }, [setLanguage]);

  return { t, language, changeLanguage };
};

/**
 * 获取当前语言的翻译文本
 * 用于非组件环境
 * @param key 翻译键
 * @param options 翻译选项
 * @returns 翻译后的文本
 */
export const getTranslation = (key: string, options?: Record<string, string | number>): string => {
  // 从本地存储获取当前语言
  const savedLanguage = localStorage.getItem('language-preference') as LanguageCode || 'zh-CN';
  
  // 获取当前语言的翻译资源
  const translation = resources[savedLanguage]?.translation;
  if (!translation) return key;
  
  let translationValue: any;
  
  // 1. 首先尝试直接查找完整的键
  if (key in translation && typeof translation[key] === 'string') {
    translationValue = translation[key];
  } else {
    // 2. 如果直接查找失败，尝试解析嵌套键
    const keys = key.split('.');
    let current: string | Record<string, any> = translation;
    let found = true;
    
    for (const k of keys) {
      // 只有当current是对象时才能继续遍历
      if (current && typeof current === 'object' && !Array.isArray(current) && k in current) {
        // 使用类型断言处理嵌套对象或字符串
        current = current[k] as string | Record<string, any>;
      } else {
        found = false;
        break;
      }
    }
    
    // 确保最终值是字符串
    translationValue = found && typeof current === 'string' ? current : key;
  }
  
  // 替换占位符
  let result = translationValue;
  if (options) {
    Object.entries(options).forEach(([placeholder, value]) => {
      result = result.replace(`{{${placeholder}}}`, String(value));
    });
  }

  return result;
};
