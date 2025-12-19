#!/usr/bin/env python3
"""
AmberPipeline AI - Code Sync Module
Key module connecting Python tools and C++ game projects
Generates C++ header files and resource metadata
"""

import os
import json
from datetime import datetime

class CodeSync:
    """
    Code Sync Class
    Generates C++ header files and resource metadata
    """
    
    def __init__(self, output_dir, cpp_header_dir, compiled_dir):
        """
        Initialize Code Synchronizer
        
        Args:
            output_dir: Resource output directory
            cpp_header_dir: C++ header file output directory
            compiled_dir: Final compilation output directory
        """
        self.output_dir = output_dir
        self.cpp_header_dir = cpp_header_dir
        self.compiled_dir = compiled_dir
    
    def generate_cpp_header(self, asset_list):
        """
        生成C++头文件，包含资源ID枚举
        
        Args:
            asset_list: 资源列表，每个元素为资源名称（不含扩展名）
            
        Returns:
            生成的头文件路径列表
        """
        # 创建输出目录
        os.makedirs(self.cpp_header_dir, exist_ok=True)
        os.makedirs(self.compiled_dir, exist_ok=True)
        
        # 生成头文件内容
        header_content = """// AmberPipeline Auto-Generated Header
#pragma once
#include <cstdint>

namespace Assets {
    // 贴图后缀定义
    namespace TextureSuffix {
        constexpr const char* BaseColor = "_BC";
        constexpr const char* Normal = "_N";
        constexpr const char* Roughness = "_R";
        constexpr const char* Emissive = "_E";
        constexpr const char* Mask = "_M";
    }

    // 资源ID枚举
"""
        
        # 将文件名转为大写枚举名，例如 UI_Amber_01_BC -> ID_UI_AMBER_01_BC
        for i, asset_name in enumerate(asset_list):
            enum_name = f"ID_{asset_name.upper()}"
            header_content += f"    static constexpr uint32_t {enum_name} = {hex(i + 1000)};\n"
        
        header_content += "}\n"
        
        # 写入头文件到cpp/include目录
        header_path = os.path.join(self.cpp_header_dir, "AssetIDs.h")
        with open(header_path, "w") as f:
            f.write(header_content)
        
        # 复制头文件到compiled_dir目录
        import shutil
        compiled_header_path = os.path.join(self.compiled_dir, "AssetIDs.h")
        shutil.copy2(header_path, compiled_header_path)
        
        return [header_path, compiled_header_path]
    
    def generate_metadata(self, asset_name, original_path, prompt="", process_steps=None):
        """
        生成资源元数据JSON文件
        
        Args:
            asset_name: 资源名称（不含扩展名）
            original_path: 原始文件路径
            prompt: 生成资源的Prompt（如果有）
            process_steps: 处理步骤列表
            
        Returns:
            生成的元数据文件路径
        """
        # 构建元数据
        metadata = {
            "asset_name": asset_name,
            "original_path": original_path,
            "generated_time": datetime.now().isoformat(),
            "prompt": prompt,
            "process_steps": process_steps or [],
            "version": "1.0"
        }
        
        # 写入元数据文件
        metadata_path = os.path.join(self.output_dir, f"{asset_name}_metadata.json")
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        return metadata_path
    
    def update_cpp_resources(self, asset_list):
        """
        更新C++资源文件
        1. 生成AssetIDs.h头文件
        2. 复制头文件到compiled_dir目录
        3. 可以扩展添加其他C++文件生成逻辑
        
        Args:
            asset_list: 资源列表
            
        Returns:
            生成的文件路径列表
        """
        generated_files = []
        
        # 生成C++头文件
        header_path = self.generate_cpp_header(asset_list)
        generated_files.append(header_path)
        
        # 复制头文件到compiled_dir目录
        import shutil
        compiled_header_path = os.path.join(self.compiled_dir, "AssetIDs.h")
        shutil.copy2(header_path, compiled_header_path)
        generated_files.append(compiled_header_path)
        
        return generated_files