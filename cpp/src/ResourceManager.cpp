// AmberPipeline AI - 资源管理器实现

#include "ResourceManager.h"
#include <fstream>
#include <algorithm>
#include <cstring>
#include <chrono>
#include <iostream>

namespace AmberPipeline {

// 单例实例
static ResourceManager* s_instance = nullptr;

ResourceManager::ResourceManager()
    : m_initialized(false)
    , m_totalMemoryUsage(0) {
    // 初始化单例实例
    if (s_instance == nullptr) {
        s_instance = this;
    }
}

ResourceManager::~ResourceManager() {
    // 关闭资源管理器
    Shutdown();
    
    // 清理单例实例
    if (s_instance == this) {
        s_instance = nullptr;
    }
}

ResourceManager& ResourceManager::GetInstance() {
    // 懒汉式单例，首次调用时创建实例
    static ResourceManager instance;
    return instance;
}

bool ResourceManager::Initialize(const std::string& resourceRootPath) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    if (m_initialized) {
        return true;
    }
    
    // 设置资源根目录
    m_resourceRootPath = resourceRootPath;
    
    // 验证资源根目录是否存在
    std::ifstream testDir(m_resourceRootPath);
    if (!testDir.good()) {
        std::cerr << "资源根目录不存在: " << m_resourceRootPath << std::endl;
        return false;
    }
    
    m_initialized = true;
    std::cout << "资源管理器初始化成功，资源根目录: " << m_resourceRootPath << std::endl;
    return true;
}

void ResourceManager::Shutdown() {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    if (!m_initialized) {
        return;
    }
    
    // 卸载所有资源
    UnloadAllResources();
    UnloadAllResourcePackages();
    
    // 清空所有映射和回调
    m_nameToIdMap.clear();
    m_resources.clear();
    m_packageToResourcesMap.clear();
    m_hotReloadCallbacks.clear();
    
    m_totalMemoryUsage = 0;
    m_initialized = false;
    
    std::cout << "资源管理器已关闭" << std::endl;
}

bool ResourceManager::LoadResourcePackage(const std::string& packagePath) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    if (!m_initialized) {
        std::cerr << "资源管理器未初始化" << std::endl;
        return false;
    }
    
    // 打开资源包文件
    std::ifstream packageFile(packagePath, std::ios::binary);
    if (!packageFile.is_open()) {
        std::cerr << "无法打开资源包: " << packagePath << std::endl;
        return false;
    }
    
    // 读取包头部
    ResourcePackageHeader header;
    packageFile.read(reinterpret_cast<char*>(&header), sizeof(ResourcePackageHeader));
    
    // 验证包标识
    if (std::memcmp(header.magic, "AMBPKG01", 8) != 0) {
        std::cerr << "无效的资源包格式: " << packagePath << std::endl;
        packageFile.close();
        return false;
    }
    
    std::cout << "加载资源包: " << packagePath << "，版本: " << header.version 
              << "，资源数量: " << header.resourceCount << std::endl;
    
    // 读取资源元数据
    std::vector<ResourceMetadata> metadataList(header.resourceCount);
    packageFile.read(reinterpret_cast<char*>(metadataList.data()), sizeof(ResourceMetadata) * header.resourceCount);
    
    // 处理每个资源
    std::vector<AssetID> loadedResources;
    for (const auto& metadata : metadataList) {
        // 生成资源ID
        std::string resourceName(metadata.name);
        AssetID id = GenerateAssetID(resourceName);
        
        // 检查资源是否已存在
        if (m_resources.find(id) != m_resources.end()) {
            std::cout << "资源已存在，跳过: " << resourceName << std::endl;
            continue;
        }
        
        // 创建资源项
        ResourceItem item;
        item.data.metadata = metadata;
        item.data.data = nullptr;
        item.data.dataSize = 0;
        item.status = ResourceLoadStatus::UNLOADED;
        item.referenceCount = 0;
        item.callbacks.clear();
        item.dependencies.clear();
        
        // 添加到资源映射
        m_resources[id] = std::move(item);
        m_nameToIdMap[resourceName] = id;
        loadedResources.push_back(id);
        
        std::cout << "添加资源到映射: " << resourceName << " -> ID: " << id << std::endl;
    }
    
    // 记录包到资源的映射
    m_packageToResourcesMap[packagePath] = std::move(loadedResources);
    
    packageFile.close();
    return true;
}

