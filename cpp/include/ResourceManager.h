// AmberPipeline AI - 资源管理器
// 负责资源的加载、管理、释放和热重载

#pragma once

#include "ResourceTypes.h"
#include <unordered_map>
#include <memory>
#include <mutex>
#include <functional>
#include <string>

namespace AmberPipeline {

// 资源加载回调函数类型
typedef std::function<void(AssetID, ResourceLoadStatus)> ResourceLoadCallback;

// 资源管理类
class ResourceManager {
private:
    // 资源项结构
    struct ResourceItem {
        ResourceData data;                   // 资源数据
        ResourceLoadStatus status;           // 加载状态
        uint32_t referenceCount;             // 引用计数
        std::vector<ResourceLoadCallback> callbacks; // 加载回调
        std::vector<AssetID> dependencies;   // 依赖资源ID
    };

public:
    ResourceManager();
    ~ResourceManager();

    // 禁止复制和移动
    ResourceManager(const ResourceManager&) = delete;
    ResourceManager& operator=(const ResourceManager&) = delete;
    ResourceManager(ResourceManager&&) = delete;
    ResourceManager& operator=(ResourceManager&&) = delete;

    // 单例模式获取实例
    static ResourceManager& GetInstance();

    // 初始化和关闭
    bool Initialize(const std::string& resourceRootPath);
    void Shutdown();

    // 资源包管理
    bool LoadResourcePackage(const std::string& packagePath);
    bool UnloadResourcePackage(const std::string& packagePath);
    void UnloadAllResourcePackages();

    // 资源加载和获取
    AssetID LoadResource(const std::string& resourceName, ResourceType type);
    AssetID LoadResourceAsync(const std::string& resourceName, ResourceType type, ResourceLoadCallback callback = nullptr);
    const ResourceData* GetResource(AssetID id) const;
    template<typename T> const T* GetResourceAs(AssetID id) const;
    bool IsResourceLoaded(AssetID id) const;

    // 资源引用计数管理
    void AddResourceRef(AssetID id);
    void ReleaseResource(AssetID id);

    // 资源热重载
    bool ReloadResource(AssetID id);
    void RegisterHotReloadCallback(std::function<void(AssetID)> callback);

    // 资源信息查询
    bool GetResourceInfo(AssetID id, ResourceMetadata& outMetadata) const;
    std::string GetResourceName(AssetID id) const;
    ResourceType GetResourceType(AssetID id) const;
    size_t GetLoadedResourceCount() const;

    // 资源内存管理
    size_t GetTotalMemoryUsage() const;
    void UnloadUnusedResources();
    void UnloadAllResources();

private:
    // 私有成员函数
    AssetID GenerateAssetID(const std::string& resourceName) const;
    bool LoadResourceFromPackage(ResourceItem& item, const std::string& packagePath);
    void ProcessLoadCallbacks(AssetID id, ResourceLoadStatus status);
    void NotifyHotReload(AssetID id);
    bool DecompressResourceData(ResourceItem& item, const uint8_t* compressedData, size_t compressedSize);

private:
    // 私有成员变量
    std::string m_resourceRootPath;                    // 资源根目录
    std::unordered_map<std::string, AssetID> m_nameToIdMap; // 资源名称到ID的映射
    std::unordered_map<AssetID, ResourceItem> m_resources;   // 资源ID到资源项的映射
    std::unordered_map<std::string, std::vector<AssetID>> m_packageToResourcesMap; // 包到资源的映射
    std::vector<std::function<void(AssetID)>> m_hotReloadCallbacks; // 热重载回调
    mutable std::mutex m_mutex;                        // 互斥锁，用于线程安全
    bool m_initialized;                                // 初始化标志
    size_t m_totalMemoryUsage;                         // 总内存使用量
};

// 模板函数实现
template<typename T>
const T* ResourceManager::GetResourceAs(AssetID id) const {
    const ResourceData* data = GetResource(id);
    if (data) {
        return static_cast<const T*>(data->data);
    }
    return nullptr;
}

} // namespace AmberPipeline

// 资源管理宏定义，方便使用
#define g_ResourceManager AmberPipeline::ResourceManager::GetInstance()
