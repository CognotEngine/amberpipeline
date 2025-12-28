/**
 * 镜像对称工具模块
 * 功能：为骨骼系统提供镜像对称功能
 */

import { SkeletonPoint } from '../composables/CanvasContext';

export interface MirrorConfig {
  axis: 'vertical' | 'horizontal'; // 镜像轴
  tolerance: number; // 对称容差（像素）
  autoRename: boolean; // 自动重命名
  namePatterns: {
    left: string[]; // 左侧标识符
    right: string[]; // 右侧标识符
  };
}

export interface MirrorResult {
  original: SkeletonPoint;
  mirrored: SkeletonPoint;
  confidence: number; // 对称置信度（0-1）
}

/**
 * 骨骼镜像对称生成器
 */
export class MirrorSymmetryGenerator {
  
  private static readonly DEFAULT_NAME_PATTERNS = {
    left: ['left', 'Left', 'L_', 'l_', '_L', '_l', '左'],
    right: ['right', 'Right', 'R_', 'r_', '_R', '_r', '右']
  };
  
  /**
   * 生成镜像对称的骨骼点
   */
  static generateMirrorPoints(
    points: SkeletonPoint[], 
    centerX: number,
    config: Partial<MirrorConfig> = {}
  ): MirrorResult[] {
    const fullConfig: MirrorConfig = {
      axis: 'vertical',
      tolerance: 5,
      autoRename: true,
      namePatterns: this.DEFAULT_NAME_PATTERNS,
      ...config
    };
    
    const results: MirrorResult[] = [];
    
    for (const point of points) {
      const mirroredPoint = this.mirrorPoint(point, centerX, fullConfig.axis);
      const confidence = this.calculateSymmetryConfidence(point, mirroredPoint, centerX);
      
      if (fullConfig.autoRename) {
        mirroredPoint.name = this.generateMirroredName(point.name || '', fullConfig.namePatterns);
      }
      
      results.push({
        original: point,
        mirrored: mirroredPoint,
        confidence
      });
    }
    
    return results;
  }
  
  /**
   * 镜像单个点
   */
  private static mirrorPoint(
    point: SkeletonPoint, 
    centerX: number, 
    axis: 'vertical' | 'horizontal'
  ): SkeletonPoint {
    if (axis === 'vertical') {
      return {
        ...point,
        id: `${point.id}_mirror`,
        x: centerX * 2 - point.x, // 垂直镜像
        name: point.name ? `${point.name}_mirror` : undefined
      };
    } else {
      return {
        ...point,
        id: `${point.id}_mirror`,
        y: centerX * 2 - point.y, // 水平镜像（这里centerX作为Y轴中心）
        name: point.name ? `${point.name}_mirror` : undefined
      };
    }
  }
  
  /**
   * 生成镜像名称
   */
  private static generateMirroredName(name: string, patterns: { left: string[]; right: string[] }): string {
    // 检查是否是左侧名称
    const isLeftSide = patterns.left.some(pattern => name.includes(pattern));
    const isRightSide = patterns.right.some(pattern => name.includes(pattern));
    
    if (isLeftSide && !isRightSide) {
      // 左侧变右侧
      let newName = name;
      for (const leftPattern of patterns.left) {
        for (const rightPattern of patterns.right) {
          newName = newName.replace(leftPattern, rightPattern);
        }
      }
      return newName;
    } else if (isRightSide && !isLeftSide) {
      // 右侧变左侧
      let newName = name;
      for (const rightPattern of patterns.right) {
        for (const leftPattern of patterns.left) {
          newName = newName.replace(rightPattern, leftPattern);
        }
      }
      return newName;
    } else {
      // 无法识别的名称，添加镜像后缀
      return `${name}_mirror`;
    }
  }
  
  /**
   * 计算对称置信度
   */
  private static calculateSymmetryConfidence(
    original: SkeletonPoint, 
    mirrored: SkeletonPoint, 
    centerX: number
  ): number {
    // 简单的对称性检查：检查镜像点是否在合理范围内
    const distance = Math.abs(original.x - centerX);
    const mirroredDistance = Math.abs(mirrored.x - centerX);
    
    // 如果镜像距离与原始距离相近，置信度高
    const distanceDiff = Math.abs(distance - mirroredDistance);
    const confidence = Math.max(0, 1 - distanceDiff / Math.max(distance, mirroredDistance, 1));
    
    return Math.min(1, confidence);
  }
  
