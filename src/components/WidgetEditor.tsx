import { WidgetInstance } from "../models/WidgetInstance";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { useEffect, useState } from "react";
import { getWidgetDefinitionByType } from "../services/widgetDefinitionsService";

interface Props {
  widget: WidgetInstance | null;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
  onAddWidget: (type: string) => void;
}

interface WidgetDefinitionField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean";
}

export default function WidgetEditor({
  widget,
  onChange,
  onSave,
  saving,
  onAddWidget,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [definitionFields, setDefinitionFields] = useState<WidgetDefinitionField[]>([]);

  useEffect(() => {
    if (widget) {
      getWidgetDefinitionByType(widget.widgetType).then((def) => {
        try {
          const parsed = JSON.parse(def.defaultConfig);
          const keys = Object.keys(parsed || {});
          const fields: WidgetDefinitionField[] = keys.map((key) => ({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
            type: typeof parsed[key] === "number"
              ? "number"
              : typeof parsed[key] === "boolean"
              ? "boolean"
              : "text",
          }));
          setDefinitionFields(fields);
        } catch (err) {
          console.error("Failed to parse DefaultConfig:", err);
          setDefinitionFields([]);
        }
      });
    } else {
      setDefinitionFields([]);
    }
  }, [widget]);

  const renderProperties = () => {
    if (!widget) {
      return <div style={{ padding: "1rem", color: "#888" }}>Select a widget to edit</div>;
    }

    return (
      <div style={{ padding: "1rem" }}>
        {definitionFields.map((field) => (
          <div key={field.key} style={{ marginBottom: "0.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "0.25rem",
              }}
            >
              {field.label || field.key.charAt(0).toUpperCase() + field.key.slice(1)}
            </label>
            <input
              type={field.type === "number" ? "number" : "text"}
              value={widget.config[field.key] || ""}
              onChange={(e) => onChange(field.key, e.target.value)}
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
        style={{ marginBottom: "0.5rem", width: "100%" }}
        onClick={() => onAddWidget("Paragraph")}
      />
      <Button
        label="Add Link"
        className="p-button-sm p-button-secondary"
        style={{ marginBottom: "0.5rem", width: "100%" }}
        onClick={() => onAddWidget("Link")}
      />
    </div>
  );

  return (
    <div style={{ width: "300px", background: "#f8f9fa", borderLeft: "1px solid #ccc" }}>
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        <TabPanel header="Properties">{renderProperties()}</TabPanel>
        <TabPanel header="Toolbox">{renderToolbox()}</TabPanel>
      </TabView>
    </div>
  );
}
