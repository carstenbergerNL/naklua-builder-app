import { Button } from "primereact/button";
import { WidgetInstance } from "../models/WidgetInstance";
import WidgetRenderer from "./WidgetRenderer";

interface Props {
  widget: WidgetInstance;
  index: number;
  selectedWidgetId: string | null;
  onSelect: () => void;
  onDelete: () => void;
}

export default function WidgetItem({
  widget,
  index,
  selectedWidgetId,
  onSelect,
  onDelete,
}: Props) {
  const isSelected = widget.id === selectedWidgetId;

  return (
    <div
      style={{
        cursor: "pointer",
        border: isSelected ? "1px solid #2196f3" : "none",
        padding: 4,
        marginBottom: 8,
        position: "relative",
      }}
      onClick={onSelect}
    >
      <WidgetRenderer widget={widget} />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger p-button-sm"
        style={{ position: "absolute", top: 4, right: 4 }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      />
    </div>
  );
}
