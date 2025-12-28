import { useMemo } from 'react';
import { useTranslation } from '../../../i18n';
import {
  Target, Ruler, Palette, Brush, Magnet, Link, 
  Bone, Scale, Settings, User, CircleDot, 
  Layers, Move, Search, Zap, Undo, Redo 
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

/**
 * 工具定义接口
 */
export interface ToolDefinition {
  id: string;
  name: string;
  icon: LucideIcon;
  shortcut: string;
  stage?: string;
  action?: () => void;
}

/**
 * 工具管理Hook
 * 提供工具列表定义和工具相关的辅助方法
 */
export const useTools = () => {
  const { t } = useTranslation();

  // 工具列表定义
  const tools = useMemo<ToolDefinition[]>(() => [
    // Stage A tools
    { id: 'sam-select', name: t('canvas.tools.samSelect'), icon: Target, shortcut: 'S', stage: 'A' },
    { id: 'depth-mark', name: t('canvas.tools.depthMark'), icon: Ruler, shortcut: 'D', stage: 'A' },
    { id: 'inpaint', name: t('canvas.tools.inpaint'), icon: Palette, shortcut: 'I', stage: 'A' },
    
    // Stage B tools
    { id: 'semantic-brush', name: t('canvas.tools.semanticBrush'), icon: Brush, shortcut: 'B', stage: 'B' },
    { id: 'edge-snap', name: t('canvas.tools.edgeSnap'), icon: Magnet, shortcut: 'E', stage: 'B' },
    { id: 'joint-complete', name: t('canvas.tools.jointComplete'), icon: Link, shortcut: 'J', stage: 'B' },
    
    // Stage C tools
    { id: 'bone-draw', name: t('canvas.tools.boneDraw'), icon: Bone, shortcut: 'O', stage: 'C' },
    { id: 'weight-paint', name: t('canvas.tools.weightPaint'), icon: Scale, shortcut: 'W', stage: 'C' },
    { id: 'ik-setup', name: t('canvas.tools.ikSetup'), icon: Settings, shortcut: 'K', stage: 'C' },
    
    // Stage D tools
    { id: 'pose-adjust', name: t('canvas.tools.poseAdjust'), icon: User, shortcut: 'P', stage: 'D' },
    { id: 'keyframe', name: t('canvas.tools.keyframe'), icon: CircleDot, shortcut: 'F', stage: 'D' },
    { id: 'onion-skin', name: t('canvas.tools.onionSkin'), icon: Layers, shortcut: 'N', stage: 'D' },
    
    // Common tools
    { id: 'move', name: t('canvas.tools.move'), icon: Move, shortcut: 'V' },
    { id: 'zoom', name: t('canvas.tools.zoom'), icon: Search, shortcut: 'Z' },
    { id: 'grid', name: t('canvas.tools.grid'), icon: Zap, shortcut: 'G' },
    { id: 'undo', name: t('canvas.tools.undo'), icon: Undo, shortcut: 'Ctrl+Z' },
    { id: 'redo', name: t('canvas.tools.redo'), icon: Redo, shortcut: 'Ctrl+Y' },
  ], [t]);

  // 根据阶段过滤工具
  const filterToolsByStage = (stage: string) => {
    return tools.filter(tool => 
      !tool.stage || tool.stage === stage
    );
  };

  // 根据ID查找工具
  const findToolById = (toolId: string) => {
    return tools.find(tool => tool.id === toolId);
  };

  return {
    tools,
    filterToolsByStage,
    findToolById
  };
};
