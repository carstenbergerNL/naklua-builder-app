import { WidgetInstance } from "../models/WidgetInstance";
import { Button } from "primereact/button";
import WidgetRenderer from "./WidgetRenderer";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
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
  onReorder: (widgets: WidgetInstance[]) => void; // ✅ New prop
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
    border: selected ? "1px solid #2196f3" : "1px solid transparent",
    padding: 8,
    marginBottom: 10,
    background: "#fff",
    borderRadius: 4,
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
          top: 8,
          left: 8,
          cursor: "grab",
          zIndex: 5,
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
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 5,
        }}
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
        padding: "1rem",
        overflowY: "auto",
        background: "#fcfcfc",
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
