#!/usr/bin/env python3
"""
AmberPipeline AI - Naming Convention Resolver Module
Automatically determines which processing workflows to call based on filename prefixes
Supports four-segment naming convention: [prefix]_[asset_name]_[properties/variation]_[version].ext
"""

import os

class NamingResolver:
    """
    Naming Convention Resolver Class
    Automatically resolves processing workflows based on filename prefixes
    Supports four-segment naming convention: [prefix]_[asset_name]_[properties/variation]_[version].ext
    """
    
    def __init__(self, custom_rules=None):
        """
        Initialize Naming Resolver
        
        Args:
            custom_rules: Custom rules dictionary, takes precedence over default rules
        """
        # Default rule mapping based on core categories
        self.default_rules = {
            "CHR": {"processes": ["segment", "align_bottom", "generate_shadow"], "icon": "Character"},    # Character: Segmentation, Alignment, Shadow
            "UI":  {"processes": ["segment", "resize_square", "sharpen"], "icon": "UI"},                # UI: Segmentation, Squarify, Sharpen
            "ENV": {"processes": ["make_seamless", "gen_pbr", "gen_lod"], "icon": "Environment"},     # Environment: Seamless, PBR, LOD
            "PRP": {"processes": ["segment", "gen_pbr", "box_collision"], "icon": "Prop"}            # Prop: Segmentation, PBR, Collision
        }
        
        # Texture suffix standards
        self.texture_suffixes = {
            "_BC": {"name": "Base Color", "description": "Base color", "engine_usage": "Base color of objects"},
            "_N": {"name": "Normal", "description": "Normal map", "engine_usage": "Bump details"},
            "_R": {"name": "Roughness", "description": "Roughness", "engine_usage": "Determines if reflection is scattered or concentrated"},
            "_E": {"name": "Emissive", "description": "Emissive", "engine_usage": "Glowing parts like amber, torches"},
            "_M": {"name": "Mask", "description": "Mask", "engine_usage": "For dynamic effects like blood, snow"}
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
            Dictionary containing parts of the naming structure
        """
        # Separate filename and extension
        name_without_ext, ext = os.path.splitext(filename)
        ext = ext.lower()
        
        # Split filename by underscore
        parts = name_without_ext.split('_')
        
        # Parse each part
        prefix = parts[0] if len(parts) > 0 else ""
        material_name = parts[1] if len(parts) > 1 else ""
        
        # Handle attribute/variation and version
        attribute = ""
        version = ""
        
        if len(parts) > 2:
            # Check if last part is version number (v01, v1.0 format)
            if len(parts[-1]) >= 2 and parts[-1][0] == 'v' and parts[-1][1:].isdigit():
                version = parts[-1]
                # Attribute/variation is the middle part
                attribute = '_'.join(parts[2:-1])
            else:
                # No version number, remaining parts are attribute/variation
                attribute = '_'.join(parts[2:])
        
        # Check if it contains texture suffix
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
        Resolve processing workflow and resource info from filename
        
        Args:
            filename: Filename (without path)
            
        Returns:
            Dictionary containing resource info and processing workflow
        """
        # Parse filename structure
        name_info = self.parse_filename(filename)
        prefix = name_info["prefix"]
        
        # Get processing rule
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
            processes: List of processing steps
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
            prefix: Prefix rule to remove
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