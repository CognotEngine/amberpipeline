/**
 * PSD导出工具模块
 * 功能：将图层数据导出为PSD格式
 */

export interface LayerData {
  id: string;
  name: string;
  width: number;
  height: number;
  imageData: ImageData;
  opacity: number;
  visible: boolean;
  x: number;
  y: number;
}

export interface PSDExportOptions {
  layers: LayerData[];
  width: number;
  height: number;
  filename: string;
}

/**
 * 模拟PSD导出功能
 * 在实际应用中，这里需要集成专业的PSD库，如 psd.js 或 ag-psd
 */
export class PSDExporter {
  /**
   * 导出图层为PSD格式
   */
  static async exportToPSD(options: PSDExportOptions): Promise<Blob> {
    try {
      // 这里模拟PSD导出过程
      // 实际实现中，需要：
      // 1. 创建PSD文件头
      // 2. 写入图层信息
      // 3. 写入图像数据
      // 4. 生成二进制数据
      
      console.log('开始导出PSD:', options.filename);
      console.log('图层数量:', options.layers.length);
      console.log('画布尺寸:', `${options.width}x${options.height}`);
      
      // 模拟处理延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 创建模拟的PSD文件Blob
      // 实际应用中，这里应该生成真正的PSD格式数据
      const mockPSDData = this.createMockPSDData(options);
      const blob = new Blob([mockPSDData], { type: 'image/vnd.adobe.photoshop' });
      
      return blob;
    } catch (error) {
      console.error('PSD导出失败:', error);
      throw new Error('PSD导出失败: ' + (error as Error).message);
    }
  }
  
  /**
   * 导出图层为独立的PNG序列
   */
  static async exportToPNGSequence(options: PSDExportOptions): Promise<{ filename: string; blob: Blob }[]> {
    const results: { filename: string; blob: Blob }[] = [];
    
    for (const layer of options.layers) {
      try {
        // 为每个图层创建Canvas
        const canvas = document.createElement('canvas');
        canvas.width = options.width;
        canvas.height = options.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('无法获取Canvas上下文');
        }
        
        // 设置透明度
        ctx.globalAlpha = layer.opacity;
        
        // 创建ImageData并绘制
        const imageData = new ImageData(
          new Uint8ClampedArray(layer.imageData.data),
          layer.imageData.width,
          layer.imageData.height
        );
        
        // 创建临时Canvas来绘制ImageData
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = layer.imageData.width;
        tempCanvas.height = layer.imageData.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (tempCtx) {
          tempCtx.putImageData(imageData, 0, 0);
          
          // 将图层绘制到主Canvas
          ctx.drawImage(
            tempCanvas,
            layer.x,
            layer.y,
            layer.imageData.width,
            layer.imageData.height
          );
        }
        
        // 转换为PNG
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('无法创建PNG blob'));
            }
          }, 'image/png');
        });
        
        results.push({
          filename: `${layer.name}.png`,
          blob
        });
        
      } catch (error) {
        console.error(`导出图层 ${layer.name} 失败:`, error);
      }
    }
    
    return results;
  }
  
  /**
   * 创建模拟的PSD数据（实际应用中会使用专业库）
   */
  private static createMockPSDData(options: PSDExportOptions): ArrayBuffer {
    // 这里创建模拟的二进制数据
    // 实际应用中需要使用专业的PSD库
    const headerSize = 26; // 简化的PSD头部大小
    const layerInfoSize = options.layers.length * 100; // 每个图层约100字节信息
    const imageDataSize = options.width * options.height * 4 * options.layers.length; // RGBA数据
    
    const totalSize = headerSize + layerInfoSize + imageDataSize;
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    
    // 写入模拟的PSD头部
    view.setUint16(0, 1, false); // 版本
    view.setUint16(2, options.width, false);
    view.setUint16(4, options.height, false);
    
    return buffer;
  }
  
  /**
   * 下载文件
   */
  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
  /**
   * 下载多个文件（压缩包）
   * 实际应用中需要集成JSZip等库
   */
  static async downloadMultipleFiles(files: { filename: string; blob: Blob }[]): Promise<void> {
    // 实际应用中，这里应该创建ZIP文件
    // 为简化，我们逐个下载
    for (const file of files) {
      this.downloadFile(file.blob, file.filename);
      // 添加延迟避免浏览器阻止多个下载
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}