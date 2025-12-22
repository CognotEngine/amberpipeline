#!/usr/bin/env python3
"""
AmberPipeline AI - 命名规范解析模块
根据文件名前缀自动决定调用哪些处理流程
支持四段式命名法：[前缀]_[素材名]_[属性/变体]_[版本].ext
"""

import os

class NamingResolver:
    """
    命名规范解析器类
    根据文件名前缀自动解析需要执行的处理流程
    支持四段式命名法：[前缀]_[素材名]_[属性/变体]_[版本].ext
    """
    
    def __init__(self, custom_rules=None):
        """
        初始化命名解析器
        
        Args:
            custom_rules: 自定义规则字典，优先级高于默认规则
        """
        # 默认规则映射，基于核心分类
        self.default_rules = {
            "CHR": {"processes": ["segment", "align_bottom", "generate_shadow"], "icon": "人物"},    # 人物：抠图、对齐、阴影
            "UI":  {"processes": ["segment", "resize_square", "sharpen"], "icon": "图标"},          # 图标：抠图、方正化、锐化
            "ENV": {"processes": ["make_seamless", "gen_pbr", "gen_lod"], "icon": "场景"},           # 场景：无缝化、PBR、LOD
            "PRP": {"processes": ["segment", "gen_pbr", "box_collision"], "icon": "道具"}          # 道具：抠图、PBR、碰撞体
        }
        
        # 贴图后缀标准
        self.texture_suffixes = {
            "_BC": {"name": "Base Color", "description": "漫反射", "engine_usage": "物体的基础颜色"},
            "_N": {"name": "Normal", "description": "法线", "engine_usage": "凹凸质感与细节"},
            "_R": {"name": "Roughness", "description": "粗糙度", "engine_usage": "决定反射光是散乱还是集中"},
            "_E": {"name": "Emissive", "description": "自发光", "engine_usage": "琥珀、火把等发光部位"},
            "_M": {"name": "Mask", "description": "遮罩", "engine_usage": "用于实现血迹、积雪等动态效果"}
        }
        
        # 合并自定义规则
        self.rules = self.default_rules.copy()
        if custom_rules:
            self.rules.update(custom_rules)
    
    def parse_filename(self, filename):
        """
        解析四段式文件名结构
        
        Args:
            filename: 文件名（不含路径）
            
        Returns:
            包含命名结构各部分的字典
        """
        # 分离文件名和扩展名
        name_without_ext, ext = os.path.splitext(filename)
        ext = ext.lower()
        
        # 按下划线分割文件名
        parts = name_without_ext.split('_')
        
        # 解析各部分
        prefix = parts[0] if len(parts) > 0 else ""
        material_name = parts[1] if len(parts) > 1 else ""
        
        # 处理属性/变体和版本
        attribute = ""
        version = ""
        
        if len(parts) > 2:
            # 检查最后一部分是否为版本号（v01, v1.0等格式）
            if len(parts[-1]) >= 2 and parts[-1][0] == 'v' and parts[-1][1:].isdigit():
                version = parts[-1]
                # 属性/变体是中间部分
                attribute = '_'.join(parts[2:-1])
            else:
                # 没有版本号，剩余部分都是属性/变体
                attribute = '_'.join(parts[2:])
        
        # 检查是否包含贴图后缀
        texture_suffix = ""
        for suffix in self.texture_suffixes.keys():
            if name_without_ext.endswith(suffix):
                texture_suffix = suffix
                break
        
        return {
            "full_name": filename,
            "name_without_ext": name_without_ext,
            "ext": ext,
            "prefix": prefix,
            "material_name": material_name,
            "attribute": attribute,
            "version": version,
            "texture_suffix": texture_suffix
        }
    
    def resolve(self, filename):
        """
        根据文件名解析处理流程和资源信息
        
        Args:
            filename: 文件名（不含路径）
            
        Returns:
            包含资源信息和处理流程的字典
        """
        # 解析文件名结构
        name_info = self.parse_filename(filename)
        prefix = name_info["prefix"]
        
        # 获取处理规则
        rule = self.rules.get(prefix, {
            "processes": ["default_process"], 
            "icon": "未知"
        })
        
        # 构建返回结果
        return {
            **name_info,
            "resource_type": rule["icon"],
            "processes": rule["processes"],
            "texture_info": self.texture_suffixes.get(name_info["texture_suffix"], {})
        }
    
    def add_rule(self, prefix, processes, icon="自定义"):
        """
        添加自定义规则
        
        Args:
            prefix: 文件名前缀
            processes: 处理流程列表
            icon: 资源类型图标/名称
        """
        self.rules[prefix] = {
            "processes": processes,
            "icon": icon
        }
    
    def remove_rule(self, prefix):
        """
        删除规则
        
        Args:
            prefix: 要删除的前缀规则
        """
        if prefix in self.rules:
            del self.rules[prefix]
    
    def get_all_rules(self):
        """
        获取所有规则
        
        Returns:
            所有规则的字典
        """
        return self.rules.copy()