import React, { useState } from 'react';
import { useCanvasContext } from '../../composables/CanvasContext';
import { useTranslation } from '../../../../i18n';
import { MirrorSymmetryGenerator } from '../../utils/MirrorSymmetryGenerator';

/**
 * 镜像对称面板组件
 * 功能：为骨骼系统提供镜像对称功能，支持自动检测和生成镜像骨骼
 */
export const MirrorSymmetryPanel: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  
  const [mirrorAxis, setMirrorAxis] = useState<'vertical' | 'horizontal'>('vertical');
  const [tolerance, setTolerance] = useState(10);
  const [autoRename, setAutoRename] = useState(true);
  const [centerX, setCenterX] = useState(400); // 默认中心点X坐标
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedPairs, setDetectedPairs] = useState<Array<{
    left: any;
    right: any;
    confidence: number;
  }>>([]);
  
  // 自动检测镜像对
  const detectMirrorPairs = async () => {
    if (state.skeletonPoints.length < 2) {
      alert('需要至少2个骨骼点才能检测镜像对');
      return;
    }
    
    setIsDetecting(true);
    
    try {
      // 使用镜像对称生成器检测镜像对
      const pairs = MirrorSymmetryGenerator.detectMirrorPairs(
        state.skeletonPoints,
        centerX,
        tolerance
      );
      
      setDetectedPairs(pairs);
      
      console.log(`检测到 ${pairs.length} 个镜像对:`);
      pairs.forEach((pair, index) => {
        console.log(`对 ${index + 1}: ${pair.left.name} ↔ ${pair.right.name} (置信度: ${(pair.confidence * 100).toFixed(1)}%)`);
      });
      
    } catch (error) {
      console.error('镜像对检测失败:', error);
      alert('镜像对检测失败: ' + (error as Error).message);
    } finally {
      setIsDetecting(false);
    }
  };
  
  // 生成镜像骨骼
  const generateMirrorBones = async () => {
    if (state.skeletonPoints.length === 0) {
      alert('没有骨骼点可以镜像');
      return;
    }
    
    try {
      // 生成镜像点
      const mirrorResults = MirrorSymmetryGenerator.generateMirrorPoints(
        state.skeletonPoints,
        centerX,
        {
          axis: mirrorAxis,
          tolerance,
          autoRename,
          namePatterns: {
            left: ['left', 'Left', 'L_', 'l_', '_L', '_l', '左'],
            right: ['right', 'Right', 'R_', 'r_', '_R', '_r', '右']
          }
        }
      );
      
      // 添加镜像点到状态
      for (const result of mirrorResults) {
        dispatch({
          type: 'ADD_SKELETON_POINT',
          payload: {
            x: result.mirrored.x,
            y: result.mirrored.y,
            name: result.mirrored.name,
            parentId: result.mirrored.parentId,
            rotation: result.mirrored.rotation || 0,
            scale: result.mirrored.scale || 1
          }
        });
      }
      
      console.log(`成功生成 ${mirrorResults.length} 个镜像骨骼点`);
      
    } catch (error) {
      console.error('镜像骨骼生成失败:', error);
      alert('镜像骨骼生成失败: ' + (error as Error).message);
    }
  };
  
  // 应用镜像约束
  const applyMirrorConstraints = () => {
    if (detectedPairs.length === 0) {
      alert('请先检测镜像对');
      return;
    }
    
    try {
      // 创建镜像约束
      const constraints = MirrorSymmetryGenerator.createMirrorConstraints(detectedPairs);
      
      // 这里应该将约束应用到骨骼系统
      // 实际应用中需要集成到骨骼约束系统中
      console.log('镜像约束已创建:', constraints);
      
      alert(`已创建 ${constraints.length} 个镜像约束`);
      
    } catch (error) {
      console.error('镜像约束应用失败:', error);
      alert('镜像约束应用失败: ' + (error as Error).message);
    }
  };
  
  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
      <h4 className="text-sm font-medium text-white">{t('stageC.mirrorSymmetry')}</h4>
      
      {/* 镜像轴设置 */}
      <div>
        <label className="block text-xs text-gray-300 mb-1">
          {t('stageC.mirrorAxis')}
        </label>
        <div className="flex space-x-2">
          <button
            onClick={() => setMirrorAxis('vertical')}
            className={`px-2 py-1 text-xs rounded ${
              mirrorAxis === 'vertical' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {t('stageC.vertical')}
          </button>
          <button
            onClick={() => setMirrorAxis('horizontal')}
            className={`px-2 py-1 text-xs rounded ${
              mirrorAxis === 'horizontal' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {t('stageC.horizontal')}
          </button>
        </div>
      </div>
      
      {/* 中心点设置 */}
      <div>
        <label className="block text-xs text-gray-300 mb-1">
          {t('stageC.centerX')}: {centerX}px
        </label>
        <input
          type="range"
          min="0"
          max="800"
          value={centerX}
          onChange={(e) => setCenterX(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      
      {/* 容差设置 */}
      <div>
        <label className="block text-xs text-gray-300 mb-1">
          {t('stageC.tolerance')}: {tolerance}px
        </label>
        <input
          type="range"
          min="1"
          max="50"
          value={tolerance}
          onChange={(e) => setTolerance(parseInt(e.target.value))}
          className="w-full"
        />
      </div>
      
      {/* 自动重命名 */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-300">{t('stageC.autoRename')}</span>
        <button
          onClick={() => setAutoRename(!autoRename)}
          className={`w-8 h-4 rounded-full transition-colors ${
            autoRename ? 'bg-blue-600' : 'bg-gray-600'
          }`}
        >
          <div className={`w-3 h-3 bg-white rounded-full transition-transform ${
            autoRename ? 'translate-x-4' : 'translate-x-0.5'
          }`} />
        </button>
      </div>
      
      {/* 检测镜像对 */}
      <button
        onClick={detectMirrorPairs}
        disabled={isDetecting || state.skeletonPoints.length < 2}
        className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
      >
        {isDetecting ? t('stageC.detecting') : t('stageC.detectMirrorPairs')}
      </button>
      
      {/* 检测结果 */}
      {detectedPairs.length > 0 && (
        <div className="mt-4 p-3 bg-gray-700 rounded">
          <h5 className="text-xs text-gray-300 mb-2">
            {t('stageC.detectedPairs')} ({detectedPairs.length})
          </h5>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {detectedPairs.map((pair, index) => (
              <div key={index} className="text-xs text-gray-400 flex justify-between">
                <span>{pair.left.name} ↔ {pair.right.name}</span>
                <span className={`${
                  pair.confidence > 0.8 ? 'text-green-400' :
                  pair.confidence > 0.5 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {(pair.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 生成镜像骨骼 */}
      <button
        onClick={generateMirrorBones}
        disabled={state.skeletonPoints.length === 0}
        className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
      >
        {t('stageC.generateMirrorBones')}
      </button>
      
      {/* 应用镜像约束 */}
      <button
        onClick={applyMirrorConstraints}
        disabled={detectedPairs.length === 0}
        className="w-full px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
      >
        {t('stageC.applyMirrorConstraints')}
      </button>
    </div>
  );
};