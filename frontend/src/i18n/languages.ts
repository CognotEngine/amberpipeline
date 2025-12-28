/**
 * Language configuration
 */
import { LanguageConfig } from './types';

/**
 * List of available languages
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
 * Get language configuration
 */
export const getLanguageConfig = (code: string): LanguageConfig | undefined => {
  return languages.find(lang => lang.code === code);
};

/**
 * Default language
 */
export const defaultLanguage: LanguageConfig = languages[0];
