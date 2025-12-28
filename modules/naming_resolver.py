#!/usr/bin/env python3
"""
AmberPipeline AI - Naming Convention Resolution Module
Automatically determines which processing flows to call based on filename prefixes
Supports four-segment naming convention: [prefix]_[material_name]_[property/variant]_[version].ext
"""

import os

class NamingResolver:
    """
    Naming Convention Resolver Class
    Automatically resolves processing flows to execute based on filename prefixes
    Supports four-segment naming convention: [prefix]_[material_name]_[property/variant]_[version].ext
    """
    
    def __init__(self, custom_rules=None):
        """
        Initialize Naming Resolver
        
        Args:
            custom_rules: Custom rules dictionary with higher priority than default rules
        """
        # Default rule mapping based on core categories
        self.default_rules = {
            "CHR": {"processes": ["segment", "align_bottom", "generate_shadow"], "icon": "Character"},    # Character: segment, align, shadow
            "UI":  {"processes": ["segment", "resize_square", "sharpen"], "icon": "Icon"},          # Icon: segment, square resize, sharpen
            "ENV": {"processes": ["make_seamless", "gen_pbr", "gen_lod"], "icon": "Environment"},           # Environment: seamless, PBR, LOD
            "PRP": {"processes": ["segment", "gen_pbr", "box_collision"], "icon": "Prop"}          # Prop: segment, PBR, collision volume
        }
        
        # Texture suffix standards
        self.texture_suffixes = {
            "_BC": {"name": "Base Color", "description": "Diffuse", "engine_usage": "Base color of objects"},
            "_N": {"name": "Normal", "description": "Normal", "engine_usage": "Bump texture and details"},
            "_R": {"name": "Roughness", "description": "Roughness", "engine_usage": "Determines whether reflected light is scattered or concentrated"},
            "_E": {"name": "Emissive", "description": "Emissive", "engine_usage": "Glowing parts like amber, torches, etc."},
            "_M": {"name": "Mask", "description": "Mask", "engine_usage": "Used to implement dynamic effects like blood stains, snow, etc."}
        }
        
        # Merge custom rules
        self.rules = self.default_rules.copy()
        if custom_rules:
            self.rules.update(custom_rules)
    
    def parse_filename(self, filename):
        """
        Parse four-segment filename structure
        
        Args:
            filename: Filename (without path)
            
        Returns:
            Dictionary containing filename structure components
        """
        # Separate filename and extension
        name_without_ext, ext = os.path.splitext(filename)
        ext = ext.lower()
        
        # Split filename by underscore
        parts = name_without_ext.split('_')
        
        # Parse each component
        prefix = parts[0] if len(parts) > 0 else ""
        material_name = parts[1] if len(parts) > 1 else ""
        
        # Process attributes/variants and version
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
        
        # Check if contains texture suffix
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
        Resolve processing flows and resource information based on filename
        
        Args:
            filename: Filename (without path)
            
        Returns:
            Dictionary containing resource information and processing flows
        """
        # Parse filename structure
        name_info = self.parse_filename(filename)
        prefix = name_info["prefix"]
        
        # Get processing rules
        rule = self.rules.get(prefix, {
            "processes": ["default_process"], 
            "icon": "Unknown"
        })
        
        # Build return result
        return {
            **name_info,
            "resource_type": rule["icon"],
            "processes": rule["processes"],
            "texture_info": self.texture_suffixes.get(name_info["texture_suffix"], {})
        }
    
    def add_rule(self, prefix, processes, icon="Custom"):
        """
        Add custom rule
        
        Args:
            prefix: Filename prefix
            processes: List of processing flows
            icon: Resource type icon/name
        """
        self.rules[prefix] = {
            "processes": processes,
            "icon": icon
        }
    
    def remove_rule(self, prefix):
        """
        Remove rule
        
        Args:
            prefix: Prefix rule to delete
        """
        if prefix in self.rules:
            del self.rules[prefix]
    
    def get_all_rules(self):
        """
        Get all rules
        
        Returns:
            Dictionary of all rules
        """
        return self.rules.copy()