/**
 * 翻译资源
 */
import { TranslationResources } from './types';

// 导入语言JSON文件
import zhCNTranslation from './locales/zh-CN.json';
import enTranslation from './locales/en.json';
import jaTranslation from './locales/ja.json';

/**
 * 翻译资源定义
 */
export const resources: TranslationResources = {
  'zh-CN': {
    translation: zhCNTranslation
  },
  'en': {
    translation: enTranslation
  },
  'ja': {
    translation: jaTranslation
  }
};
