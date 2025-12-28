import { Suspense, useState } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '../lib/queryClient'
import { useAppStore, useCurrentMode } from '../stores/appStore'
import { Loader2 } from 'lucide-react'
import { LeftNavigation } from '../components/common/LeftNavigation'
import { Header } from '../modules/header/Header'
import { MainCanvas } from '../modules/canvas/MainCanvas'

import { StatusBar } from '../components/common/StatusBar'
import { useSingleShortcut } from '../hooks/useShortcut'
// 
import { ThemeProvider } from '../themes/ThemeContext'
import { CanvasProvider } from '../modules/canvas/composables/CanvasContext'

/**
 * 主应用组件
 * 集成TanStack Query和React 19 Suspense
 * 处理AI模型推理的异步状态管理
 * 实现六区域布局：顶部导航栏、左侧工具栏、中间画布、右侧属性面板、底部任务区、底部状态栏
 */
function App() {
  const currentMode = useCurrentMode()
  const { setCurrentMode } = useAppStore()
  // const { t } = useTranslation()
  
  // 处理导航模式切换
  const handleModeChange = (mode: 'sam' | 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'rigging' | 'animation') => {
    setCurrentMode(mode)
  }

  // 属性面板可见性状态 - 默认收起
  // const [propertiesVisible, setPropertiesVisible] = useState(false)
  
  // 模拟标签页数据
  const [tabs, setTabs] = useState([
    { id: 'tab-1', title: '背景分层', mode: 'precision-cut' as const, content: {} },
    { id: 'tab-2', title: '部位拆解', mode: 'character-layer' as const, content: {} },
    { id: 'tab-3', title: '骨骼绑定', mode: 'skeleton-binding' as const, content: {} },
    { id: 'tab-4', title: '骨骼动画', mode: 'animation' as const, content: {} }
  ])
  
  // 当前活动标签页
  const [activeTabId, setActiveTabId] = useState('tab-1')
  
  // 处理新建画布
  const handleNewCanvas = (width: number, height: number, mode: 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'animation') => {
    // 创建新标签页
    const newTab = {
      id: `tab-${tabs.length + 1}`,
      title: `画布 ${tabs.length + 1}`,
      mode,
      content: {
        width,
        height,
        layers: []
      }
    }
    
    // 添加新标签页并激活
    setTabs([...tabs, newTab])
    setActiveTabId(newTab.id)
    
    // 切换到对应的模式
    setCurrentMode(mode)
  }
  
  // 处理打开图片
  const handleOpenImage = () => {
    // 创建一个隐藏的文件输入元素
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.accept = 'image/*'
    
    // 监听文件选择事件
    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        const file = target.files[0]
        const reader = new FileReader()
        
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string
          
          // 创建Image对象获取图片尺寸
          const img = new Image();
          img.onload = () => {
            const width = img.width;
            const height = img.height;
            
            // 使用函数式更新来获取最新的状态值
            setTabs((prevTabs) => {
              // 使用当前的activeTabId状态
              if (activeTabId && prevTabs.length > 0) {
                // 如果有当前活跃的标签页，将图片添加到当前画布
                return prevTabs.map(tab => {
                  if (tab.id === activeTabId) {
                    // 更新当前活跃标签页的内容，添加图片
                    return {
                      ...tab,
                      title: file.name,
                      content: {
                        ...tab.content,
                        imagePath: imageUrl,
                        width: width,
                        height: height,
                        layers: (tab.content as any).layers || []
                      }
                    }
                  }
                  return tab
                })
              } else {
                // 如果没有活跃的标签页，创建新标签页
                const newTab = {
                  id: `tab-${prevTabs.length + 1}`,
                  title: file.name,
                  mode: 'precision-cut' as const,
                  content: {
                    imagePath: imageUrl,
                    width: width,
                    height: height,
                    layers: []
                  }
                }
                
                // 添加新标签页
                const updatedTabs = [...prevTabs, newTab]
                // 激活新标签页
                setActiveTabId(newTab.id)
                return updatedTabs
              }
            })
          };
          img.src = imageUrl;
          
          // 切换到抠图模式
          setCurrentMode('precision-cut')
        }
        
        reader.readAsDataURL(file)
      }
    }
    
    // 触发文件选择对话框
    fileInput.click()
  }
  
  // 处理保存图片
  const handleSaveImage = () => {
    console.log('保存图片')
  }
  
  // 使用封装好的快捷键Hook来注册各个快捷键
  // Ctrl+N: 新建画布
  useSingleShortcut('Ctrl+N', () => {
    handleNewCanvas(1920, 1080, 'precision-cut')
  }, { preventDefault: true })
  
  // Ctrl+O: 打开图片
  useSingleShortcut('Ctrl+O', handleOpenImage, { preventDefault: true })
  
  // Ctrl+S: 保存图片
  useSingleShortcut('Ctrl+S', handleSaveImage, { preventDefault: true })
  
  // 模拟任务数据
  const [tasks] = useState([
    { id: 'task-1', title: '任务 1', filename: 'sample-1.png', progress: 100, status: 'completed' as const, timestamp: Date.now() - 300000 },
    { id: 'task-2', title: '任务 2', filename: 'sample-2.png', progress: 50, status: 'processing' as const, timestamp: Date.now() - 150000 },
    { id: 'task-3', title: '任务 3', filename: 'sample-3.png', progress: 0, status: 'pending' as const, timestamp: Date.now() }
  ])
  
  // 系统状态数据
  const [systemStatus] = useState({
    gpuLoad: 0,
    vramUsage: { used: 0, total: 8 },
    fps: 60,
    errorCount: 0,
    warningCount: 0
  })

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CanvasProvider>

          <div className="h-screen flex flex-col bg-background text-foreground">
            {/* 顶部导航栏 */}
            <Header 
              onNewCanvas={handleNewCanvas}
              onOpenImage={handleOpenImage}
              onSaveImage={handleSaveImage}
            />
            
            {/* 中间主要内容区 - 包含左侧工具栏、画布区域、右侧属性面板 */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* 左侧极窄工具栏 - 响应式调整 */}
              <LeftNavigation currentMode={currentMode as any} onModeChange={handleModeChange as any} />
              
              {/* 中间画布区域 - 响应式调整 */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* 工作区 - 使用Suspense处理异步加载 */}
                <main className="flex-1 overflow-hidden">
                  <Suspense fallback={
                    <div className="flex-1 flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">正在加载AI模型...</p>
                      </div>
                    </div>
                  }>
                    {/* 主画布 - 带标签的画布切换 */}
                    <MainCanvas 
                      tabs={tabs}
                      activeTabId={activeTabId}
                      currentMode={currentMode as 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'animation'}
                      onTabCreate={() => {
                        const newTab = {
                          id: `tab-${Date.now()}`,
                          title: `画布 ${tabs.length + 1}`,
                          mode: 'precision-cut' as const,
                          content: {}
                        };
                        setTabs([...tabs, newTab]);
                        setActiveTabId(newTab.id);
                      }}
                      onTabClose={(tabId) => {
                        setTabs(tabs.filter(tab => tab.id !== tabId))
                        if (activeTabId === tabId && tabs.length > 1) {
                          setActiveTabId(tabs.find(tab => tab.id !== tabId)?.id || '')
                        }
                      }}
                      onTabSelect={(tabId) => {
                        setActiveTabId(tabId);
                        // 更新currentMode为当前标签页的mode
                        const selectedTab = tabs.find(tab => tab.id === tabId);
                        if (selectedTab) {
                          setCurrentMode(selectedTab.mode);
                        }
                      }}
                      onImport={() => console.log('导入文件')}
                      onProcessingChange={() => console.log('处理状态变化')}
                      className="h-full"
                    />
                  </Suspense>
                </main>
                

              </div>
            </div>
            
            {/* 底部极窄状态栏 */}
            <StatusBar status={systemStatus} />
          </div>
          
          {/* TanStack Query 开发工具 */}
          <ReactQueryDevtools initialIsOpen={false} />
        </CanvasProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App