bool ResourceManager::UnloadResourcePackage(const std::string& packagePath) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    // 查找包对应的资源
    auto packageIt = m_packageToResourcesMap.find(packagePath);
    if (packageIt == m_packageToResourcesMap.end()) {
        return false;
    }
    
    // 卸载包中的所有资源
    for (AssetID id : packageIt->second) {
        // 查找资源
        auto resourceIt = m_resources.find(id);
        if (resourceIt != m_resources.end()) {
            // 如果资源有引用，只标记为未加载，不删除
            if (resourceIt->second.referenceCount > 0) {
                resourceIt->second.status = ResourceLoadStatus::UNLOADED;
                if (resourceIt->second.data.data != nullptr) {
                    delete[] static_cast<uint8_t*>(resourceIt->second.data.data);
                    resourceIt->second.data.data = nullptr;
                    m_totalMemoryUsage -= resourceIt->second.data.dataSize;
                }
            } else {
                // 没有引用，删除资源
                if (resourceIt->second.data.data != nullptr) {
                    delete[] static_cast<uint8_t*>(resourceIt->second.data.data);
                    m_totalMemoryUsage -= resourceIt->second.data.dataSize;
                }
                // 从名称映射中删除
                std::string resourceName = GetResourceName(id);
                auto nameIt = m_nameToIdMap.find(resourceName);
                if (nameIt != m_nameToIdMap.end()) {
                    m_nameToIdMap.erase(nameIt);
                }
                // 从资源映射中删除
                m_resources.erase(resourceIt);
            }
        }
    }
    
    // 从包映射中删除
    m_packageToResourcesMap.erase(packageIt);
    return true;
}

void ResourceManager::UnloadAllResourcePackages() {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    // 遍历所有包并卸载
    for (const auto& package : m_packageToResourcesMap) {
        UnloadResourcePackage(package.first);
    }
}

AssetID ResourceManager::LoadResource(const std::string& resourceName, ResourceType type) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    // 查找资源ID
    auto nameIt = m_nameToIdMap.find(resourceName);
    if (nameIt == m_nameToIdMap.end()) {
        std::cerr << "资源不存在: " << resourceName << std::endl;
        return 0;
    }
    
    AssetID id = nameIt->second;
    auto resourceIt = m_resources.find(id);
    if (resourceIt == m_resources.end()) {
        return 0;
    }
    
    // 检查资源类型是否匹配
    if (resourceIt->second.data.metadata.type != type) {
        std::cerr << "资源类型不匹配: " << resourceName << std::endl;
        return 0;
    }
    
    // 如果资源已加载，增加引用计数并返回
    if (resourceIt->second.status == ResourceLoadStatus::LOADED) {
        AddResourceRef(id);
        return id;
    }
    
    // 从包中加载资源数据
    if (!LoadResourceFromPackage(resourceIt->second, "")) {
        return 0;
    }
    
    // 资源加载成功，设置状态并增加引用计数
    resourceIt->second.status = ResourceLoadStatus::LOADED;
    AddResourceRef(id);
    
    return id;
}

AssetID ResourceManager::LoadResourceAsync(const std::string& resourceName, ResourceType type, ResourceLoadCallback callback) {
    // 异步加载的简化实现，实际项目中应该使用线程池
    AssetID id = LoadResource(resourceName, type);
    
    if (callback) {
        ResourceLoadStatus status = (id != 0) ? ResourceLoadStatus::LOADED : ResourceLoadStatus::FAILED;
        callback(id, status);
    }
    
    return id;
}

const ResourceData* ResourceManager::GetResource(AssetID id) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    auto it = m_resources.find(id);
    if (it != m_resources.end() && it->second.status == ResourceLoadStatus::LOADED) {
        return &it->second.data;
    }
    
    return nullptr;
}

bool ResourceManager::IsResourceLoaded(AssetID id) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    auto it = m_resources.find(id);
    return (it != m_resources.end() && it->second.status == ResourceLoadStatus::LOADED);
}

void ResourceManager::AddResourceRef(AssetID id) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    auto it = m_resources.find(id);
    if (it != m_resources.end()) {
        it->second.referenceCount++;
    }
}

void ResourceManager::ReleaseResource(AssetID id) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    auto it = m_resources.find(id);
    if (it != m_resources.end()) {
        if (it->second.referenceCount > 0) {
            it->second.referenceCount--;
            
            // 如果引用计数为0且资源已加载，卸载资源
            if (it->second.referenceCount == 0 && it->second.status == ResourceLoadStatus::LOADED) {
                if (it->second.data.data != nullptr) {
                    delete[] static_cast<uint8_t*>(it->second.data.data);
                    it->second.data.data = nullptr;
                    m_totalMemoryUsage -= it->second.data.dataSize;
                }
                it->second.status = ResourceLoadStatus::UNLOADED;
            }
        }
    }
}

bool ResourceManager::ReloadResource(AssetID id) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    auto it = m_resources.find(id);
    if (it == m_resources.end()) {
        return false;
    }
    
    // 保存当前引用计数
    uint32_t refCount = it->second.referenceCount;
    
    // 卸载资源
    if (it->second.data.data != nullptr) {
        delete[] static_cast<uint8_t*>(it->second.data.data);
        it->second.data.data = nullptr;
        m_totalMemoryUsage -= it->second.data.dataSize;
    }
    it->second.status = ResourceLoadStatus::UNLOADED;
    
    // 重新加载资源
    if (!LoadResourceFromPackage(it->second, "")) {
        return false;
    }
    
    // 恢复引用计数和状态
    it->second.status = ResourceLoadStatus::LOADED;
    it->second.referenceCount = refCount;
    
    // 通知热重载
    NotifyHotReload(id);
    
    return true;
}

