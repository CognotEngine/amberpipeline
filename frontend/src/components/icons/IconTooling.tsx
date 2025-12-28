import React from 'react';
import { Wrench } from 'lucide-react';

interface IconToolingProps {
  size?: number;
  className?: string;
}

/**
 * 工具图标组件
 */
export const IconTooling: React.FC<IconToolingProps> = ({ 
  size = 24, 
  className 
}) => {
  return <Wrench size={size} className={className} />;
};