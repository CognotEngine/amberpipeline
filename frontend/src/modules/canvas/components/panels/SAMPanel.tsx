import React, { useState } from 'react';
import { useTranslation } from '../../../../i18n';
import { useCanvasContext } from '../../composables/CanvasContext';
import { Button, Slider } from '@/components/ui';
import { apiService } from '@/lib/api';

type SelectionMode = 'foreground' | 'background' | 'auto';

interface Point {
  x: number;
  y: number;
  label: 0 | 1; // 0: background, 1: foreground
}

/**
 * SAM 智能框选面板组件
 * 功能：提供 SAM 模型的智能分割功能
 */
export const SAMPanel: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('foreground');
  const [points, setPoints] = useState<Point[]>([]);
  const [threshold, setThreshold] = useState(0.5);
  const [maskOpacity, setMaskOpacity] = useState(0.5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMask, setPreviewMask] = useState<string | null>(null);
  const [multipleTargets, setMultipleTargets] = useState(false);
  
  // 添加点
  
  
  // 清除所有点
  const handleClearPoints = () => {
    setPoints([]);
    setPreviewMask(null);
  };
  
  // 撤销最后一个点
  const handleUndoPoint = () => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  };
  
  // 执行分割
  const handleSegment = async () => {
    const selectedLayer = state.layers.find(layer => layer.id === state.selectedLayerId);
    if (!selectedLayer || !selectedLayer.imagePath) {
      alert(t('sam.noImageSelected'));
      return;
    }
    
    if (selectionMode !== 'auto' && points.length === 0) {
      alert(t('sam.needPoints'));
      return;
    }
    
    setIsProcessing(true);
    dispatch({
      type: 'SET_PROCESSING_STATUS',
      payload: {
        isProcessing: true,
        progress: 0,
        message: t('sam.processing')
      }
    });
    
    try {
      // 准备点坐标和标签
      let pointsStr: string | undefined;
      let pointLabelsStr: string | undefined;
      
      if (points.length > 0) {
        pointsStr = points.map(p => `${p.x},${p.y}`).join(';');
        pointLabelsStr = points.map(p => `${p.label}`).join(';');
      }
      
      // 将 base64 图像转换为 File
      const imageBlob = await fetch(selectedLayer.imagePath).then(r => r.blob());
      const imageFile = new File([imageBlob], 'image.png', { type: 'image/png' });
      
      // 调用 SAM API
      const result = await apiService.segmentImage(imageFile, pointsStr, pointLabelsStr);
      
      if (result.success && result.image) {
        // 创建新图层
        dispatch({
          type: 'ADD_LAYER',
          payload: {
            name: `分割 ${state.layers.length + 1}`,
            type: 'object',
            zIndex: state.layers.length,
            opacity: 1,
            visible: true,
            locked: false,
            imagePath: result.image,
            maskPath: result.image
          }
        });
        
        setPreviewMask(result.image);
        
        dispatch({
          type: 'SET_PROCESSING_STATUS',
          payload: {
            isProcessing: false,
            progress: 100,
            message: t('sam.completed')
          }
        });
        
        // 清除点
        handleClearPoints();
      } else {
        throw new Error('Segmentation failed'); // result 对象没有 error 属性，直接使用固定错误信息
      }
    } catch (error) {
      console.error('SAM segmentation failed:', error);
      alert(t('sam.failed') + ': ' + (error as Error).message);
      
      dispatch({
        type: 'SET_PROCESSING_STATUS',
        payload: {
          isProcessing: false,
          progress: 0,
          message: t('sam.failed')
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // 自动分割
  const handleAutoSegment = async () => {
    setSelectionMode('auto');
    await handleSegment();
  };
  
  // 执行移除并修复
  const performInpaint = async () => {
    const selectedLayer = state.layers.find(layer => layer.id === state.selectedLayerId);
    if (!selectedLayer) return;
    
    try {
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: true, 
          progress: 0, 
          message: '正在修复背景...' 
        } 
      });
      
      // 使用API Service调用修复算法
      // 这里需要根据实际情况调整参数
      const result = await apiService.performInpaint(
        selectedLayer.imagePath,
        selectedLayer.maskPath || '',
        'Lama', // 默认算法
        30, // 默认步骤
        10 // 默认填充
      );
      
      if (result.success && result.image) {
        // 更新背景图层
        const backgroundLayer = state.layers.find(layer => layer.type === 'background');
        if (backgroundLayer) {
          dispatch({ 
            type: 'UPDATE_LAYER', 
            payload: { 
              id: backgroundLayer.id, 
              updates: { imagePath: result.image } 
            } 
          });
        } else {
          // 创建新的背景图层
          dispatch({ 
            type: 'ADD_LAYER', 
            payload: { 
              name: '背景层', 
              type: 'background', 
              zIndex: -1, 
              opacity: 1, 
              visible: true, 
              locked: false, 
              imagePath: result.image 
            } 
          });
        }
      }
      
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 100, 
          message: '背景修复完成' 
        } 
      });
    } catch (error) {
      console.error('修复背景失败:', error);
      dispatch({ 
        type: 'SET_PROCESSING_STATUS', 
        payload: { 
          isProcessing: false, 
          progress: 0, 
          message: '背景修复失败' 
        } 
      });
    }
  };

  return (
    <div className="space-y-4 p-4 bg-surface rounded-lg">
      <h4 className="text-sm font-medium text-text-primary">
        {t('sam.title')}
      </h4>
      
      {/* SAM选择模式 - 前景/背景/套索 */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-text-secondary">
          SAM选择模式
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`px-3 py-2 text-xs rounded transition-colors ${state.samSelectionMode === 'foreground' ? 'bg-green-600 text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
            onClick={() => dispatch({ type: 'SET_SAM_SELECTION_MODE', payload: 'foreground' })}
            disabled={isProcessing}
          >
            前景
          </button>
          <button
            className={`px-3 py-2 text-xs rounded transition-colors ${state.samSelectionMode === 'background' ? 'bg-red-600 text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
            onClick={() => dispatch({ type: 'SET_SAM_SELECTION_MODE', payload: 'background' })}
            disabled={isProcessing}
          >
            背景
          </button>
          <button
            className={`px-3 py-2 text-xs rounded transition-colors ${state.samSelectionMode === 'lasso' ? 'bg-blue-600 text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
            onClick={() => dispatch({ type: 'SET_SAM_SELECTION_MODE', payload: 'lasso' })}
            disabled={isProcessing}
          >
            套索
          </button>
        </div>
      </div>
      
      {/* 选择模式 */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-text-secondary">
          {t('sam.selectionMode')}
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            className={`px-3 py-2 text-xs rounded transition-colors ${selectionMode === 'foreground' ? 'bg-green-600 text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
            onClick={() => setSelectionMode('foreground')}
            disabled={isProcessing}
          >
            {t('sam.foreground')}
          </button>
          <button
            className={`px-3 py-2 text-xs rounded transition-colors ${selectionMode === 'background' ? 'bg-red-600 text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
            onClick={() => setSelectionMode('background')}
            disabled={isProcessing}
          >
            {t('sam.background')}
          </button>
          <button
            className={`px-3 py-2 text-xs rounded transition-colors ${selectionMode === 'auto' ? 'bg-blue-600 text-white' : 'bg-surface-hover text-text-primary hover:bg-surface-active'}`}
            onClick={() => setSelectionMode('auto')}
            disabled={isProcessing}
          >
            {t('sam.auto')}
          </button>
        </div>
        <div className="text-xs text-text-secondary">
          {selectionMode === 'foreground' && t('sam.foregroundDesc')}
          {selectionMode === 'background' && t('sam.backgroundDesc')}
          {selectionMode === 'auto' && t('sam.autoDesc')}
        </div>
      </div>
      
      {/* 点列表 */}
      {points.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-text-secondary">
              {t('sam.points')} ({points.length})
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearPoints}
              disabled={isProcessing}
            >
              {t('sam.clearPoints')}
            </Button>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {points.map((point, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-surface-hover rounded text-xs"
              >
                <span>
                  {point.label === 1 ? '🟢' : '🔴'} ({point.x}, {point.y})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPoints(points.filter((_, i) => i !== index))}
                  disabled={isProcessing}
                >
                  ✕
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 阈值调整 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-text-secondary">
            {t('precision-cut.threshold')}
          </label>
          <span className="text-xs text-text-primary">
            {(threshold * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          value={[threshold * 100]}
          onValueChange={(value: number[]) => setThreshold(value[0] / 100)}
          min={0}
          max={100}
          step={1}
          disabled={isProcessing}
          className="w-full"
        />
      </div>
      
      {/* 遮罩透明度 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-text-secondary">
            {t('precision-cut.mask-opacity')}
          </label>
          <span className="text-xs text-text-primary">
            {(maskOpacity * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          value={[maskOpacity * 100]}
          onValueChange={(value: number[]) => setMaskOpacity(value[0] / 100)}
          min={0}
          max={100}
          step={1}
          disabled={isProcessing}
          className="w-full"
        />
      </div>
      
      {/* 多目标分割 */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-text-secondary">
          {t('precision-cut.multiple-targets')}
        </label>
        <button
          className={`px-3 py-1 text-xs rounded transition-colors ${
            multipleTargets
              ? 'bg-accent text-white'
              : 'bg-surface-hover text-text-primary'
          }`}
          onClick={() => setMultipleTargets(!multipleTargets)}
          disabled={isProcessing}
        >
          {multipleTargets ? t('precision-cut.show') : t('precision-cut.hide')}
        </button>
      </div>
      
      {/* 操作按钮 */}
      <div className="space-y-2">
        <Button
          onClick={handleSegment}
          disabled={isProcessing || !state.selectedLayerId || (selectionMode !== 'auto' && points.length === 0)}
          className="w-full"
          variant="primary"
        >
          {isProcessing ? t('sam.processing') : t('sam.segment')}
        </Button>
        
        <Button
          onClick={handleAutoSegment}
          disabled={isProcessing || !state.selectedLayerId}
          className="w-full"
          variant="outline"
        >
          {t('sam.autoSegment')}
        </Button>
        
        <Button
          onClick={handleUndoPoint}
          disabled={isProcessing || points.length === 0}
          className="w-full"
          variant="outline"
        >
          {t('sam.undoPoint')}
        </Button>
        
        <div className="h-px bg-border my-2"></div>
        
        {/* 移除并修复功能 */}
        <Button
          onClick={performInpaint}
          disabled={!state.selectedLayerId || state.processingStatus.isProcessing}
          className="w-full"
          variant="primary"
        >
          {state.processingStatus.isProcessing ? '修复中...' : '移除并修复'}
        </Button>
      </div>
      
      {/* 预览遮罩 */}
      {previewMask && (
        <div className="mt-4">
          <h5 className="text-xs font-medium text-text-secondary mb-2">
            {t('sam.previewMask')}
          </h5>
          <div className="border border-border rounded overflow-hidden">
            <img
              src={previewMask}
              alt="SAM Mask Preview"
              className="w-full h-auto"
              style={{ opacity: maskOpacity }}
            />
          </div>
        </div>
      )}
      
      {/* 使用提示 */}
      <div className="mt-4 p-3 bg-surface-hover rounded text-xs text-text-secondary">
        <p className="font-medium mb-1">{t('sam.tips.title')}</p>
        <ul className="list-disc list-inside space-y-1">
          <li>{t('sam.tips.tip1')}</li>
          <li>{t('sam.tips.tip2')}</li>
          <li>{t('sam.tips.tip3')}</li>
          <li>{t('sam.tips.tip4')}</li>
        </ul>
      </div>
    </div>
  );
};
