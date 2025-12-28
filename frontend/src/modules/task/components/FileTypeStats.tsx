import React from 'react';
import type { FileTypeStats } from '../utils/utils';

interface FileTypeStatsProps {
  // 文件类型统计数据
  stats: FileTypeStats;
}

/**
 * 文件类型统计组件
 * 显示核心类别的文件统计信息（角色、界面、场景、道具）
 */
const FileTypeStats: React.FC<FileTypeStatsProps> = ({ stats }) => {
  return (
    <div className="file-type-stats mt-4 pt-3 border-t border-[#333333]">
      <div className="text-gray-400 mb-2">核心类别统计:</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex justify-between">
          <span className="text-white">角色(CHR):</span>
          <span className="text-white">{stats.chr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white">界面(UI):</span>
          <span className="text-white">{stats.ui}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white">场景(ENV):</span>
          <span className="text-white">{stats.env}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white">道具(PRP):</span>
          <span className="text-white">{stats.prp}</span>
        </div>
      </div>

      <style>{`
        .file-type-stats {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default FileTypeStats;