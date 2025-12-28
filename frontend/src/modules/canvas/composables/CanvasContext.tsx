import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// 定义Stage类型
export type StageType = 'A' | 'B' | 'C' | 'D';

// 定义工具类型
export type ToolType = 'lasso' | 'brush' | 'eraser' | 'move' | 'hand' | 'skeleton' | 'select';

// 定义图层类型
export interface Layer {
  id: string;
  name: string;
  type: 'background' | 'object' | 'character' | 'skeleton' | 'animation';
  zIndex: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  imagePath: string;
  maskPath?: string;
  properties?: Record<string, any>;
}

// 定义骨骼点类型
export interface SkeletonPoint {
  id: string;
  x: number;
  y: number;
  name?: string;
  parentId?: string;
  childrenIds?: string[];
  rotation?: number;
  scale?: number;
  weights?: Record<string, number>; // 权重映射：顶点ID -> 权重值
}

// 定义关键帧类型
export interface Keyframe {
  id: string;
  time: number;
  properties: Record<string, any>;
  interpolation: 'linear' | 'bezier' | 'easeIn' | 'easeOut';
}

// 定义动画剪辑类型
export interface AnimationClip {
  id: string;
  name: string;
  duration: number;
  keyframes: Keyframe[];
  loop: boolean;
  fps: number;
}

// 定义画布状态类型
export interface CanvasState {
  activeStage: StageType;
  selectedTool: ToolType;
  activeTool: string;
  stage: 'A' | 'B' | 'C' | 'D';
  layers: Layer[];
  selectedLayerId: string | null;
  parts: any[];
  selectedPartId: string | null;
  bones: any[];
  selectedBoneId: string | null;
  skeletonPoints: SkeletonPoint[];
  selectedPointId: string | null;
  animations: AnimationClip[];
  activeAnimationId: string | null;
  currentTime: number;
  isPlaying: boolean;
  zoomLevel: number;
  zoom: number;
  panPosition: { x: number; y: number };
  cursorPosition: { x: number; y: number };
  canvasSize: { width: number; height: number };
  showGrid: boolean;
  gridSize: number;
  processingStatus: {
    isProcessing: boolean;
    progress: number;
    message: string;
  };
  isProcessing: boolean;
  processingMessage: string;
  inpaintMode: boolean;
  brushMode: string | null;
  weightPaintMode: boolean;
  animationDuration: number;
  fps: number;
  onionSkinFrames: number;
  // SAM选择模式
  samSelectionMode: 'foreground' | 'background' | 'lasso';
}

// 定义Action类型
type CanvasAction =
  | { type: 'SET_ACTIVE_STAGE'; payload: StageType }
  | { type: 'SET_SELECTED_TOOL'; payload: ToolType }
  | { type: 'SET_ACTIVE_TOOL'; payload: string }
  | { type: 'SET_STAGE'; payload: 'A' | 'B' | 'C' | 'D' }
  | { type: 'ADD_LAYER'; payload: Omit<Layer, 'id'> }
  | { type: 'UPDATE_LAYER'; payload: { id: string; updates: Partial<Layer> } }
  | { type: 'DELETE_LAYER'; payload: string }
  | { type: 'SET_SELECTED_LAYER'; payload: string | null }
  | { type: 'REORDER_LAYERS'; payload: { layerId: string; newIndex: number } }
  | { type: 'ADD_SKELETON_POINT'; payload: Omit<SkeletonPoint, 'id' | 'childrenIds'> }
  | { type: 'UPDATE_SKELETON_POINT'; payload: { id: string; updates: Partial<SkeletonPoint> } }
  | { type: 'DELETE_SKELETON_POINT'; payload: string }
  | { type: 'SET_SELECTED_POINT'; payload: string | null }
  | { type: 'ADD_ANIMATION'; payload: Omit<AnimationClip, 'id'> }
  | { type: 'UPDATE_ANIMATION'; payload: { id: string; updates: Partial<AnimationClip> } }
  | { type: 'SET_ACTIVE_ANIMATION'; payload: string | null }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'TOGGLE_PLAYING'; payload?: boolean }
  | { type: 'SET_ZOOM_LEVEL'; payload: number }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'SET_PAN_POSITION'; payload: { x: number; y: number } }
  | { type: 'TOGGLE_GRID' }
  | { type: 'SET_GRID_SIZE'; payload: number }
  | { type: 'SET_PROCESSING_STATUS'; payload: CanvasState['processingStatus'] }
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_PROCESSING_MESSAGE'; payload: string }
  | { type: 'SET_INPAINT_MODE'; payload: boolean }
  | { type: 'SET_BRUSH_MODE'; payload: string | null }
  | { type: 'SET_WEIGHT_PAINT_MODE'; payload: boolean }
  | { type: 'SET_ANIMATION_DURATION'; payload: number }
  | { type: 'SET_FPS'; payload: number }
  | { type: 'SET_ONION_SKIN_FRAMES'; payload: number }
  | { type: 'SET_CURSOR_POSITION'; payload: { x: number; y: number } }
  | { type: 'SET_CANVAS_SIZE'; payload: { width: number; height: number } }
  | { type: 'SAVE_PROJECT' }
  | { type: 'EXPORT_PROJECT' }
  | { type: 'RESET_CANVAS' }
  | { type: 'SET_SAM_SELECTION_MODE'; payload: 'foreground' | 'background' | 'lasso' };

