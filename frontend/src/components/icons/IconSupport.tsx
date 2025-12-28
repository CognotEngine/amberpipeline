import React from 'react';
import { HelpCircle } from 'lucide-react';

interface IconSupportProps {
  size?: number;
  className?: string;
}

/**
 * 支持图标组件
 */
export const IconSupport: React.FC<IconSupportProps> = ({ 
  size = 20, 
  className 
}) => {
  return <HelpCircle size={size} className={className} />;
};