import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { getPages } from "../services/pageService";
import { getWidgetsByPageId } from "../services/widgetService";
import { Page } from "../models/Page";
import { WidgetInstance } from "../models/WidgetInstance";
import WidgetRenderer from "../components/WidgetRenderer";
import { v4 as uuidv4 } from "uuid";

export default function BuilderPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  const appInstanceId = "238AD08C-3F96-4F94-993B-20546C0C6F11";

  useEffect(() => {
    getPages(appInstanceId).then(setPages);
  }, []);

  const handleSelectPage = async (id: string) => {
    setSelectedPageId(id);
    const data = await getWidgetsByPageId(id);
    setWidgets(data);
    setSelectedWidgetId(null);
  };

  const addWidget = (type: string) => {
    const newWidget: WidgetInstance = {
      id: uuidv4(),
      pageId: selectedPageId!,
      widgetType: type,
      label: "",
      config: type === "Heading"
        ? { text: "New Heading", size: "h2" }
        : { text: "New paragraph content..." },
      isVisible: true,
      isPageTitle: false,
      orderIndex: widgets.length,
      createdAt: new Date().toISOString(),
    };
    setWidgets([...widgets, newWidget]);
  };

  const updateConfig = (key: string, value: any) => {
    setWidgets(prev =>
      prev.map(w => w.id === selectedWidgetId
        ? { ...w, config: { ...w.config, [key]: value } }
        : w)
    );
  };

  const selectedWidget = widgets.find(w => w.id === selectedWidgetId);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Fixed Sidebar */}
      <div style={{ width: "260px", background: "#f4f4f4", padding: "1rem", borderRight: "1px solid #ccc" }}>
        <h3>Pages</h3>
        {pages.map(page => (
          <div key={page.id}>
            <Button
              label={page.title}
              onClick={() => handleSelectPage(page.id)}
              className={`p-button-text p-mb-2 ${selectedPageId === page.id ? "p-button-info" : ""}`}
            />
          </div>
        ))}

        <h4 className="p-mt-4">Add Widget</h4>
        <Button label="Heading" className="p-mb-2 p-button-sm" onClick={() => addWidget("Heading")} disabled={!selectedPageId} />
        <Button label="Paragraph" className="p-mb-2 p-button-sm" onClick={() => addWidget("Paragraph")} disabled={!selectedPageId} />
      </div>

      {/* Main Canvas */}
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        <Panel header="Canvas Area">
          {selectedPageId ? widgets.map(widget => (
            <div
              key={widget.id}
              onClick={() => setSelectedWidgetId(widget.id)}
              style={{
                cursor: "pointer",
                border: selectedWidgetId === widget.id ? "1px solid #2196f3" : "none",
                padding: 4,
                marginBottom: 8,
              }}
            >
              <WidgetRenderer widget={widget} />
            </div>
          )) : <p>Select a page to start editing</p>}
        </Panel>
      </div>

      {/* Widget Config Panel */}
      <div style={{ width: "300px", padding: "1rem", borderLeft: "1px solid #ccc" }}>
        <h4>Widget Config</h4>
        {!selectedWidget && <p>Select a widget to edit</p>}
        {selectedWidget && (
          <>
            <div className="p-field">
              <label>Text</label>
              <InputText
                value={selectedWidget.config.text || ""}
                onChange={(e) => updateConfig("text", e.target.value)}
              />
            </div>

            {selectedWidget.widgetType === "Heading" && (
              <div className="p-field">
                <label>Size</label>
                <Dropdown
                  value={selectedWidget.config.size}
                  options={["h1", "h2", "h3", "h4", "h5", "h6"]}
                  onChange={(e) => updateConfig("size", e.value)}
                  placeholder="Select heading level"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
