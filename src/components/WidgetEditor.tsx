import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { WidgetInstance } from "../models/WidgetInstance";

type Props = {
  widget: WidgetInstance;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
};

export default function WidgetEditor({ widget, onChange, onSave, saving }: Props) {
  return (
    <>
      <div className="p-field">
        <label>Text</label>
        <InputText
          value={widget.config.text || ""}
          onChange={(e) => onChange("text", e.target.value)}
        />
      </div>

      {widget.widgetType === "Heading" && (
        <div className="p-field">
          <label>Size</label>
          <Dropdown
            value={widget.config.size}
            options={["h1", "h2", "h3", "h4", "h5", "h6"]}
            onChange={(e) => onChange("size", e.value)}
            placeholder="Select heading level"
          />
        </div>
      )}

      <Button
        label={saving ? "Saving..." : "Save Widget"}
        className="p-mt-3"
        onClick={onSave}
        disabled={saving}
      />
    </>
  );
}