  /**
   * 自动检测镜像对
   */
  static detectMirrorPairs(
    points: SkeletonPoint[], 
    centerX: number,
    tolerance: number = 10
  ): Array<{
    left: SkeletonPoint;
    right: SkeletonPoint;
    confidence: number;
  }> {
    const pairs: Array<{ left: SkeletonPoint; right: SkeletonPoint; confidence: number }> = [];
    const used = new Set<string>();
    
    for (const leftPoint of points) {
      if (used.has(leftPoint.id)) continue;
      
      // 查找可能的右侧对应点
      const rightPoint = this.findPotentialMirrorPoint(leftPoint, points, centerX, tolerance);
      
      if (rightPoint && !used.has(rightPoint.id)) {
        const confidence = this.calculatePairConfidence(leftPoint, rightPoint, centerX);
        
        pairs.push({
          left: leftPoint,
          right: rightPoint,
          confidence
        });
        
        used.add(leftPoint.id);
        used.add(rightPoint.id);
      }
    }
    
    return pairs.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * 查找潜在的镜像点
   */
  private static findPotentialMirrorPoint(
    sourcePoint: SkeletonPoint,
    allPoints: SkeletonPoint[],
    centerX: number,
    tolerance: number
  ): SkeletonPoint | null {
    const targetX = centerX * 2 - sourcePoint.x;
    
    // 查找在目标X坐标附近的点
    const candidates = allPoints.filter(point => 
      point.id !== sourcePoint.id &&
      Math.abs(point.x - targetX) <= tolerance
    );
    
    if (candidates.length === 0) return null;
    
    // 选择最接近的点
    return candidates.reduce((best, current) => {
      const bestDistance = Math.abs(best.x - targetX);
      const currentDistance = Math.abs(current.x - targetX);
      return currentDistance < bestDistance ? current : best;
    });
  }
  
  /**
   * 计算点对的对称置信度
   */
  private static calculatePairConfidence(
    leftPoint: SkeletonPoint,
    rightPoint: SkeletonPoint,
    centerX: number
  ): number {
    // 检查名称对称性
    const nameConfidence = this.calculateNameSymmetryConfidence(leftPoint.name || '', rightPoint.name || '');
    
    // 检查位置对称性
    const positionConfidence = this.calculatePositionSymmetryConfidence(leftPoint, rightPoint, centerX);
    
    // 综合置信度
    return (nameConfidence + positionConfidence) / 2;
  }
  
  /**
   * 计算名称对称性置信度
   */
  private static calculateNameSymmetryConfidence(name1: string, name2: string): number {
    const patterns = this.DEFAULT_NAME_PATTERNS;
    
    const hasLeft1 = patterns.left.some(pattern => name1.includes(pattern));
    const hasRight1 = patterns.right.some(pattern => name1.includes(pattern));
    const hasLeft2 = patterns.left.some(pattern => name2.includes(pattern));
    const hasRight2 = patterns.right.some(pattern => name2.includes(pattern));
    
    // 如果一个是左侧，另一个是右侧，置信度高
    if ((hasLeft1 && hasRight2) || (hasRight1 && hasLeft2)) {
      return 0.9;
    }
    
    // 如果都有相同的侧向标识，置信度低
    if ((hasLeft1 && hasLeft2) || (hasRight1 && hasRight2)) {
      return 0.1;
    }
    
    return 0.5; // 无法确定
  }
  
  /**
   * 计算位置对称性置信度
   */
  private static calculatePositionSymmetryConfidence(
    point1: SkeletonPoint,
    point2: SkeletonPoint,
    centerX: number
  ): number {
    const expectedX2 = centerX * 2 - point1.x;
    const actualDiff = Math.abs(point2.x - expectedX2);
    
    // 如果Y坐标相近，置信度更高
    const yDiff = Math.abs(point1.y - point2.y);
    const yConfidence = Math.max(0, 1 - yDiff / 100); // 假设100像素是最大可接受差异
    
    // X坐标对称性
    const xConfidence = Math.max(0, 1 - actualDiff / 50); // 假设50像素是最大可接受差异
    
    return (xConfidence + yConfidence) / 2;
  }
  
  /**
   * 创建镜像约束
   */
  static createMirrorConstraints(
    pairs: Array<{ left: SkeletonPoint; right: SkeletonPoint; confidence: number }>
  ): Array<{
    type: 'mirror';
    leftId: string;
    rightId: string;
    strength: number;
  }> {
    return pairs.map(pair => ({
      type: 'mirror' as const,
      leftId: pair.left.id,
      rightId: pair.right.id,
      strength: pair.confidence
    }));
  }
  
  /**
   * 应用镜像变换到骨骼层次结构
   */
  static applyMirrorToHierarchy(
    points: SkeletonPoint[],
    centerX: number
  ): {
    mirroredPoints: SkeletonPoint[];
    mirroredHierarchy: { [parentId: string]: string[] };
  } {
    const mirroredPoints = this.generateMirrorPoints(points, centerX);
    const mirroredHierarchy: { [parentId: string]: string[] } = {};
    
    // 构建镜像层次结构
    for (const result of mirroredPoints) {
      if (result.original.parentId) {
        const mirroredParentId = this.findMirroredPointId(result.original.parentId, mirroredPoints);
        if (mirroredParentId) {
          if (!mirroredHierarchy[mirroredParentId]) {
            mirroredHierarchy[mirroredParentId] = [];
          }
          mirroredHierarchy[mirroredParentId].push(result.mirrored.id);
        }
      }
    }
    
    return {
      mirroredPoints: mirroredPoints.map(r => r.mirrored),
      mirroredHierarchy
    };
  }
  
  /**
   * 查找镜像点的ID
   */
  private static findMirroredPointId(
    originalId: string, 
    mirrorResults: MirrorResult[]
  ): string | null {
    const result = mirrorResults.find(r => r.original.id === originalId);
    return result ? result.mirrored.id : null;
  }
}