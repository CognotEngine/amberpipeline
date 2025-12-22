#!/usr/bin/env python3
"""
AmberPipeline AI - 实时监控仪表盘
专注于自动化流水线操作的标签页
包含左侧目录配置、中央实时流水线视图和右侧统计图表
"""

import os
import sys
import time
import logging
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QGroupBox,
    QProgressBar, QScrollArea, QListWidget, QListWidgetItem, QGridLayout,
    QFrame, QSplitter, QCheckBox, QLineEdit, QSizePolicy
)
from PyQt5.QtCore import Qt, QThread, pyqtSignal, QTimer
from PyQt5.QtGui import QColor, QPixmap, QPalette

# 添加项目根目录到系统路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(project_root)

# 导入核心模块
from config import Config
import watchdog.observers as observers
from main import ImageProcessingHandler

class FileSystemMonitor(QThread):
    """文件系统监控线程"""
    file_added = pyqtSignal(str)  # 新文件添加信号
    file_updated = pyqtSignal(str)  # 文件更新信号
    file_deleted = pyqtSignal(str)  # 文件删除信号
    
    def __init__(self, watch_dir):
        super().__init__()
        self.watch_dir = watch_dir
        self.observer = None
        self.running = False
    
    def run(self):
        """启动文件系统监控"""
        from watchdog.events import FileSystemEventHandler
        
        class EventHandler(FileSystemEventHandler):
            def __init__(self, monitor):
                self.monitor = monitor
            
            def on_created(self, event):
                if not event.is_directory:
                    self.monitor.file_added.emit(event.src_path)
            
            def on_modified(self, event):
                if not event.is_directory:
                    self.monitor.file_updated.emit(event.src_path)
            
            def on_deleted(self, event):
                if not event.is_directory:
                    self.monitor.file_deleted.emit(event.src_path)
        
        self.running = True
        self.observer = observers.Observer()
        event_handler = EventHandler(self)
        self.observer.schedule(event_handler, self.watch_dir, recursive=True)
        self.observer.start()
        
        while self.running:
            time.sleep(1)
    
    def stop(self):
        """停止文件系统监控"""
        self.running = False
        if self.observer:
            self.observer.stop()
            self.observer.join()

class ProcessCard(QWidget):
    """处理任务卡片组件"""
    
    def __init__(self, file_name, parent=None):
        super().__init__(parent)
        self.file_name = file_name
        self.init_ui()
    
    def init_ui(self):
        """初始化卡片UI"""
        layout = QVBoxLayout(self)
        layout.setContentsMargins(15, 15, 15, 15)
        layout.setSpacing(12)
        
        # 设置卡片样式
        self.setObjectName("processCard")
        self.setMinimumHeight(150)
        self.setMaximumHeight(200)
        
        # 文件名
        self.file_label = QLabel(f"正在处理: {self.file_name}")
        self.file_label.setWordWrap(True)
        self.file_label.setObjectName("processFileName")
        self.file_label.setMaximumHeight(40)
        layout.addWidget(self.file_label)
        
        # 进度条
        self.progress_bar = QProgressBar()
        self.progress_bar.setObjectName("processProgressBar")
        self.progress_bar.setValue(0)
        layout.addWidget(self.progress_bar)
        
        # 当前步骤
        self.step_label = QLabel("当前步骤: 等待处理...")
        self.step_label.setObjectName("processStepLabel")
        self.step_label.setMaximumHeight(25)
        layout.addWidget(self.step_label)
        
        # 处理流程
        self.flow_layout = QHBoxLayout()
        self.flow_layout.setSpacing(10)
        
        # 步骤指示器
        steps = ["SAM分割", "法线贴图", "阴影生成", "完成"]
        self.step_indicators = []
        
        for i, step in enumerate(steps):
            # 步骤容器
            step_container = QVBoxLayout()
            step_container.setSpacing(5)
            
            # 指示器
            indicator = QFrame()
            indicator.setFixedSize(22, 22)
            indicator.setObjectName("stepIndicator")
            indicator.setToolTip(step)
            self.step_indicators.append(indicator)
            
            # 步骤标签
            step_label = QLabel(step)
            step_label.setObjectName("stepNameLabel")
            step_label.setFixedWidth(60)
            step_label.setAlignment(Qt.AlignCenter)
            step_label.setWordWrap(True)
            
            step_container.addWidget(indicator, alignment=Qt.AlignCenter)
            step_container.addWidget(step_label)
            
            self.flow_layout.addLayout(step_container)
            
            # 添加箭头
            if i < len(steps) - 1:
                arrow_label = QLabel("→")
                arrow_label.setObjectName("stepArrowLabel")
                self.flow_layout.addWidget(arrow_label, alignment=Qt.AlignCenter)
        
        self.flow_layout.addStretch()
        layout.addLayout(self.flow_layout)
        
        # 设置卡片大小
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
    
    def update_progress(self, progress, step):
        """更新进度和步骤"""
        self.progress_bar.setValue(progress)
        self.step_label.setText(f"当前步骤: {step}")
        
        # 更新步骤指示器
        if step == "SAM分割":
            self.step_indicators[0].setObjectName("stepIndicatorActive")
        elif step == "法线贴图":
            self.step_indicators[0].setObjectName("stepIndicatorComplete")
            self.step_indicators[1].setObjectName("stepIndicatorActive")
        elif step == "阴影生成":
            self.step_indicators[1].setObjectName("stepIndicatorComplete")
            self.step_indicators[2].setObjectName("stepIndicatorActive")
        elif step == "完成":
            self.step_indicators[2].setObjectName("stepIndicatorComplete")
            self.step_indicators[3].setObjectName("stepIndicatorComplete")
        
        # 重新应用样式
        self.style().unpolish(self)
        self.style().polish(self)

