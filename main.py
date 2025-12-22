#!/usr/bin/env python3
"""
AmberPipeline AI - MVP Stage
主脚本文件，实现AI图片自动处理流水线
功能：监视目录 -> 自动抠图 -> 生成法线贴图 -> 缩放到512x512
"""

import os
import time
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from config import Config
# from modules.segmentation import SAMSegmenter  # 未安装segment-anything，暂时注释
from modules.normal_map import NormalMapGenerator
from modules.image_processing import ImageProcessor
from modules.naming_resolver import NamingResolver
from modules.code_sync import CodeSync

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('amber_pipeline.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class ImageProcessingHandler(FileSystemEventHandler):
    """
    目录监视事件处理器，当有新图片添加时触发处理流程
    """
    def __init__(self, config):
        self.config = config
        # self.segmenter = SAMSegmenter(config)  # 未安装segment-anything，暂时注释
        self.normal_generator = NormalMapGenerator(config)
        self.image_processor = ImageProcessor(config)
        self.naming_resolver = NamingResolver()
        self.code_sync = CodeSync(config.output_dir, config.cpp_header_dir, config.compiled_dir)
        # 资源列表，用于生成C++头文件
        self.asset_list = []
    
    def on_created(self, event):
        """当有新文件创建时调用"""
        if not event.is_directory:
            file_path = event.src_path
            if self._is_supported_image(file_path):
                logger.info(f"新图片文件检测到: {file_path}")
                # 添加延迟，等待文件完全写入磁盘
                time.sleep(0.5)
                self._process_image(file_path)
    
    def _is_supported_image(self, file_path):
        """检查文件是否为支持的图片格式"""
        supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tga']
        ext = os.path.splitext(file_path)[1].lower()
        return ext in supported_formats
    
    def _process_image(self, file_path):
        """处理图片的完整流程"""
        try:
            # 1. 复制原始文件到工作目录
            base_name = os.path.basename(file_path)
            name_without_ext = os.path.splitext(base_name)[0]
            
            # 2. 使用命名规范解析器获取资源信息和处理流程
            resource_info = self.naming_resolver.resolve(base_name)
            logger.info(f"根据文件名解析资源信息: {base_name} -> 类型: {resource_info['resource_type']}, 处理流程: {resource_info['processes']}")
            
            # 3. 加载原始图片
            original_image = self.image_processor.load_image(file_path)
            if original_image is None:
                logger.error(f"加载图片失败: {file_path}")
                return
            
            # 4. 跳过抠图处理（未安装SAM）
            logger.info(f"跳过抠图处理（未安装SAM）: {file_path}")
            processed_image = original_image
            
            # 5. 执行处理流程
            executed_steps = []
            
            for step in resource_info['processes']:
                try:
                    logger.info(f"执行步骤: {step}")
                    executed_steps.append(step)
                    
                    if step == "segment":
                        # 抠图处理（未安装SAM，跳过）
                        logger.info(f"跳过抠图处理（未安装SAM）")
                    elif step == "align_bottom":
                        # 对齐底部
                        processed_image = self.image_processor.align_bottom(processed_image)
                    elif step == "generate_shadow":
                        # 生成阴影
                        processed_image = self.image_processor.generate_shadow(processed_image)
                    elif step == "resize_square":
                        # 正方形裁切
                        target_size = self.config.target_size[0]  # 假设是正方形
                        processed_image = self.image_processor.resize_square(processed_image, target_size)
                    elif step == "sharpen":
                        # 边缘强化
                        processed_image = self.image_processor.sharpen(processed_image)
                    elif step == "make_seamless":
                        # 无缝化处理
                        processed_image = self.image_processor.make_seamless(processed_image)
                    elif step == "gen_pbr":
                        # 生成PBR贴图（暂时只生成法线贴图）
                        logger.info(f"开始生成法线贴图")
                        normal_map = self.normal_generator.generate(file_path)
                        if normal_map is not None:
                            normal_path = os.path.join(self.config.output_dir, f"{name_without_ext}_normal.png")
                            self.image_processor.save_image(normal_map, normal_path)
                            logger.info(f"法线贴图生成完成，保存到: {normal_path}")
                    elif step == "gen_lod":
                        # 生成LOD
                        logger.info(f"开始生成LOD")
                        lods = self.image_processor.gen_lod(processed_image)
                        for i, lod_image in enumerate(lods):
                            lod_path = os.path.join(self.config.output_dir, f"{name_without_ext}_lod{i}.png")
                            self.image_processor.save_image(lod_image, lod_path)
                            logger.info(f"LOD {i} 生成完成，保存到: {lod_path}")
                    elif step == "box_collision":
                        # 生成碰撞体边界
                        collision_box = self.image_processor.box_collision(processed_image)
                        logger.info(f"碰撞体边界生成: {collision_box}")
                    elif step == "default_process":
                        # 默认处理流程
                        logger.info(f"执行默认处理流程")
                        processed_image = self.image_processor.resize(processed_image, self.config.target_size)
                except Exception as step_error:
                    logger.error(f"执行步骤 {step} 失败: {str(step_error)}")
            
            # 6. 保存原始图片副本
            original_copy_path = os.path.join(self.config.output_dir, f"{name_without_ext}_original.png")
            self.image_processor.save_image(original_image, original_copy_path)
            logger.info(f"原始图片保存到: {original_copy_path}")
            
            # 7. 保存处理后的图片
            processed_path = os.path.join(self.config.output_dir, f"{name_without_ext}_processed.png")
            self.image_processor.save_image(processed_image, processed_path)
            logger.info(f"处理后的图片保存到: {processed_path}")
            
            # 8. 缩放到目标尺寸（如果还没有执行过）
            if "resize_square" not in executed_steps and "default_process" not in executed_steps:
                resized_path = os.path.join(self.config.output_dir, f"{name_without_ext}_{self.config.target_size[0]}x{self.config.target_size[1]}.png")
                resized_image = self.image_processor.resize(processed_image, self.config.target_size)
                self.image_processor.save_image(resized_image, resized_path)
                logger.info(f"图片缩放完成，保存到: {resized_path}")
            
            # 9. 生成资源元数据
            metadata_path = self.code_sync.generate_metadata(
                asset_name=name_without_ext,
                original_path=file_path,
                prompt="",
                process_steps=executed_steps
            )
            logger.info(f"资源元数据生成完成: {metadata_path}")
            
            # 11. 添加到资源列表，用于生成C++头文件
            if name_without_ext not in self.asset_list:
                self.asset_list.append(name_without_ext)
                # 更新C++头文件
                header_paths = self.code_sync.generate_cpp_header(self.asset_list)
                for path in header_paths:
                    logger.info(f"C++头文件更新完成: {path}")
            
            logger.info(f"图片处理流程全部完成: {file_path}")
            
        except Exception as e:
            logger.error(f"处理图片时发生错误: {file_path}, 错误信息: {str(e)}")

def main():
    """主函数，启动流水线"""
    # 加载配置
    config = Config()
    
    # 创建输出目录
    os.makedirs(config.output_dir, exist_ok=True)
    os.makedirs(config.watch_dir, exist_ok=True)
    
    logger.info("AmberPipeline AI MVP 启动")
    logger.info(f"监视目录: {config.watch_dir}")
    logger.info(f"输出目录: {config.output_dir}")
    logger.info(f"目标尺寸: {config.target_size[0]}x{config.target_size[1]}")
    
    # 创建事件处理器
    event_handler = ImageProcessingHandler(config)
    
    # 创建观察者
    observer = Observer()
    observer.schedule(event_handler, config.watch_dir, recursive=False)
    
    # 启动观察者
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        logger.info("AmberPipeline AI 已停止")
    
    observer.join()

def start_gui():
    """
    启动GUI界面
    """
    import sys
    from PyQt5.QtWidgets import QApplication
    from gui.main_window import AmberPipelineGUI
    
    app = QApplication(sys.argv)
    gui = AmberPipelineGUI()
    gui.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    import sys
    
    # 检查命令行参数
    if len(sys.argv) > 1 and sys.argv[1] == "--gui":
        start_gui()
    else:
        # 默认以命令行模式启动
        main()
