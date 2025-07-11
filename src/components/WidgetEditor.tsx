import { WidgetInstance } from "../models/WidgetInstance";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { useEffect, useState, useRef } from "react";
import { getWidgetDefinitionByType } from "../services/widgetDefinitionsService";
import { Page } from "../models/Page";
import { Tooltip } from "primereact/tooltip";

interface Props {
  widget: WidgetInstance | null;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
  onAddWidget: (type: string) => void;
  pages?: Page[];
  onSelectPage?: (id: string) => void;
  selectedPageId?: string | null;
  selectedPage?: Page | null;
  onPagePropertyChange?: (key: string, value: any) => void;
  onSavePageProperties?: () => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
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
  pages,
  onSelectPage,
  selectedPageId,
  selectedPage,
  onPagePropertyChange,
  onSavePageProperties,
  activeIndex,
  setActiveIndex,
}: Props) {
  const [definitionFields, setDefinitionFields] = useState<WidgetDefinitionField[]>([]);

  // Move hook and handler to top level
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onChange("src", ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      <div style={{ padding: "1rem", fontSize: '0.93rem' }}>
        {widget.widgetType === "Image" && (
          <div style={{ marginBottom: "0.75rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
              Image File
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ fontSize: "0.9rem" }}
            />
          </div>
        )}
        {definitionFields.map((field) => {
          // Skip the src field for Image widget (handled by file input above)
          if (widget.widgetType === "Image" && field.key === "src") return null;
          return (
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
          );
        })}
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

  const renderPagesList = () => {
    if (!pages || pages.length === 0) {
      return <div style={{ padding: "1rem", color: "#888" }}>No pages found</div>;
    }
    return (
      <div style={{ padding: "1rem" }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Pages</div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {pages.map((page) => (
            <li key={page.id} style={{
              padding: "0.5rem 0.75rem",
              borderRadius: 6,
              marginBottom: 4,
              cursor: onSelectPage ? "pointer" : undefined,
              transition: "background 0.15s",
              background: selectedPageId === page.id ? "#e0e7ff" : undefined,
              color: selectedPageId === page.id ? "#2563eb" : undefined,
              fontWeight: selectedPageId === page.id ? 600 : 400,
            }}
            onClick={() => onSelectPage && onSelectPage(page.id)}
            >
              <span style={{ fontWeight: 500 }}>{page.name}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderPageProperties = () => {
    if (!selectedPage) {
      return <div style={{ padding: "1rem", color: "#888" }}>No page selected</div>;
    }
    // Editable fields
    const editableFields = [
      { key: "name", label: "Name", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "url", label: "URL", type: "text" },
      { key: "pageType", label: "Type", type: "text" },
      { key: "platform", label: "Platform", type: "text" },
      { key: "layoutType", label: "Layout Type", type: "text" },
      { key: "isHomePage", label: "Is Home Page", type: "boolean" },
      { key: "isPublished", label: "Is Published", type: "boolean" },
    ];
    return (
      <div style={{ padding: "1rem" }}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Page Properties</div>
        <form onSubmit={e => { e.preventDefault(); onSavePageProperties && onSavePageProperties(); }}>
          {editableFields.map(f => (
            <div key={f.key} style={{ marginBottom: "0.7rem" }}>
              <label style={{ display: "block", fontSize: "0.95em", marginBottom: 2 }}>{f.label}</label>
              {f.type === "boolean" ? (
                <input
                  type="checkbox"
                  checked={!!(selectedPage as any)[f.key]}
                  onChange={e => onPagePropertyChange && onPagePropertyChange(f.key, e.target.checked)}
                />
              ) : (
                <input
                  type={f.type}
                  value={(selectedPage as any)[f.key] ?? ""}
                  onChange={e => onPagePropertyChange && onPagePropertyChange(f.key, e.target.value)}
                  style={{ width: "100%", padding: "0.4em", borderRadius: 4, border: "1px solid #ccc" }}
                />
              )}
            </div>
          ))}
          <Button
            icon="pi pi-save"
            type="submit"
            className="p-button-sm p-button-primary"
            style={{ marginTop: 8 }}
            disabled={saving}
            loading={saving}
          >Save</Button>
        </form>
      </div>
    );
  };

  const TOOLBOX_WIDGETS = [
    { type: "Heading", icon: null, label: "Heading" },
    { type: "Paragraph", icon: "pi pi-align-left", label: "Paragraph" },
    { type: "Link", icon: "pi pi-link", label: "Link" },
    { type: "Image", icon: "pi pi-image", label: "Image" },
    { type: "Divider", icon: "pi pi-minus", label: "Divider" },
  ];

  const renderToolbox = () => (
    <div className="toolbox">
      <Tooltip target='.toolbox-item' />
      {TOOLBOX_WIDGETS.map((w) => (
        <div
          key={w.type}
          className="toolbox-item"
          data-pr-tooltip={w.label}
          data-pr-position="top"
          onClick={() => {
            onAddWidget(w.type);
            // setActiveIndex(0); // Remove this line
          }}
          style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', display: 'flex' }}
        >
          {w.type === "Heading" ? (
            <span className="toolbox-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="3" rx="1.5" fill="#2563eb"/>
                <rect x="3" y="10" width="12" height="2.5" rx="1.25" fill="#2563eb"/>
                <rect x="3" y="16" width="8" height="2.5" rx="1.25" fill="#2563eb"/>
              </svg>
            </span>
          ) : (
            <span className={`toolbox-icon ${w.icon}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="app-widget-editor">
      <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
        <TabPanel header="Properties">
          {widget ? renderProperties() : renderPageProperties()}
        </TabPanel>
        <TabPanel header="Toolbox">{renderToolbox()}</TabPanel>
      </TabView>
    </div>
  );
}
