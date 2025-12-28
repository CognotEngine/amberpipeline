import React from 'react';
import { Globe } from 'lucide-react';

interface IconEcosystemProps {
  size?: number;
  className?: string;
}

/**
 * 生态系统图标组件
 */
export const IconEcosystem: React.FC<IconEcosystemProps> = ({ 
  size = 20, 
  className 
}) => {
  return <Globe size={size} className={className} />;
};