import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface ContainerWidgetProps {
  id: string;
  config?: {
    style?: React.CSSProperties;
    className?: string;
    [key: string]: any;
  };
  children?: React.ReactNode;
}

export default function ContainerWidget({ id, config = {}, children }: ContainerWidgetProps) {
  const { style = {}, className = '', ...rest } = config;
  const { setNodeRef, isOver } = useDroppable({ id, data: { isLayout: true } });
  return (
    <div
      ref={setNodeRef}
      style={{
        padding: 16,
        background: isOver ? '#e0f7fa' : '#f9f9f9',
        borderRadius: 8,
        outline: isOver ? '2px solid #2196f3' : undefined,
        transition: 'background 0.2s, outline 0.2s',
        ...style
      }}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
} 