#!/usr/bin/env python3
"""
AmberPipeline AI - Normal Map Generation Module
Generate PBR normal maps from 2D images, supporting multiple generation algorithms
"""

import os
import numpy as np
from PIL import Image, ImageFilter

class NormalMapGenerator:
    """Normal Map Generation Class"""
    
    def __init__(self, config):
        """
        Initialize Normal Map Generator
        
        Args:
            config: Configuration object
        """
        self.config = config
    
    def generate(self, image_path: str) -> Image.Image:
        """
        从图片生成法线贴图
        
        Args:
            image_path: 图片文件路径
        
        Returns:
            生成的法线贴图Image对象，如果生成失败则返回None
        """
        try:
            # 加载图片
            image = Image.open(image_path)
            
            # 转换为灰度图
            gray_image = image.convert('L')
            
            # 使用 Sobel 算子生成法线贴图
            normal_map = self._sobel_normal_map(gray_image)
            
            return normal_map
            
        except Exception as e:
            print(f"生成法线贴图失败: {image_path}, 错误信息: {str(e)}")
            return None
    
    def _sobel_normal_map(self, gray_image: Image.Image) -> Image.Image:
        """
        使用Sobel算子生成法线贴图
        
        Args:
            gray_image: 灰度图Image对象
        
        Returns:
            生成的法线贴图Image对象
        """
        # 转换为numpy数组
        gray_np = np.array(gray_image, dtype=np.float32) / 255.0
        
        # 应用模糊，减少噪声
        if self.config.normal_blur > 0:
            blur_image = Image.fromarray((gray_np * 255).astype(np.uint8))
            blur_image = blur_image.filter(ImageFilter.GaussianBlur(radius=self.config.normal_blur))
            gray_np = np.array(blur_image, dtype=np.float32) / 255.0
        
        # Sobel算子
        sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])
        sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]])
        
        # 计算梯度
        height, width = gray_np.shape
        gradient_x = np.zeros_like(gray_np)
        gradient_y = np.zeros_like(gray_np)
        
        # 卷积操作
        for i in range(1, height - 1):
            for j in range(1, width - 1):
                gradient_x[i, j] = np.sum(gray_np[i-1:i+2, j-1:j+2] * sobel_x)
                gradient_y[i, j] = np.sum(gray_np[i-1:i+2, j-1:j+2] * sobel_y)
        
        # 计算法线向量
        strength = self.config.normal_strength
        normals = np.zeros((height, width, 3), dtype=np.float32)
        
        normals[:, :, 0] = -gradient_x * strength
        normals[:, :, 1] = -gradient_y * strength
        normals[:, :, 2] = 1.0
        
        # 归一化法线向量
        norm = np.sqrt(normals[:, :, 0]**2 + normals[:, :, 1]**2 + normals[:, :, 2]**2)
        norm = np.maximum(norm, 1e-10)  # 避免除以零
        
        normals[:, :, 0] /= norm
        normals[:, :, 1] /= norm
        normals[:, :, 2] /= norm
        
        # 转换为RGB颜色空间（法线贴图格式）
        # 法线贴图的格式：R=X, G=Y, B=Z，范围从[-1, 1]映射到[0, 255]
        normal_map = (normals + 1.0) * 0.5 * 255.0
        normal_map = normal_map.astype(np.uint8)
        
        # 创建Image对象
        normal_image = Image.fromarray(normal_map)
        
        return normal_image
    
    def _simple_normal_map(self, gray_image: Image.Image) -> Image.Image:
        """
        使用简单差值方法生成法线贴图
        
        Args:
            gray_image: 灰度图Image对象
        
        Returns:
            生成的法线贴图Image对象
        """
        # 转换为numpy数组
        gray_np = np.array(gray_image, dtype=np.float32) / 255.0
        
        height, width = gray_np.shape
        normals = np.zeros((height, width, 3), dtype=np.float32)
        
        # 简单差值计算梯度
        for i in range(height):
            for j in range(width):
                dx = gray_np[i, min(j+1, width-1)] - gray_np[i, max(j-1, 0)]
                dy = gray_np[min(i+1, height-1), j] - gray_np[max(i-1, 0), j]
                
                normals[i, j, 0] = -dx * self.config.normal_strength
                normals[i, j, 1] = -dy * self.config.normal_strength
                normals[i, j, 2] = 1.0
        
        # 归一化
        norm = np.sqrt(normals[:, :, 0]**2 + normals[:, :, 1]**2 + normals[:, :, 2]**2)
        norm = np.maximum(norm, 1e-10)
        
        normals[:, :, 0] /= norm
        normals[:, :, 1] /= norm
        normals[:, :, 2] /= norm
        
        # 转换为RGB颜色空间
        normal_map = (normals + 1.0) * 0.5 * 255.0
        normal_map = normal_map.astype(np.uint8)
        
        return Image.fromarray(normal_map)
    
    def generate_from_color(self, color_image: Image.Image) -> Image.Image:
        """
        从彩色图像生成法线贴图
        
        Args:
            color_image: 彩色图Image对象
        
        Returns:
            生成的法线贴图Image对象
        """
        # 将彩色图像转换为灰度图，使用亮度作为高度信息
        gray_image = color_image.convert('L')
        return self._sobel_normal_map(gray_image)
