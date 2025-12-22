#!/usr/bin/env python3
"""
AmberPipeline AI - 配置文件
管理流水线的各项参数，包括目录路径、AI模型路径、图像处理参数等
"""

import os
import json
from dataclasses import dataclass

@dataclass
class Config:
    """流水线配置类"""
    # 目录配置
    watch_dir: str  # 监视目录，放置待处理的AI图片
    output_dir: str  # 输出目录，保存处理后的图片
    models_dir: str  # AI模型目录
    
    # 图像处理配置
    target_size: tuple[int, int]  # 目标尺寸 (width, height)
    
    # SAM模型配置
    sam_model_path: str  # SAM模型路径
    sam_device: str  # 运行设备 ('cpu' or 'cuda')
    sam_confidence_threshold: float  # 分割置信度阈值
    
    # 法线贴图生成配置
    normal_strength: float  # 法线强度
    normal_blur: float  # 法线贴图模糊度
    
    def __init__(self, config_file: str = "config.json"):
        """
        从配置文件加载配置，如果文件不存在则使用默认值
        
        Args:
            config_file: 配置文件路径
        """
        # 默认配置
        default_config = {
            "raw_dir": "Raw",           # 存放 AI 生成的原始图
            "sorted_dir": "Sorted",     # 人工或 AI 初步重命名后的文件，脚本监控此文件夹
            "processed_dir": "Processed", # 自动化脚本处理后的、带透明度的 PNG
            "compiled_dir": "Compiled",   # 最终生成的 C++ 引擎专用二进制文件和 .h 头文件
            "watch_dir": "Sorted",      # 监控目录，指向 Sorted
            "output_dir": "Processed",   # 输出目录，指向 Processed
            "models_dir": "models",
            "cpp_header_dir": "cpp/include",
            "target_size": [512, 512],
            "sam_model_path": "models/sam_vit_h_4b8939.pth",
            "sam_device": "cpu",
            "sam_confidence_threshold": 0.8,
            "normal_strength": 1.0,
            "normal_blur": 0.5,
            "batch_mode": False,
            "max_parallel_tasks": 4
        }
        
        # 读取配置文件
        if os.path.exists(config_file):
            with open(config_file, 'r', encoding='utf-8') as f:
                config_data = json.load(f)
            # 合并默认配置和文件配置
            default_config.update(config_data)
        else:
            # 创建默认配置文件
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(default_config, f, indent=4, ensure_ascii=False)
        
        # 初始化配置
        self.watch_dir = os.path.abspath(default_config["watch_dir"])
        self.output_dir = os.path.abspath(default_config["output_dir"])
        self.models_dir = os.path.abspath(default_config["models_dir"])
        self.target_size = tuple(default_config["target_size"])
        self.sam_model_path = os.path.abspath(default_config["sam_model_path"])
        self.sam_device = default_config["sam_device"]
        self.sam_confidence_threshold = default_config["sam_confidence_threshold"]
        self.normal_strength = default_config["normal_strength"]
        self.normal_blur = default_config["normal_blur"]
        self.cpp_header_dir = os.path.abspath(default_config["cpp_header_dir"])
        self.batch_mode = default_config["batch_mode"]
        self.max_parallel_tasks = default_config["max_parallel_tasks"]
        
        # 工作目录结构
        self.raw_dir = os.path.abspath(default_config["raw_dir"])
        self.sorted_dir = os.path.abspath(default_config["sorted_dir"])
        self.processed_dir = os.path.abspath(default_config["processed_dir"])
        self.compiled_dir = os.path.abspath(default_config["compiled_dir"])
        
        # 创建必要的目录
        os.makedirs(self.watch_dir, exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.models_dir, exist_ok=True)
        os.makedirs(self.cpp_header_dir, exist_ok=True)
        os.makedirs(self.raw_dir, exist_ok=True)
        os.makedirs(self.sorted_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)
        os.makedirs(self.compiled_dir, exist_ok=True)