class MonitorTab(QWidget):
    """实时监控仪表盘标签页"""
    
    def __init__(self, config, parent=None):
        super().__init__(parent)
        self.config = config
        self.parent = parent
        self.file_monitor = None
        self.process_cards = {}
        
        # 初始化UI
        self.init_ui()
        self.setup_logging()
        
        # 启动定时刷新
        self.refresh_timer = QTimer(self)
        self.refresh_timer.timeout.connect(self.update_statistics)
        self.refresh_timer.start(5000)  # 每5秒刷新一次
    
    def init_ui(self):
        """初始化用户界面"""
        # 主布局
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(10, 10, 10, 10)
        main_layout.setSpacing(10)
        
        # ------------------------------
        # 中央区域 - 实时流水线视图
        # ------------------------------
        self.central_view = QWidget()
        central_layout = QVBoxLayout(self.central_view)
        central_layout.setContentsMargins(0, 0, 0, 0)
        central_layout.setSpacing(10)
        
        # 标题
        title_label = QLabel("实时流水线监控")
        title_label.setObjectName("sectionTitle")
        central_layout.addWidget(title_label)
        
        # 处理任务列表
        self.process_list = QListWidget()
        self.process_list.setObjectName("processList")
        self.process_list.setSpacing(15)
        self.process_list.setWrapping(False)
        self.process_list.setFlow(QListWidget.TopToBottom)
        self.process_list.setResizeMode(QListWidget.Adjust)
        self.process_list.setUniformItemSizes(True)
        
        # 添加滚动区域
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setObjectName("processScrollArea")
        scroll_area.setWidget(self.process_list)
        
        central_layout.addWidget(scroll_area, 1)
        
        # 添加到主布局
        main_layout.addWidget(self.central_view, 1)
        
        # 创建右侧面板
        self.create_right_panel()
    
    def create_right_panel(self):
        """创建右侧统计面板"""
        self.right_panel = QWidget()
        self.right_panel.setObjectName("rightPanel")
        right_layout = QVBoxLayout(self.right_panel)
        right_layout.setContentsMargins(10, 10, 10, 10)
        right_layout.setSpacing(10)
        
        # 标题
        title_label = QLabel("统计信息")
        title_label.setObjectName("sectionTitle")
        right_layout.addWidget(title_label)
        
        # 日处理量
        self.daily_count_group = QGroupBox("日处理量")
        count_layout = QVBoxLayout(self.daily_count_group)
        self.daily_count_label = QLabel("0 个文件")
        self.daily_count_label.setAlignment(Qt.AlignCenter)
        self.daily_count_label.setObjectName("statValue")
        count_layout.addWidget(self.daily_count_label)
        right_layout.addWidget(self.daily_count_group)
        
        # 成功率
        self.success_rate_group = QGroupBox("成功率")
        rate_layout = QVBoxLayout(self.success_rate_group)
        self.success_rate_label = QLabel("0%")
        self.success_rate_label.setAlignment(Qt.AlignCenter)
        self.success_rate_label.setObjectName("statValue")
        rate_layout.addWidget(self.success_rate_label)
        right_layout.addWidget(self.success_rate_group)
        
        # 资源类型分布
        self.resource_distribution_group = QGroupBox("资源类型分布")
        distribution_layout = QVBoxLayout(self.resource_distribution_group)
        
        # 饼图占位符
        self.pie_chart_placeholder = QFrame()
        self.pie_chart_placeholder.setObjectName("pieChartPlaceholder")
        self.pie_chart_placeholder.setMinimumSize(200, 200)
        
        # 类型统计
        self.resource_types_label = QLabel("暂无数据")
        self.resource_types_label.setWordWrap(True)
        self.resource_types_label.setObjectName("resourceTypesLabel")
        
        distribution_layout.addWidget(self.pie_chart_placeholder)
        distribution_layout.addWidget(self.resource_types_label)
        right_layout.addWidget(self.resource_distribution_group)
        
        # 添加拉伸
        right_layout.addStretch()
    
    def get_right_panel(self):
        """获取右侧面板"""
        return self.right_panel
    
    def start_monitoring(self):
        """启动文件系统监控"""
        if not self.file_monitor:
            self.file_monitor = FileSystemMonitor(self.config.watch_dir)
            self.file_monitor.file_added.connect(self.on_file_added)
            self.file_monitor.file_updated.connect(self.on_file_updated)
            self.file_monitor.file_deleted.connect(self.on_file_deleted)
            self.file_monitor.start()
            
            logging.info("开始监控目录: %s", self.config.watch_dir)
    
    def stop_monitoring(self):
        """停止文件系统监控"""
        if self.file_monitor:
            self.file_monitor.stop()
            self.file_monitor = None
            
            logging.info("停止监控目录")
    
    def on_file_added(self, file_path):
        """当新文件添加时的处理"""
        file_name = os.path.basename(file_path)
        logging.info("发现新文件: %s", file_name)
        
        # 创建处理卡片
        self.add_process_card(file_name)
    
    def on_file_updated(self, file_path):
        """当文件更新时的处理"""
        file_name = os.path.basename(file_path)
        logging.info("文件更新: %s", file_name)
    
    def on_file_deleted(self, file_path):
        """当文件删除时的处理"""
        file_name = os.path.basename(file_path)
        logging.info("文件删除: %s", file_name)
    
    def add_process_card(self, file_name):
        """添加处理卡片"""
        # 创建卡片
        card = ProcessCard(file_name)
        
        # 创建列表项
        item = QListWidgetItem()
        item.setSizeHint(card.sizeHint() + QSize(20, 20))
        
        # 添加到列表
        self.process_list.addItem(item)
        self.process_list.setItemWidget(item, card)
        
        # 保存引用
        self.process_cards[file_name] = card
        
        # 模拟处理流程
        self.simulate_processing(file_name)
    
    def simulate_processing(self, file_name):
        """模拟处理流程"""
        def update_progress(step, progress):
            """更新进度的嵌套函数"""
            if file_name in self.process_cards:
                self.process_cards[file_name].update_progress(progress, step)
        
        # 模拟处理步骤
        steps = [
            ("SAM分割", 25),
            ("法线贴图", 50),
            ("阴影生成", 75),
            ("完成", 100)
        ]
        
        # 使用定时器模拟处理过程
        for i, (step, progress) in enumerate(steps):
            QTimer.singleShot(i * 2000, lambda s=step, p=progress: update_progress(s, p))
        
        # 处理完成后移除卡片
        QTimer.singleShot(9000, lambda: self.remove_process_card(file_name))
    
    def remove_process_card(self, file_name):
        """移除处理卡片"""
        if file_name in self.process_cards:
            # 查找列表项
            for i in range(self.process_list.count()):
                item = self.process_list.item(i)
                widget = self.process_list.itemWidget(item)
                if widget and widget.file_name == file_name:
                    self.process_list.takeItem(i)
                    break
            
            # 移除引用
            del self.process_cards[file_name]
    
    def update_statistics(self):
        """更新统计信息"""
        # 模拟统计数据
        daily_count = 125
        success_rate = 98
        resource_types = "道具: 45%, 角色: 30%, 场景: 25%"
        
        # 更新标签
        self.daily_count_label.setText(f"{daily_count} 个文件")
        self.success_rate_label.setText(f"{success_rate}%")
        self.resource_types_label.setText(resource_types)
    
    def setup_logging(self):
        """配置日志系统"""
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        # 添加控制台处理器
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        
        if not self.logger.hasHandlers():
            self.logger.addHandler(handler)
