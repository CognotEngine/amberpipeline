import React, { useState } from 'react';
import { Settings, X, Monitor, Cpu, Info } from 'lucide-react';
import { GlobalMenu } from './GlobalMenu';
import { WindowControls } from './WindowControls';
import { cn } from '@/lib/utils';
import { useTheme, saveThemePreference } from '../../themes/themeManager';
import { useTranslation, languages } from '../../i18n';
import { LanguageCode } from '../../stores/appStore';

interface HeaderProps {
  className?: string;
  onNewCanvas?: (width: number, height: number, mode: 'precision-cut' | 'character-layer' | 'skeleton-binding') => void;
  onOpenImage?: () => void;
  onSaveImage?: () => void;
}

/**
 * 头部组件
 * 功能：提供应用顶部导航栏，包括全局菜单、设置按钮和窗口控制
 */
export const Header: React.FC<HeaderProps> = ({ 
  className, 
  onNewCanvas, 
  onOpenImage, 
  onSaveImage 
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'model' | 'about'>('general');
  const { currentTheme, themes, switchTheme: switchThemeHook } = useTheme();
  const { t, language, changeLanguage } = useTranslation();

  /**
   * 处理设置按钮点击事件
   */
  const handleSettingsClick = () => {
    setShowSettings(true);
    setActiveTab('general');
  };

  /**
   * 处理语言变化
   */
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    changeLanguage(e.target.value as LanguageCode);
  };

  /**
   * 关闭设置面板
   */
  const closeSettings = () => {
    setShowSettings(false);
  };

  /**
   * 选择主题
   */
  const selectTheme = (themeId: string) => {
    switchThemeHook(themeId);
  };

  /**
   * 保存设置
   */
  const saveSettings = () => {
    saveThemePreference();
    closeSettings();
  };

  return (
    <>
      <header className={cn(
        "header flex items-center justify-between h-11 bg-surface border-b border-border",
        className
      )}>
        {/* Logo和主菜单 */}
        <div className="flex items-center">
          <GlobalMenu 
            onNewCanvas={onNewCanvas}
            onOpenImage={onOpenImage}
            onSaveImage={onSaveImage}
          />
        </div>
        
        {/* 设置按钮 */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSettingsClick}
            className="settings-btn p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-all duration-150"
            title={t('common.settings')}
          >
            <Settings size={16} />
          </button>
          
          {/* 窗口控制按钮 */}
          <WindowControls />
        </div>
      </header>

      {/* 设置面板 */}
      {showSettings && (
        <div className="settings-modal fixed inset-0 bg-black/60 flex items-center justify-center z-[9998]" onClick={closeSettings}>
          <div className="settings-content bg-card border border-border rounded-xl w-[700px] h-[500px] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* 头部 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-primary" />
                <span className="text-foreground text-sm font-medium">{t('common.settings')}</span>
              </div>
              <button 
                onClick={closeSettings}
                className="text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                <X size={18} />
              </button>
            </div>

            {/* 主体内容 */}
            <div className="flex flex-1 overflow-hidden">
              {/* 左侧菜单 */}
              <div className="w-40 bg-muted border-r border-border py-2">
                <button
                  onClick={() => setActiveTab('general')}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-all duration-150",
                    activeTab === 'general' ? 'text-primary bg-accent border-r-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/20'
                  )}
                >
                  <Monitor size={16} />
                  {t('settings.interface')}
                </button>
                <button
                  onClick={() => setActiveTab('model')}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-all duration-150",
                    activeTab === 'model' ? 'text-primary bg-accent border-r-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/20'
                  )}
                >
                  <Cpu size={16} />
                  {t('settings.model-path')}
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-all duration-150",
                    activeTab === 'about' ? 'text-primary bg-accent border-r-2 border-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent/20'
                  )}
                >
                  <Info size={16} />
                  {t('common.about')}
                </button>
              </div>

              {/* 右侧内容区域 */}
              <div className="flex-1 p-6 overflow-y-auto">
                {/* 通用设置 */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-foreground text-sm font-medium mb-4">{t('settings.interface')}</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">{t('settings.dark-mode')}</span>
                          <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-primary-foreground rounded-full"></div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">{t('settings.auto-save')}</span>
                          <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-primary-foreground rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-foreground text-sm font-medium mb-4">{t('settings.theme')}</h3>
                      <div className="space-y-3">
                        {themes.map((theme) => (
                          <div 
                            key={theme.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-150",
                              currentTheme === theme.id ? 'bg-accent/20 border border-primary' : 'bg-muted border border-border hover:border-primary/50'
                            )}
                            onClick={() => selectTheme(theme.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.colors.accent }}></div>
                              <span className="text-muted-foreground text-sm">{theme.name}</span>
                            </div>
                            {currentTheme === theme.id && (
                              <div className="text-primary text-xs">
                                {t('common.ok')}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-foreground text-sm font-medium mb-4">{t('settings.language')}</h3>
                      <select 
                        className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-muted-foreground text-sm focus:outline-none focus:border-primary"
                        value={language}
                        onChange={handleLanguageChange}
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.nativeName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 模型设置 */}
                {activeTab === 'model' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-foreground text-sm font-medium mb-4">{t('settings.model-path')}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-muted-foreground/70 text-xs mb-1 block">SAM {t('settings.model-path')}</label>
                          <input 
                            type="text" 
                            defaultValue="/models/sam_vit_h_4b8939.pth"
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-muted-foreground text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="text-muted-foreground/70 text-xs mb-1 block">{t('settings.model-path')} Depth Estimation</label>
                          <input 
                            type="text" 
                            defaultValue="/models/depth_anything_v2_vitl14.pth"
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-muted-foreground text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-foreground text-sm font-medium mb-4">{t('settings.inference')}</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">{t('settings.use-gpu')}</span>
                          <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-primary-foreground rounded-full"></div>
                          </div>
                        </div>
                        <div>
                          <label className="text-muted-foreground/70 text-xs mb-1 block">{t('settings.batch-size')}</label>
                          <input 
                            type="number" 
                            defaultValue="4"
                            className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-muted-foreground text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 关于 */}
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div className="text-center py-4">
                      <div className="w-16 h-16 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <Settings size={32} className="text-primary-foreground" />
                      </div>
                      <h3 className="text-foreground text-lg font-medium mb-2">AmberPipeline</h3>
                      <p className="text-muted-foreground text-sm mb-4">AI-powered 3D Character Pipeline</p>
                      <div className="text-muted-foreground/70 text-xs">
                        <p>{t('about.version', { version: '1.0.0' })}</p>
                        <p className="mt-1">{t('about.build-date', { date: '2024-12-26' })}</p>
                      </div>
                    </div>
                    <div className="border-t border-border pt-4">
                      <h4 className="text-foreground text-sm font-medium mb-3">{t('about.tech-stack')}</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-muted-foreground">React 18</div>
                        <div className="text-muted-foreground">TypeScript</div>
                        <div className="text-muted-foreground">PyTorch</div>
                        <div className="text-muted-foreground">Electron</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-end gap-3 px-5 py-4 border-t border-border">
            <button 
              onClick={closeSettings}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              {t('common.cancel')}
            </button>
            <button 
              onClick={saveSettings}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-150"
            >
              {t('common.ok')}
            </button>
          </div>
        </div>
      )}


    </>
  );
};