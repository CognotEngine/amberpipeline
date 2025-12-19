#!/usr/bin/env python3
"""
AmberPipeline AI - MVP Stage
Main script file, implementing AI image auto-processing pipeline
Features: Monitor directory -> Auto segmentation -> Generate normal map -> Resize to 512x512
"""

import os
import time
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from config import Config
from modules.segmentation import SAMSegmenter  # SAM模型已安装，启用
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
    Directory monitoring event handler, triggers processing flow when new images are added
    """
    def __init__(self, config):
        self.config = config
        self.segmenter = SAMSegmenter(config)  # SAM model installed, enabled
        self.normal_generator = NormalMapGenerator(config)
        self.image_processor = ImageProcessor(config)
        self.naming_resolver = NamingResolver()
        self.code_sync = CodeSync(config.output_dir, config.cpp_header_dir, config.compiled_dir)
        # Asset list for generating C++ header files
        self.asset_list = []
    
    def on_created(self, event):
        """Called when a new file is created"""
        if not event.is_directory:
            file_path = event.src_path
            if self._is_supported_image(file_path):
                logger.info(f"New image file detected: {file_path}")
                # Add delay to wait for file to be fully written to disk
                time.sleep(0.5)
                self._process_image(file_path)
    
    def _is_supported_image(self, file_path):
        """Check if file is a supported image format"""
        supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tga']
        ext = os.path.splitext(file_path)[1].lower()
        return ext in supported_formats
    
    def _process_image(self, file_path):
        """
        Complete image processing workflow
        """
        try:
            # 1. Get base file information
            base_name = os.path.basename(file_path)
            name_without_ext = os.path.splitext(base_name)[0]
            
            # 2. Use naming resolver to get resource info and processing steps
            resource_info = self.naming_resolver.resolve(base_name)
            logger.info(f"Resource info resolved from filename: {base_name} -> Type: {resource_info['resource_type']}, Processes: {resource_info['processes']}")
            
            # 3. Load original image
            original_image = self.image_processor.load_image(file_path)
            if original_image is None:
                logger.error(f"Failed to load image: {file_path}")
                return
            
            # 4. Execute processing steps
            executed_steps = []
            processed_image = original_image
            
            for step in resource_info['processes']:
                try:
                    logger.info(f"Executing step: {step}")
                    executed_steps.append(step)
                    
                    if step == "segment":
                        # Segment image using SAM
                        logger.info(f"Starting segmentation process")
                        segmented_image = self.segmenter.segment(file_path)
                        if segmented_image is not None:
                            processed_image = segmented_image
                            logger.info(f"Segmentation completed")
                        else:
                            logger.warning(f"Segmentation failed, continuing with original image")
                    elif step == "align_bottom":
                        # Align bottom
                        processed_image = self.image_processor.align_bottom(processed_image)
                    elif step == "generate_shadow":
                        # Generate shadow
                        processed_image = self.image_processor.generate_shadow(processed_image)
                    elif step == "resize_square":
                        # Square crop
                        target_size = self.config.target_size[0]  # Assume square
                        processed_image = self.image_processor.resize_square(processed_image, target_size)
                    elif step == "sharpen":
                        # Sharpen edges
                        processed_image = self.image_processor.sharpen(processed_image)
                    elif step == "make_seamless":
                        # Make seamless
                        processed_image = self.image_processor.make_seamless(processed_image)
                    elif step == "gen_pbr":
                        # Generate PBR textures (currently only normal map)
                        logger.info(f"Starting normal map generation")
                        normal_map = self.normal_generator.generate(file_path)
                        if normal_map is not None:
                            normal_path = os.path.join(self.config.output_dir, f"{name_without_ext}_normal.png")
                            self.image_processor.save_image(normal_map, normal_path)
                            logger.info(f"Normal map generated and saved to: {normal_path}")
                    elif step == "gen_lod":
                        # Generate LODs
                        logger.info(f"Starting LOD generation")
                        lods = self.image_processor.gen_lod(processed_image)
                        for i, lod_image in enumerate(lods):
                            lod_path = os.path.join(self.config.output_dir, f"{name_without_ext}_lod{i}.png")
                            self.image_processor.save_image(lod_image, lod_path)
                            logger.info(f"LOD {i} generated and saved to: {lod_path}")
                    elif step == "box_collision":
                        # Generate collision box
                        collision_box = self.image_processor.box_collision(processed_image)
                        logger.info(f"Collision box generated: {collision_box}")
                    elif step == "default_process":
                        # Default processing flow
                        logger.info(f"Executing default processing")
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
            
            # 8. Resize to target size (if not already done)
            if "resize_square" not in executed_steps and "default_process" not in executed_steps:
                resized_path = os.path.join(self.config.output_dir, f"{name_without_ext}_{self.config.target_size[0]}x{self.config.target_size[1]}.png")
                resized_image = self.image_processor.resize(processed_image, self.config.target_size)
                self.image_processor.save_image(resized_image, resized_path)
                logger.info(f"Image resized and saved to: {resized_path}")
            
            # 9. Generate resource metadata
            metadata_path = self.code_sync.generate_metadata(
                asset_name=name_without_ext,
                original_path=file_path,
                prompt="",
                process_steps=executed_steps
            )
            logger.info(f"Resource metadata generated: {metadata_path}")
            
            # 11. Add to asset list for generating C++ header files
            if name_without_ext not in self.asset_list:
                self.asset_list.append(name_without_ext)
                # Update C++ header files
                header_paths = self.code_sync.generate_cpp_header(self.asset_list)
                for path in header_paths:
                    logger.info(f"C++ header file updated: {path}")
            
            logger.info(f"Image processing workflow completed: {file_path}")
            
        except Exception as e:
            logger.error(f"Error processing image: {file_path}, Error info: {str(e)}")

def main():
    """
    Main function, starts the pipeline
    """
    # Load configuration
    config = Config()
    
    # Create output directories
    os.makedirs(config.output_dir, exist_ok=True)
    os.makedirs(config.watch_dir, exist_ok=True)
    
    logger.info("AmberPipeline AI MVP Started")
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
        logger.info("AmberPipeline AI Stopped")
    
    observer.join()

def process_single_file(file_path):
    """
    Process a single file
    
    Args:
        file_path: File path
    """
    config = Config()
    handler = ImageProcessingHandler(config)
    handler._process_image(file_path)

if __name__ == "__main__":
    import sys
    
    # Check if there are command line arguments
    if len(sys.argv) > 1:
        # Process specified file
        file_path = sys.argv[1]
        print(f"Processing file directly: {file_path}")
        process_single_file(file_path)
    else:
        # Start in watch mode
        main()
