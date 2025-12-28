import React, { useState, useRef, useEffect } from 'react';
import { useCanvasContext } from '../../composables/CanvasContext';
import { useTranslation } from '../../../../i18n';
import { AutoMeshGenerator, MeshData } from '../../utils/AutoMeshGenerator';

/**
 * 自动网格化组件
 * 功能：显示和控制部位网格化参数，生成用于变形的网格
 */
export const AutoMeshPanel: React.FC = () => {
  const { t } = useTranslation();
  const { state, dispatch } = useCanvasContext();
  
  const [vertexDensity, setVertexDensity] = useState(50); // 顶点密度
  const [edgeSmoothing, setEdgeSmoothing] = useState(5); // 边缘平滑度
  const [optimizationLevel, setOptimizationLevel] = useState(1); // 优化级别
  const [meshData, setMeshData] = useState<MeshData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 生成网格
  const generateMesh = async () => {
    if (!state.selectedPartId) {
      alert('请先选择一个部位');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // 获取当前选中部位的遮罩数据
      // 这里需要实际的遮罩数据，现在使用模拟数据
      const mockMask = new ImageData(200, 200);
      
      // 设置遮罩数据（模拟圆形遮罩）
      for (let y = 0; y < 200; y++) {
        for (let x = 0; x < 200; x++) {
          const index = (y * 200 + x) * 4;
          const centerX = 100;
          const centerY = 100;
          const radius = 80;
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
          
          if (distance <= radius) {
            mockMask.data[index] = 255;     // R
            mockMask.data[index + 1] = 255; // G
            mockMask.data[index + 2] = 255; // B
            mockMask.data[index + 3] = 255; // A
          } else {
            mockMask.data[index] = 0;       // R
            mockMask.data[index + 1] = 0;   // G
            mockMask.data[index + 2] = 0;   // B
            mockMask.data[index + 3] = 0;   // A
          }
        }
      }
      
      const meshOptions = {
        width: 200,
        height: 200,
        vertexDensity,
        partMask: mockMask,
        edgeSmoothing
      };
      
      // 生成网格
      let generatedMesh = AutoMeshGenerator.generateMesh(meshOptions);
      
      // 应用优化
      if (optimizationLevel > 0) {
        generatedMesh = AutoMeshGenerator.optimizeMesh(generatedMesh, optimizationLevel);
      }
      
      setMeshData(generatedMesh);
      
      // 保存到状态
      dispatch({
        type: 'UPDATE_LAYER',
        payload: {
          id: state.selectedLayerId!,
          updates: { 
            properties: {
              ...state.layers.find(l => l.id === state.selectedLayerId)?.properties,
              meshData: generatedMesh
            }
          }
        }
      });
      
    } catch (error) {
      console.error('网格生成失败:', error);
      alert('网格生成失败: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 绘制网格预览
  const drawMeshPreview = () => {
    if (!canvasRef.current || !meshData) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 设置绘制样式
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
    ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // 绘制三角形
    meshData.triangles.forEach(triangle => {
      const vertices = triangle.vertices.map(vertexId => 
        meshData.vertices.find(v => v.id === vertexId)
      ).filter(Boolean) as MeshData['vertices'];
      
      if (vertices.length === 3) {
        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        ctx.lineTo(vertices[1].x, vertices[1].y);
        ctx.lineTo(vertices[2].x, vertices[2].y);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    });
    
    // 绘制顶点
    ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
    meshData.vertices.forEach(vertex => {
      ctx.beginPath();
      ctx.arc(vertex.x, vertex.y, 2, 0, 2 * Math.PI);
      ctx.fill();
    });
    
    // 显示统计信息
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.fillText(`顶点数: ${meshData.vertices.length}`, 10, 20);
    ctx.fillText(`三角形数: ${meshData.triangles.length}`, 10, 35);
    ctx.fillText(`边界: ${meshData.bounds.minX},${meshData.bounds.minY} - ${meshData.bounds.maxX},${meshData.bounds.maxY}`, 10, 50);
  };
  
  useEffect(() => {
    drawMeshPreview();
  }, [meshData]);
  
  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
      <h4 className="text-sm font-medium text-white">{t('stageB.autoMesh')}</h4>
      
      {/* 参数控制 */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-300 mb-1">
            {t('stageB.vertexDensity')}: {vertexDensity}
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={vertexDensity}
            onChange={(e) => setVertexDensity(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-300 mb-1">
            {t('stageB.edgeSmoothing')}: {edgeSmoothing}
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={edgeSmoothing}
            onChange={(e) => setEdgeSmoothing(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-300 mb-1">
            {t('stageB.optimizationLevel')}: {optimizationLevel}
          </label>
          <input
            type="range"
            min="0"
            max="5"
            value={optimizationLevel}
            onChange={(e) => setOptimizationLevel(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      {/* 生成按钮 */}
      <button
        onClick={generateMesh}
        disabled={isGenerating || !state.selectedPartId}
        className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-sm"
      >
        {isGenerating ? t('stageB.generating') : t('stageB.generateMesh')}
      </button>
      
      {/* 预览 */}
      {meshData && (
        <div className="mt-4">
          <h5 className="text-xs text-gray-300 mb-2">{t('stageB.meshPreview')}</h5>
          <div className="border border-gray-600 rounded overflow-hidden">
            <canvas
              ref={canvasRef}
              width={200}
              height={200}
              className="block"
            />
          </div>
        </div>
      )}
    </div>
  );
};