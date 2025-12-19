// AmberPipeline AI - 资源同步服务器
// 用于接收Python脚本发送的消息，实现资源同步和热重载

#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <atomic>
#include <cstring>
#include <fstream>
#include <sstream>

// 网络库
#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib, "ws2_32.lib")
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#endif

// JSON库（使用nlohmann/json，需要在项目中添加）
#include <nlohmann/json.hpp>
using json = nlohmann::json;

// 资源管理器头文件
#include "../include/ResourceManager.h"

namespace AmberPipeline {

class ResourceSyncServer {
public:
    ResourceSyncServer(uint16_t port = 8888);
    ~ResourceSyncServer();

    // 禁止复制和移动
    ResourceSyncServer(const ResourceSyncServer&) = delete;
    ResourceSyncServer& operator=(const ResourceSyncServer&) = delete;
    ResourceSyncServer(ResourceSyncServer&&) = delete;
    ResourceSyncServer& operator=(ResourceSyncServer&&) = delete;

    // 启动服务器
    bool Start();

    // 停止服务器
    void Stop();

    // 等待服务器停止
    void Join();

    // 检查服务器状态
    bool IsRunning() const;

private:
    // 客户端连接类
    class ClientConnection {
    public:
        ClientConnection(int socket, const std::string& address, uint16_t port);
        ~ClientConnection();

        // 禁止复制和移动
        ClientConnection(const ClientConnection&) = delete;
        ClientConnection& operator=(const ClientConnection&) = delete;
        ClientConnection(ClientConnection&&) = delete;
        ClientConnection& operator=(ClientConnection&&) = delete;

        // 处理客户端连接
        void Process();

        // 发送消息
        bool SendMessage(const json& message);

        // 获取客户端信息
        const std::string& GetAddress() const;
        uint16_t GetPort() const;

        // 检查连接状态
        bool IsConnected() const;

    private:
        // 接收消息
        std::optional<json> ReceiveMessage();

        // 处理消息
        void HandleMessage(const json& message);

        // 处理资源更新消息
        void HandleResourceUpdated(const json& message);

        // 处理资源重载请求
        void HandleReloadResource(const json& message);

        // 处理所有资源重载请求
        void HandleReloadAllResources(const json& message);

        // 处理AssetIDs.h头文件消息
        void HandleAssetIDsHeader(const json& message);

        // 处理心跳消息
        void HandleHeartbeat(const json& message);

    private:
        int m_socket;
        std::string m_address;
        uint16_t m_port;
        std::atomic<bool> m_connected;
        std::thread m_thread;
    };

private:
    // 网络初始化
    bool InitializeNetwork();

    // 网络清理
    void CleanupNetwork();

    // 服务器主循环
    void ServerLoop();

    // 接受客户端连接
    void AcceptConnections();

    // 移除客户端连接
    void RemoveClient(ClientConnection* client);

private:
    uint16_t m_port;
    int m_serverSocket;
    std::atomic<bool> m_running;
    std::thread m_serverThread;
    std::vector<std::unique_ptr<ClientConnection>> m_clients;
    std::mutex m_clientsMutex;
    std::condition_variable m_stopCondition;
    
