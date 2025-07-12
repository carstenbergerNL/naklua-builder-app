import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface ColumnWidgetProps {
  id: string;
  config?: {
    style?: React.CSSProperties;
    className?: string;
    [key: string]: any;
  };
  children?: React.ReactNode;
}

export default function ColumnWidget({ id, config = {}, children }: ColumnWidgetProps) {
  const { style = {}, className = '', ...rest } = config;
  const { setNodeRef, isOver } = useDroppable({ id, data: { isLayout: true } });
  return (
    <div
      ref={setNodeRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        background: isOver ? '#e0f7fa' : undefined,
        outline: isOver ? '2px solid #2196f3' : undefined,
        borderRadius: 0,
        transition: 'background 0.2s, outline 0.2s',
        ...style,
      }}
      className={className}
      {...rest}
    >
      {children}
    </div>
  );
} 