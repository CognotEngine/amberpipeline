import React, { useState } from 'react';
import { useTranslation } from '../../../../i18n';
import { useCanvasContext } from '../../composables/CanvasContext';
import { cn } from '@/lib/utils';
import { Button, Slider } from '@/components/ui';
import { PSDExporter } from '../../utils/PSDExporter';
import { Eye, EyeOff, Lock, Unlock, Trash2, Copy, Plus } from 'lucide-react';

/**
 * 层级管理器组件
 * 功能：显示和管理图层列表，支持拖拽排序、隐藏/显示、锁定等操作
 */
export const LayerManager: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  // 获取按zIndex排序的图层
  const sortedLayers = [...state.layers].sort((a, b) => b.zIndex - a.zIndex);
  
  // 处理图层选择
  const handleSelectLayer = (layerId: string) => {
    dispatch({ type: 'SET_SELECTED_LAYER', payload: layerId });
  };
  
  // 处理图层可见性切换
  const handleToggleVisibility = (layerId: string, currentVisible: boolean) => {
    dispatch({
      type: 'UPDATE_LAYER',
      payload: {
        id: layerId,
        updates: { visible: !currentVisible }
      }
    });
  };
  
  // 处理图层锁定切换
  const handleToggleLock = (layerId: string) => {
    const layer = sortedLayers.find(l => l.id === layerId);
    if (!layer) return;
    
    dispatch({
      type: 'UPDATE_LAYER',
      payload: {
        id: layerId,
        updates: { locked: !layer.locked }
      }
    });
  };
  
  // 处理图层上移
  const handleLayerMoveUp = (layerId: string) => {
    const currentIndex = sortedLayers.findIndex(layer => layer.id === layerId);
    if (currentIndex > 0) {
      dispatch({
        type: 'REORDER_LAYERS',
        payload: {
          layerId,
          newIndex: currentIndex - 1
        }
      });
    }
  };

  // 处理图层下移
  const handleLayerMoveDown = (layerId: string) => {
    const currentIndex = sortedLayers.findIndex(layer => layer.id === layerId);
    if (currentIndex < sortedLayers.length - 1) {
      dispatch({
        type: 'REORDER_LAYERS',
        payload: {
          layerId,
          newIndex: currentIndex + 1
        }
      });
    }
  };

  // 处理图层删除
  const handleDeleteLayer = (layerId: string) => {
    if (confirm(t('layer.confirmDelete'))) {
      dispatch({
        type: 'DELETE_LAYER',
        payload: layerId
      });
    }
  };

  // 处理图层复制
  const handleDuplicateLayer = (layerId: string) => {
    const layer = sortedLayers.find(l => l.id === layerId);
    if (!layer) return;
    
    dispatch({
      type: 'ADD_LAYER',
      payload: {
        ...layer,
        name: `${layer.name} (副本)`,
        zIndex: layer.zIndex + 1
      }
    });
  };

  // 处理新建图层
  const handleAddLayer = () => {
    dispatch({
      type: 'ADD_LAYER',
      payload: {
        name: `图层 ${state.layers.length + 1}`,
        type: 'object',
        zIndex: state.layers.length,
        opacity: 1,
        visible: true,
        locked: false,
        imagePath: ''
      }
    });
  };

  // 处理图层重命名
  const handleStartRename = (layerId: string, currentName: string) => {
    setEditingLayerId(layerId);
    setEditingName(currentName);
  };

  const handleFinishRename = () => {
    if (editingLayerId && editingName.trim()) {
      dispatch({
        type: 'UPDATE_LAYER',
        payload: {
          id: editingLayerId,
          updates: { name: editingName.trim() }
        }
      });
    }
    setEditingLayerId(null);
    setEditingName('');
  };

  // 处理不透明度调整
  const handleOpacityChange = (layerId: string, opacity: number) => {
    dispatch({
      type: 'UPDATE_LAYER',
      payload: {
        id: layerId,
        updates: { opacity: opacity / 100 }
      }
    });
  };

  // 处理图层合并
  const handleMergeLayers = () => {
    if (state.layers.length < 2) {
      alert(t('layer.needTwoLayers'));
      return;
    }
    
    // TODO: 实现图层合并逻辑
    alert(t('common.notImplemented'));
  };

  // 处理全部显示/隐藏
  const handleToggleAllVisibility = () => {
    const allVisible = sortedLayers.every(l => l.visible);
    sortedLayers.forEach(layer => {
      dispatch({
        type: 'UPDATE_LAYER',
        payload: {
          id: layer.id,
          updates: { visible: !allVisible }
        }
      });
    });
  };

  // 处理导出为PSD
  const handleExportPSD = async () => {
    try {
      // 准备图层数据
      const layerData = sortedLayers.map(layer => ({
        id: layer.id,
        name: layer.name,
        width: 800, // 实际应该从canvas获取
        height: 600,
        imageData: new ImageData(800, 600), // 实际应该从canvas获取
        opacity: layer.opacity,
        visible: layer.visible,
        x: 0,
        y: 0
      }));

      const exportOptions = {
        layers: layerData,
        width: 800,
        height: 600,
        filename: `layers_${Date.now()}.psd`
      };

      // 导出PSD
      const psdBlob = await PSDExporter.exportToPSD(exportOptions);
      PSDExporter.downloadFile(psdBlob, exportOptions.filename);

    } catch (error) {
      console.error('PSD导出失败:', error);
      alert('PSD导出失败: ' + (error as Error).message);
    }
  };

  // 处理导出为PNG序列
  const handleExportPNGSequence = async () => {
    try {
      // 准备图层数据
      const layerData = sortedLayers.map(layer => ({
        id: layer.id,
        name: layer.name,
        width: 800,
        height: 600,
        imageData: new ImageData(800, 600), // 实际应该从canvas获取
        opacity: layer.opacity,
        visible: layer.visible,
        x: 0,
        y: 0
      }));

      const exportOptions = {
        layers: layerData,
        width: 800,
        height: 600,
        filename: `layers_${Date.now()}`
      };

      // 导出PNG序列
      const pngFiles = await PSDExporter.exportToPNGSequence(exportOptions);
      await PSDExporter.downloadMultipleFiles(pngFiles);

    } catch (error) {
      console.error('PNG序列导出失败:', error);
      alert('PNG序列导出失败: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-2 p-2">
      {/* 工具栏 */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="text-sm font-medium text-text-primary">
          {t('stageA.layerManager')}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleAddLayer}
            title={t('layer.addLayer')}
          >
            <Plus size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleToggleAllVisibility}
            title={t('layer.toggleAllVisibility')}
          >
            <Eye size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleMergeLayers}
            title={t('layer.mergeLayers')}
            disabled={state.layers.length < 2}
          >
            ⬇️
          </Button>
        </div>
      </div>
      
      {/* 图层列表 */}
      <div className="max-h-96 overflow-y-auto space-y-1">
        {sortedLayers.length === 0 ? (
          <div className="text-xs text-text-secondary text-center py-8">
            {t('stageA.noLayers')}
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddLayer}
              >
                {t('layer.addLayer')}
              </Button>
            </div>
          </div>
        ) : (
          sortedLayers.map((layer) => (
            <div
              key={layer.id}
              className={cn(
                "border border-border rounded-md overflow-hidden transition-all",
                { 
                  "ring-2 ring-accent border-accent": state.selectedLayerId === layer.id,
                  "opacity-50": !layer.visible
                }
              )}
            >
              {/* 图层主信息 */}
              <div className="flex items-center p-2 bg-surface-elevated hover:bg-surface-hover">
                {/* 图层名称 */}
                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleSelectLayer(layer.id)}
                  onDoubleClick={() => handleStartRename(layer.id, layer.name)}
                >
                  {editingLayerId === layer.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={handleFinishRename}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleFinishRename();
                        if (e.key === 'Escape') {
                          setEditingLayerId(null);
                          setEditingName('');
                        }
                      }}
                      className="w-full px-1 text-xs bg-background border border-accent rounded"
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium truncate">
                        {layer.name}
                      </span>
                      <span className="text-xs text-text-secondary">
                        ({layer.type})
                      </span>
                    </div>
                  )}
                </div>
                
                {/* 操作按钮 */}
                <div className="flex items-center gap-1">
                  {/* 可见性 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleToggleVisibility(layer.id, layer.visible)}
                    title={layer.visible ? t('layer.hide') : t('layer.show')}
                  >
                    {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </Button>
                  
                  {/* 锁定 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleToggleLock(layer.id)}
                    title={layer.locked ? t('layer.unlock') : t('layer.lock')}
                  >
                    {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                  </Button>
                  
                  {/* 复制 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleDuplicateLayer(layer.id)}
                    title={t('layer.duplicate')}
                  >
                    <Copy size={12} />
                  </Button>
                  
                  {/* 删除 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-error hover:text-error"
                    onClick={() => handleDeleteLayer(layer.id)}
                    title={t('layer.delete')}
                  >
                    <Trash2 size={12} />
                  </Button>
                  
                  {/* 上移 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleLayerMoveUp(layer.id)}
                    disabled={sortedLayers.indexOf(layer) === 0}
                    title={t('layer.moveUp')}
                  >
                    ↑
                  </Button>
                  
                  {/* 下移 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleLayerMoveDown(layer.id)}
                    disabled={sortedLayers.indexOf(layer) === sortedLayers.length - 1}
                    title={t('layer.moveDown')}
                  >
                    ↓
                  </Button>
                </div>
              </div>
              
              {/* 图层详细信息（选中时显示） */}
              {state.selectedLayerId === layer.id && (
                <div className="p-2 bg-surface border-t border-border space-y-2">
                  {/* 不透明度 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-text-secondary">
                        {t('layer.opacity')}
                      </label>
                      <span className="text-xs text-text-primary">
                        {Math.round(layer.opacity * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[layer.opacity * 100]}
                      onValueChange={(value: number[]) => handleOpacityChange(layer.id, value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Z-Index */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">{t('layer.zIndex')}</span>
                    <span className="text-text-primary">{layer.zIndex}</span>
                  </div>
                  
                  {/* 图层类型 */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">{t('layer.type')}</span>
                    <span className="text-text-primary">{layer.type}</span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* 导出选项 */}
      <div className="pt-2 border-t border-border space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
          onClick={handleExportPSD}
          disabled={sortedLayers.length === 0}
        >
          {t('stageA.exportPSD')}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs"
          onClick={handleExportPNGSequence}
          disabled={sortedLayers.length === 0}
        >
          {t('stageA.exportPNGSequence')}
        </Button>
      </div>
    </div>
  );
};
