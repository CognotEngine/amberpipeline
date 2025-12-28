/**
 * 语言类型定义
 */
export type LanguageCode = 'zh-CN' | 'en' | 'ja';

/**
 * 翻译资源类型 - 支持嵌套结构
 */
export type TranslationResources = {
  [K in LanguageCode]: {
    translation: {
      [key: string]: string | Record<string, any>;
    };
  };
};

/**
 * 语言配置类型
 */
export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
}
