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

interface Props {
  widgets: WidgetInstance[];
  selectedWidgetId: string | null;
  onSelectWidget: (id: string) => void;
  onDeleteWidget: (id: string) => void;
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
    <div ref={setNodeRef} style={style}>
      {/* Click area for drag and selection */}
      <div
        {...attributes}
        {...listeners}
        onClick={onSelect}
        style={{ cursor: "pointer", paddingRight: "2.5rem" }}
      >
        <WidgetRenderer widget={widget} />
      </div>

      {/* Absolute positioned delete button, outside drag zone */}
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          zIndex: 10,
        }}
        onClick={(e) => {
          e.stopPropagation(); // prevent selecting
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
      <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>Canvas</h3>

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
                (w, i) => ({
                  ...w,
                  orderIndex: i,
                })
              );
              // TODO: save updated order to server
              console.log("New order:", updated);
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
                onDelete={() => {
                  console.log("Deleting widget", widget.id); // 👈 Log here
                  onDeleteWidget(widget.id);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
