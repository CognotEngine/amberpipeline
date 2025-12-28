/**
 * 语言配置
 */
import { LanguageConfig } from './types';

/**
 * 可用语言列表
 */
export const languages: LanguageConfig[] = [
  {
    code: 'zh-CN',
    name: '简体中文',
    nativeName: '简体中文'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English'
  },
  {
    code: 'ja',
    name: '日语',
    nativeName: '日本語'
  }
];

/**
 * 获取语言配置
 */
export const getLanguageConfig = (code: string): LanguageConfig | undefined => {
  return languages.find(lang => lang.code === code);
};

/**
 * 默认语言
 */
export const defaultLanguage: LanguageConfig = languages[0];
