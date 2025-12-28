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
    const translationValue = resources[language]?.translation[key];
    let translation: string = typeof translationValue === 'string' ? translationValue : key;

    // 替换占位符
    if (options) {
      Object.entries(options).forEach(([placeholder, value]) => {
        translation = translation.replace(`{{${placeholder}}}`, String(value));
      });
    }

    return translation;
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
  const translationValue = resources[savedLanguage]?.translation[key];
  let translation: string = typeof translationValue === 'string' ? translationValue : key;

  // 替换占位符
  if (options) {
    Object.entries(options).forEach(([placeholder, value]) => {
      translation = translation.replace(`{{${placeholder}}}`, String(value));
    });
  }

  return translation;
};
