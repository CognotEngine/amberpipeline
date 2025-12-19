#!/usr/bin/env python3
"""
AmberPipeline AI - Configuration File
Manages pipeline parameters including directory paths, AI model paths, image processing parameters, etc.
"""

import os
import json
from dataclasses import dataclass

@dataclass
class Config:
    """Pipeline Configuration Class"""
    # Directory configuration
    watch_dir: str  # Watch directory for AI images to be processed
    output_dir: str  # Output directory for processed images
    models_dir: str  # AI models directory
    
    # Image processing configuration
    target_size: tuple[int, int]  # Target size (width, height)
    
    # SAM model configuration
    sam_model_path: str  # SAM model path
    sam_device: str  # Running device ('cpu' or 'cuda')
    sam_confidence_threshold: float  # Segmentation confidence threshold
    
    # Normal map generation configuration
    normal_strength: float  # Normal map strength
    normal_blur: float  # Normal map blur level
    
    # C++ project configuration
    cpp_header_dir: str  # C++ header file output directory
    compiled_dir: str  # Final compilation output directory
    
    def __init__(self, config_file: str = "config.json"):
        """
        Initialize from JSON configuration file
        
        Args:
            config_file: Configuration file path
        """
        # Default configuration
        default_config = {
            "raw_dir": "Raw",           # Directory for AI-generated raw images
            "sorted_dir": "Sorted",     # Directory for manually or AI-initial renamed files, script monitors this folder
            "processed_dir": "Processed", # Directory for automated script processed PNG with transparency
            "compiled_dir": "Compiled",   # Directory for final C++ engine binary files and .h header files
            "watch_dir": "Sorted",      # Watch directory, points to Sorted
            "output_dir": "Processed",   # Output directory, points to Processed
            "models_dir": "models",
            "cpp_header_dir": "cpp/include",
            "target_size": [512, 512],
            "sam_model_path": "models/sam_vit_h_4b8939.pth",
            "sam_device": "cuda",
            "sam_confidence_threshold": 0.8,
            "normal_strength": 1.0,
            "normal_blur": 0.5,
            "batch_mode": False,
            "max_parallel_tasks": 4
        }
        
        # Read configuration file
        if os.path.exists(config_file):
            with open(config_file, 'r', encoding='utf-8') as f:
                config_data = json.load(f)
            # Merge default configuration with file configuration
            default_config.update(config_data)
        else:
            # Create default configuration file
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(default_config, f, indent=4, ensure_ascii=False)
        
        # Initialize configuration
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
        
        # Working directory structure
        self.raw_dir = os.path.abspath(default_config["raw_dir"])
        self.sorted_dir = os.path.abspath(default_config["sorted_dir"])
        self.processed_dir = os.path.abspath(default_config["processed_dir"])
        self.compiled_dir = os.path.abspath(default_config["compiled_dir"])
        
        # Create necessary directories
        os.makedirs(self.watch_dir, exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.models_dir, exist_ok=True)
        os.makedirs(self.cpp_header_dir, exist_ok=True)
        os.makedirs(self.raw_dir, exist_ok=True)
        os.makedirs(self.sorted_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)
        os.makedirs(self.compiled_dir, exist_ok=True)
