#!/usr/bin/env python3
"""
AmberPipeline AI - AssetIDs.h生成工具
从资源包中读取元数据，自动生成C++头文件，包含资源ID的映射
"""

import os
import struct
import json
import argparse
from datetime import datetime

# 资源包头部结构（与C++定义一致）
RESOURCE_PACKAGE_HEADER_FORMAT = '8sIIDD16s'
RESOURCE_PACKAGE_HEADER_SIZE = struct.calcsize(RESOURCE_PACKAGE_HEADER_FORMAT)

# 资源元数据结构（与C++定义一致）
RESOURCE_METADATA_FORMAT = 'IID64B256sI32s16s'
RESOURCE_METADATA_SIZE = struct.calcsize(RESOURCE_METADATA_FORMAT)

# 资源类型枚举（与C++定义一致）
RESOURCE_TYPES = {
    0: "UNKNOWN",
    1: "TEXTURE_2D",
    2: "TEXTURE_CUBE",
    3: "MODEL",
    4: "MATERIAL",
    5: "SHADER",
    6: "SOUND",
    7: "ANIMATION",
    8: "PARTICLE_SYSTEM",
    9: "SCRIPT"
}

def parse_arguments():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description='AmberPipeline AI - AssetIDs.h生成工具')
    parser.add_argument('package_path', help='资源包路径')
    parser.add_argument('-o', '--output', default='AssetIDs.h', help='输出头文件路径')
    parser.add_argument('-n', '--namespace', default='AmberPipeline', help='C++命名空间')
    parser.add_argument('-p', '--prefix', default='ASSET_', help='ID宏前缀')
    parser.add_argument('-v', '--verbose', action='store_true', help='显示详细信息')
    return parser.parse_args()

def read_resource_package(package_path, verbose=False):
    """读取资源包并解析元数据"""
    if not os.path.exists(package_path):
        print(f"错误：资源包不存在 - {package_path}")
        return None
    
    if verbose:
        print(f"读取资源包：{package_path}")
    
    resources = []
    
    with open(package_path, 'rb') as f:
        # 读取包头部
        header_data = f.read(RESOURCE_PACKAGE_HEADER_SIZE)
        if len(header_data) != RESOURCE_PACKAGE_HEADER_SIZE:
            print(f"错误：无法读取完整的包头部 - {package_path}")
            return None
        
        magic, version, resource_count, total_size, create_time, reserved = struct.unpack(
            RESOURCE_PACKAGE_HEADER_FORMAT, header_data
        )
        
        # 验证包标识
        if magic != b'AMBPKG01':
            print(f"错误：无效的资源包格式 - {package_path}")
            return None
        
        if verbose:
            print(f"包标识：{magic.decode()}")
            print(f"版本：{version}")
            print(f"资源数量：{resource_count}")
            print(f"总大小：{total_size} 字节")
            print(f"创建时间：{datetime.fromtimestamp(create_time)}")
        
        # 读取资源元数据
        for i in range(resource_count):
            metadata_data = f.read(RESOURCE_METADATA_SIZE)
            if len(metadata_data) != RESOURCE_METADATA_SIZE:
                print(f"错误：无法读取完整的资源元数据 - 索引：{i}")
                return None
            
            id, type, offset, size, name, flags, hash, reserved = struct.unpack(
                RESOURCE_METADATA_FORMAT, metadata_data
            )
            
            # 处理字符串（去除末尾的null字符）
            resource_name = name.decode('utf-8').rstrip('\x00')
            hash_str = hash.decode('utf-8').rstrip('\x00')
            
            # 添加到资源列表
            resources.append({
                'id': id,
                'type': type,
                'offset': offset,
                'size': size,
                'name': resource_name,
                'flags': flags,
                'hash': hash_str
            })
            
            if verbose:
                type_name = RESOURCE_TYPES.get(type, f"UNKNOWN({type})")
                print(f"资源 {i+1}/{resource_count}：")
                print(f"  ID：{id}")
                print(f"  类型：{type_name}")
                print(f"  名称：{resource_name}")
                print(f"  大小：{size} 字节")
                print(f"  偏移量：{offset}")
                print(f"  标志：{flags}")
                print(f"  哈希：{hash_str}")
    
    return resources

