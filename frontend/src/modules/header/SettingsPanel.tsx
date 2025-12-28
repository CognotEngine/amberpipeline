import React, { useState } from 'react';
import { Settings, X, Monitor, Cpu, Info, Palette } from 'lucide-react';
import { CanvasSettings } from '../../canvas/components/CanvasSettings';

interface SettingsPanelProps {
  onClose: () => void;
}

/**
 * 设置面板组件
 * 包含通用设置、画布设置、模型配置和关于信息的模态对话框
 */
const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  // 当前选中的标签页
  const [activeTab, setActiveTab] = useState<'general' | 'canvas' | 'model' | 'about'>('general');

  // 切换标签页
  const switchTab = (tab: 'general' | 'canvas' | 'model' | 'about') => {
    setActiveTab(tab);
  };

  // 关闭面板
  const closePanel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9998]" onClick={closePanel}>
      <div 
        className="bg-surface border border-border rounded-xl w-[700px] h-[500px] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-accent" />
            <span className="text-textPrimary text-sm font-medium">设置</span>
          </div>
          <button 
            onClick={closePanel}
            className="text-textSecondary hover:text-textPrimary transition-colors duration-150"
          >
            <X size={18} />
          </button>
        </div>

        {/* 主体内容 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 左侧菜单 */}
          <div className="w-40 bg-background border-r border-border py-2">
            <button
              onClick={() => switchTab('general')}
              className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-all duration-150 ${activeTab === 'general' ? 'text-accent bg-surfaceElevated border-r-2 border-accent' : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceElevated'}`}
            >
              <Monitor size={16} />
              通用
            </button>
            <button
              onClick={() => switchTab('canvas')}
              className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-all duration-150 ${activeTab === 'canvas' ? 'text-accent bg-surfaceElevated border-r-2 border-accent' : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceElevated'}`}
            >
              <Palette size={16} />
              画布
            </button>
            <button
              onClick={() => switchTab('model')}
              className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-all duration-150 ${activeTab === 'model' ? 'text-accent bg-surfaceElevated border-r-2 border-accent' : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceElevated'}`}
            >
              <Cpu size={16} />
              模型
            </button>
            <button
              onClick={() => switchTab('about')}
              className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-all duration-150 ${activeTab === 'about' ? 'text-accent bg-surfaceElevated border-r-2 border-accent' : 'text-textSecondary hover:text-textPrimary hover:bg-surfaceElevated'}`}
            >
              <Info size={16} />
              关于
            </button>
          </div>

          {/* 右侧内容区域 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* 通用设置 */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-textPrimary text-sm font-medium mb-4">界面设置</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-textSecondary text-sm">深色模式</span>
                      <div className="w-10 h-5 bg-accent rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-textSecondary text-sm">自动保存</span>
                      <div className="w-10 h-5 bg-accent rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-textPrimary text-sm font-medium mb-4">语言</h3>
                  <select className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textPrimary text-sm focus:outline-none focus:border-accent">
                    <option>简体中文</option>
                    <option>English</option>
                  </select>
                </div>
              </div>
            )}

            {/* 模型设置 */}
            {activeTab === 'model' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-textPrimary text-sm font-medium mb-4">模型路径</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-textSecondary text-xs mb-1 block">SAM模型</label>
                      <input 
                        type="text" 
                        defaultValue="/models/sam_vit_h_4b8939.pth"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textPrimary text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div>
                      <label className="text-textSecondary text-xs mb-1 block">深度估计模型</label>
                      <input 
                        type="text" 
                        defaultValue="/models/depth_anything_v2_vitl14.pth"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textPrimary text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-white text-sm font-medium mb-4">推理设置</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-textSecondary text-sm">使用GPU加速</span>
                      <div className="w-10 h-5 bg-accent rounded-full relative cursor-pointer">
                        <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div>
                      <label className="text-textSecondary text-xs mb-1 block">批处理大小</label>
                      <input 
                        type="number" 
                        defaultValue="4"
                        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-textPrimary text-sm focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 画布设置 */}
            {activeTab === 'canvas' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-textPrimary text-sm font-medium mb-4">画布设置</h3>
                  <CanvasSettings />
                </div>
              </div>
            )}

            {/* 关于 */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-accent rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Settings size={32} className="text-white" />
                  </div>
                  <h3 className="text-textPrimary text-lg font-medium mb-2">AmberPipeline</h3>
                  <p className="text-textSecondary text-sm mb-4">AI驱动的3D角色制作流水线</p>
                  <div className="text-gray-500 text-xs">
                    <p>版本: 1.0.0</p>
                    <p className="mt-1">构建日期: 2024-12-26</p>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <h4 className="text-white text-sm font-medium mb-3">技术栈</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-400">React 19</div>
                    <div className="text-gray-400">TypeScript</div>
                    <div className="text-gray-400">PyTorch</div>
                    <div className="text-gray-400">Electron</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-border">
          <button 
            onClick={closePanel}
            className="px-4 py-2 text-sm text-textSecondary hover:text-textPrimary transition-colors duration-150"
          >
            取消
          </button>
          <button 
            onClick={closePanel}
            className="px-4 py-2 text-sm bg-accent text-textPrimary rounded-lg hover:bg-accentDark transition-colors duration-150"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;