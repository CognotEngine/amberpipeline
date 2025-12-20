#!/usr/bin/env python3
"""
AmberPipeline AI - Python与C++交互接口
用于Python脚本与C++资源管理器之间的通信，实现资源同步和热重载
"""

import os
import sys
import json
import socket
import time
import threading
from typing import Dict, List, Optional, Any

class AmberPipelineBridge:
    """AmberPipeline Python与C++交互桥接类"""
    
    def __init__(self, host: str = 'localhost', port: int = 8888):
        """
        初始化交互桥接
        
        Args:
            host: C++服务器主机地址
            port: C++服务器端口
        """
        self.host = host
        self.port = port
        self.socket = None
        self.connected = False
        self._stop_event = threading.Event()
        self._thread = None
    
    def connect(self) -> bool:
        """
        连接到C++服务器
        
        Returns:
            连接成功返回True，失败返回False
        """
        try:
            self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.socket.connect((self.host, self.port))
            self.connected = True
            print(f"成功连接到AmberPipeline服务器: {self.host}:{self.port}")
            
            # 启动心跳线程
            self._stop_event.clear()
            self._thread = threading.Thread(target=self._heartbeat_loop, daemon=True)
            self._thread.start()
            
            return True
        except Exception as e:
            print(f"连接到AmberPipeline服务器失败: {e}")
            self.connected = False
            return False
    
    def disconnect(self):
        """
        断开与C++服务器的连接
        """
        self._stop_event.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2.0)
        
        if self.socket:
            try:
                self.socket.close()
            except Exception as e:
                print(f"关闭socket失败: {e}")
            finally:
                self.socket = None
                self.connected = False
        
        print("已断开与AmberPipeline服务器的连接")
    
    def _heartbeat_loop(self):
        """
        心跳循环，保持连接活跃
        """
        while not self._stop_event.is_set():
            try:
                if self.connected:
                    # 发送心跳包
                    self._send_message({'type': 'heartbeat', 'timestamp': time.time()})
                time.sleep(5.0)  # 每5秒发送一次心跳
            except Exception as e:
                print(f"心跳循环错误: {e}")
                self.connected = False
                break
    
    def _send_message(self, message: Dict[str, Any]) -> bool:
        """
        发送消息到C++服务器
        
        Args:
            message: 要发送的消息字典
        
        Returns:
            发送成功返回True，失败返回False
        """
        if not self.connected or not self.socket:
            return False
        
        try:
            # 序列化消息
            message_str = json.dumps(message) + '\n'
            # 发送消息
            self.socket.sendall(message_str.encode('utf-8'))
            return True
        except Exception as e:
            print(f"发送消息失败: {e}")
            self.connected = False
            return False
    
    def _receive_message(self, timeout: float = 1.0) -> Optional[Dict[str, Any]]:
        """
        从C++服务器接收消息
        
        Args:
            timeout: 超时时间（秒）
        
        Returns:
            接收到的消息字典，如果超时或失败返回None
        """
        if not self.connected or not self.socket:
            return None
        
        try:
            # 设置超时
            self.socket.settimeout(timeout)
            # 接收消息
            data = self.socket.recv(4096)
            if not data:
                self.connected = False
                return None
            
            # 解析消息
            message_str = data.decode('utf-8').strip()
            if message_str:
                return json.loads(message_str)
            return None
        except socket.timeout:
            return None  # 超时，返回None
        except Exception as e:
            print(f"接收消息失败: {e}")
            self.connected = False
            return None
    
    def notify_resource_updated(self, resource_path: str, resource_type: str, asset_id: int = 0) -> bool:
        """
        通知C++服务器资源已更新
        
        Args:
            resource_path: 资源文件路径
            resource_type: 资源类型
            asset_id: 资源ID（可选）
        
        Returns:
            发送成功返回True，失败返回False
        """
        message = {
            'type': 'resource_updated',
            'resource_path': resource_path,
            'resource_type': resource_type,
            'asset_id': asset_id,
            'timestamp': time.time()
        }
        return self._send_message(message)
    
    def request_resource_reload(self, asset_id: int) -> bool:
        """
        请求C++服务器重新加载资源
        
        Args:
            asset_id: 资源ID
        
        Returns:
            发送成功返回True，失败返回False
        """
        message = {
            'type': 'reload_resource',
            'asset_id': asset_id,
            'timestamp': time.time()
        }
        return self._send_message(message)
    
    def request_all_resources_reload(self) -> bool:
        """
        请求C++服务器重新加载所有资源
        
        Returns:
            发送成功返回True，失败返回False
        """
        message = {
            'type': 'reload_all_resources',
            'timestamp': time.time()
        }
        return self._send_message(message)
    
    def send_asset_ids_header(self, header_path: str) -> bool:
        """
        发送AssetIDs.h头文件到C++服务器
        
        Args:
            header_path: AssetIDs.h头文件路径
        
        Returns:
            发送成功返回True，失败返回False
        """
        try:
            # 读取头文件内容
            with open(header_path, 'r', encoding='utf-8') as f:
                header_content = f.read()
            
            message = {
                'type': 'asset_ids_header',
                'header_content': header_content,
                'header_path': header_path,
                'timestamp': time.time()
            }
            return self._send_message(message)
        except Exception as e:
            print(f"读取AssetIDs.h文件失败: {e}")
            return False
    
    def is_connected(self) -> bool:
        """
        检查连接状态
        
        Returns:
            连接状态
        """
        return self.connected
    
    def __enter__(self):
        """
        上下文管理器进入
        """
        self.connect()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        上下文管理器退出
        """
        self.disconnect()

# 示例用法
def main():
    """示例用法"""
    # 创建桥接实例
    bridge = AmberPipelineBridge()
    
    # 连接到服务器
    if not bridge.connect():
        print("无法连接到服务器，退出")
        return
    
    try:
        # 示例1：通知资源更新
        bridge.notify_resource_updated(
            resource_path="output/asset_texture.png",
            resource_type="TEXTURE_2D",
            asset_id=12345
        )
        print("已通知资源更新")
        
        # 示例2：请求重新加载资源
        bridge.request_resource_reload(asset_id=12345)
        print("已请求重新加载资源")
        
        # 示例3：发送AssetIDs.h头文件
        bridge.send_asset_ids_header("AssetIDs.h")
        print("已发送AssetIDs.h头文件")
        
        # 等待一段时间，观察结果
        time.sleep(2)
        
    finally:
        # 断开连接
        bridge.disconnect()

if __name__ == "__main__":
    main()