// 初始状态
const initialState: CanvasState = {
  activeStage: 'A',
  selectedTool: 'lasso',
  activeTool: 'move',
  stage: 'A',
  layers: [],
  selectedLayerId: null,
  parts: [],
  selectedPartId: null,
  bones: [],
  selectedBoneId: null,
  skeletonPoints: [],
  selectedPointId: null,
  animations: [],
  activeAnimationId: null,
  currentTime: 0,
  isPlaying: false,
  zoomLevel: 1,
  zoom: 1,
  panPosition: { x: 0, y: 0 },
  cursorPosition: { x: 0, y: 0 },
  canvasSize: { width: 1920, height: 1080 },
  showGrid: false,
  gridSize: 50,
  processingStatus: {
    isProcessing: false,
    progress: 0,
    message: ''
  },
  isProcessing: false,
  processingMessage: '',
  inpaintMode: false,
  brushMode: null,
  weightPaintMode: false,
  animationDuration: 5,
  fps: 24,
  onionSkinFrames: 2,
  // SAM选择模式初始值
  samSelectionMode: 'foreground'
};

// Reducer函数
function canvasReducer(state: CanvasState, action: CanvasAction): CanvasState {
  switch (action.type) {
    case 'SET_ACTIVE_STAGE':
      return { ...state, activeStage: action.payload };
    case 'SET_SELECTED_TOOL':
      return { ...state, selectedTool: action.payload };
    case 'SET_ACTIVE_TOOL':
      return { ...state, activeTool: action.payload };
    case 'SET_STAGE':
      return { ...state, stage: action.payload };
    case 'ADD_LAYER':
      const newLayer: Layer = {
        ...action.payload,
        id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      return { ...state, layers: [...state.layers, newLayer], selectedLayerId: newLayer.id };
    case 'UPDATE_LAYER':
      return {
        ...state,
        layers: state.layers.map(layer =>
          layer.id === action.payload.id
            ? { ...layer, ...action.payload.updates }
            : layer
        )
      };
    case 'DELETE_LAYER':
      return {
        ...state,
        layers: state.layers.filter(layer => layer.id !== action.payload),
        selectedLayerId: state.selectedLayerId === action.payload ? null : state.selectedLayerId
      };
    case 'SET_SELECTED_LAYER':
      return { ...state, selectedLayerId: action.payload };
    case 'REORDER_LAYERS':
      const newLayers = [...state.layers];
      const layerIndex = newLayers.findIndex(layer => layer.id === action.payload.layerId);
      if (layerIndex === -1) return state;
      
      const [movedLayer] = newLayers.splice(layerIndex, 1);
      newLayers.splice(action.payload.newIndex, 0, movedLayer);
      
      // 更新zIndex
      const layersWithUpdatedZIndex = newLayers.map((layer, index) => ({
        ...layer,
        zIndex: index
      }));
      
      return { ...state, layers: layersWithUpdatedZIndex };
    case 'ADD_SKELETON_POINT':
      const newPoint: SkeletonPoint = {
        ...action.payload,
        id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        childrenIds: []
      };
      return { ...state, skeletonPoints: [...state.skeletonPoints, newPoint] };
    case 'UPDATE_SKELETON_POINT':
      return {
        ...state,
        skeletonPoints: state.skeletonPoints.map(point =>
          point.id === action.payload.id
            ? { ...point, ...action.payload.updates }
            : point
        )
      };
    case 'DELETE_SKELETON_POINT':
      // 删除点及其所有子点
      const deletePointAndChildren = (pointId: string, points: SkeletonPoint[]): SkeletonPoint[] => {
        const pointToDelete = points.find(p => p.id === pointId);
        if (!pointToDelete) return points;
        
        // 删除子点
        const childrenIds = pointToDelete.childrenIds || [];
        let newPoints = [...points.filter(p => p.id !== pointId)];
        
        for (const childId of childrenIds) {
          newPoints = deletePointAndChildren(childId, newPoints);
        }
        
        // 从父点的childrenIds中移除
        newPoints = newPoints.map(point => {
          if (point.childrenIds?.includes(pointId)) {
            return {
              ...point,
              childrenIds: point.childrenIds.filter(id => id !== pointId)
            };
          }
          return point;
        });
        
        return newPoints;
      };
      
      return {
        ...state,
        skeletonPoints: deletePointAndChildren(action.payload, state.skeletonPoints),
        selectedPointId: state.selectedPointId === action.payload ? null : state.selectedPointId
      };
    case 'SET_SELECTED_POINT':
      return { ...state, selectedPointId: action.payload };
    case 'ADD_ANIMATION':
      const newAnimation: AnimationClip = {
        ...action.payload,
        id: `animation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      return { ...state, animations: [...state.animations, newAnimation], activeAnimationId: newAnimation.id };
    case 'UPDATE_ANIMATION':
      return {
        ...state,
        animations: state.animations.map(animation =>
          animation.id === action.payload.id
            ? { ...animation, ...action.payload.updates }
            : animation
        )
      };
    case 'SET_ACTIVE_ANIMATION':
      return { ...state, activeAnimationId: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'TOGGLE_PLAYING':
      return { ...state, isPlaying: action.payload !== undefined ? action.payload : !state.isPlaying };
    case 'SET_ZOOM_LEVEL':
      return { ...state, zoomLevel: action.payload };
    case 'SET_ZOOM':
      return { ...state, zoom: action.payload };
    case 'SET_PAN_POSITION':
      return { ...state, panPosition: action.payload };
    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };
    case 'SET_GRID_SIZE':
      return { ...state, gridSize: action.payload };
    case 'SET_PROCESSING_STATUS':
      return { ...state, processingStatus: action.payload };
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_PROCESSING_MESSAGE':
      return { ...state, processingMessage: action.payload };
    case 'SET_INPAINT_MODE':
      return { ...state, inpaintMode: action.payload };
    case 'SET_BRUSH_MODE':
      return { ...state, brushMode: action.payload };
    case 'SET_WEIGHT_PAINT_MODE':
      return { ...state, weightPaintMode: action.payload };
    case 'SET_ANIMATION_DURATION':
      return { ...state, animationDuration: action.payload };
    case 'SET_FPS':
      return { ...state, fps: action.payload };
    case 'SET_ONION_SKIN_FRAMES':
      return { ...state, onionSkinFrames: action.payload };
    case 'SET_CURSOR_POSITION':
      return { ...state, cursorPosition: action.payload };
    case 'SET_CANVAS_SIZE':
      return { ...state, canvasSize: action.payload };
    case 'SET_SAM_SELECTION_MODE':
      return { ...state, samSelectionMode: action.payload };
    case 'SAVE_PROJECT':
      // Handle save logic here
      console.log('Saving project...');
      return state;
    case 'EXPORT_PROJECT':
      // Handle export logic here
      console.log('Exporting project...');
      return state;
    case 'RESET_CANVAS':
      return { ...initialState };
    default:
      return state;
  }
}

// 定义Context类型
interface CanvasContextType {
  state: CanvasState;
  dispatch: React.Dispatch<CanvasAction>;
  // 辅助方法
  getSelectedLayer: () => Layer | null;
  getSelectedPoint: () => SkeletonPoint | null;
  getActiveAnimation: () => AnimationClip | null;
  getLayersByZIndex: () => Layer[];
}

// 创建Context
const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

// 定义Provider属性类型
interface CanvasProviderProps {
  children: ReactNode;
  initialState?: Partial<CanvasState>;
}

// 创建Provider组件
export const CanvasProvider: React.FC<CanvasProviderProps> = ({ children, initialState }) => {
  // 如果没有提供initialState，使用默认的initialState
  const defaultInitialState = {
    activeStage: 'A',
    selectedTool: 'lasso',
    activeTool: 'move',
    stage: 'A',
    layers: [],
    selectedLayerId: null,
    parts: [],
    selectedPartId: null,
    bones: [],
    selectedBoneId: null,
    skeletonPoints: [],
    selectedPointId: null,
    animations: [],
    activeAnimationId: null,
    currentTime: 0,
    isPlaying: false,
    zoomLevel: 1,
    zoom: 1,
    panPosition: { x: 0, y: 0 },
    cursorPosition: { x: 0, y: 0 },
    canvasSize: { width: 1920, height: 1080 },
    showGrid: false,
    gridSize: 50,
    processingStatus: {
      isProcessing: false,
      progress: 0,
      message: ''
    },
    isProcessing: false,
    processingMessage: '',
    inpaintMode: false,
    brushMode: null,
    weightPaintMode: false,
    animationDuration: 5,
    fps: 24,
    onionSkinFrames: 2,
    samSelectionMode: 'foreground'
  };
  
  const mergedInitialState = initialState ? { ...defaultInitialState, ...initialState } : defaultInitialState;
  const [state, dispatch] = useReducer(canvasReducer, mergedInitialState as CanvasState);

  // 辅助方法
  const getSelectedLayer = () => {
    return state.layers.find(layer => layer.id === state.selectedLayerId) || null;
  };

  const getSelectedPoint = () => {
    return state.skeletonPoints.find(point => point.id === state.selectedPointId) || null;
  };

  const getActiveAnimation = () => {
    return state.animations.find(animation => animation.id === state.activeAnimationId) || null;
  };

  const getLayersByZIndex = () => {
    return [...state.layers].sort((a, b) => a.zIndex - b.zIndex);
  };

  const value: CanvasContextType = {
    state,
    dispatch,
    getSelectedLayer,
    getSelectedPoint,
    getActiveAnimation,
    getLayersByZIndex
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

// 创建Hook用于访问Context
export const useCanvasContext = () => {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvasContext must be used within a CanvasProvider');
  }
  return context;
};
