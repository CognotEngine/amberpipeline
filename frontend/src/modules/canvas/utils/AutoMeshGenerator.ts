/**
 * 自动网格化工具模块
 * 功能：根据部位分割结果生成用于变形的网格
 */

export interface MeshVertex {
  id: string;
  x: number;
  y: number;
  u: number; // 纹理坐标U
  v: number; // 纹理坐标V
  boneWeights?: { [boneId: string]: number }; // 骨骼权重
}

export interface MeshTriangle {
  id: string;
  vertices: [string, string, string]; // 三个顶点的ID
}

export interface MeshData {
  vertices: MeshVertex[];
  triangles: MeshTriangle[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  vertexDensity: number;
}

export interface AutoMeshOptions {
  width: number;
  height: number;
  vertexDensity: number; // 顶点密度，控制网格精细度
  partMask: ImageData; // 部位的遮罩数据
  edgeSmoothing: number; // 边缘平滑度
}

/**
 * 自动网格化生成器
 */
export class AutoMeshGenerator {
  
  /**
   * 生成用于部位变形的网格
   */
  static generateMesh(options: AutoMeshOptions): MeshData {
    const { width, height, vertexDensity, partMask } = options;
    
    // 根据密度计算网格间距
    const spacing = Math.max(5, Math.min(50, 100 / vertexDensity));
    
    // 生成顶点
    const vertices = this.generateVertices(width, height, spacing, partMask);
    
    // 生成三角形
    const triangles = this.generateTriangles(vertices, width, height, spacing);
    
    // 计算边界
    const bounds = this.calculateBounds(vertices);
    
    return {
      vertices,
      triangles,
      bounds,
      vertexDensity
    };
  }
  
  /**
   * 生成网格顶点
   */
  private static generateVertices(
    width: number, 
    height: number, 
    spacing: number, 
    mask: ImageData
  ): MeshVertex[] {
    const vertices: MeshVertex[] = [];
    let vertexId = 0;
    
    // 在网格点上生成顶点
    for (let y = 0; y < height; y += spacing) {
      for (let x = 0; x < width; x += spacing) {
        // 检查该点是否在遮罩内
        if (this.isPointInMask(x, y, mask)) {
          const vertex: MeshVertex = {
            id: `vertex-${vertexId++}`,
            x,
            y,
            u: x / width,
            v: y / height
          };
          vertices.push(vertex);
        }
      }
    }
    
    // 在边缘添加额外的顶点以提高变形质量
    const edgeVertices = this.generateEdgeVertices(width, height, mask);
    vertices.push(...edgeVertices);
    
    return vertices;
  }
  
  /**
   * 检查点是否在遮罩内
   */
  private static isPointInMask(x: number, y: number, mask: ImageData): boolean {
    const index = (y * mask.width + x) * 4;
    if (index < 0 || index >= mask.data.length) return false;
    
    // 检查alpha通道，大于128认为在遮罩内
    return mask.data[index + 3] > 128;
  }
  
  /**
   * 生成边缘顶点
   */
  private static generateEdgeVertices(
    width: number, 
    height: number, 
    mask: ImageData
  ): MeshVertex[] {
    const edgeVertices: MeshVertex[] = [];
    let vertexId = 10000; // 边缘顶点使用不同的ID范围
    
    // 在遮罩边缘添加顶点
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const currentInMask = this.isPointInMask(x, y, mask);
        const neighbors = [
          { x: x - 1, y }, // 左
          { x: x + 1, y }, // 右
          { x, y: y - 1 }, // 上
          { x, y: y + 1 }  // 下
        ];
        
        // 如果当前点在遮罩内，且至少有一个邻居在遮罩外，则是边缘
        if (currentInMask) {
          const isEdge = neighbors.some(neighbor => 
            !this.isPointInMask(neighbor.x, neighbor.y, mask)
          );
          
          if (isEdge) {
            edgeVertices.push({
              id: `edge-${vertexId++}`,
              x,
              y,
              u: x / width,
              v: y / height
            });
          }
        }
      }
    }
    
