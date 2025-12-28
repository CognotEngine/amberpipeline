/**
 * IK/FK混合控制器模块
 * 功能：实现反向运动学和前向运动学的混合控制
 */

import { SkeletonPoint } from '../composables/CanvasContext';

export interface IKChain {
  id: string;
  name: string;
  endEffectorId: string; // 末端执行器ID
  jointIds: string[]; // 关节链ID列表
  targetPosition: { x: number; y: number };
  isActive: boolean;
  weight: number; // IK权重（0-1）
}

export interface FKChain {
  id: string;
  name: string;
  jointIds: string[];
  rotations: { [jointId: string]: number }; // 各关节旋转角度
}

export interface HybridChain {
  id: string;
  name: string;
  ikChain: IKChain;
  fkChain: FKChain;
  blendWeight: number; // IK/FK混合权重（0=纯FK，1=纯IK）
  mode: 'ik' | 'fk' | 'hybrid';
}

export interface PoseData {
  position: { x: number; y: number };
  rotation: number;
  scale: { x: number; y: number };
}

/**
 * IK/FK混合控制器
 */
export class IKFKHybridController {
  
  /**
   * 计算IK解
   */
  static solveIK(
    chain: IKChain,
    skeletonPoints: SkeletonPoint[],
    maxIterations: number = 100,
    tolerance: number = 1.0
  ): { [jointId: string]: PoseData } | null {
    const joints = chain.jointIds.map(id => 
      skeletonPoints.find(p => p.id === id)
    ).filter(Boolean) as SkeletonPoint[];
    
    if (joints.length < 2) return null;
    
    const result: { [jointId: string]: PoseData } = {};
    
    // 简化的CCD（Cyclic Coordinate Descent）算法
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const endEffector = joints[joints.length - 1];
      const distance = this.calculateDistance(
        { x: endEffector.x, y: endEffector.y },
        chain.targetPosition
      );
      
      if (distance < tolerance) {
        // 找到解，记录最终姿态
        for (const joint of joints) {
          result[joint.id] = {
            position: { x: joint.x, y: joint.y },
            rotation: joint.rotation || 0,
            scale: { x: joint.scale || 1, y: joint.scale || 1 }
          };
        }
        return result;
      }
      
      // 从末端向根节点迭代
      for (let i = joints.length - 2; i >= 0; i--) {
        const currentJoint = joints[i];
        const endEffectorPos = { x: endEffector.x, y: endEffector.y };
        const targetPos = chain.targetPosition;
        const jointPos = { x: currentJoint.x, y: currentJoint.y };
        
        // 计算旋转角度
        const angle = this.calculateRotationAngle(
          jointPos,
          endEffectorPos,
          targetPos
        );
        
        // 应用旋转
        this.rotateJoint(currentJoint, joints.slice(i + 1), angle);
      }
    }
    
    // 达到最大迭代次数，返回最佳解
    for (const joint of joints) {
      result[joint.id] = {
        position: { x: joint.x, y: joint.y },
        rotation: joint.rotation || 0,
        scale: { x: joint.scale || 1, y: joint.scale || 1 }
      };
    }
    
