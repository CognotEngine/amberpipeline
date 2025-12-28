import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from '../../i18n';
import { useCanvas } from '../../composables/useCanvas';
import { useTabSystem } from './composables/useTabSystem';
import { RenderDispatcher } from './components/Renderers/RenderDispatcher';
import { SmartPanel } from './components/SmartPanel';
import { useCanvasContext } from './composables/CanvasContext';
import { CanvasThemeProvider } from './composables/CanvasThemeProvider';
import { DynamicToolbar } from './components/DynamicToolbar';
import { useTools } from './composables/useTools';

import GridOverlay from './components/GridOverlay';
import { Button, Card } from '../../components/ui';
import { sx } from '../../themes/themeUtils';
import { TabSystem } from './components/TabBar/TabSystem';
// 导入Lucide图标已在useTools中完成

// 导入Tab接口
type Tab = import('./components/TabBar/TabSystem').Tab;

interface MainCanvasProps {
  tabs: Tab[];
  activeTabId: string;
  currentMode: 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'animation';
  onTabCreate?: () => void;
  onTabClose?: (tabId: string) => void;
  onTabSelect?: (tabId: string) => void;
  onTabRename?: (tabId: string, newTitle: string) => void;
  onImport?: () => void;
  onProcessingChange?: (isProcessing: boolean) => void;
  className?: string;
}

/**
 * 主画布组件
 * 功能：提供图像编辑的核心画布功能，包括缩放、平移、工具选择等
 */
