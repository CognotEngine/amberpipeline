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
    CompressionType compressionType; // 压缩类型
    uint64_t originalSize; // 原始数据大小（压缩前）
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

// 骨骼数据结构
struct BoneInfo {
    uint32_t boneId;              // 骨骼ID
    char name[128];               // 骨骼名称
    float localPosition[3];       // 局部位置
    float localRotation[4];       // 局部旋转（四元数）
    float localScale[3];          // 局部缩放
    uint32_t parentBoneId;        // 父骨骼ID，-1表示没有父骨骼
    float bindPoseMatrix[16];     // 绑定姿态矩阵
}; 

// 模型资源的额外信息
struct ModelInfo {
    uint32_t vertexCount; // 顶点数量
    uint32_t indexCount;  // 索引数量
    uint32_t meshCount;   // 网格数量
    uint32_t materialCount; // 材质数量
    uint32_t boneCount;   // 骨骼数量
    uint64_t boneDataOffset; // 骨骼数据在资源中的偏移量
};

// 压缩类型枚举
enum class CompressionType : uint32_t {
    NONE = 0,        // 不压缩
    DEFLATE = 1,     // Deflate压缩算法
    LZ4 = 2,         // LZ4压缩算法
    ZSTD = 3,        // Zstandard压缩算法
    BC7 = 4,         // BC7纹理压缩（仅用于纹理资源）
    ASTC = 5,        // ASTC纹理压缩（仅用于纹理资源）
};

// 资源数据结构
struct ResourceData {
    ResourceMetadata metadata; // 资源元数据
    void* data;                // 资源数据指针
    size_t dataSize;           // 资源数据大小
    CompressionType compressionType; // 压缩类型
    size_t originalSize;       // 原始数据大小（压缩前）
    
    // 资源类型特定的信息（union）
    union {
        TextureInfo textureInfo;
        ModelInfo modelInfo;
        BoneInfo boneInfo;     // 骨骼信息（当资源类型为MODEL时使用）
    } typeInfo;
};

// 资源ID类型（用于类型安全）
using AssetID = uint32_t;

// 资源加载请求结构体
struct ResourceLoadRequest {
    AssetID assetId;           // 要加载的资源ID
    bool streamingLoad;        // 是否使用流式加载
    void* userData;            // 用户自定义数据
    void(*callback)(const ResourceData* resource, ResourceLoadStatus status, void* userData); // 加载完成回调
};

// 资源加载状态
enum class ResourceLoadStatus {
    UNLOADED = 0,     // 未加载
    LOADING = 1,      // 正在加载
    LOADED = 2,       // 已加载
    FAILED = 3,       // 加载失败
    UNLOADING = 4,    // 正在卸载
};

} // namespace AmberPipeline
