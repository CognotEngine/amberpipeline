#!/usr/bin/env python3
"""
AmberPipeline AI - MVP Stage
Main script file implementing AI image auto-processing pipeline
Features: Directory monitoring -> Automatic image matting -> Normal map generation -> Resize to 512x512
"""

import os
import time
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from config import Config
from modules.segmentation import SAMSegmenter  # SAM2 segmentation module
from modules.normal_map import NormalMapGenerator
from modules.image_processing import ImageProcessor
from modules.naming_resolver import NamingResolver
from modules.code_sync import CodeSync

# Configure logging
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
    Directory monitoring event handler, triggers processing flow when new images are added
    """
    def __init__(self, config):
        self.config = config
        # 采用延迟加载机制，只在需要时才初始化模型
        self.segmenter = None  # SAM2 segmentation module - 延迟加载
        self.normal_generator = None  # Normal map generator - 延迟加载
        self.image_processor = None  # Image processor - 延迟加载
        self.naming_resolver = NamingResolver()
        self.code_sync = CodeSync(config.output_dir, config.cpp_header_dir, config.compiled_dir)
        # Asset list for generating C++ header files
        self.asset_list = []
        
    def _init_processors(self):
        """
        延迟初始化处理器组件
        """
        if self.segmenter is None:
            print("初始化SAM2分割器...")
            self.segmenter = SAMSegmenter(self.config)
        if self.normal_generator is None:
            print("初始化法线贴图生成器...")
            self.normal_generator = NormalMapGenerator(self.config)
        if self.image_processor is None:
            print("初始化图像处理处理器...")
            self.image_processor = ImageProcessor(self.config)
    
    def on_created(self, event):
        """Called when a new file is created"""
        if not event.is_directory:
            file_path = event.src_path
            if self._is_supported_image(file_path):
                logger.info(f"New image file detected: {file_path}")
                # Add delay to wait for file to be completely written to disk
                time.sleep(0.5)
                self._process_image(file_path)
    
    def _is_supported_image(self, file_path):
        """Check if file is a supported image format"""
        supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tga']
        ext = os.path.splitext(file_path)[1].lower()
        return ext in supported_formats
    
    def _process_image(self, file_path):
        """Complete image processing workflow"""
        try:
            # 延迟初始化处理器组件
            self._init_processors()
            
            # 1. Get base filename information
            base_name = os.path.basename(file_path)
            name_without_ext = os.path.splitext(base_name)[0]
            
            # 2. Use naming convention resolver to get resource information and processing flow
            resource_info = self.naming_resolver.resolve(base_name)
            logger.info(f"Resolved resource info from filename: {base_name} -> Type: {resource_info['resource_type']}, Processes: {resource_info['processes']}")
            
            # 3. Load original image
            original_image = self.image_processor.load_image(file_path)
            if original_image is None:
                logger.error(f"Failed to load image: {file_path}")
                return
            
            # 4. Perform segmentation using SAM2
            logger.info(f"Performing segmentation using SAM2: {file_path}")
            processed_image = self.segmenter.segment(file_path)
            if processed_image is None:
                logger.error(f"Segmentation failed: {file_path}")
                return
            
            # 5. Execute processing workflow
            executed_steps = []
            
            for step in resource_info['processes']:
                try:
                    logger.info(f"Executing step: {step}")
                    executed_steps.append(step)
                    
                    if step == "segment":
                        # Segmentation processing using SAM2
                        logger.info(f"Performing segmentation using SAM2")
                        processed_image = self.segmenter.segment(file_path)
                    elif step == "align_bottom":
                        # Align to bottom
                        processed_image = self.image_processor.align_bottom(processed_image)
                    elif step == "generate_shadow":
                        # Generate shadow
                        processed_image = self.image_processor.generate_shadow(processed_image)
                    elif step == "resize_square":
                        # Square resize
                        target_size = self.config.target_size[0]  # Assuming square
                        processed_image = self.image_processor.resize_square(processed_image, target_size)
                    elif step == "sharpen":
                        # Sharpen edges
                        processed_image = self.image_processor.sharpen(processed_image)
                    elif step == "make_seamless":
                        # Make seamless
                        processed_image = self.image_processor.make_seamless(processed_image)
                    elif step == "gen_pbr":
                        # Generate PBR maps (only normal map for now)
                        logger.info(f"Generating normal map")
                        normal_map = self.normal_generator.generate(file_path)
                        if normal_map is not None:
                            normal_path = os.path.join(self.config.output_dir, f"{name_without_ext}_normal.png")
                            self.image_processor.save_image(normal_map, normal_path)
                            logger.info(f"Normal map generated, saved to: {normal_path}")
                    elif step == "gen_lod":
                        # Generate LODs
                        logger.info(f"Generating LODs")
                        lods = self.image_processor.gen_lod(processed_image)
                        for i, lod_image in enumerate(lods):
                            lod_path = os.path.join(self.config.output_dir, f"{name_without_ext}_lod{i}.png")
                            self.image_processor.save_image(lod_image, lod_path)
                            logger.info(f"LOD {i} generated, saved to: {lod_path}")
                    elif step == "box_collision":
                        # Generate collision box
                        collision_box = self.image_processor.box_collision(processed_image)
                        logger.info(f"Collision box generated: {collision_box}")
                    elif step == "default_process":
                        # Default processing
                        logger.info(f"Executing default process")
                        processed_image = self.image_processor.resize(processed_image, self.config.target_size)
                except Exception as step_error:
                    logger.error(f"Failed to execute step {step}: {str(step_error)}")
            
            # 6. Save original image copy
            original_copy_path = os.path.join(self.config.output_dir, f"{name_without_ext}_original.png")
            self.image_processor.save_image(original_image, original_copy_path)
            logger.info(f"Original image saved to: {original_copy_path}")
            
            # 7. Save processed image
            processed_path = os.path.join(self.config.output_dir, f"{name_without_ext}_processed.png")
            self.image_processor.save_image(processed_image, processed_path)
            logger.info(f"Processed image saved to: {processed_path}")
            
            # 8. Resize to target size (if not already executed)
            if "resize_square" not in executed_steps and "default_process" not in executed_steps:
                resized_path = os.path.join(self.config.output_dir, f"{name_without_ext}_{self.config.target_size[0]}x{self.config.target_size[1]}.png")
                resized_image = self.image_processor.resize(processed_image, self.config.target_size)
                self.image_processor.save_image(resized_image, resized_path)
                logger.info(f"Image resized and saved to: {resized_path}")
            
            # 9. Generate asset metadata
            metadata_path = self.code_sync.generate_metadata(
                asset_name=name_without_ext,
                original_path=file_path,
                prompt="",
                process_steps=executed_steps
            )
            logger.info(f"Asset metadata generated: {metadata_path}")
            
            # 11. Add to asset list for C++ header generation
            if name_without_ext not in self.asset_list:
                self.asset_list.append(name_without_ext)
                # Update C++ header files
                header_paths = self.code_sync.generate_cpp_header(self.asset_list)
                for path in header_paths:
                    logger.info(f"C++ header file updated: {path}")
            
            logger.info(f"Image processing workflow completed: {file_path}")
            
        except Exception as e:
            logger.error(f"Error processing image: {file_path}, Error: {str(e)}")

def main():
    """Main function, starts the pipeline"""
    # Load configuration
    config = Config()
    
    # Create output directories
    os.makedirs(config.output_dir, exist_ok=True)
    os.makedirs(config.watch_dir, exist_ok=True)
    
    logger.info("AmberPipeline AI MVP started")
    logger.info(f"Watching directory: {config.watch_dir}")
    logger.info(f"Output directory: {config.output_dir}")
    logger.info(f"Target size: {config.target_size[0]}x{config.target_size[1]}")
    
    # Create event handler
    event_handler = ImageProcessingHandler(config)
    
    # Create observer
    observer = Observer()
    observer.schedule(event_handler, config.watch_dir, recursive=False)
    
    # Start observer
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        logger.info("AmberPipeline AI stopped")
    
    observer.join()

def start_gui():
    """
    Launch GUI interface
    """
    import sys
    from gui.main_window import main
    sys.exit(main())

if __name__ == "__main__":
    import sys
    
    # Check command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == "--gui":
        start_gui()
    else:
        # Start in command line mode by default
        main()
