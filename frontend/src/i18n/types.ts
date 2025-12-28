/**
 * Language type definition
 */
export type LanguageCode = 'zh-CN' | 'en' | 'ja';

/**
 * Translation resource type - supports nested structure
 */
export type TranslationResources = {
  [K in LanguageCode]: {
    translation: {
      [key: string]: string | Record<string, any>;
    };
  };
};

/**
 * Language configuration type
 */
export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
}
