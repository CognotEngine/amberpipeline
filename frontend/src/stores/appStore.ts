import { create } from 'zustand'
import { switchTheme as switchThemeManager, getCurrentThemeId, addThemeListener } from '../themes/themeManager'

// 导航模式类型定义
type NavigationMode = 'sam' | 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'rigging' | 'animation'

// 语言代码类型
export type LanguageCode = 'zh-CN' | 'en' | 'ja'

interface AppState {
  // 导航状态
  currentMode: NavigationMode
  
  // 应用状态
  isLoading: boolean
  theme: 'light' | 'dark'
  
  // 语言状态
  language: LanguageCode
  
  // 图像处理状态
  selectedImage: string | null
  processedImages: Array<{
    id: string
    originalPath: string
    processedPath: string
    mode: NavigationMode
    timestamp: number
  }>
  
  // SAM2模型状态
  samModel: {
    isLoaded: boolean
    isProcessing: boolean
    modelName: string
    device: 'cpu' | 'cuda' | 'mps' | 'unknown'
    memoryUsage: number
    inferenceTime: number
    error: string | null
  }
  
  // 系统状态
  systemInfo: {
    gpuUsage: number
    memoryUsage: number
    fps: number
  }
}

interface AppActions {
  // 导航操作
  setCurrentMode: (mode: NavigationMode) => void
  
  // 主题操作
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  
  // 语言操作
  setLanguage: (language: LanguageCode) => void
  
  // 加载状态
  setLoading: (loading: boolean) => void
  
  // 图像处理操作
  setSelectedImage: (imagePath: string | null) => void
  addProcessedImage: (image: {
    id: string
    originalPath: string
    processedPath: string
    mode: NavigationMode
  }) => void
  removeProcessedImage: (id: string) => void
  
  // SAM2模型操作
  setSamModelLoaded: (loaded: boolean) => void
  setSamModelProcessing: (processing: boolean) => void
  setSamModelName: (name: string) => void
  setSamModelDevice: (device: 'cpu' | 'cuda' | 'mps' | 'unknown') => void
  setSamModelMemoryUsage: (usage: number) => void
  setSamModelInferenceTime: (time: number) => void
  setSamModelError: (error: string | null) => void
  resetSamModelState: () => void
  
  // 系统状态更新
  updateSystemInfo: (info: Partial<AppState['systemInfo']>) => void
}

// 获取初始主题状态
const getInitialTheme = (): 'light' | 'dark' => {
  const currentThemeId = getCurrentThemeId();
  return currentThemeId === 'modern-dark' ? 'dark' : 'light';
};

// 创建应用状态存储
export const useAppStore = create<AppState & AppActions>((set) => {
  // 添加主题管理器监听器，保持状态同步
  addThemeListener((themeId) => {
    set({
      theme: themeId === 'modern-dark' ? 'dark' : 'light'
    });
  });

  return {
    // 初始状态
    currentMode: 'precision-cut',
    isLoading: false,
    theme: getInitialTheme(),
    language: 'zh-CN',
    selectedImage: null,
    processedImages: [],
    samModel: {
      isLoaded: false,
      isProcessing: false,
      modelName: 'SAM 2',
      device: 'unknown',
      memoryUsage: 0,
      inferenceTime: 0,
      error: null
    },
    systemInfo: {
      gpuUsage: 0,
      memoryUsage: 0,
      fps: 60
    },
  
    // 导航操作
    setCurrentMode: (mode) => set({ currentMode: mode }),
  
    // 主题操作
    setTheme: (theme) => {
      set({ theme });
      switchThemeManager(theme === 'dark' ? 'modern-dark' : 'modern-light');
    },
    toggleTheme: () => set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      switchThemeManager(newTheme === 'dark' ? 'modern-dark' : 'modern-light');
      return { theme: newTheme };
    }),
  
    // 语言操作
    setLanguage: (language) => set({ language }),
  
    // 加载状态
    setLoading: (isLoading) => set({ isLoading }),
  
    // 图像处理操作
    setSelectedImage: (selectedImage) => set({ selectedImage }),
  
    addProcessedImage: (image) => set((state) => ({
      processedImages: [...state.processedImages, {
        ...image,
        timestamp: Date.now()
      }]
    })),
  
    removeProcessedImage: (id) => set((state) => ({
      processedImages: state.processedImages.filter(img => img.id !== id)
    })),
  
    // SAM2模型操作
    setSamModelLoaded: (isLoaded) => set((state) => ({
      samModel: { ...state.samModel, isLoaded }
    })),
  
    setSamModelProcessing: (isProcessing) => set((state) => ({
      samModel: { ...state.samModel, isProcessing }
    })),
  
    setSamModelName: (modelName) => set((state) => ({
      samModel: { ...state.samModel, modelName }
    })),
  
    setSamModelDevice: (device) => set((state) => ({
      samModel: { ...state.samModel, device }
    })),
  
    setSamModelMemoryUsage: (memoryUsage) => set((state) => ({
      samModel: { ...state.samModel, memoryUsage }
    })),
  
    setSamModelInferenceTime: (inferenceTime) => set((state) => ({
      samModel: { ...state.samModel, inferenceTime }
    })),
  
    setSamModelError: (error) => set((state) => ({
      samModel: { ...state.samModel, error }
    })),
  
    resetSamModelState: () => set((state) => ({
      samModel: {
        ...state.samModel,
        isProcessing: false,
        error: null
      }
    })),
  
    // 系统状态更新
    updateSystemInfo: (info) => set((state) => ({
      systemInfo: { ...state.systemInfo, ...info }
    }))
  };
});

// 选择器函数，方便在组件中使用
export const useCurrentMode = () => useAppStore((state) => state.currentMode)
export const useTheme = () => useAppStore((state) => state.theme)
export const useLoading = () => useAppStore((state) => state.isLoading)
export const useSelectedImage = () => useAppStore((state) => state.selectedImage)
export const useSystemInfo = () => useAppStore((state) => state.systemInfo)

// SAM2模型状态选择器
export const useSamModel = () => useAppStore((state) => state.samModel)
export const useSamModelLoaded = () => useAppStore((state) => state.samModel.isLoaded)
export const useSamModelProcessing = () => useAppStore((state) => state.samModel.isProcessing)
export const useSamModelName = () => useAppStore((state) => state.samModel.modelName)
export const useSamModelDevice = () => useAppStore((state) => state.samModel.device)
export const useSamModelMemoryUsage = () => useAppStore((state) => state.samModel.memoryUsage)
export const useSamModelInferenceTime = () => useAppStore((state) => state.samModel.inferenceTime)
export const useSamModelError = () => useAppStore((state) => state.samModel.error)