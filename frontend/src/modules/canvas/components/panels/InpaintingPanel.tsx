import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../../../i18n';
import { useCanvasContext } from '../../composables/CanvasContext';
import { Button, Slider } from '@/components/ui';
import { apiService } from '@/lib/api';

/**
 * Inpainting 参数面板组件
 * 功能：提供图像修复参数调节界面和实时预览
 */
export const InpaintingPanel: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  
  // Inpainting 参数
  const [method, setMethod] = useState<'telea' | 'ns' | 'lama'>('telea');
  const [radius, setRadius] = useState(3);
  const [padding, setPadding] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState(0);
  
  // 获取可用的修复方法
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const response = await fetch('http://localhost:8000/inpaint/methods');
        const data = await response.json();
        if (data.success) {
          setAvailableMethods(data.methods);
        }
      } catch (error) {
        console.error('Failed to fetch inpainting methods:', error);
        setAvailableMethods(['telea', 'ns']);
      }
    };
    
    fetchMethods();
  }, []);
  
  // 估算处理时间
  useEffect(() => {
    // 基于图像尺寸和方法估算时间
    const estimateTime = () => {
      const selectedLayer = state.layers.find(layer => layer.id === state.selectedLayerId);
      if (!selectedLayer) return 0;
      
      // 假设图像尺寸为 1920x1080（实际应该从图像获取）
      const pixels = 1920 * 1080;
      
      let timePerPixel = 0;
      if (method === 'lama') {
        timePerPixel = 1 / 100000;
      } else if (method === 'ns') {
        timePerPixel = 1 / 500000;
      } else {
        timePerPixel = 1 / 1000000;
      }
      
      return pixels * timePerPixel;
    };
    
    setEstimatedTime(estimateTime());
  }, [method, state.selectedLayerId, state.layers]);
  
  // 执行 Inpainting
  const handleInpaint = async () => {
    const selectedLayer = state.layers.find(layer => layer.id === state.selectedLayerId);
    if (!selectedLayer || !selectedLayer.imagePath || !selectedLayer.maskPath) {
      alert(t('inpainting.noLayerSelected'));
      return;
    }
    
    setIsProcessing(true);
    dispatch({
      type: 'SET_PROCESSING_STATUS',
      payload: {
        isProcessing: true,
        progress: 0,
        message: t('inpainting.processing')
      }
    });
    
    try {
      // 调用后端 API
      const result = await apiService.performInpaint(
        selectedLayer.imagePath,
        selectedLayer.maskPath,
        method,
        radius,
        padding
      );
      
      if (result.success && result.image) {
        // 更新图层
        dispatch({
          type: 'UPDATE_LAYER',
          payload: {
            id: selectedLayer.id,
            updates: {
              imagePath: result.image
            }
          }
        });
        
        // 设置预览
        setPreviewImage(result.image);
        
        dispatch({
          type: 'SET_PROCESSING_STATUS',
          payload: {
            isProcessing: false,
            progress: 100,
            message: t('inpainting.completed')
          }
        });
      } else {
        throw new Error(result.error || 'Inpainting failed');
      }
    } catch (error) {
      console.error('Inpainting failed:', error);
      alert(t('inpainting.failed') + ': ' + (error as Error).message);
      
      dispatch({
        type: 'SET_PROCESSING_STATUS',
        payload: {
          isProcessing: false,
          progress: 0,
          message: t('inpainting.failed')
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 实时预览（防抖）
  const handlePreview = async () => {
    // TODO: 实现实时预览功能
    // 可以使用较小的图像尺寸进行快速预览
    console.log('Preview requested');
  };
  
  return (
    <div className="space-y-4 p-4 bg-surface rounded-lg">
      <h4 className="text-sm font-medium text-text-primary">
        {t('inpainting.title')}
      </h4>
      
      {/* 修复方法选择 */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-text-secondary">
          {t('inpainting.method')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          {availableMethods.map((m) => (
            <button
              key={m}
              className={`px-3 py-2 text-xs rounded transition-colors ${
                method === m
                  ? 'bg-accent text-white'
                  : 'bg-surface-hover text-text-primary hover:bg-surface-active'
              }`}
              onClick={() => setMethod(m as 'telea' | 'ns' | 'lama')}
              disabled={isProcessing}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>
        
        {/* 方法说明 */}
        <div className="text-xs text-text-secondary mt-1">
          {method === 'telea' && t('inpainting.methodDesc.telea')}
          {method === 'ns' && t('inpainting.methodDesc.ns')}
          {method === 'lama' && t('inpainting.methodDesc.lama')}
        </div>
      </div>
      
      {/* 修复半径 */}
      {(method === 'telea' || method === 'ns') && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-text-secondary">
              {t('inpainting.radius')}
            </label>
            <span className="text-xs text-text-primary">{radius}px</span>
          </div>
          <Slider
            value={[radius]}
            onValueChange={(value: number[]) => setRadius(value[0])}
            min={1}
            max={20}
            step={1}
            disabled={isProcessing}
            className="w-full"
          />
          <div className="text-xs text-text-secondary">
            {t('inpainting.radiusDesc')}
          </div>
        </div>
      )}
      
      {/* 遮罩扩展 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-text-secondary">
            {t('inpainting.padding')}
          </label>
          <span className="text-xs text-text-primary">{padding}px</span>
        </div>
        <Slider
          value={[padding]}
          onValueChange={(value: number[]) => setPadding(value[0])}
          min={0}
          max={50}
          step={1}
          disabled={isProcessing}
          className="w-full"
        />
        <div className="text-xs text-text-secondary">
          {t('inpainting.paddingDesc')}
        </div>
      </div>
      
      {/* 估算时间 */}
      <div className="text-xs text-text-secondary">
        {t('inpainting.estimatedTime')}: {estimatedTime.toFixed(2)}s
      </div>
      
      {/* 操作按钮 */}
      <div className="space-y-2">
        <Button
          onClick={handleInpaint}
          disabled={isProcessing || !state.selectedLayerId}
          className="w-full"
          variant="primary"
        >
          {isProcessing ? t('inpainting.processing') : t('inpainting.apply')}
        </Button>
        
        <Button
          onClick={handlePreview}
          disabled={isProcessing || !state.selectedLayerId}
          className="w-full"
          variant="outline"
        >
          {t('inpainting.preview')}
        </Button>
      </div>
      
      {/* 预览图像 */}
      {previewImage && (
        <div className="mt-4">
          <h5 className="text-xs font-medium text-text-secondary mb-2">
            {t('inpainting.previewTitle')}
          </h5>
          <div className="border border-border rounded overflow-hidden">
            <img
              src={previewImage}
              alt="Inpainting Preview"
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
      
      {/* 使用提示 */}
      <div className="mt-4 p-3 bg-surface-hover rounded text-xs text-text-secondary">
        <p className="font-medium mb-1">{t('inpainting.tips.title')}</p>
        <ul className="list-disc list-inside space-y-1">
          <li>{t('inpainting.tips.tip1')}</li>
          <li>{t('inpainting.tips.tip2')}</li>
          <li>{t('inpainting.tips.tip3')}</li>
        </ul>
      </div>
    </div>
  );
};