export const MainCanvas: React.FC<MainCanvasProps> = ({
  tabs: initialTabs,
  activeTabId: initialActiveTabId,
  currentMode,
  onTabCreate,
  onTabClose,
  onTabSelect,
  onTabRename,
  // onImport,
  // onProcessingChange,
  className
}) => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  
  // 使用多页签系统Hook
  const { 
    tabs, 
    activeTabId,
    createTab,
    closeTab,
    selectTab,
    updateTab
  } = useTabSystem(initialTabs, {
    initialActiveTabId,
    onTabCreate,
    onTabClose,
    onTabSelect
  });
  
  // 处理标签页重命名
  const handleTabRename = (tabId: string, newTitle: string) => {
    updateTab(tabId, { title: newTitle });
    onTabRename?.(tabId, newTitle);
  };
  
  // 将activeTab转换为状态变量，确保标签页切换时能正确触发更新
  const [activeTab, setActiveTab] = React.useState<Tab | undefined>(
    tabs.find(tab => tab.id === activeTabId)
  );
  
  // 当activeTabId变化时，更新activeTab状态
  useEffect(() => {
    const newActiveTab = tabs.find(tab => tab.id === activeTabId);
    setActiveTab(newActiveTab);
  }, [activeTabId, tabs]);

  // 当activeTab变化时，将图片作为背景图层添加到CanvasContext中
  useEffect(() => {
    if (activeTab?.content?.imagePath) {
      // 检查是否已存在背景图层
      const hasBackgroundLayer = state.layers.some(layer => layer.type === 'background');
      if (!hasBackgroundLayer) {
        // 添加背景图层
        dispatch({
          type: 'ADD_LAYER',
          payload: {
            name: t('layer.background'),
            type: 'background',
            zIndex: 0,
            opacity: 1,
            visible: true,
            locked: false,
            imagePath: activeTab.content.imagePath
          }
        });
      } else {
        // 更新现有的背景图层
        const backgroundLayer = state.layers.find(layer => layer.type === 'background');
        if (backgroundLayer && backgroundLayer.imagePath !== activeTab.content.imagePath) {
          dispatch({
            type: 'UPDATE_LAYER',
            payload: {
              id: backgroundLayer.id,
              updates: {
                imagePath: activeTab.content.imagePath
              }
            }
          });
        }
      }
    }
  }, [activeTab, state.layers, dispatch]);
  
  // 同步当前模式到CanvasContext
  useEffect(() => {
    const stageMap = {
      'precision-cut': 'A' as const,
      'character-layer': 'B' as const,
      'skeleton-binding': 'C' as const,
      'animation': 'D' as const
    };
    // 使用currentMode直接设置CanvasContext的activeStage，确保左侧工具栏切换时属性面板能同步更新
    dispatch({ type: 'SET_ACTIVE_STAGE', payload: stageMap[currentMode] });
  }, [currentMode, dispatch]);
  
  // 使用Canvas操作hook
  const { 
    transform, 
    transformStyle, 
    startDrag, 
    drag: onDrag, 
    endDrag, 
    zoomIn, 
    zoomOut, 
    fitCanvas
  } = useCanvas({
    minScale: 0.1,
    maxScale: 8,
    scaleStep: 0.1,
    enableRotation: true,
    enablePan: true,
    enableZoom: true,
    enableKeyboardControls: true,
    keyboardPanSpeed: 10
  });
  
  // 从transform中提取scale、x、y
  const { scale, x, y } = transform;
  
  // 使用工具Hook获取工具列表
  const { tools } = useTools();

  
  // 处理工具选择
  const handleToolSelect = (toolId: string) => {
    if (toolId === 'grid') {
      dispatch({ type: 'TOGGLE_GRID' });
    } else {
      dispatch({ type: 'SET_ACTIVE_TOOL', payload: toolId });
    }
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log('选择文件:', file.name);
      // 这里可以添加文件处理逻辑
    }
  };

  return (
    <CanvasThemeProvider canvasType={currentMode}>
      <div className={cn(sx(['relative', 'flex', 'h-full', 'bg.background', 'overflow-hidden']), className)}>
      {/* 隐藏的文件选择器 */}
      <input
        id="image-upload-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      

      
      {/* 中间主区域 */}
      <div className="flex-1 flex flex-col">
        {/* 标签页系统 - 使用封装的TabSystem组件 */}
        <TabSystem
          tabs={tabs}
          activeTabId={activeTabId}
          options={{
            showScrollButtons: true,
            allowRename: true,
            maxTabWidth: 200,
            minTabWidth: 80
          }}
          onTabCreate={() => {
            // 创建新标签页，使用当前模式和默认画布尺寸
            createTab({
              title: t('canvas.title', { number: tabs.length + 1 }),
              mode: currentMode,
              content: {
                width: 1920,
                height: 1080
              }
            });
          }}
          onTabClose={closeTab}
          onTabSelect={selectTab}
          onTabRename={handleTabRename}
        />
        
        {/* 画布视口 */}
        <div
          className={sx([
            'relative', 'flex-1', 'overflow-hidden', 'rounded-[2px]', 'bg.surface', 
            'border', 'cursor-move', 'transition-all', 'duration-300',
            activeTab?.mode === 'precision-cut' ? 'border-blue-500 shadow-sm shadow-blue-500/20' : 
            activeTab?.mode === 'character-layer' ? 'border-light-blue-500 shadow-sm shadow-light-blue-500/20' : 
            activeTab?.mode === 'skeleton-binding' ? 'border-purple-500 shadow-sm shadow-purple-500/20' : 
            activeTab?.mode === 'animation' ? 'border-green-500 shadow-sm shadow-green-500/20' : 
            'border.border'
          ])}
          onWheel={(e) => {
            e.preventDefault();
            // 滚轮缩放，deltaY为负时放大，为正时缩小
            if (e.deltaY > 0) {
              zoomOut();
            } else {
              zoomIn();
            }
          }}
          onMouseDown={startDrag}
          onMouseMove={onDrag}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
        >
          {/* 网格覆盖层 */}
          <GridOverlay 
            width={activeTab?.content?.width || 800}
            height={activeTab?.content?.height || 600}
            transform={{ scale, translateX: x, translateY: y }}
          />
          
          {/* 画布容器 */}
          <div className={sx(['absolute', 'inset-0', 'flex', 'items-center', 'justify-center'])}>
            {/* 图像容器 */}
            <div 
              className={sx(['relative', 'transition-transform', 'duration-100', 'w-full', 'h-full'])}
              style={transformStyle}
            >
              {/* 背景层 - 移到内容层内部，与内容一起变换 */}
              <div className={sx(['absolute', 'inset-0', 'transition-all', 'duration-500', 'z-0'])} 
                   style={{ 
                     background: activeTab?.mode === 'precision-cut' ? 
                       'repeating-conic-gradient(#1F1F1F 0 25%, #1D1D1D 0 50%) 50%/60px 60px' : 
                     activeTab?.mode === 'character-layer' ? 
                       'repeating-conic-gradient(#212121 0 25%, #1F1F1F 0 50%) 50%/40px 40px' : 
                     activeTab?.mode === 'skeleton-binding' ? 
                       'repeating-conic-gradient(#202020 0 25%, #1E1E1E 0 50%) 50%/50px 50px' : 
                     activeTab?.mode === 'animation' ? 
                       'repeating-conic-gradient(#1F1F1F 0 25%, #1D1D1D 0 50%) 50%/45px 45px' : 
                       'repeating-conic-gradient(#202020 0 25%, #1E1E1E 0 50%) 50%/40px 40px' 
                   }} 
              />
              
              {/* RenderDispatcher组件 - 根据当前模式动态渲染对应的图层 */}
              <RenderDispatcher 
                mode={currentMode}
                data={activeTab?.content || {}}
                transform={{ 
                  scale, 
                  translateX: x, 
                  translateY: y 
                }}
                onProcessingChange={(isProcessing) => {
                  console.log('处理状态变化:', isProcessing);
                }}
              />
            </div>
          </div>
          
          {/* 画布标识 */}
          <div className={sx(['absolute', 'top-4', 'left-4', 'bg.surface/80', 'border', 'border.border', 'rounded-full', 'p-2', 'shadow-md', 'text-lg', 'transition-all', 'duration-200', 'backdrop-blur-sm'])}>
            {activeTab?.mode === 'precision-cut' && '🔪'}
            {activeTab?.mode === 'character-layer' && '🧩'}
            {activeTab?.mode === 'skeleton-binding' && '🦴'}
            {activeTab?.mode === 'animation' && '🎬'}
          </div>
          
          {/* 画布控制工具栏 */}
          <Card className={sx(['absolute', 'top-4', 'right-4', 'bg.surface', 'border', 'border.border', 'rounded-lg', 'p-2', 'space-y-2', 'shadow-md', 'transition-all', 'duration-200', 'hover:shadow-lg'])}>
            <div className={sx(['flex', 'space-x-2'])}>
              <Button
                variant="primary"
                size="small"
                className={sx(['px-2', 'py-1', 'text-xs', 'bg.accent', 'text.white', 'rounded', 'hover:bg.accent-dark', 'hover:shadow-md', 'transition-all', 'duration-200', 'transform', 'hover:scale-105'])}
                onClick={zoomIn}
                title="Zoom In"
              >
                +
              </Button>
              <Button
                variant="primary"
                size="small"
                className={sx(['px-2', 'py-1', 'text-xs', 'bg.accent', 'text.white', 'rounded', 'hover:bg.accent-dark', 'hover:shadow-md', 'transition-all', 'duration-200', 'transform', 'hover:scale-105'])}
                onClick={zoomOut}
                title="Zoom Out"
              >
                -
              </Button>
              <Button
                variant="primary"
                size="small"
                className={sx(['px-2', 'py-1', 'text-xs', 'bg.accent', 'text.white', 'rounded', 'hover:bg.accent-dark', 'hover:shadow-md', 'transition-all', 'duration-200', 'transform', 'hover:scale-105'])}
                onClick={fitCanvas}
                title="Fit Canvas"
              >
                ⚡
              </Button>

            </div>
            <div className={sx(['text-xs', 'text.text-secondary', 'text-center'])}>
              {(scale * 100).toFixed(0)}%
            </div>
          </Card>
          
          {/* 动态工具栏 - 根据当前阶段显示工具 */}
          <DynamicToolbar 
            tools={tools}
            position="top-left"
            onToolSelect={handleToolSelect}
          />
        </div>
        

      </div>
      
      {/* 右侧属性面板 */}
      <SmartPanel />
    </div>
    </CanvasThemeProvider>
  );
};