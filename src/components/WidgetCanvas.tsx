import { WidgetInstance } from "../models/WidgetInstance";
import { Button } from "primereact/button";
import WidgetRenderer from "./WidgetRenderer";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import React, { useState } from "react";

interface Props {
  widgets: WidgetInstance[];
  selectedWidgetId: string | null;
  onSelectWidget: (id: string) => void;
  onDeleteWidget: (id: string) => void;
  onReorder: (widgets: WidgetInstance[]) => void;
  pageName: string;
  onAddWidget?: (type: string, parentId?: string | null, orderIndex?: number) => void;
  activeDragFromToolbox?: boolean;
}

function DropZone({ id, isActive }: { id: string; isActive: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { isDropZone: true } });
  return (
    <div
      ref={setNodeRef}
      style={{
        height: 8, // reduced from 18
        background: isOver || isActive ? '#b3e5fc' : 'transparent',
        transition: 'background 0.2s',
        margin: '2px 0',
        borderRadius: 4,
      }}
    />
  );
}

function SortableWidget({
  widget,
  selected,
  onSelect,
  onDelete,
  onConfigChange,
  children,
  editing,
  setEditing,
  clearEditing,
}: {
  widget: WidgetInstance;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onConfigChange: (key: string, value: any) => void;
  children?: React.ReactNode;
  editing: boolean;
  setEditing: () => void;
  clearEditing: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: widget.id,
      data: { fromToolbox: false },
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: selected ? "2px solid #2196f3" : "1px solid #e0e0e0",
    padding: "0.5rem",
    background: "#fff",
    position: "relative",
  };

  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div ref={setNodeRef} className="widget-item-container" style={style} onClick={onSelect}>
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          cursor: "grab",
          opacity: 0.5,
        }}
        onClick={(e) => e.stopPropagation()}
        title="Drag widget"
      >
        <GripVertical size={16} />
      </div>

      {/* Widget Content */}
      <div style={{ paddingLeft: "1.5rem" }}>
        {children}
      </div>

      {/* Mendix-style Delete Button */}
      <button
        className="widget-delete-btn"
        title="Delete widget"
        onClick={(e) => {
          e.stopPropagation();
          setShowConfirm(true);
        }}
      >
        <span className="pi pi-trash" />
      </button>

      {/* Confirmation Popup */}
      {showConfirm && (
        <div style={{
          position: "absolute",
          top: 40,
          right: 8,
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
          zIndex: 10,
          padding: "0.75rem 1rem",
          minWidth: 180,
        }}>
          <div style={{ marginBottom: 10 }}>Delete this widget?</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              style={{ padding: "0.3em 1em", borderRadius: 4, border: "none", background: "#e0e7ff", color: "#222", cursor: "pointer" }}
              onClick={e => { e.stopPropagation(); setShowConfirm(false); }}
            >No</button>
            <button
              style={{ padding: "0.3em 1em", borderRadius: 4, border: "none", background: "#f44336", color: "#fff", cursor: "pointer" }}
              onClick={e => { e.stopPropagation(); setShowConfirm(false); onDelete(); }}
            >Yes</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WidgetCanvas({
  widgets,
  selectedWidgetId,
  onSelectWidget,
  onDeleteWidget,
  onReorder,
  pageName,
  onAddWidget,
  activeDragFromToolbox = false,
}: Props) {
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);

  const handleWidgetConfigChange = (widgetId: string, key: string, value: any) => {
    onReorder(
      widgets.map(w =>
        w.id === widgetId ? { ...w, config: { ...w.config, [key]: value } } : w
      )
    );
  };

  // Render drop zones between widgets
  const renderWithDropZones = () => {
    const elements: React.ReactNode[] = [];
    for (let i = 0; i <= widgets.length; i++) {
      elements.push(
        <DropZone key={`dropzone-${i}`} id={`dropzone-${i}`} isActive={false} />
      );
      if (i < widgets.length) {
        elements.push(widgets[i].id);
      }
    }
    return elements;
  };

  // Make the canvas a droppable area
  const { setNodeRef: setCanvasRef, isOver: isOverCanvas } = useDroppable({
    id: 'canvas-root',
    data: { isCanvas: true }
  });

  return (
    <div
      ref={setCanvasRef}
      className="app-canvas"
      style={{
        outline: isOverCanvas ? '2px solid #2196f3' : undefined,
        transition: 'outline 0.2s',
        minHeight: 300,
        background: '#f9f9f9',
        position: 'relative',
      }}
    >
      {/* Info bar will be rendered in BuilderPage, not here */}
      {widgets.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#888",
            fontStyle: "italic",
            background: "#f9f9f9",
            borderRadius: "8px",
          }}
        >
          No widgets yet. Select a page and add widgets from the sidebar.
        </div>
      ) : (
        <SortableContext
          items={widgets.map((w) => w.id)}
          strategy={verticalListSortingStrategy}
        >
          {Array.from({ length: widgets.length + 1 }).map((_, i) => (
            <React.Fragment key={`dropzone-widget-${i}`}>
              {activeDragFromToolbox && <DropZone id={`dropzone-${i}`} isActive={false} />}
              {i < widgets.length && (
                <SortableWidget
                  key={widgets[i].id}
                  widget={widgets[i]}
                  selected={selectedWidgetId === widgets[i].id}
                  onSelect={() => onSelectWidget(widgets[i].id)}
                  onDelete={() => onDeleteWidget(widgets[i].id)}
                  onConfigChange={(key, value) => handleWidgetConfigChange(widgets[i].id, key, value)}
                  editing={editingWidgetId === widgets[i].id}
                  setEditing={() => setEditingWidgetId(widgets[i].id)}
                  clearEditing={() => setEditingWidgetId(null)}
                >
                  <WidgetRenderer
                    widget={widgets[i]}
                    onConfigChange={(key, value) => handleWidgetConfigChange(widgets[i].id, key, value)}
                    editing={editingWidgetId === widgets[i].id}
                    setEditing={() => setEditingWidgetId(widgets[i].id)}
                    clearEditing={() => setEditingWidgetId(null)}
                    renderChildren={() => null}
                  />
                </SortableWidget>
              )}
            </React.Fragment>
          ))}
        </SortableContext>
      )}
    </div>
  );
}