void ResourceManager::RegisterHotReloadCallback(std::function<void(AssetID)> callback) {
    std::lock_guard<std::mutex> lock(m_mutex);
    m_hotReloadCallbacks.push_back(callback);
}

bool ResourceManager::GetResourceInfo(AssetID id, ResourceMetadata& outMetadata) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    auto it = m_resources.find(id);
    if (it != m_resources.end()) {
        outMetadata = it->second.data.metadata;
        return true;
    }
    
    return false;
}

std::string ResourceManager::GetResourceName(AssetID id) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    auto it = m_resources.find(id);
    if (it != m_resources.end()) {
        return std::string(it->second.data.metadata.name);
    }
    
    return "";
}

ResourceType ResourceManager::GetResourceType(AssetID id) const {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    auto it = m_resources.find(id);
    if (it != m_resources.end()) {
        return it->second.data.metadata.type;
    }
    
    return ResourceType::UNKNOWN;
}

size_t ResourceManager::GetLoadedResourceCount() const {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    size_t count = 0;
    for (const auto& pair : m_resources) {
        if (pair.second.status == ResourceLoadStatus::LOADED) {
            count++;
        }
    }
    
    return count;
}

size_t ResourceManager::GetTotalMemoryUsage() const {
    std::lock_guard<std::mutex> lock(m_mutex);
    return m_totalMemoryUsage;
}

void ResourceManager::UnloadUnusedResources() {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    for (auto it = m_resources.begin(); it != m_resources.end();) {
        if (it->second.referenceCount == 0 && it->second.status == ResourceLoadStatus::LOADED) {
            // 卸载资源
            if (it->second.data.data != nullptr) {
                delete[] static_cast<uint8_t*>(it->second.data.data);
                it->second.data.data = nullptr;
                m_totalMemoryUsage -= it->second.data.dataSize;
            }
            it->second.status = ResourceLoadStatus::UNLOADED;
            ++it;
        } else {
            ++it;
        }
    }
}

void ResourceManager::UnloadAllResources() {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    for (auto& pair : m_resources) {
        if (pair.second.data.data != nullptr) {
            delete[] static_cast<uint8_t*>(pair.second.data.data);
            pair.second.data.data = nullptr;
            pair.second.status = ResourceLoadStatus::UNLOADED;
        }
    }
    
    m_totalMemoryUsage = 0;
}

AssetID ResourceManager::GenerateAssetID(const std::string& resourceName) const {
    // 使用FNV-1a哈希算法生成资源ID
    const uint32_t FNV_PRIME = 16777619U;
    const uint32_t FNV_OFFSET = 2166136261U;
    
    uint32_t hash = FNV_OFFSET;
    for (char c : resourceName) {
        hash ^= static_cast<uint32_t>(c);
        hash *= FNV_PRIME;
    }
    
    return hash;
}

bool ResourceManager::LoadResourceFromPackage(ResourceItem& item, const std::string& packagePath) {
    // 查找资源所属的包
    std::string actualPackagePath;
    for (const auto& package : m_packageToResourcesMap) {
        auto it = std::find(package.second.begin(), package.second.end(), item.data.metadata.id);
        if (it != package.second.end()) {
            actualPackagePath = package.first;
            break;
        }
    }
    
    if (actualPackagePath.empty()) {
        std::cerr << "找不到资源所属的包: " << item.data.metadata.name << std::endl;
        return false;
    }
    
    // 打开资源包
    std::ifstream packageFile(actualPackagePath, std::ios::binary);
    if (!packageFile.is_open()) {
        std::cerr << "无法打开资源包: " << actualPackagePath << std::endl;
        return false;
    }
    
    // 跳转到资源数据位置
    packageFile.seekg(item.data.metadata.offset, std::ios::beg);
    
    // 分配内存并读取资源数据
    uint8_t* data = new uint8_t[item.data.metadata.size];
    packageFile.read(reinterpret_cast<char*>(data), item.data.metadata.size);
    
    if (!packageFile.good()) {
        delete[] data;
        packageFile.close();
        std::cerr << "读取资源数据失败: " << item.data.metadata.name << std::endl;
        return false;
    }
    
    // 保存资源数据
    item.data.data = data;
    item.data.dataSize = item.data.metadata.size;
    m_totalMemoryUsage += item.data.dataSize;
    
    packageFile.close();
    return true;
}

void ResourceManager::ProcessLoadCallbacks(AssetID id, ResourceLoadStatus status) {
    std::lock_guard<std::mutex> lock(m_mutex);
    
    auto it = m_resources.find(id);
    if (it != m_resources.end()) {
        // 执行所有回调
        for (const auto& callback : it->second.callbacks) {
            if (callback) {
                callback(id, status);
            }
        }
        // 清空回调列表
        it->second.callbacks.clear();
    }
}

void ResourceManager::NotifyHotReload(AssetID id) {
    // 执行所有热重载回调
    for (const auto& callback : m_hotReloadCallbacks) {
        if (callback) {
            callback(id);
        }
    }
}

} // namespace AmberPipeline
