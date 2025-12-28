import React, { useState, useEffect } from 'react';
import { useCanvasContext } from '../../composables/CanvasContext';
import { useTranslation } from '../../../../i18n';
import { IKFKHybridController, HybridChain } from '../../utils/IKFKHybridController';

/**
 * 姿态控制面板组件
 * 功能：实现IK/FK混合控制，支持姿态调整和关键帧记录
 */
export const PoseControlPanel: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  
  const [selectedChainId, setSelectedChainId] = useState<string>('');
  const [ikWeight, setIkWeight] = useState(0.5); // IK权重
  const [controlMode, setControlMode] = useState<'ik' | 'fk' | 'hybrid'>('hybrid');
  const [isRecording, setIsRecording] = useState(false);
  const [hybridChains, setHybridChains] = useState<HybridChain[]>([]);
  
  // 初始化默认的混合链
  useEffect(() => {
    const defaultChains: HybridChain[] = [
      IKFKHybridController.createDefaultHybridChain(
        'LeftArm',
        ['shoulder_L', 'elbow_L', 'wrist_L'],
        'wrist_L'
      ),
      IKFKHybridController.createDefaultHybridChain(
        'RightArm',
        ['shoulder_R', 'elbow_R', 'wrist_R'],
        'wrist_R'
      ),
      IKFKHybridController.createDefaultHybridChain(
        'LeftLeg',
        ['hip_L', 'knee_L', 'ankle_L'],
        'ankle_L'
      ),
      IKFKHybridController.createDefaultHybridChain(
        'RightLeg',
        ['hip_R', 'knee_R', 'ankle_R'],
        'ankle_R'
      )
    ];
    
    setHybridChains(defaultChains);
    if (defaultChains.length > 0) {
      setSelectedChainId(defaultChains[0].id);
    }
  }, []);
  
  // 更新选中链的混合权重
  const updateChainBlendWeight = (chainId: string, weight: number) => {
    setHybridChains(prev => 
      prev.map(chain => 
        chain.id === chainId 
          ? { ...chain, blendWeight: weight }
          : chain
      )
    );
  };
  
  // 更新链的控制模式
  const updateChainMode = (chainId: string, mode: 'ik' | 'fk' | 'hybrid') => {
    setHybridChains(prev => 
      prev.map(chain => 
        chain.id === chainId 
          ? { ...chain, mode }
          : chain
      )
    );
  };
  
  // 应用姿态到骨骼
  const applyPoseToSkeleton = (chainId: string) => {
    const chain = hybridChains.find(c => c.id === chainId);
    if (!chain) return;
    
    try {
      // 计算混合姿态
      const poseData = IKFKHybridController.calculateHybridPose(chain, state.skeletonPoints);
      
      // 应用姿态到骨骼点
      for (const [jointId, pose] of Object.entries(poseData)) {
        dispatch({
          type: 'UPDATE_SKELETON_POINT',
          payload: {
            id: jointId,
            updates: {
              x: pose.position.x,
              y: pose.position.y,
              rotation: pose.rotation
            }
          }
        });
      }
      
      console.log(`已应用姿态到链: ${chainId}`);
      
    } catch (error) {
      console.error('姿态应用失败:', error);
      alert('姿态应用失败: ' + (error as Error).message);
    }
  };
  
  // 记录关键帧
  const recordKeyframe = (chainId: string) => {
    const chain = hybridChains.find(c => c.id === chainId);
    if (!chain) return;
    
    try {
      // 获取当前骨骼状态
      const currentTime = state.currentTime;
      const keyframeData = {
        chainId,
        time: currentTime,
        pose: {},
        interpolation: 'linear' as const
      };
      
      // 记录当前链中所有骨骼点的状态
      for (const jointId of chain.ikChain.jointIds) {
        const point = state.skeletonPoints.find(p => p.id === jointId);
        if (point) {
          (keyframeData.pose as any)[jointId] = {
            x: point.x,
            y: point.y,
            rotation: point.rotation || 0,
            scale: point.scale || 1
          };
        }
      }
      
      // 添加到当前动画的关键帧列表
      if (state.activeAnimationId) {
        const currentAnimation = state.animations.find(a => a.id === state.activeAnimationId);
        if (currentAnimation) {
          const newKeyframe = {
            id: `keyframe-${Date.now()}`,
            time: keyframeData.time,
            properties: keyframeData.pose,
            interpolation: keyframeData.interpolation
          };
          
          dispatch({
            type: 'UPDATE_ANIMATION',
            payload: {
              id: state.activeAnimationId,
              updates: {
                keyframes: [...currentAnimation.keyframes, newKeyframe]
              }
            }
          });
          
          console.log(`已记录关键帧: ${newKeyframe.id} at time ${currentTime}s`);
        }
      }
      
    } catch (error) {
      console.error('关键帧记录失败:', error);
      alert('关键帧记录失败: ' + (error as Error).message);
    }
  };
  
  // 开始/停止录制
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      console.log('开始姿态录制');
    } else {
      console.log('停止姿态录制');
    }
  };
  
  // 重置链姿态
  const resetChainPose = (chainId: string) => {
    const chain = hybridChains.find(c => c.id === chainId);
    if (!chain) return;
    
    try {
      // 重置所有关节到初始状态
      for (const jointId of chain.ikChain.jointIds) {
        dispatch({
          type: 'UPDATE_SKELETON_POINT',
          payload: {
            id: jointId,
            updates: {
              rotation: 0,
              scale: 1
            }
          }
        });
      }
      
      console.log(`已重置链姿态: ${chainId}`);
      
    } catch (error) {
      console.error('姿态重置失败:', error);
      alert('姿态重置失败: ' + (error as Error).message);
    }
  };
  
  // 获取当前选中链
  const selectedChain = hybridChains.find(c => c.id === selectedChainId);
  
  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
      <h4 className="text-sm font-medium text-white">{t('stageD.poseControl')}</h4>
      
      {/* 链选择 */}
      <div>
        <label className="block text-xs text-gray-300 mb-1">
          {t('stageD.controlChain')}
        </label>
        <select
          value={selectedChainId}
          onChange={(e) => setSelectedChainId(e.target.value)}
          className="w-full px-2 py-1 bg-gray-700 text-white rounded text-sm"
        >
          {hybridChains.map(chain => (
            <option key={chain.id} value={chain.id}>
              {chain.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* 控制模式 */}
      <div>
        <label className="block text-xs text-gray-300 mb-1">
          {t('stageD.controlMode')}
        </label>
        <div className="flex space-x-1">
          {[
            { value: 'ik', label: 'IK' },
            { value: 'fk', label: 'FK' },
            { value: 'hybrid', label: 'Hybrid' }
          ].map(mode => (
            <button
              key={mode.value}
              onClick={() => {
                setControlMode(mode.value as any);
                if (selectedChain) {
                  updateChainMode(selectedChain.id, mode.value as any);
                }
              }}
              className={`flex-1 px-2 py-1 text-xs rounded ${
                controlMode === mode.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* IK/FK混合权重 */}
      {controlMode === 'hybrid' && (
        <div>
          <label className="block text-xs text-gray-300 mb-1">
            {t('stageD.ikWeight')}: {(ikWeight * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={ikWeight}
            onChange={(e) => {
              const weight = parseFloat(e.target.value);
              setIkWeight(weight);
              if (selectedChain) {
                updateChainBlendWeight(selectedChain.id, weight);
              }
            }}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>FK</span>
            <span>混合</span>
            <span>IK</span>
          </div>
        </div>
      )}
      
      {/* 姿态控制按钮 */}
      <div className="space-y-2">
        <button
          onClick={() => selectedChain && applyPoseToSkeleton(selectedChain.id)}
          disabled={!selectedChain}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
        >
          {t('stageD.applyPose')}
        </button>
        
        <button
          onClick={toggleRecording}
          className={`w-full px-3 py-2 text-white rounded text-sm ${
            isRecording 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRecording ? t('stageD.stopRecording') : t('stageD.startRecording')}
        </button>
        
        <button
          onClick={() => selectedChain && recordKeyframe(selectedChain.id)}
          disabled={!selectedChain || !state.activeAnimationId}
          className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
        >
          {t('stageD.recordKeyframe')}
        </button>
        
        <button
          onClick={() => selectedChain && resetChainPose(selectedChain.id)}
          disabled={!selectedChain}
          className="w-full px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:cursor-not-allowed text-sm"
        >
          {t('stageD.resetPose')}
        </button>
      </div>
      
      {/* 当前姿态信息 */}
      {selectedChain && (
        <div className="mt-4 p-3 bg-gray-700 rounded">
          <h5 className="text-xs text-gray-300 mb-2">{t('stageD.currentPose')}</h5>
          <div className="space-y-1 text-xs text-gray-400">
            <div>{t('stageD.chain')}: {selectedChain.name}</div>
            <div>{t('stageD.mode')}: {controlMode.toUpperCase()}</div>
            {controlMode === 'hybrid' && (
              <div>{t('stageD.ikWeight')}: {(ikWeight * 100).toFixed(0)}%</div>
            )}
            <div>{t('stageD.joints')}: {selectedChain.ikChain.jointIds.length}</div>
          </div>
        </div>
      )}
      
      {/* 录制状态 */}
      {isRecording && (
        <div className="mt-2 p-2 bg-red-900 border border-red-700 rounded">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-red-300">{t('stageD.recordingActive')}</span>
          </div>
        </div>
      )}
    </div>
  );
};