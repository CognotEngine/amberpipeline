#!/usr/bin/env python3
"""
AmberPipeline AI - Workflow Manager Module
Automatically processes files in the monitored directory based on four-segment naming convention
"""

import os
import sys
import time
import threading
import logging
import json
from typing import Dict, List, Any, Optional
from PIL import Image

# Import modules
from modules.segmentation import SAMSegmenter
from modules.image_processing import ImageProcessor
from modules.naming_resolver import NamingResolver
from modules.normal_map import NormalMapGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class WorkflowManager:
    """
    Automatic Workflow Manager
    Monitors directory, parses filenames, and executes processing flows based on naming convention
    """
    
    def __init__(self, config):
        """
        Initialize Workflow Manager
        
        Args:
            config: Configuration object
        """
        self.config = config
        self.running = False
        self.monitor_thread = None
        self.processing_queue = []
        self.processed_files = []
        self.failed_files = []
        self.current_process = None
        self.models_loaded = False
        # Batch configuration
        self.max_parallel_tasks = 4  # Default value to prevent VRAM overflow
        self.current_running_tasks = 0
        self.batch_condition = threading.Condition()  # 使用Condition替代Lock，更适合等待条件变化
        
        # Initialize components - SAM模型延迟加载
        self.naming_resolver = NamingResolver()
        self.image_processor = ImageProcessor(config)
        self.normal_map_generator = NormalMapGenerator(config)
        self.sam_segmenter = None  # SAM模型延迟加载
        
        # Ensure directories exist
        self._ensure_directories()
    
    def _ensure_directories(self):
        """
        Ensure required directories exist
        """
        directories = [
            self.config.raw_dir,
            self.config.sorted_dir,
            self.config.processed_dir,
            self.config.compiled_dir,
            self.config.temp_dir
        ]
        
        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            logger.info(f"Ensured directory exists: {directory}")
    
    def start_monitoring(self):
        """
        Start monitoring the watch directory
        """
        if self.running:
            logger.warning("Workflow manager is already running")
            return
        
        # 加载AI模型（延迟加载，只在首次启动监控时加载）
        if not self.models_loaded:
            logger.info("Loading AI models...")
            from modules.segmentation import SAMSegmenter
            self.sam_segmenter = SAMSegmenter(self.config)
            self.models_loaded = True
            logger.info("AI models loaded successfully")
        
        self.running = True
        self.monitor_thread = threading.Thread(target=self._monitor_directory, daemon=True)
        self.monitor_thread.start()
        logger.info(f"Started monitoring directory: {self.config.watch_dir}")
    
    def stop_monitoring(self):
        """
        Stop monitoring the watch directory
        """
        self.running = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        logger.info("Stopped monitoring directory")
    
    def _monitor_directory(self):
        """
        Monitor the watch directory for new files
        """
        processed_filenames = set()
        
        while self.running:
            try:
                # Get all files in the watch directory
                files = [f for f in os.listdir(self.config.watch_dir) 
                        if os.path.isfile(os.path.join(self.config.watch_dir, f))]
                
                # Process new files
                for filename in files:
                    if filename not in processed_filenames:
                        logger.info(f"New file detected: {filename}")
                        self.process_file(filename)
                        processed_filenames.add(filename)
                
                # Sleep for a short interval
                time.sleep(1)
            
            except Exception as e:
                logger.error(f"Error monitoring directory: {str(e)}")
                time.sleep(5)
    
    def process_file(self, filename: str) -> Dict[str, Any]:
        """
        Process a single file based on its filename
        
        Args:
            filename: Name of the file to process
            
        Returns:
            Dictionary containing processing results
        """
        # Add to processing queue
        self.processing_queue.append(filename)
        
        result = {
            "filename": filename,
            "status": "processing",
            "start_time": time.time(),
            "end_time": None,
            "processes": [],
            "error": None
        }
        
        try:
            # 检查并等待可用的并行任务槽位
            logger.info(f"Attempting to process file: {filename}")
            
            # 使用Condition确保线程安全和高效等待
            with self.batch_condition:
                while self.current_running_tasks >= self.max_parallel_tasks:
                    logger.info(f"Max parallel tasks reached ({self.current_running_tasks}/{self.max_parallel_tasks}). Waiting for available slot...")
                    # 等待直到有任务完成
                    self.batch_condition.wait()
                
                # 增加当前运行任务计数
                self.current_running_tasks += 1
                logger.info(f"Started processing file: {filename} (Tasks: {self.current_running_tasks}/{self.max_parallel_tasks})")
            
            # Resolve processing flow based on filename
            file_info = self.naming_resolver.resolve(filename)
            logger.info(f"File info: {file_info}")
            
            # Execute processing flow
            result["processes"] = self._execute_processing_flow(filename, file_info)
            
            # Update result
            result["status"] = "completed"
            result["end_time"] = time.time()
            
            # Add to processed files
            self.processed_files.append(result)
            
            logger.info(f"Successfully processed file: {filename}")
            
        except Exception as e:
            logger.error(f"Failed to process file {filename}: {str(e)}")
            
            # Update result with error
            result["status"] = "failed"
            result["end_time"] = time.time()
            result["error"] = str(e)
            
            # Add to failed files
            self.failed_files.append(result)
        finally:
            # 使用Condition确保线程安全地减少当前运行任务计数并通知等待的线程
            with self.batch_condition:
                if self.current_running_tasks > 0:
                    self.current_running_tasks -= 1
                logger.info(f"Finished processing file: {filename} (Tasks: {self.current_running_tasks}/{self.max_parallel_tasks})")
                # 通知等待的线程有任务槽位可用
                self.batch_condition.notify()
            
            # Remove from processing queue
            if filename in self.processing_queue:
                self.processing_queue.remove(filename)
        
        return result
    
    def _execute_processing_flow(self, filename: str, file_info: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Execute the processing flow based on file information
        
        Args:
            filename: Name of the file to process
            file_info: Dictionary containing file information
            
        Returns:
            List of processing results
        """
        processes = []
        
        # Get full input path
        input_path = os.path.join(self.config.watch_dir, filename)
        
        # Create processed filename
        processed_filename = f"processed_{filename}"
        output_path = os.path.join(self.config.output_dir, processed_filename)
        
        # Current working image
        current_image = self.image_processor.load_image(input_path)
        if current_image is None:
            raise Exception("Failed to load image")
        
        # Execute each process in the flow
        for process_name in file_info["processes"]:
            process_result = {
                "name": process_name,
                "status": "completed",
                "error": None
            }
            
            try:
                logger.info(f"Executing process: {process_name} on {filename}")
                
                if process_name == "segment":
                    # Perform segmentation using SAM
                    segment_result = self.sam_segmenter.segment(input_path)
                    if segment_result is None:
                        raise Exception("Segmentation failed")
                    current_image = segment_result
                    
                elif process_name == "align_bottom":
                    # Align to bottom
                    current_image = self.image_processor.align_bottom(current_image)
                    
                elif process_name == "generate_shadow":
                    # Generate shadow
                    current_image = self.image_processor.generate_shadow(current_image)
                    
                elif process_name == "resize_square":
                    # Resize to square
                    current_image = self.image_processor.resize_square(current_image, target_size=512)
                    
                elif process_name == "sharpen":
                    # Sharpen image
                    current_image = self.image_processor.sharpen(current_image)
                    
                elif process_name == "make_seamless":
                    # Make image seamless
                    current_image = self.image_processor.make_seamless(current_image)
                    
                elif process_name == "gen_lod":
                    # Generate LOD levels
                    lods = self.image_processor.gen_lod(current_image, levels=3)
                    # Save LOD levels
                    for i, lod_image in enumerate(lods):
                        lod_filename = f"{os.path.splitext(processed_filename)[0]}_lod{i}.png"
                        lod_path = os.path.join(self.config.output_dir, lod_filename)
                        self.image_processor.save_image(lod_image, lod_path)
                    
                elif process_name == "gen_pbr":
                    # Generate PBR normal map
                    temp_path = os.path.join(self.config.temp_dir, f"temp_{filename}")
                    self.image_processor.save_image(current_image, temp_path)
                    normal_map = self.normal_map_generator.generate(temp_path)
                    if normal_map:
                        # Save normal map
                        normal_filename = f"{os.path.splitext(processed_filename)[0]}_Normal.png"
                        normal_path = os.path.join(self.config.output_dir, normal_filename)
                        self.image_processor.save_image(normal_map, normal_path)
                    
                elif process_name == "box_collision":
                    # Generate collision box
                    bbox = self.image_processor.box_collision(current_image)
                    process_result["details"] = {"collision_box": bbox}
                    
                elif process_name == "default_process":
                    # Default processing
                    logger.info("Using default processing")
                
                logger.info(f"Successfully executed process: {process_name}")
                
            except Exception as e:
                logger.error(f"Failed to execute process {process_name}: {str(e)}")
                process_result["status"] = "failed"
                process_result["error"] = str(e)
            
            processes.append(process_result)
        
        # Save the final processed image
        self.image_processor.save_image(current_image, output_path)
        
        return processes
    
    def get_workflow_status(self) -> Dict[str, Any]:
        """
        Get the current workflow status
        
        Returns:
            Dictionary containing workflow status information
        """
        total_files = len(self.processed_files) + len(self.failed_files)
        success_rate = (len(self.processed_files) / total_files * 100) if total_files > 0 else 0.0
        
        return {
            "is_running": self.running,
            "processing_queue": self.processing_queue.copy(),
            "processed_files": self.processed_files.copy(),
            "failed_files": self.failed_files.copy(),
            "total_files": total_files,
            "success_rate": success_rate,
            "batch_config": {
                "max_parallel_tasks": self.max_parallel_tasks,
                "current_running_tasks": self.current_running_tasks
            }
        }
    
    def clear_processed_files(self):
        """
        Clear the list of processed files
        """
        self.processed_files = []
        logger.info("Cleared processed files list")
    
    def clear_failed_files(self):
        """
        Clear the list of failed files
        """
        self.failed_files = []
        logger.info("Cleared failed files list")
    
    def set_batch_config(self, max_parallel_tasks: int) -> Dict[str, Any]:
        """
        Set batch processing configuration
        
        Args:
            max_parallel_tasks: Maximum number of parallel tasks to execute
            
        Returns:
            Dictionary containing the updated configuration
        """
        try:
            # Validate the value
            if not isinstance(max_parallel_tasks, int) or max_parallel_tasks < 1 or max_parallel_tasks > 10:
                raise ValueError("max_parallel_tasks must be an integer between 1 and 10")
            
            self.max_parallel_tasks = max_parallel_tasks
            logger.info(f"Batch configuration updated: max_parallel_tasks = {max_parallel_tasks}")
            
            return {
                "success": True,
                "message": "Batch configuration updated successfully",
                "max_parallel_tasks": self.max_parallel_tasks
            }
        except ValueError as e:
            logger.error(f"Invalid batch configuration: {str(e)}")
            return {
                "success": False,
                "message": str(e)
            }
        except Exception as e:
            logger.error(f"Failed to update batch configuration: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to update batch configuration: {str(e)}"
            }
    
    def generate_metadata(self) -> Dict[str, Any]:
        """
        Generate JSON metadata for all processed resources
        
        Returns:
            Dictionary containing the generated metadata
        """
        try:
            logger.info("Generating metadata for processed resources...")
            
            # Create metadata structure
            metadata = {
                "version": "1.0",
                "generated_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "total_processed": len(self.processed_files),
                "total_failed": len(self.failed_files),
                "resources": []
            }
            
            # Add processed files to metadata
            for file in self.processed_files:
                resource_info = {
                    "filename": file["filename"],
                    "status": file["status"],
                    "start_time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(file["start_time"])),
                    "end_time": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(file["end_time"])),
                    "processing_time": round(file["end_time"] - file["start_time"], 2),
                    "processes": file["processes"],
                    "metadata": {}
                }
                
                # Extract additional metadata from filename using naming resolver
                file_info = self.naming_resolver.resolve(file["filename"])
                resource_info["metadata"]["file_type"] = file_info.get("file_type", "unknown")
                resource_info["metadata"]["category"] = file_info.get("category", "unknown")
                resource_info["metadata"]["material"] = file_info.get("material", "unknown")
                resource_info["metadata"]["version"] = file_info.get("version", "unknown")
                
                # Add to resources list
                metadata["resources"].append(resource_info)
            
            # Generate metadata filename with timestamp
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            metadata_filename = f"resources_metadata_{timestamp}.json"
            metadata_path = os.path.join(self.config.output_dir, metadata_filename)
            
            # Save metadata to JSON file
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, ensure_ascii=False, indent=2)
            
            logger.info(f"Metadata generated successfully: {metadata_path}")
            
            # Return metadata summary
            return {
                "success": True,
                "message": "Metadata generated successfully",
                "filename": metadata_filename,
                "path": metadata_path,
                "total_resources": len(metadata["resources"]),
                "generated_at": metadata["generated_at"]
            }
            
        except Exception as e:
            logger.error(f"Failed to generate metadata: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to generate metadata: {str(e)}"
            }

# For testing purposes
if __name__ == "__main__":
    # Import config
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from config import Config
    
    # Initialize config
    config = Config()
    
    # Initialize workflow manager
    workflow_manager = WorkflowManager(config)
    
    # Start monitoring
    workflow_manager.start_monitoring()
    
    # Keep the script running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping workflow manager...")
        workflow_manager.stop_monitoring()
        print("Workflow manager stopped")
