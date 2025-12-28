#!/usr/bin/env python3
"""
AmberPipeline AI - Code Synchronization Module
Key module connecting Python tools and C++ game projects
Generates C++ header files and resource metadata
"""

import os
import json
from datetime import datetime
# from .resource_sync_client import get_resource_sync_client

class CodeSync:
    """
    Code Synchronization Class
    Used to generate C++ header files and resource metadata
    """
    
    def __init__(self, output_dir, cpp_header_dir, compiled_dir, server_host="localhost", server_port=8888):
        """
        Initialize the code synchronizer
        
        Args:
            output_dir: Resource output directory
            cpp_header_dir: C++ header file output directory
            compiled_dir: Final compiled output directory
            server_host: ResourceSyncServer host address
            server_port: ResourceSyncServer port number
        """
        self.output_dir = output_dir
        self.cpp_header_dir = cpp_header_dir
        self.compiled_dir = compiled_dir
        
        # Initialize resource sync client (temporarily commented out)
        # self.sync_client = get_resource_sync_client(server_host, server_port)
        # 
        # # Try to connect to the server
        # if not self.sync_client.connect():
        #     print(f"Warning: Failed to connect to ResourceSyncServer at {server_host}:{server_port}")
        #     print("Some features (real-time resource synchronization) may not work properly")
        self.sync_client = None
    
    def generate_cpp_header(self, asset_list):
        """
        Generate C++ header file containing resource ID enums
        
        Args:
            asset_list: List of resources, each element is a resource name (without extension)
            
        Returns:
            List of generated header file paths
        """
        # Create output directories
        os.makedirs(self.cpp_header_dir, exist_ok=True)
        os.makedirs(self.compiled_dir, exist_ok=True)
        
        # Generate header file content
        header_content = """// AmberPipeline Auto-Generated Header
#pragma once
#include <cstdint>

namespace Assets {
    // Texture suffix definitions
    namespace TextureSuffix {
        constexpr const char* BaseColor = "_BC";
        constexpr const char* Normal = "_N";
        constexpr const char* Roughness = "_R";
        constexpr const char* Emissive = "_E";
        constexpr const char* Mask = "_M";
    }

    // Resource ID enums
"""
        
        # Convert filename to uppercase enum name, e.g., UI_Amber_01_BC -> ID_UI_AMBER_01_BC
        for i, asset_name in enumerate(asset_list):
            enum_name = f"ID_{asset_name.upper()}"
            header_content += f"    static constexpr uint32_t {enum_name} = {hex(i + 1000)};\n"
        
        header_content += "}\n"
        
        # Write header file to cpp/include directory
        header_path = os.path.join(self.cpp_header_dir, "AssetIDs.h")
        with open(header_path, "w") as f:
            f.write(header_content)
        
        # Copy header file to compiled_dir directory
        import shutil
        compiled_header_path = os.path.join(self.compiled_dir, "AssetIDs.h")
        shutil.copy2(header_path, compiled_header_path)
        
        # Send header content to C++ ResourceSyncServer (temporarily commented out)
        # if self.sync_client:
        #     self.sync_client.send_asset_ids_header(header_content)
        
        return [header_path, compiled_header_path]
    
    def generate_metadata(self, asset_name, original_path, prompt="", process_steps=None):
        """
        Generate resource metadata JSON file
        
        Args:
            asset_name: Resource name (without extension)
            original_path: Original file path
            prompt: Prompt used to generate the resource (if any)
            process_steps: List of processing steps
            
        Returns:
            Path to the generated metadata file
        """
        # Build metadata
        metadata = {
            "asset_name": asset_name,
            "original_path": original_path,
            "generated_time": datetime.now().isoformat(),
            "prompt": prompt,
            "process_steps": process_steps or [],
            "version": "1.0"
        }
        
        # Write metadata file
        metadata_path = os.path.join(self.output_dir, f"{asset_name}_metadata.json")
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        return metadata_path
    
    def update_cpp_resources(self, asset_list):
        """
        Update C++ resource files
        1. Generate AssetIDs.h header file
        2. Copy header file to compiled_dir directory
        3. Can be extended to add other C++ file generation logic
        
        Args:
            asset_list: List of resources
            
        Returns:
            List of generated file paths
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