    // 资源管理器引用
    ResourceManager& m_resourceManager;
};

// 客户端连接实现
ResourceSyncServer::ClientConnection::ClientConnection(int socket, const std::string& address, uint16_t port)
    : m_socket(socket)
    , m_address(address)
    , m_port(port)
    , m_connected(true)
    , m_thread(&ClientConnection::Process, this) {
}

ResourceSyncServer::ClientConnection::~ClientConnection() {
    m_connected = false;
    if (m_thread.joinable()) {
        m_thread.join();
    }
    
    #ifdef _WIN32
    closesocket(m_socket);
    #else
    close(m_socket);
    #endif
}

void ResourceSyncServer::ClientConnection::Process() {
    std::cout << "客户端连接: " << m_address << ":" << m_port << std::endl;
    
    while (m_connected) {
        // 接收消息
        auto message = ReceiveMessage();
        if (!message) {
            break;
        }
        
        // 处理消息
        HandleMessage(*message);
    }
    
    std::cout << "客户端断开连接: " << m_address << ":" << m_port << std::endl;
    m_connected = false;
}

std::optional<json> ResourceSyncServer::ClientConnection::ReceiveMessage() {
    // 简单的消息接收实现，使用换行符作为消息分隔符
    std::string buffer;
    char recvBuffer[4096];
    
    while (m_connected) {
        // 设置超时
        #ifdef _WIN32
        fd_set readfds;
        FD_ZERO(&readfds);
        FD_SET(m_socket, &readfds);
        
        struct timeval timeout;
        timeout.tv_sec = 1;
        timeout.tv_usec = 0;
        
        int result = select(m_socket + 1, &readfds, NULL, NULL, &timeout);
        if (result == 0) {
            continue; // 超时
        } else if (result < 0) {
            break; // 错误
        }
        #endif
        
        // 接收数据
        int bytesRead = 0;
        #ifdef _WIN32
        bytesRead = recv(m_socket, recvBuffer, sizeof(recvBuffer) - 1, 0);
        #else
        bytesRead = read(m_socket, recvBuffer, sizeof(recvBuffer) - 1);
        #endif
        
        if (bytesRead <= 0) {
            break; // 连接关闭或错误
        }
        
        recvBuffer[bytesRead] = '\0';
        buffer += recvBuffer;
        
        // 检查是否有完整的消息
        size_t newlinePos = buffer.find('\n');
        if (newlinePos != std::string::npos) {
            std::string messageStr = buffer.substr(0, newlinePos);
            buffer = buffer.substr(newlinePos + 1);
            
            try {
                // 解析JSON
                json message = json::parse(messageStr);
                return message;
            } catch (const json::parse_error& e) {
                std::cerr << "解析JSON消息失败: " << e.what() << std::endl;
                std::cerr << "消息内容: " << messageStr << std::endl;
            }
        }
    }
    
    return std::nullopt;
}

bool ResourceSyncServer::ClientConnection::SendMessage(const json& message) {
    try {
        // 序列化JSON
        std::string messageStr = message.dump() + '\n';
        
        // 发送消息
        #ifdef _WIN32
        int bytesSent = send(m_socket, messageStr.c_str(), messageStr.size(), 0);
        #else
        int bytesSent = write(m_socket, messageStr.c_str(), messageStr.size());
        #endif
        
        return bytesSent == static_cast<int>(messageStr.size());
    } catch (const std::exception& e) {
        std::cerr << "发送消息失败: " << e.what() << std::endl;
        return false;
    }
}

void ResourceSyncServer::ClientConnection::HandleMessage(const json& message) {
    try {
        // 检查消息类型
        if (!message.contains("type")) {
            std::cerr << "消息缺少类型字段" << std::endl;
            return;
        }
        
        std::string type = message["type"];
        
        if (type == "resource_updated") {
            HandleResourceUpdated(message);
        } else if (type == "reload_resource") {
            HandleReloadResource(message);
        } else if (type == "reload_all_resources") {
            HandleReloadAllResources(message);
        } else if (type == "asset_ids_header") {
            HandleAssetIDsHeader(message);
        } else if (type == "heartbeat") {
            HandleHeartbeat(message);
        } else {
            std::cerr << "未知消息类型: " << type << std::endl;
        }
    } catch (const std::exception& e) {
        std::cerr << "处理消息失败: " << e.what() << std::endl;
    }
}

void ResourceSyncServer::ClientConnection::HandleResourceUpdated(const json& message) {
    std::cout << "收到资源更新通知" << std::endl;
    
    // 提取消息内容
    std::string resourcePath = message.value("resource_path", "");
    std::string resourceType = message.value("resource_type", "");
    uint32_t assetId = message.value("asset_id", 0u);
    
    std::cout << "  资源路径: " << resourcePath << std::endl;
    std::cout << "  资源类型: " << resourceType << std::endl;
    std::cout << "  资源ID: " << assetId << std::endl;
    
    // TODO: 实现资源更新逻辑
    // 1. 检查资源文件是否存在
    // 2. 更新资源包中的资源
    // 3. 通知资源管理器资源已更新
}

void ResourceSyncServer::ClientConnection::HandleReloadResource(const json& message) {
    std::cout << "收到资源重载请求" << std::endl;
    
    // 提取资源ID
    uint32_t assetId = message.value("asset_id", 0u);
    std::cout << "  资源ID: " << assetId << std::endl;
    
    // 调用资源管理器重载资源
    bool success = ResourceManager::GetInstance().ReloadResource(assetId);
    
    // 发送响应
    json response = {
        {"type", "reload_resource_response"},
        {"asset_id", assetId},
        {"success", success}
    };
    SendMessage(response);
    
    std::cout << "  重载结果: " << (success ? "成功" : "失败") << std::endl;
}

void ResourceSyncServer::ClientConnection::HandleReloadAllResources(const json& message) {
    std::cout << "收到所有资源重载请求" << std::endl;
    
    // TODO: 实现所有资源重载逻辑
    // 1. 遍历所有已加载资源
    // 2. 逐个重载资源
    
    // 发送响应
    json response = {
        {"type", "reload_all_resources_response"},
        {"success", true}
    };
    SendMessage(response);
    
    std::cout << "  重载所有资源请求已处理" << std::endl;
}

void ResourceSyncServer::ClientConnection::HandleAssetIDsHeader(const json& message) {
    std::cout << "收到AssetIDs.h头文件" << std::endl;
    
    // 提取头文件内容和路径
    std::string headerContent = message.value("header_content", "");
    std::string headerPath = message.value("header_path", "AssetIDs.h");
    
    std::cout << "  头文件路径: " << headerPath << std::endl;
    
    // 写入头文件
    try {
        std::ofstream outFile(headerPath, std::ios::trunc);
        if (outFile.is_open()) {
            outFile << headerContent;
            outFile.close();
            std::cout << "  AssetIDs.h头文件已保存" << std::endl;
            
            // 发送响应
            json response = {
                {"type", "asset_ids_header_response"},
                {"success", true},
                {"header_path", headerPath}
            };
            SendMessage(response);
        } else {
            std::cerr << "无法打开文件: " << headerPath << std::endl;
            
            // 发送响应
            json response = {
                {"type", "asset_ids_header_response"},
                {"success", false},
                {"error", "无法打开文件"}
            };
            SendMessage(response);
        }
    } catch (const std::exception& e) {
        std::cerr << "写入AssetIDs.h头文件失败: " << e.what() << std::endl;
        
        // 发送响应
        json response = {
            {"type", "asset_ids_header_response"},
            {"success", false},
            {"error", e.what()}
        };
        SendMessage(response);
    }
}

void ResourceSyncServer::ClientConnection::HandleHeartbeat(const json& message) {
    // 心跳消息无需特殊处理，仅用于保持连接活跃
    double timestamp = message.value("timestamp", 0.0);
    // std::cout << "收到心跳消息，时间戳: " << timestamp << std::endl;
}

const std::string& ResourceSyncServer::ClientConnection::GetAddress() const {
    return m_address;
}

uint16_t ResourceSyncServer::ClientConnection::GetPort() const {
    return m_port;
}

bool ResourceSyncServer::ClientConnection::IsConnected() const {
    return m_connected;
}

// 资源同步服务器实现
ResourceSyncServer::ResourceSyncServer(uint16_t port)
    : m_port(port)
    , m_serverSocket(-1)
    , m_running(false)
    , m_resourceManager(ResourceManager::GetInstance()) {
}

ResourceSyncServer::~ResourceSyncServer() {
    Stop();
    Join();
    CleanupNetwork();
}

bool ResourceSyncServer::Start() {
    // 初始化网络
    if (!InitializeNetwork()) {
        return false;
    }
    
    // 创建服务器套接字
    #ifdef _WIN32
    m_serverSocket = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    #else
    m_serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    #endif
    
    if (m_serverSocket < 0) {
        std::cerr << "创建服务器套接字失败" << std::endl;
        CleanupNetwork();
        return false;
    }
    
    // 设置套接字选项
    int reuseAddr = 1;
    #ifdef _WIN32
    setsockopt(m_serverSocket, SOL_SOCKET, SO_REUSEADDR, (const char*)&reuseAddr, sizeof(reuseAddr));
    #else
    setsockopt(m_serverSocket, SOL_SOCKET, SO_REUSEADDR, &reuseAddr, sizeof(reuseAddr));
    #endif
    
    // 绑定套接字
    sockaddr_in serverAddr;
    memset(&serverAddr, 0, sizeof(serverAddr));
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_addr.s_addr = INADDR_ANY;
    serverAddr.sin_port = htons(m_port);
    
    if (bind(m_serverSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) < 0) {
        std::cerr << "绑定服务器套接字失败" << std::endl;
        #ifdef _WIN32
        closesocket(m_serverSocket);
        #else
        close(m_serverSocket);
        #endif
        m_serverSocket = -1;
        CleanupNetwork();
        return false;
    }
    
    // 监听连接
    if (listen(m_serverSocket, SOMAXCONN) < 0) {
        std::cerr << "监听连接失败" << std::endl;
        #ifdef _WIN32
        closesocket(m_serverSocket);
        #else
        close(m_serverSocket);
        #endif
        m_serverSocket = -1;
        CleanupNetwork();
        return false;
    }
    
    // 启动服务器线程
    m_running = true;
    m_serverThread = std::thread(&ResourceSyncServer::ServerLoop, this);
    
    std::cout << "资源同步服务器已启动，监听端口: " << m_port << std::endl;
    return true;
}

void ResourceSyncServer::Stop() {
    m_running = false;
    
    // 唤醒服务器线程
    m_stopCondition.notify_all();
    
    // 关闭服务器套接字
    if (m_serverSocket >= 0) {
        #ifdef _WIN32
        closesocket(m_serverSocket);
        #else
        close(m_serverSocket);
        #endif
        m_serverSocket = -1;
    }
    
    // 关闭所有客户端连接
    std::lock_guard<std::mutex> lock(m_clientsMutex);
    for (auto& client : m_clients) {
        client->~ClientConnection();
    }
    m_clients.clear();
}

void ResourceSyncServer::Join() {
    if (m_serverThread.joinable()) {
        m_serverThread.join();
    }
}

bool ResourceSyncServer::IsRunning() const {
    return m_running;
}

bool ResourceSyncServer::InitializeNetwork() {
    #ifdef _WIN32
    WSADATA wsaData;
    int result = WSAStartup(MAKEWORD(2, 2), &wsaData);
    if (result != 0) {
        std::cerr << "WSAStartup失败，错误码: " << result << std::endl;
        return false;
    }
    #endif
    return true;
}

void ResourceSyncServer::CleanupNetwork() {
    #ifdef _WIN32
    WSACleanup();
    #endif
}

void ResourceSyncServer::ServerLoop() {
    std::cout << "服务器主循环启动" << std::endl;
    
    // 创建接受连接线程
    std::thread acceptThread(&ResourceSyncServer::AcceptConnections, this);
    
    // 等待停止信号
    std::unique_lock<std::mutex> lock(m_clientsMutex);
    m_stopCondition.wait(lock, [this]() { return !m_running; });
    
    // 停止接受连接线程
    acceptThread.join();
    
    std::cout << "服务器主循环结束" << std::endl;
}

void ResourceSyncServer::AcceptConnections() {
    std::cout << "开始接受客户端连接" << std::endl;
    
    while (m_running) {
        // 接受客户端连接
        sockaddr_in clientAddr;
        socklen_t clientAddrLen = sizeof(clientAddr);
        
        #ifdef _WIN32
        int clientSocket = accept(m_serverSocket, (sockaddr*)&clientAddr, &clientAddrLen);
        #else
        int clientSocket = accept(m_serverSocket, (sockaddr*)&clientAddr, &clientAddrLen);
        #endif
        
        if (clientSocket < 0) {
            if (m_running) {
                std::cerr << "接受客户端连接失败" << std::endl;
            }
            continue;
        }
        
        // 获取客户端地址和端口
        char clientIp[INET_ADDRSTRLEN];
        #ifdef _WIN32
        inet_ntop(AF_INET, &(clientAddr.sin_addr), clientIp, INET_ADDRSTRLEN);
        #else
        inet_ntop(AF_INET, &(clientAddr.sin_addr), clientIp, INET_ADDRSTRLEN);
        #endif
        std::string clientAddress(clientIp);
        uint16_t clientPort = ntohs(clientAddr.sin_port);
        
        std::cout << "新客户端连接: " << clientAddress << ":" << clientPort << std::endl;
        
        // 创建客户端连接对象
        auto client = std::make_unique<ClientConnection>(clientSocket, clientAddress, clientPort);
        
        // 添加到客户端列表
        {   
            std::lock_guard<std::mutex> lock(m_clientsMutex);
            m_clients.push_back(std::move(client));
        }
        
        // 清理断开连接的客户端
        {   
            std::lock_guard<std::mutex> lock(m_clientsMutex);
            m_clients.erase(
                std::remove_if(m_clients.begin(), m_clients.end(),
                    [](const std::unique_ptr<ClientConnection>& client) {
                        return !client->IsConnected();
                    }),
                m_clients.end()
            );
        }
    }
    
    std::cout << "停止接受客户端连接" << std::endl;
}

void ResourceSyncServer::RemoveClient(ClientConnection* client) {
    std::lock_guard<std::mutex> lock(m_clientsMutex);
    auto it = std::find_if(m_clients.begin(), m_clients.end(),
        [client](const std::unique_ptr<ClientConnection>& c) {
            return c.get() == client;
        });
    
    if (it != m_clients.end()) {
        m_clients.erase(it);
    }
}

} // namespace AmberPipeline

// 示例用法
int main() {
    std::cout << "AmberPipeline AI - 资源同步服务器" << std::endl;
    std::cout << "版本: 1.0.0" << std::endl;
    std::cout << "======================================" << std::endl;
    
    // 初始化资源管理器
    if (!AmberPipeline::ResourceManager::GetInstance().Initialize(".")) {
        std::cerr << "初始化资源管理器失败" << std::endl;
        return 1;
    }
    
    // 创建并启动服务器
    AmberPipeline::ResourceSyncServer server(8888);
    if (!server.Start()) {
        std::cerr << "启动服务器失败" << std::endl;
        return 1;
    }
    
    std::cout << "服务器已启动，按Enter键停止..." << std::endl;
    
    // 等待用户输入
    std::string input;
    std::getline(std::cin, input);
    
    // 停止服务器
    std::cout << "停止服务器..." << std::endl;
    server.Stop();
    server.Join();
    
    std::cout << "服务器已停止" << std::endl;
    
    // 关闭资源管理器
    AmberPipeline::ResourceManager::GetInstance().Shutdown();
    
    return 0;
}
