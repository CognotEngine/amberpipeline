import React from 'react';
import { useTranslation } from '../../../../i18n';
import { Slider, Input, Button } from '../../../../components/ui';
import { sx } from '../../../../themes/themeUtils';

interface WeightEditPanelProps {
  brushStrength: number;
  brushRadius: number;
  onBrushStrengthChange: (value: number) => void;
  onBrushRadiusChange: (value: number) => void;
  onAutoWeightCalculation: () => void;
  onClearWeights: () => void;
}

/**
 * 权重编辑面板组件
 * 功能：用于调整权重画笔设置和显示权重可视化控制
 */
export const WeightEditPanel: React.FC<WeightEditPanelProps> = ({
  brushStrength,
  brushRadius,
  onBrushStrengthChange,
  onBrushRadiusChange,
  onAutoWeightCalculation,
  onClearWeights
}) => {
  const { t } = useTranslation();

  return (
    <div className={sx(['space-y-4', 'p-4', 'bg.surface', 'border', 'border.border', 'rounded-lg'])}>
      {/* 画笔设置 */}
      <div>
        <h3 className={sx(['text-sm', 'font-medium', 'text.text-primary', 'mb-3'])}>{t('weight-edit.paint-settings')}</h3>
        
        {/* 画笔强度 */}
        <div className={sx(['space-y-2'])}>
          <div className={sx(['flex', 'justify-between', 'items-center'])}>
            <label className={sx(['text-xs', 'text.text-secondary'])}>{t('weight-edit.strength')}</label>
            <Input
              type="number"
              min={0}
              max={1}
              step={0.1}
              value={brushStrength}
              onChange={(e) => onBrushStrengthChange(parseFloat(e.target.value) || 0)}
              className={sx(['w-16', 'text-xs'])} 
            />
          </div>
          <Slider
            value={[brushStrength]}
            min={0}
            max={1}
            step={0.1}
            onValueChange={(value) => onBrushStrengthChange(value[0])}
            className={sx(['h-2'])} 
          />
        </div>
        
        {/* 画笔半径 */}
        <div className={sx(['space-y-2', 'mt-4'])}>
          <div className={sx(['flex', 'justify-between', 'items-center'])}>
            <label className={sx(['text-xs', 'text.text-secondary'])}>{t('weight-edit.radius')}</label>
            <Input
              type="number"
              min={5}
              max={50}
              step={5}
              value={brushRadius}
              onChange={(e) => onBrushRadiusChange(parseInt(e.target.value) || 5)}
              className={sx(['w-16', 'text-xs'])} 
            />
          </div>
          <Slider
            value={[brushRadius]}
            min={5}
            max={50}
            step={5}
            onValueChange={(value) => onBrushRadiusChange(value[0])}
            className={sx(['h-2'])} 
          />
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className={sx(['flex', 'space-x-2'])}>
        <Button
          variant="primary"
          size="small"
          className={sx(['flex-1', 'text-xs'])} 
          onClick={onAutoWeightCalculation}
        >
          {t('weight-edit.auto-calculate')}
        </Button>
        <Button
          variant="secondary"
          size="small"
          className={sx(['flex-1', 'text-xs'])} 
          onClick={onClearWeights}
        >
          {t('weight-edit.clear-weights')}
        </Button>
      </div>
    </div>
  );
};
