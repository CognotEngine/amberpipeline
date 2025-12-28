import React from 'react';
import { BookOpen } from 'lucide-react';

interface IconDocumentationProps {
  size?: number;
  className?: string;
}

/**
 * 文档图标组件
 */
export const IconDocumentation: React.FC<IconDocumentationProps> = ({ 
  size = 20, 
  className 
}) => {
  return <BookOpen size={size} className={className} />;
};