import React from 'react';
import { Users } from 'lucide-react';

interface IconCommunityProps {
  size?: number;
  className?: string;
}

/**
 * 社区图标组件
 */
export const IconCommunity: React.FC<IconCommunityProps> = ({ 
  size = 20, 
  className 
}) => {
  return <Users size={size} className={className} />;
};