    return edgeVertices;
  }
  
  /**
   * 生成三角形
   */
  private static generateTriangles(
    vertices: MeshVertex[], 
    width: number, 
    height: number, 
    spacing: number
  ): MeshTriangle[] {
    const triangles: MeshTriangle[] = [];
    let triangleId = 0;
    
    // 使用Delaunay三角剖分算法（简化版）
    // 这里使用基于网格的方法
    for (let y = 0; y < height - spacing; y += spacing) {
      for (let x = 0; x < width - spacing; x += spacing) {
        // 找到当前网格的四个顶点
        const topLeft = vertices.find(v => v.x === x && v.y === y);
        const topRight = vertices.find(v => v.x === x + spacing && v.y === y);
        const bottomLeft = vertices.find(v => v.x === x && v.y === y + spacing);
        const bottomRight = vertices.find(v => v.x === x + spacing && v.y === y + spacing);
        
        // 创建两个三角形
        if (topLeft && topRight && bottomLeft) {
          triangles.push({
            id: `triangle-${triangleId++}`,
            vertices: [topLeft.id, topRight.id, bottomLeft.id]
          });
        }
        
        if (topRight && bottomLeft && bottomRight) {
          triangles.push({
            id: `triangle-${triangleId++}`,
            vertices: [topRight.id, bottomLeft.id, bottomRight.id]
          });
        }
      }
    }
    
    return triangles;
  }
  
  /**
   * 计算边界
   */
  private static calculateBounds(vertices: MeshVertex[]): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    if (vertices.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    
    let minX = vertices[0].x;
    let minY = vertices[0].y;
    let maxX = vertices[0].x;
    let maxY = vertices[0].y;
    
    for (const vertex of vertices) {
      minX = Math.min(minX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxX = Math.max(maxX, vertex.x);
      maxY = Math.max(maxY, vertex.y);
    }
    
    return { minX, minY, maxX, maxY };
  }
  
  /**
   * 优化网格，移除不必要的顶点
   */
  static optimizeMesh(mesh: MeshData, optimizationLevel: number = 1): MeshData {
    // 基于优化级别移除顶点
    const targetReduction = optimizationLevel * 0.1; // 10% * level
    const targetVertexCount = Math.floor(mesh.vertices.length * (1 - targetReduction));
    
    if (mesh.vertices.length <= targetVertexCount) {
      return mesh; // 无需优化
    }
    
    // 简化的优化算法：基于顶点的重要性进行移除
    const optimizedVertices = this.selectImportantVertices(mesh.vertices, targetVertexCount);
    
    // 重新生成三角形
    const optimizedTriangles = this.regenerateTriangles(optimizedVertices);
    
    return {
      vertices: optimizedVertices,
      triangles: optimizedTriangles,
      bounds: mesh.bounds,
      vertexDensity: mesh.vertexDensity
    };
  }
  
  /**
   * 选择重要的顶点
   */
  private static selectImportantVertices(vertices: MeshVertex[], targetCount: number): MeshVertex[] {
    // 简化的重要性计算：基于位置分布
    // 实际应用中可以使用更复杂的算法，如基于曲率、边缘强度等
    
    if (vertices.length <= targetCount) {
      return vertices;
    }
    
    // 均匀采样
    const step = vertices.length / targetCount;
    const selected: MeshVertex[] = [];
    
    for (let i = 0; i < vertices.length; i += step) {
      const index = Math.floor(i);
      if (index < vertices.length) {
        selected.push(vertices[index]);
      }
    }
    
    return selected;
  }
  
  /**
   * 重新生成三角形
   */
  private static regenerateTriangles(vertices: MeshVertex[]): MeshTriangle[] {
    // 简化的三角剖分
    // 实际应用中应该使用Delaunay三角剖分算法
    
    const triangles: MeshTriangle[] = [];
    let triangleId = 0;
    
    // 这里只是一个占位符实现
    // 实际应用中需要基于顶点位置进行正确的三角剖分
    for (let i = 0; i < vertices.length - 2; i += 3) {
      triangles.push({
        id: `triangle-${triangleId++}`,
        vertices: [vertices[i].id, vertices[i + 1].id, vertices[i + 2].id]
      });
    }
    
    return triangles;
  }
}