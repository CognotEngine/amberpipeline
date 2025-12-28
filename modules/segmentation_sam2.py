#!/usr/bin/env python3
"""
AmberPipeline AI - Semantic Segmentation Module
简化版：只使用SAM2模型实现语义分割（背景移除）
"""

import os
import numpy as np
from PIL import Image
import torch

# 导入SAM2模块
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor
from hydra import compose, initialize
from hydra.core.global_hydra import GlobalHydra
import importlib.util

class SAMSegmenter:
    """SAM2语义分割类"""
    
    def __init__(self, config):
        """
        初始化SAM2分割器
        
        Args:
            config: 配置对象，包含sam_model_path和sam_device等参数
        """
        self.config = config
        self.sam2_model = None
        self.sam2_predictor = None
        self._model_initialized = False
    
    def _init_sam_model(self):
        """
        初始化SAM2模型
        """
        if self._model_initialized:
            return True
            
        try:
            # 检查模型文件
            if not os.path.exists(self.config.sam_model_path):
                print(f"❌ 模型文件不存在: {self.config.sam_model_path}")
                return False
            
            print(f"\n=== SAM2模型初始化 ===")
            print(f"模型路径: {self.config.sam_model_path}")
            print(f"设备: {self.config.sam_device}")
            
            # 清理并初始化Hydra
            if GlobalHydra.instance().is_initialized():
                print("清理现有的Hydra实例...")
                GlobalHydra.instance().clear()
            
            print("初始化Hydra...")
            initialize(version_base=None, config_path=None)
            
            # 获取SAM2模块路径
            sam2_path = importlib.util.find_spec('sam2').submodule_search_locations[0]
            
            # 选择配置文件
            if "2.1_hiera_tiny" in self.config.sam_model_path.lower() or "2.1_hiera_t" in self.config.sam_model_path.lower():
                config_name = os.path.join(sam2_path, "configs", "sam2.1", "sam2.1_hiera_t.yaml")
            elif "2.1_hiera_s" in self.config.sam_model_path.lower():
                config_name = os.path.join(sam2_path, "configs", "sam2.1", "sam2.1_hiera_s.yaml")
            elif "2.1_hiera_l" in self.config.sam_model_path.lower():
                config_name = os.path.join(sam2_path, "configs", "sam2.1", "sam2.1_hiera_l.yaml")
            elif "2.1_hiera_b" in self.config.sam_model_path.lower():
                config_name = os.path.join(sam2_path, "configs", "sam2.1", "sam2.1_hiera_b+.yaml")
            else:
                config_name = os.path.join(sam2_path, "configs", "sam2", "sam2_hiera_t.yaml")
            
            print(f"配置文件: {config_name}")
            
            # 构建模型结构
            print("构建SAM2模型结构...")
            self.sam2_model = build_sam2(
                config_file=config_name,
                ckpt_path=None,  # 不直接加载权重
                device=self.config.sam_device,
                mode="eval"
            )
            print("✅ 模型结构构建成功")
            
            # 手动加载权重
            print("加载模型权重...")
            checkpoint = torch.load(self.config.sam_model_path, map_location="cpu")
            
            # 提取model键下的权重
            if "model" in checkpoint:
                state_dict = checkpoint["model"]
                print(f"✅ 成功提取'model'键下的权重，共{len(state_dict)}个参数")
            else:
                state_dict = checkpoint
                print(f"✅ 直接使用权重，共{len(state_dict)}个参数")
            
            # 加载权重到模型
            result = self.sam2_model.load_state_dict(state_dict, strict=False)
            print("✅ 权重加载成功")
            
            # 检查加载结果
            if hasattr(result, "missing_keys") and result.missing_keys:
                print(f"⚠️  缺少 {len(result.missing_keys)} 个键")
            if hasattr(result, "unexpected_keys") and result.unexpected_keys:
                print(f"⚠️  发现 {len(result.unexpected_keys)} 个意外键")
            
            # 初始化预测器
            print("初始化SAM2预测器...")
            self.sam2_predictor = SAM2ImagePredictor(self.sam2_model)
            print("✅ 预测器初始化成功")
            
            self._model_initialized = True
            return True
            
        except Exception as e:
            print(f"❌ 模型初始化失败: {str(e)}")
            import traceback
            traceback.print_exc()
            return False
    
    def segment(self, image_path: str) -> Image.Image:
        """
        执行语义分割（背景移除）
        
        Args:
            image_path: 图片文件路径
        
        Returns:
            分割后的Image对象（包含Alpha通道），失败时返回None
        """
        # 初始化模型
        if not self._init_sam_model():
            print("SAM2模型初始化失败，无法执行分割")
            return None
        
        try:
            # 加载图片
            image = Image.open(image_path)
            if image.mode == 'RGBA':
                image = image.convert('RGB')
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            image_np = np.array(image)
            print(f"处理图片: {image_path} (尺寸: {image_np.shape})")
            
            # 设置图片
            self.sam2_predictor.set_image(image_np)
            
            # 使用中心点作为提示
            h, w, _ = image_np.shape
            center_point = np.array([[w // 2, h // 2]])
            center_label = np.array([1])  # 1表示前景
            
            # 生成掩码
            masks, scores, logits = self.sam2_predictor.predict(
                point_coords=center_point,
                point_labels=center_label,
                multimask_output=True
            )
            
            # 选择最佳掩码
            if masks is None or len(masks) == 0:
                print("❌ 未生成有效掩码")
                return None
            
            best_idx = np.argmax(scores)
            mask = masks[best_idx]
            print(f"✅ 生成掩码，置信度: {scores[best_idx]:.4f}")
            
            # 创建RGBA图片
            rgba_image = np.zeros((image_np.shape[0], image_np.shape[1], 4), dtype=np.uint8)
            rgba_image[:, :, :3] = image_np
            rgba_image[:, :, 3] = mask.astype(np.uint8) * 255
            
            result_image = Image.fromarray(rgba_image)
            return result_image
            
        except Exception as e:
            print(f"❌ 分割失败: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    def segment_with_points(self, image_path: str, points: list, point_labels: list) -> Image.Image:
        """
        使用点提示执行语义分割
        
        Args:
            image_path: 图片文件路径
            points: 点坐标列表 [(x1, y1), (x2, y2), ...]
            point_labels: 点标签列表 [0, 1, ...] 0表示背景，1表示前景
        
        Returns:
            分割后的Image对象（包含Alpha通道），失败时返回None
        """
        # 初始化模型
        if not self._init_sam_model():
            print("SAM2模型初始化失败，无法执行分割")
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
            self.sam2_predictor.set_image(image_np)
            
            # 转换点格式
            input_points = np.array(points)
            input_labels = np.array(point_labels)
            
            # 生成掩码
            masks, scores, logits = self.sam2_predictor.predict(
                point_coords=input_points,
                point_labels=input_labels,
                multimask_output=True
            )
            
            # 选择最佳掩码
            if masks is None or len(masks) == 0:
                print("❌ 未生成有效掩码")
                return None
            
            best_idx = np.argmax(scores)
            mask = masks[best_idx]
            
            # 创建RGBA图片
            rgba_image = np.zeros((image_np.shape[0], image_np.shape[1], 4), dtype=np.uint8)
            rgba_image[:, :, :3] = image_np
            rgba_image[:, :, 3] = mask.astype(np.uint8) * 255
            
            result_image = Image.fromarray(rgba_image)
            return result_image
            
        except Exception as e:
            print(f"❌ 点提示分割失败: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