    return result;
  }
  
  /**
   * 计算两点间距离
   */
  private static calculateDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  /**
   * 计算旋转角度
   */
  private static calculateRotationAngle(
    joint: { x: number; y: number },
    endEffector: { x: number; y: number },
    target: { x: number; y: number }
  ): number {
    const v1 = { x: endEffector.x - joint.x, y: endEffector.y - joint.y };
    const v2 = { x: target.x - joint.x, y: target.y - joint.y };
    
    const angle1 = Math.atan2(v1.y, v1.x);
    const angle2 = Math.atan2(v2.y, v2.x);
    
    return angle2 - angle1;
  }
  
  /**
   * 旋转关节
   */
  private static rotateJoint(
    joint: SkeletonPoint,
    children: SkeletonPoint[],
    angle: number
  ): void {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    
    for (const child of children) {
      const dx = child.x - joint.x;
      const dy = child.y - joint.y;
      
      child.x = joint.x + dx * cos - dy * sin;
      child.y = joint.y + dx * sin + dy * cos;
      
      // 更新旋转角度
      child.rotation = (child.rotation || 0) + angle;
    }
  }
  
  /**
   * 应用FK姿态
   */
  static applyFKPose(
    chain: FKChain,
    skeletonPoints: SkeletonPoint[]
  ): { [jointId: string]: PoseData } {
    const result: { [jointId: string]: PoseData } = {};
    
    for (const jointId of chain.jointIds) {
      const joint = skeletonPoints.find(p => p.id === jointId);
      if (!joint) continue;
      
      const rotation = chain.rotations[jointId] || 0;
      
      result[jointId] = {
        position: { x: joint.x, y: joint.y },
        rotation: rotation,
        scale: { x: joint.scale || 1, y: joint.scale || 1 }
      };
      
      // 应用旋转
      joint.rotation = rotation;
    }
    
    return result;
  }
  
  /**
   * 混合IK和FK结果
   */
  static blendIKFK(
    ikResult: { [jointId: string]: PoseData } | null,
    fkResult: { [jointId: string]: PoseData },
    blendWeight: number
  ): { [jointId: string]: PoseData } {
    if (!ikResult || blendWeight === 0) {
      return fkResult;
    }
    
    if (blendWeight === 1) {
      return ikResult;
    }
    
    const result: { [jointId: string]: PoseData } = {};
    const allJointIds = new Set([
      ...Object.keys(ikResult),
      ...Object.keys(fkResult)
    ]);
    
    for (const jointId of allJointIds) {
      const ikPose = ikResult[jointId];
      const fkPose = fkResult[jointId];
      
      if (!ikPose || !fkPose) {
        result[jointId] = ikPose || fkPose;
        continue;
      }
      
      // 位置插值
      const blendedPosition = {
        x: this.lerp(fkPose.position.x, ikPose.position.x, blendWeight),
        y: this.lerp(fkPose.position.y, ikPose.position.y, blendWeight)
      };
      
      // 旋转插值（处理角度环绕）
      const blendedRotation = this.lerpAngle(fkPose.rotation, ikPose.rotation, blendWeight);
      
      // 缩放插值
      const blendedScale = {
        x: this.lerp(fkPose.scale.x, ikPose.scale.x, blendWeight),
        y: this.lerp(fkPose.scale.y, ikPose.scale.y, blendWeight)
      };
      
      result[jointId] = {
        position: blendedPosition,
        rotation: blendedRotation,
        scale: blendedScale
      };
    }
    
    return result;
  }
  
  /**
   * 线性插值
   */
  private static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
  
  /**
   * 角度插值（处理角度环绕）
   */
  private static lerpAngle(a: number, b: number, t: number): number {
    let diff = b - a;
    
    // 处理角度环绕
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    
    return a + diff * t;
  }
  
  /**
   * 计算混合链的姿态
   */
  static calculateHybridPose(
    hybridChain: HybridChain,
    skeletonPoints: SkeletonPoint[]
  ): { [jointId: string]: PoseData } {
    switch (hybridChain.mode) {
      case 'ik':
        return this.solveIK(hybridChain.ikChain, skeletonPoints) || {};
        
      case 'fk':
        return this.applyFKPose(hybridChain.fkChain, skeletonPoints);
        
      case 'hybrid':
        const ikResult = this.solveIK(hybridChain.ikChain, skeletonPoints);
        const fkResult = this.applyFKPose(hybridChain.fkChain, skeletonPoints);
        return this.blendIKFK(ikResult, fkResult, hybridChain.blendWeight);
        
      default:
        return {};
    }
  }
  
  /**
   * 创建默认的混合链配置
   */
  static createDefaultHybridChain(
    name: string,
    jointIds: string[],
    endEffectorId: string
  ): HybridChain {
    const ikChain: IKChain = {
      id: `${name}_ik`,
      name: `${name} IK`,
      endEffectorId,
      jointIds,
      targetPosition: { x: 0, y: 0 },
      isActive: true,
      weight: 1.0
    };
    
    const fkChain: FKChain = {
      id: `${name}_fk`,
      name: `${name} FK`,
      jointIds,
      rotations: {}
    };
    
    // 初始化FK旋转
    for (const jointId of jointIds) {
      fkChain.rotations[jointId] = 0;
    }
    
    return {
      id: name,
      name,
      ikChain,
      fkChain,
      blendWeight: 0.5, // 默认50/50混合
      mode: 'hybrid'
    };
  }
}