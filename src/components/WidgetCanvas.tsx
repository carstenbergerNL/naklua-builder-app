import { WidgetInstance } from "../models/WidgetInstance";
import { Button } from "primereact/button";
import WidgetRenderer from "./WidgetRenderer";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface Props {
  widgets: WidgetInstance[];
  selectedWidgetId: string | null;
  onSelectWidget: (id: string) => void;
  onDeleteWidget: (id: string) => void;
  onReorder: (widgets: WidgetInstance[]) => void;
}

function SortableWidget({
  widget,
  selected,
  onSelect,
  onDelete,
}: {
  widget: WidgetInstance;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: widget.id,
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    border: selected ? "2px solid #2196f3" : "1px solid #e0e0e0",
    padding: "0.5rem",
    background: "#fff",
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} onClick={onSelect}>
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
        <WidgetRenderer widget={widget} />
      </div>

      {/* Delete Button */}
      <i
        className="pi pi-trash"
        style={{
          position: "absolute",
          top: 12,
          right: 8,
          color: "#f44336", // red color
          fontSize: "1rem",
          cursor: "pointer",
        }}
        title="Delete widget"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      />
    </div>
  );
}

export default function WidgetCanvas({
  widgets,
  selectedWidgetId,
  onSelectWidget,
  onDeleteWidget,
  onReorder, // ✅ Receive prop
}: Props) {
  return (
    <div
      style={{
        flex: 1,
        padding: "2rem",
        overflowY: "auto",
        background: "#f4f6f8",
      }}
    >
      {widgets.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#888",
            fontStyle: "italic",
            background: "#f9f9f9",
            borderRadius: "8px",
            border: "1px dashed #ccc",
          }}
        >
          No widgets yet. Select a page and add widgets from the sidebar.
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = widgets.findIndex((w) => w.id === active.id);
            const newIndex = widgets.findIndex((w) => w.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
              const updated = arrayMove(widgets, oldIndex, newIndex).map(
                (w, i) => ({ ...w, orderIndex: i })
              );
              onReorder(updated); // ✅ update parent state
            }
          }}
        >
          <SortableContext
            items={widgets.map((w) => w.id)}
            strategy={verticalListSortingStrategy}
          >
            {widgets.map((widget) => (
              <SortableWidget
                key={widget.id}
                widget={widget}
                selected={selectedWidgetId === widget.id}
                onSelect={() => onSelectWidget(widget.id)}
                onDelete={() => onDeleteWidget(widget.id)}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