def generate_asset_ids_header(resources, output_path, namespace, prefix, verbose=False):
    """生成AssetIDs.h头文件"""
    if not resources:
        print("错误：没有资源数据")
        return False
    
    # 按资源名称排序
    resources.sort(key=lambda x: x['name'])
    
    # 生成头文件内容
    header_content = f"""// AmberPipeline AI - 资源ID映射头文件
// 自动生成，请勿手动修改
// 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
// 资源数量：{len(resources)}

#pragma once

#include <cstdint>

namespace {namespace} {{

// 资源ID类型
typedef uint32_t AssetID;

// 资源类型枚举
enum class ResourceType : uint32_t {{
    UNKNOWN = 0,
    TEXTURE_2D = 1,
    TEXTURE_CUBE = 2,
    MODEL = 3,
    MATERIAL = 4,
    SHADER = 5,
    SOUND = 6,
    ANIMATION = 7,
    PARTICLE_SYSTEM = 8,
    SCRIPT = 9,
}};

// 资源ID定义
"""
    
    # 生成资源ID宏定义
    for resource in resources:
        # 将资源名称转换为宏名（大写，空格和特殊字符替换为下划线）
        macro_name = resource['name'].upper().replace(' ', '_').replace('-', '_').replace('.', '_')
        macro_name = f"{prefix}{macro_name}"
        
        # 获取资源类型名称
        type_name = RESOURCE_TYPES.get(resource['type'], "UNKNOWN")
        
        header_content += f"#define {macro_name} 0x{resource['id']:08X} // {type_name}: {resource['name']}\n"
    
    # 生成资源ID到名称的映射数组
    header_content += "\n// 资源ID到名称的映射\nextern const char* g_assetNames[];\nextern const ResourceType g_assetTypes[];\n\n// 获取资源名称\ninline const char* GetAssetName(AssetID id) {{
    return g_assetNames[id];
}}\n\n// 获取资源类型\ninline ResourceType GetAssetType(AssetID id) {{
    return g_assetTypes[id];
}}\n\n}} // namespace {namespace}\n"
    
    # 生成对应的cpp文件内容（可选）
    cpp_content = f"""// AmberPipeline AI - 资源ID映射实现
// 自动生成，请勿手动修改
// 生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

#include "AssetIDs.h"

namespace {namespace} {{

// 资源ID到名称的映射数组
const char* g_assetNames[] = {{
    nullptr, // ID 0 保留
"""
    
    # 确定最大ID
    max_id = max(resource['id'] for resource in resources)
    
    # 生成名称映射数组
    for i in range(1, max_id + 1):
        # 查找对应的资源
        resource = next((r for r in resources if r['id'] == i), None)
        if resource:
            cpp_content += f"    \"{resource['name']}", // ID 0x{i:08X}\n"
        else:
            cpp_content += f"    nullptr, // ID 0x{i:08X} (未使用)\n"
    
    cpp_content += "}};\n\n// 资源ID到类型的映射数组
const ResourceType g_assetTypes[] = {{
    ResourceType::UNKNOWN, // ID 0 保留
"""
    
    # 生成类型映射数组
    for i in range(1, max_id + 1):
        # 查找对应的资源
        resource = next((r for r in resources if r['id'] == i), None)
        if resource:
            type_name = RESOURCE_TYPES.get(resource['type'], "UNKNOWN")
            cpp_content += f"    ResourceType::{type_name}, // ID 0x{i:08X}\n"
        else:
            cpp_content += f"    ResourceType::UNKNOWN, // ID 0x{i:08X} (未使用)\n"
    
    cpp_content += "}};\n\n}} // namespace {namespace}\n"
    
    # 写入头文件
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(header_content)
    
    if verbose:
        print(f"头文件生成成功：{output_path}")
    
    # 写入cpp文件（可选）
    cpp_output_path = os.path.splitext(output_path)[0] + ".cpp"
    with open(cpp_output_path, 'w', encoding='utf-8') as f:
        f.write(cpp_content)
    
    if verbose:
        print(f"实现文件生成成功：{cpp_output_path}")
    
    return True

def main():
    """主函数"""
    args = parse_arguments()
    
    print("AmberPipeline AI - AssetIDs.h生成工具")
    print("======================================")
    
    # 读取资源包
    resources = read_resource_package(args.package_path, args.verbose)
    if not resources:
        print("错误：无法读取资源包")
        return 1
    
    # 生成头文件
    success = generate_asset_ids_header(
        resources, 
        args.output, 
        args.namespace, 
        args.prefix, 
        args.verbose
    )
    
    if success:
        print("======================================")
        print(f"AssetIDs.h生成成功！")
        print(f"输出路径：{args.output}")
        print(f"资源数量：{len(resources)}")
        print(f"命名空间：{args.namespace}")
        print(f"ID前缀：{args.prefix}")
        return 0
    else:
        print("错误：生成AssetIDs.h失败")
        return 1

if __name__ == "__main__":
    main()
