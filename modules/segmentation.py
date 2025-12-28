#!/usr/bin/env python3
"""
AmberPipeline AI - Semantic Segmentation Module
Implements automatic image segmentation (background removal) using SAM2 (Segment Anything Model 2)
Separates background from target objects
"""

import os
import numpy as np
from PIL import Image
import torch
import importlib.util

# Import SAM2 components
from sam2.build_sam import build_sam2
from sam2.sam2_image_predictor import SAM2ImagePredictor
from hydra.core.global_hydra import GlobalHydra
from hydra import initialize

class SAMSegmenter:
    """SAM2 Semantic Segmentation Class"""
    
    def __init__(self, config):
        """
        Initialize SAM2 Segmenter
        
        Args:
            config: Configuration object
        """
        self.config = config
        # SAM2 attributes
        self.sam2_model = None
        self.sam2_predictor = None
        self._model_initialized = False
    
    def _init_sam_model(self):
        """
        Initialize SAM2 Model
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
            
            # 清理Hydra实例
            if GlobalHydra.instance().is_initialized():
                print("清理现有的Hydra实例...")
                GlobalHydra.instance().clear()
            
            # 初始化Hydra
            print("初始化Hydra...")
            initialize(version_base=None, config_path=None)
            
            # 获取sam2模块的安装路径
            sam2_path = importlib.util.find_spec('sam2').submodule_search_locations[0]
            
            # 选择合适的配置文件
            if "2.1_hiera_tiny" in self.config.sam_model_path.lower() or "2.1_hiera_t" in self.config.sam_model_path.lower():
                config_name = os.path.join(sam2_path, "configs", "sam2.1", "sam2.1_hiera_t.yaml")
            elif "2.1_hiera_s" in self.config.sam_model_path.lower():
                config_name = os.path.join(sam2_path, "configs", "sam2.1", "sam2.1_hiera_s.yaml")
            elif "2.1_hiera_l" in self.config.sam_model_path.lower():
                config_name = os.path.join(sam2_path, "configs", "sam2.1", "sam2.1_hiera_l.yaml")
            elif "2.1_hiera_b" in self.config.sam_model_path.lower():
                config_name = os.path.join(sam2_path, "configs", "sam2.1", "sam2.1_hiera_b+.yaml")
            elif "hiera_tiny" in self.config.sam_model_path.lower() or "hiera_t" in self.config.sam_model_path.lower():
                config_name = os.path.join(sam2_path, "configs", "sam2", "sam2_hiera_t.yaml")
            elif "hiera_s" in self.config.sam_model_path.lower():
                config_name = os.path.join(sam2_path, "configs", "sam2", "sam2_hiera_s.yaml")
            elif "hiera_l" in self.config.sam_model_path.lower():
                config_name = os.path.join(sam2_path, "configs", "sam2", "sam2_hiera_l.yaml")
            elif "hiera_b" in self.config.sam_model_path.lower():
                config_name = os.path.join(sam2_path, "configs", "sam2", "sam2_hiera_b+.yaml")
            else:
                config_name = os.path.join(sam2_path, "configs", "sam2", "sam2_hiera_t.yaml")
            
            print(f"使用配置文件: {config_name}")
            
            # 构建模型结构
            print("1. 构建SAM2模型结构...")
            self.sam2_model = build_sam2(
                config_file=config_name,
                ckpt_path=None,  # 不直接加载权重
                device=self.config.sam_device,
                mode="eval"
            )
            print("✅ 模型结构构建成功")
            
            # 加载权重
            print("\n2. 加载模型权重...")
            checkpoint = torch.load(self.config.sam_model_path, map_location="cpu")
            state_dict = checkpoint["model"] if "model" in checkpoint else checkpoint
            print(f"✅ 权重加载成功，共{len(state_dict)}个参数")
            
            # 将权重加载到模型
            print("\n3. 将权重应用到模型...")
            self.sam2_model.load_state_dict(state_dict, strict=False)
            print("✅ 权重应用成功")
            
            # 初始化预测器
            print("\n4. 初始化SAM2预测器...")
            self.sam2_predictor = SAM2ImagePredictor(self.sam2_model)
            print("✅ 预测器初始化成功")
            
            self._model_initialized = True
            print("\n🎉 SAM2模型完全初始化成功！")
            return True
            
        except Exception as e:
            print(f"❌ 模型初始化失败: {str(e)}")
            import traceback
            traceback.print_exc()
            # 清理模型引用
            self.sam2_model = None
            self.sam2_predictor = None
            self._model_initialized = False
            return False
    
    def segment(self, image_path: str) -> Image.Image:
        """
        Perform automatic semantic segmentation (background removal) using SAM2
        
        Args:
            image_path: Image file path
        
        Returns:
            Segmented Image object with transparent background, or None if failed
        """
        # Initialize SAM2 model if not already initialized
        if not self._model_initialized:
            if not self._init_sam_model():
                print("SAM2 model initialization failed, cannot perform segmentation")
                return None
        
        try:
            # Load image
            image = Image.open(image_path)
            # Convert to RGB format
            if image.mode == 'RGBA':
                image = image.convert('RGB')
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            image_np = np.array(image)
            mask = None
            
            # Perform SAM2 segmentation
            print("Using SAM2 for segmentation")
            self.sam2_predictor.set_image(image_np)
            
            # Use center point as prompt to get the main object
            h, w, _ = image_np.shape
            center_point = np.array([[w // 2, h // 2]])
            center_label = np.array([1])  # 1 for foreground
            
            # Generate masks
            masks, scores, logits = self.sam2_predictor.predict(
                point_coords=center_point,
                point_labels=center_label,
                multimask_output=True
            )
            
            # Select the best mask based on confidence score
            if masks is not None and len(masks) > 0:
                best_idx = np.argmax(scores)
                mask = masks[best_idx]
            else:
                print("No valid masks generated by SAM2")
                return None
            
            # Generate segmentation result with transparent background
            rgba_image = np.zeros((image_np.shape[0], image_np.shape[1], 4), dtype=np.uint8)
            rgba_image[:, :, :3] = image_np  # Copy RGB channels
            rgba_image[:, :, 3] = mask.astype(np.uint8) * 255  # Generate Alpha channel
            
            # Convert to Image object
            result_image = Image.fromarray(rgba_image)
            
            return result_image
            
        except Exception as e:
            print(f"Failed to segment image: {image_path}, error: {str(e)}")
            return None
    
    def segment_with_points(self, image_path: str, points: list, point_labels: list) -> Image.Image:
        """
        Perform semantic segmentation with point prompts using SAM2
        
        Args:
            image_path: Image file path
            points: List of point coordinates [(x1, y1), (x2, y2), ...]
            point_labels: List of point labels [0, 1, ...] 0 for background, 1 for foreground
        
        Returns:
            Segmented Image object with transparent background, or None if failed
        """
        # Initialize SAM2 model if not already initialized
        if not self._model_initialized:
            if not self._init_sam_model():
                print("SAM2 model initialization failed, cannot perform segmentation")
                return None
        
        try:
            # Load image
            image = Image.open(image_path)
            if image.mode == 'RGBA':
                image = image.convert('RGB')
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            
            image_np = np.array(image)
            
            # Convert point format
            input_points = np.array(points)
            input_labels = np.array(point_labels)
            
            # Perform SAM2 segmentation with points
            print("Using SAM2 for point-based segmentation")
            self.sam2_predictor.set_image(image_np)
            
            # Generate masks
            masks, scores, logits = self.sam2_predictor.predict(
                point_coords=input_points,
                point_labels=input_labels,
                multimask_output=True
            )
            
            # Select best mask
            best_idx = np.argmax(scores)
            mask = masks[best_idx]
            
            # Generate segmentation result
            rgba_image = np.zeros((image_np.shape[0], image_np.shape[1], 4), dtype=np.uint8)
            rgba_image[:, :, :3] = image_np
            rgba_image[:, :, 3] = mask.astype(np.uint8) * 255
            
            result_image = Image.fromarray(rgba_image)
            
            return result_image
            
        except Exception as e:
            print(f"Failed to segment image with point prompts: {image_path}, error: {str(e)}")
            return None