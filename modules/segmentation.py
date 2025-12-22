#!/usr/bin/env python3
"""
AmberPipeline AI - 语义分割模块
使用SAM (Segment Anything Model) 实现自动抠图功能，将背景与目标物体分离
"""

import os
import numpy as np
from PIL import Image
import torch
from segment_anything import SamPredictor, SamAutomaticMaskGenerator, sam_model_registry

class SAMSegmenter:
    """SAM语义分割类"""
    
    def __init__(self, config):
        """
        初始化SAM分割器
        
        Args:
            config: 配置对象
        """
        self.config = config
        self.sam = None
        self.predictor = None
        self.mask_generator = None
        
        # 初始化SAM模型
        self._init_sam_model()
    
    def _init_sam_model(self):
        """
        初始化SAM模型
        """
        try:
            # 检查模型文件是否存在
            if not os.path.exists(self.config.sam_model_path):
                print(f"SAM模型文件不存在: {self.config.sam_model_path}")
                print("请从 https://github.com/facebookresearch/segment-anything 下载SAM模型")
                return
            
            # 确定模型类型
            model_type = "vit_h"  # 默认使用vit_h模型
            if "vit_b" in self.config.sam_model_path.lower():
                model_type = "vit_b"
            elif "vit_l" in self.config.sam_model_path.lower():
                model_type = "vit_l"
            
            # 加载模型
            print(f"加载SAM模型: {self.config.sam_model_path}")
            self.sam = sam_model_registry[model_type](checkpoint=self.config.sam_model_path)
            self.sam.to(device=self.config.sam_device)
            
            # 创建预测器和掩码生成器
            self.predictor = SamPredictor(self.sam)
            self.mask_generator = SamAutomaticMaskGenerator(
                self.sam,
                points_per_side=32,
                pred_iou_thresh=0.9,
                stability_score_thresh=0.92,
                crop_n_layers=1,
                crop_n_points_downscale_factor=2,
                min_mask_region_area=100
            )
            
            print("SAM模型初始化成功")
            
        except Exception as e:
            print(f"初始化SAM模型失败, 错误信息: {str(e)}")
            self.sam = None
            self.predictor = None
            self.mask_generator = None
    
    def segment(self, image_path: str) -> Image.Image:
        """
        对图片进行语义分割（抠图）
        
        Args:
            image_path: 图片文件路径
        
        Returns:
            抠图后的Image对象，如果处理失败则返回None
        """
        if self.sam is None or self.mask_generator is None:
            print("SAM模型未初始化，无法进行分割")
            return None
        
        try:
            # 加载图片
            image = Image.open(image_path)
            # 转换为RGB格式
            if image.mode == 'RGBA':
                image = image.convert('RGB')
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            # 转换为numpy数组
            image_np = np.array(image)
            
            # 生成掩码
            masks = self.mask_generator.generate(image_np)
            
            # 选择最佳掩码
            if not masks:
                print("未生成有效掩码")
                return None
            
            # 选择面积最大的掩码（通常是主要物体）
            best_mask = max(masks, key=lambda x: x['area'])
            mask = best_mask['segmentation']
            
            # 生成抠图结果
            # 创建RGBA图片
            rgba_image = np.zeros((image_np.shape[0], image_np.shape[1], 4), dtype=np.uint8)
            rgba_image[:, :, :3] = image_np  # 复制RGB通道
            rgba_image[:, :, 3] = mask.astype(np.uint8) * 255  # 生成Alpha通道
            
            # 转换为Image对象
            result_image = Image.fromarray(rgba_image)
            
            return result_image
            
        except Exception as e:
            print(f"分割图片失败: {image_path}, 错误信息: {str(e)}")
            return None
    
    def segment_with_points(self, image_path: str, points: list, point_labels: list) -> Image.Image:
        """
        使用点提示进行语义分割
        
        Args:
            image_path: 图片文件路径
            points: 点坐标列表 [(x1, y1), (x2, y2), ...]
            point_labels: 点标签列表 [0, 1, ...] 0表示背景，1表示前景
        
        Returns:
            抠图后的Image对象，如果处理失败则返回None
        """
        if self.sam is None or self.predictor is None:
            print("SAM模型未初始化，无法进行分割")
            return None
        
        try:
            # 加载图片
            image = Image.open(image_path)
            if image.mode == 'RGBA':
                image = image.convert('RGB')
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            image_np = np.array(image)
            
            # 设置图片
            self.predictor.set_image(image_np)
            
            # 转换点格式
            input_points = np.array(points)
            input_labels = np.array(point_labels)
            
            # 生成掩码
            masks, scores, logits = self.predictor.predict(
                point_coords=input_points,
                point_labels=input_labels,
                multimask_output=True
            )
            
            # 选择最佳掩码
            best_idx = np.argmax(scores)
            mask = masks[best_idx]
            
            # 生成抠图结果
            rgba_image = np.zeros((image_np.shape[0], image_np.shape[1], 4), dtype=np.uint8)
            rgba_image[:, :, :3] = image_np
            rgba_image[:, :, 3] = mask.astype(np.uint8) * 255
            
            result_image = Image.fromarray(rgba_image)
            
            return result_image
            
        except Exception as e:
            print(f"使用点提示分割图片失败: {image_path}, 错误信息: {str(e)}")
            return None
