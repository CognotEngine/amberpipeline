import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 定义支持的模式类型
export type WorkflowMode = 'sam' | 'rigging' | 'precision-cut' | 'character-layer' | 'skeleton-binding';

// 历史记录项接口
interface HistoryItem {
  mode: WorkflowMode;
  tool: string;
  settings: Record<string, any>;
}

// 工作流状态接口
interface WorkflowState {
  // 当前工作流模式
  currentMode: WorkflowMode;
  
  // 当前激活的工具
  activeTool: string;
  
  // 工具设置，按模式分组
  toolSettings: Record<WorkflowMode, Record<string, any>>;
  
  // 工作空间预设
  workspacePreset: string;
  
  // 历史记录
  history: HistoryItem[];
  
  // 历史记录索引
  historyIndex: number;
}

// 工作流操作接口
interface WorkflowActions {
  // 设置当前工作流模式
  setMode: (mode: WorkflowMode) => void;
  
  // 设置当前工具
  setActiveTool: (tool: string) => void;
  
  // 更新工具设置
  updateToolSettings: (settings: Record<string, any>) => void;
  
  // 重置工具设置到默认值
  resetToolSettings: (mode: WorkflowMode) => void;
  
  // 设置工作空间预设
  setWorkspacePreset: (preset: string) => void;
  
  // 撤销操作
  undo: () => void;
  
  // 重做操作
  redo: () => void;
  
  // 清除历史记录
  clearHistory: () => void;
  
  // 保存历史记录
  saveHistory: () => void;
}

// 默认工具设置
const defaultToolSettings: Record<WorkflowMode, Record<string, any>> = {
  sam: {
    threshold: 0.9,
    edgeRefinement: 5,
    modelType: 'vit_h',
    autoSave: true
  },
  rigging: {
    riggingMode: 'IK',
    showBones: true,
    controlPointSize: 8,
    autoAlign: false,
    constraintType: 'none'
  },
  'precision-cut': {
    brushSize: 5,
    tolerance: 0.1,
    autoSnap: true
  },
  'character-layer': {
    layerOpacity: 1,
    showGuides: true
  },
  'skeleton-binding': {
    weightThreshold: 0.1,
    smoothness: 3
  }
};

/**
 * 工作流状态管理Store
 * 使用Zustand进行状态管理，支持持久化和开发工具
 */
export const useWorkflowStore = create<WorkflowState & WorkflowActions>()(
  devtools(
    persist(
      (set, get) => ({
        // 状态
        currentMode: 'sam',
        activeTool: 'brush',
        toolSettings: { ...defaultToolSettings },
        workspacePreset: 'default',
        history: [],
        historyIndex: -1,

        // 操作
        setMode: (mode) => {
          const state = get();
          // 保存当前状态到历史记录
          const currentState = {
            mode: state.currentMode,
            tool: state.activeTool,
            settings: JSON.parse(JSON.stringify(state.toolSettings[state.currentMode]))
          };
          
          // 添加到历史记录
          const newHistory = [...state.history.slice(0, state.historyIndex + 1), currentState];
          
          set({ 
            currentMode: mode,
            history: newHistory,
            historyIndex: newHistory.length - 1,
            // 如果模式不存在，初始化默认设置
            toolSettings: {
              ...state.toolSettings,
              [mode]: state.toolSettings[mode] || { ...defaultToolSettings[mode] }
            }
          });
        },

        setActiveTool: (tool) => {
          set({ activeTool: tool });
        },

        updateToolSettings: (settings) => {
          const state = get();
          const currentMode = state.currentMode;
          
          set({
            toolSettings: {
              ...state.toolSettings,
              [currentMode]: {
                ...state.toolSettings[currentMode],
                ...settings
              }
            }
          });
        },

        resetToolSettings: (mode) => {
          const state = get();
          set({
            toolSettings: {
              ...state.toolSettings,
              [mode]: { ...defaultToolSettings[mode] }
            }
          });
        },

        setWorkspacePreset: (preset) => {
          set({ workspacePreset: preset });
        },

        saveHistory: () => {
          const state = get();
          
          // 添加当前状态到历史记录
          const currentState = {
            mode: state.currentMode,
            tool: state.activeTool,
            settings: JSON.parse(JSON.stringify(state.toolSettings[state.currentMode]))
          };
          
          // 如果不是在历史记录的末尾，删除后面的记录
          const newHistory = [...state.history.slice(0, state.historyIndex + 1), currentState];
          
          set({
            history: newHistory,
            historyIndex: newHistory.length - 1
          });
        },

        undo: () => {
          const state = get();
          // 检查是否可以撤销
          if (state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1;
            const historyItem = state.history[newIndex];
            if (historyItem) {
              set({
                currentMode: historyItem.mode,
                activeTool: historyItem.tool,
                toolSettings: {
                  ...state.toolSettings,
                  [historyItem.mode]: historyItem.settings
                },
                historyIndex: newIndex
              });
            }
          }
        },

        redo: () => {
          const state = get();
          // 检查是否可以重做
          if (state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1;
            const historyItem = state.history[newIndex];
            if (historyItem) {
              set({
                currentMode: historyItem.mode,
                activeTool: historyItem.tool,
                toolSettings: {
                  ...state.toolSettings,
                  [historyItem.mode]: historyItem.settings
                },
                historyIndex: newIndex
              });
            }
          }
        },

        clearHistory: () => {
          set({ 
            history: [],
            historyIndex: -1
          });
        }
      }),
      {
        name: 'workflow-store', // 持久化存储的名称
        partialize: (state) => ({
          // 只持久化需要保存的状态
          currentMode: state.currentMode,
          activeTool: state.activeTool,
          toolSettings: state.toolSettings,
          workspacePreset: state.workspacePreset
        })
      }
    ),
    {
      name: 'workflow-store'
    }
  )
);

/**
 * 工作流工具设置Hook
 * 提供简化的工具设置访问和更新方法
 */
export function useToolSettings(mode?: WorkflowMode) {
  const currentMode = useWorkflowStore((state) => state.currentMode);
  const toolSettings = useWorkflowStore((state) => state.toolSettings);
  const updateToolSettings = useWorkflowStore((state) => state.updateToolSettings);
  const resetToolSettings = useWorkflowStore((state) => state.resetToolSettings);
  
  const targetMode = mode || currentMode;
  const settings = toolSettings[targetMode] || {};
  
  return {
    settings,
    updateSettings: (newSettings: Record<string, any>) => {
      updateToolSettings(newSettings);
    },
    resetSettings: () => {
      resetToolSettings(targetMode);
    }
  };
}

/**
 * 工作流历史记录Hook
 * 提供撤销重做功能
 */
export function useWorkflowHistory() {
  const history = useWorkflowStore((state) => state.history);
  const historyIndex = useWorkflowStore((state) => state.historyIndex);
  const undo = useWorkflowStore((state) => state.undo);
  const redo = useWorkflowStore((state) => state.redo);
  const clearHistory = useWorkflowStore((state) => state.clearHistory);
  
  // 直接计算canUndo和canRedo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  return {
    canUndo,
    canRedo,
    undo,
    redo,
    clearHistory
  };
}
