import React, { useState } from 'react';

interface ModelOption {
  id: string;
  name: string;
}

interface ModelSelectorProps {
  className?: string;
  onModelChange?: (modelId: string) => void;
}

/**
 * 模型选择器组件
 * 功能：提供SAM模型选择功能，支持ViT-H、ViT-L、ViT-B等不同精度模型
 */
export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  className, 
  onModelChange 
}) => {
  // 支持的模型列表
  const models: ModelOption[] = [
    { id: 'vit_h', name: 'ViT-H (高精度)' },
    { id: 'vit_l', name: 'ViT-L (平衡)' },
    { id: 'vit_b', name: 'ViT-B (轻量级)' }
  ];

  // 当前选中的模型
  const [selectedModel, setSelectedModel] = useState('vit_h');

  /**
   * 保存模型设置
   */
  const saveModelConfig = async (modelId: string) => {
    try {
      // 更新本地状态
      setSelectedModel(modelId);
      
      // 通知父组件模型变更
      if (onModelChange) {
        onModelChange(modelId);
      }
      
      // 可以在这里添加与后端的同步逻辑
      // const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
      // await fetch(`${baseUrl}/config/set-model`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({ modelType: modelId })
      // })
    } catch (error) {
      console.error('保存模型配置失败:', error);
    }
  };

  /**
   * 当选中模型变化时保存设置
   */
  const handleModelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newModelId = event.target.value;
    saveModelConfig(newModelId);
  };

  return (
    <div className={`model-selector py-1 ${className || ''}`}>
      <div className="text-gray-400 mb-2">模型设置:</div>
      <div className="flex flex-col space-y-2">
        <label htmlFor="modelType" className="text-white text-xs">选择模型:</label>
        <select
          id="modelType"
          value={selectedModel}
          onChange={handleModelChange}
          className="w-full px-3 py-2 text-sm bg-[#2A2A2A] border border-[#333333] rounded-lg text-white focus:outline-none focus:border-[#444444]"
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};