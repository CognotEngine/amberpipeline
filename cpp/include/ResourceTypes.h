// AmberPipeline AI - 资源类型定义
// 定义资源包的二进制格式和相关数据结构

#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace AmberPipeline {

// 资源类型枚举
enum class ResourceType : uint32_t {
    UNKNOWN = 0,
    TEXTURE_2D = 1,      // 2D纹理
    TEXTURE_CUBE = 2,    // 立方体贴图
    MODEL = 3,           // 3D模型
    MATERIAL = 4,        // 材质
    SHADER = 5,          // 着色器
    SOUND = 6,           // 音效
    ANIMATION = 7,       // 动画
    PARTICLE_SYSTEM = 8, // 粒子系统
    SCRIPT = 9,          // 脚本
};

// 资源包头部结构
struct ResourcePackageHeader {
    char magic[8];       // 包标识，固定为"AMBPKG01"
    uint32_t version;    // 包版本号
    uint32_t resourceCount; // 资源数量
    uint64_t totalSize;  // 包总大小（字节）
    uint64_t createTime; // 创建时间戳（Unix时间）
    uint32_t checksum;   // 校验和
    char reserved[16];   // 保留字段
};

// 资源元数据结构
struct ResourceMetadata {
    uint32_t id;         // 资源ID
    ResourceType type;   // 资源类型
    uint64_t offset;     // 资源在包中的偏移量
    uint64_t size;       // 资源大小（字节）
    char name[256];      // 资源名称（以null结尾）
    uint32_t flags;      // 资源标志位
    char hash[32];       // 资源哈希值（SHA-256）
    char reserved[16];   // 保留字段
};

// 纹理资源的额外信息
struct TextureInfo {
    uint32_t width;      // 宽度
    uint32_t height;     // 高度
    uint32_t mipLevels;  // mipmap层级
    uint32_t format;     // 纹理格式（D3DFORMAT或VK_FORMAT）
    uint32_t channels;   // 通道数
    uint32_t pitch;      // 行间距（字节）
};

// 模型资源的额外信息
struct ModelInfo {
    uint32_t vertexCount; // 顶点数量
    uint32_t indexCount;  // 索引数量
    uint32_t meshCount;   // 网格数量
    uint32_t materialCount; // 材质数量
};

// 资源数据结构
struct ResourceData {
    ResourceMetadata metadata; // 资源元数据
    void* data;                // 资源数据指针
    size_t dataSize;           // 资源数据大小
    
    // 资源类型特定的信息（union）
    union {
        TextureInfo textureInfo;
        ModelInfo modelInfo;
    } typeInfo;
};

// 资源ID类型（用于类型安全）
using AssetID = uint32_t;

// 资源加载状态
enum class ResourceLoadStatus {
    UNLOADED = 0,     // 未加载
    LOADING = 1,      // 正在加载
    LOADED = 2,       // 已加载
    FAILED = 3,       // 加载失败
    UNLOADING = 4,    // 正在卸载
};

} // namespace AmberPipeline
