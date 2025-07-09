import { WidgetInstance } from "../models/WidgetInstance";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { useState } from "react";

interface Props {
  widget: WidgetInstance | null;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
  onAddWidget: (type: string) => void;
}

export default function WidgetEditor({
  widget,
  onChange,
  onSave,
  saving,
  onAddWidget,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  const renderProperties = () => {
    if (!widget) {
      return (
        <div style={{ padding: "1rem", color: "#888" }}>
          Select a widget to edit
        </div>
      );
    }

    return (
      <div style={{ padding: "1rem" }}>
        {Object.keys(widget.config).map((key) => (
          <div key={key} style={{ marginBottom: "0.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>

            <input
              type="text"
              value={widget.config[key]}
              onChange={(e) => onChange(key, e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
        ))}

        <Button
          icon="pi pi-save"
          onClick={onSave}
          className="p-button-sm p-button-primary"
          disabled={saving}
          loading={saving}
        />
      </div>
    );
  };

  const renderToolbox = () => (
    <div style={{ padding: "1rem" }}>
      <Button
        label="Add Heading"
        className="p-button-sm p-button-secondary"
        style={{ marginBottom: "0.5rem", width: "100%" }}
        onClick={() => onAddWidget("Heading")}
      />
      <Button
        label="Add Paragraph"
        className="p-button-sm p-button-secondary"
        style={{ width: "100%" }}
        onClick={() => onAddWidget("Paragraph")}
      />
    </div>
  );

  return (
    <div
      style={{
        width: "300px",
        background: "#f8f9fa",
        borderLeft: "1px solid #ccc",
      }}
    >
      <TabView
        activeIndex={activeIndex}
        onTabChange={(e) => setActiveIndex(e.index)}
      >
        <TabPanel header="Properties">{renderProperties()}</TabPanel>
        <TabPanel header="Toolbox">{renderToolbox()}</TabPanel>
      </TabView>
    </div>
  );
}
