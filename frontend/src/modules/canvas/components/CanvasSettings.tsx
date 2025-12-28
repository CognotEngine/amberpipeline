import React from 'react';
import { Card, Slider, Switch, Select, Separator, Button } from '../../../components/ui';
import { useTranslation } from '../../../i18n';
import { useCanvasTheme } from '../composables/CanvasThemeProvider';
import { cn } from '../../../lib/utils';
import { sx } from '../../../themes/themeUtils';

/**
 * 画布设置组件
 * 功能：提供可视化的画布设置界面，支持实时预览
 */
export const CanvasSettings: React.FC = () => {
  const { t } = useTranslation();
  const { settings, updateSettings, resetSettings } = useCanvasTheme();

  // 处理格子大小变化
  const handleGridSizeChange = (value: number[]) => {
    updateSettings({ gridSize: value[0] });
  };

  // 处理对比度变化
  const handleContrastChange = (value: string) => {
    updateSettings({ contrast: value as any });
  };

  // 处理背景样式变化
  const handleBackgroundStyleChange = (value: string) => {
    updateSettings({ backgroundStyle: value as any });
  };

  // 处理显示网格变化
  const handleShowGridChange = (checked: boolean) => {
    updateSettings({ showGrid: checked });
  };

  // 处理网格透明度变化
  const handleGridOpacityChange = (value: number[]) => {
    updateSettings({ gridOpacity: value[0] });
  };

  // 处理焦点模式变化
  const handleFocusModeChange = (checked: boolean) => {
    updateSettings({ enableFocusMode: checked });
  };

  // 处理护眼模式变化
  const handleEyeProtectionChange = (checked: boolean) => {
    updateSettings({ enableEyeProtection: checked });
  };

  return (
    <Card className={sx(['bg.surface', 'border.border', 'rounded-lg', 'p-4', 'space-y-4', 'shadow-md'])}>
      <h2 className={sx(['text-xl', 'font-semibold', 'text.text-primary', 'mb-4'])}>
        {t('canvas.settings.title')}
      </h2>

      {/* 格子大小设置 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className={sx(['text.text-secondary', 'text-sm', 'font-medium'])}>
            {t('canvas.settings.gridSize')}
          </label>
          <span className={sx(['text.text-primary', 'text-sm'])}>{settings.gridSize}px</span>
        </div>
        <Slider
          value={[settings.gridSize]}
          min={10}
          max={60}
          step={5}
          onValueChange={handleGridSizeChange}
          className="my-2"
        />
      </div>

      <Separator className={sx(['bg.border'])} />

      {/* 对比度设置 */}
      <div className="space-y-2">
        <label className={sx(['text.text-secondary', 'text-sm', 'font-medium', 'block', 'mb-2'])}>
          {t('canvas.settings.contrast')}
        </label>
        <Select
          value={settings.contrast}
          onValueChange={handleContrastChange}
          className={sx(['w-full'])}>
          <option value="low">{t('canvas.settings.contrastLow')}</option>
          <option value="medium">{t('canvas.settings.contrastMedium')}</option>
          <option value="high">{t('canvas.settings.contrastHigh')}</option>
          <option value="custom">{t('canvas.settings.contrastCustom')}</option>
        </Select>
        {settings.contrast === 'custom' && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className={sx(['text.text-secondary', 'text-xs', 'block', 'mb-1'])}>
                {t('canvas.settings.customLight')}
              </label>
              <input
                type="color"
                value={settings.customContrast.light}
                onChange={(e) => updateSettings({
                  customContrast: { ...settings.customContrast, light: e.target.value }
                })}
                className={sx(['w-full', 'h-10', 'rounded', 'cursor-pointer', 'border.border'])} 
              />
            </div>
            <div>
              <label className={sx(['text.text-secondary', 'text-xs', 'block', 'mb-1'])}>
                {t('canvas.settings.customDark')}
              </label>
              <input
                type="color"
                value={settings.customContrast.dark}
                onChange={(e) => updateSettings({
                  customContrast: { ...settings.customContrast, dark: e.target.value }
                })}
                className={sx(['w-full', 'h-10', 'rounded', 'cursor-pointer', 'border.border'])} 
              />
            </div>
          </div>
        )}
      </div>

      <Separator className={sx(['bg.border'])} />

      {/* 背景样式设置 */}
      <div className="space-y-2">
        <label className={sx(['text.text-secondary', 'text-sm', 'font-medium', 'block', 'mb-2'])}>
          {t('canvas.settings.backgroundStyle')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            className={cn(
              sx(['px-3', 'py-2', 'rounded', 'text-sm', 'border', 'transition-all', 'duration-200']),
              settings.backgroundStyle === 'grid' 
                ? sx(['bg.accent/20', 'border.accent', 'text.accent']) 
                : sx(['bg.background', 'border.border', 'text.text-secondary', 'hover:bg.hover'])
            )}
            onClick={() => handleBackgroundStyleChange('grid')}
          >
            {t('canvas.settings.backgroundGrid')}
          </button>
          <button
            className={cn(
              sx(['px-3', 'py-2', 'rounded', 'text-sm', 'border', 'transition-all', 'duration-200']),
              settings.backgroundStyle === 'solid' 
                ? sx(['bg.accent/20', 'border.accent', 'text.accent']) 
                : sx(['bg.background', 'border.border', 'text.text-secondary', 'hover:bg.hover'])
            )}
            onClick={() => handleBackgroundStyleChange('solid')}
          >
            {t('canvas.settings.backgroundSolid')}
          </button>
          <button
            className={cn(
              sx(['px-3', 'py-2', 'rounded', 'text-sm', 'border', 'transition-all', 'duration-200']),
              settings.backgroundStyle === 'gradient' 
                ? sx(['bg.accent/20', 'border.accent', 'text.accent']) 
                : sx(['bg.background', 'border.border', 'text.text-secondary', 'hover:bg.hover'])
            )}
            onClick={() => handleBackgroundStyleChange('gradient')}
          >
            {t('canvas.settings.backgroundGradient')}
          </button>
        </div>
      </div>

      <Separator className={sx(['bg.border'])} />

      {/* 网格显示设置 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className={sx(['text.text-secondary', 'text-sm', 'font-medium'])}>
            {t('canvas.settings.showGrid')}
          </label>
          <Switch
            checked={settings.showGrid}
            onCheckedChange={handleShowGridChange}
          />
        </div>
        {settings.showGrid && (
          <div className="space-y-1 mt-2">
            <div className="flex justify-between items-center">
              <label className={sx(['text.text-secondary', 'text-xs', 'font-medium'])}>
                {t('canvas.settings.gridOpacity')}
              </label>
              <span className={sx(['text.text-primary', 'text-xs'])}>
                {Math.round(settings.gridOpacity * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.gridOpacity]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(value) => updateSettings({ gridOpacity: value[0] })}
              className="my-2"
            />
          </div>
        )}
      </div>

      <Separator className={sx(['bg.border'])} />

      {/* 高级设置 */}
      <div className="space-y-3">
        <h3 className={sx(['text.text-primary', 'text-sm', 'font-semibold', 'mb-2'])}>
          {t('canvas.settings.advanced')}
        </h3>
        
        {/* 焦点模式 */}
        <div className="flex justify-between items-center">
          <label className={sx(['text.text-secondary', 'text-sm', 'font-medium'])}>
            {t('canvas.settings.focusMode')}
          </label>
          <Switch
            checked={settings.enableFocusMode}
            onCheckedChange={handleFocusModeChange}
          />
        </div>
        
        {/* 护眼模式 */}
        <div className="flex justify-between items-center">
          <label className={sx(['text.text-secondary', 'text-sm', 'font-medium'])}>
            {t('canvas.settings.eyeProtection')}
          </label>
          <Switch
            checked={settings.enableEyeProtection}
            onCheckedChange={handleEyeProtectionChange}
          />
        </div>
      </div>

      <Separator className={sx(['bg.border'])} />

      {/* 重置按钮 */}
      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="small"
          onClick={resetSettings}
          className={sx(['bg.background', 'border.border', 'text.text-secondary', 'hover:bg.hover'])}>
          {t('canvas.settings.reset')}
        </Button>
      </div>
    </Card>
  );
};
