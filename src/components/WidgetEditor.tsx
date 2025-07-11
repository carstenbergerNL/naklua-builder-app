import { WidgetInstance } from "../models/WidgetInstance";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import { useEffect, useState, useRef } from "react";
import { getWidgetDefinitionByType } from "../services/widgetDefinitionsService";
import { WidgetDefinition } from "../models/WidgetDefinition";
import { Page } from "../models/Page";
import { Tooltip } from "primereact/tooltip";
import { Tooltip as PrimeTooltip } from 'primereact/tooltip';
import React from 'react';

interface Props {
  widget: WidgetInstance | null;
  onChange: (key: string, value: any) => void;
  onSave: () => void;
  saving: boolean;
  onAddWidget: (type: string) => void;
  availableWidgets: WidgetDefinition[];
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
  availableWidgets,
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

  function renderToolbox() {
    // Group widgets by category
    const groups: { [category: string]: WidgetDefinition[] } = {};
    for (const w of availableWidgets) {
      const cat = w.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(w);
    }
    // Generate unique ids for tooltips
    const getTooltipId = (widgetType: string) => `toolbox-tooltip-${widgetType}`;
    return (
      <div className="toolbox">
        {Object.entries(groups).map(([category, widgets]) => (
          <div key={category} style={{ width: '100%' }}>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', margin: '0.5rem 0 0.25rem 0.25rem', color: '#444' }}>{category}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {widgets.map((w) => {
                const tooltipId = getTooltipId(w.widgetType);
                return (
                  <React.Fragment key={w.widgetType}>
                    <div
                      id={tooltipId}
                      className="toolbox-item"
                      onClick={() => {
                        onAddWidget(w.widgetType);
                      }}
                      style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', display: 'flex' }}
                    >
                      {renderWidgetIcon(w)}
                    </div>
                    <PrimeTooltip target={`#${tooltipId}`} content={w.displayName} position="top" />
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Helper to render the correct icon
  function renderWidgetIcon(w: WidgetDefinition) {
    // If iconType is 'material-outlined', use Material Icons Outlined
    if (w.iconType === 'material-outlined' && w.icon) {
      return <span className="material-icons-outlined" style={{ fontSize: '1rem' }}>{w.icon}</span>;
    }
    // If iconType is 'material', use Material Icons
    if (w.iconType === 'material' && w.icon) {
      return <span className="material-icons" style={{ fontSize: '1rem' }}>{w.icon}</span>;
    }
    // Otherwise, use class-based icon (PrimeIcons, etc.)
    return <span className={`toolbox-icon ${w.icon ? w.icon : 'pi pi-plus'}`} style={{ fontSize: '1rem' }} />;
  }

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
