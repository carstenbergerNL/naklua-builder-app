import { WidgetInstance } from "../models/WidgetInstance";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

interface Props {
  widget: WidgetInstance | null;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function WidgetEditor({ widget, onChange, onSave, saving }: Props) {
  if (!widget) {
    return (
      <div
        style={{
          height: "100%",
          borderLeft: "1px solid #ccc",
          padding: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          fontStyle: "italic",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <i className="pi pi-cog" style={{ fontSize: "2rem", marginBottom: "1rem" }} />
          <p>No widget selected</p>
          <p>Select a widget from the canvas</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem", borderLeft: "1px solid #ccc", height: "100%", overflowY: "auto" }}>
      <h4 style={{ marginBottom: "1rem" }}>Edit Widget</h4>

      <div className="p-field">
        <label>Text</label>
        <InputText
          value={widget.config.text || ""}
          onChange={(e) => onChange("text", e.target.value)}
          className="p-inputtext-sm"
        />
      </div>

      {widget.widgetType === "Heading" && (
        <div className="p-field" style={{ marginTop: "1rem" }}>
          <label>Size</label>
          <Dropdown
            value={widget.config.size}
            options={["h1", "h2", "h3", "h4", "h5", "h6"]}
            onChange={(e) => onChange("size", e.value)}
            placeholder="Select heading level"
            className="p-dropdown-sm"
          />
        </div>
      )}

      <Button
        label={saving ? "Saving..." : "Save Widget"}
        className="p-mt-3 p-button-sm"
        onClick={onSave}
        disabled={saving}
      />
    </div>
  );
}
