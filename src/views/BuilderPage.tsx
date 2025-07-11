import { useEffect, useState } from "react";
import { getPages } from "../services/pageService";
import {
  deleteWidget,
  getWidgetsByPageId,
  saveWidget,
} from "../services/widgetService";
import { Page } from "../models/Page";
import { WidgetInstance } from "../models/WidgetInstance";
import WidgetCanvas from "../components/WidgetCanvas";
import WidgetEditor from "../components/WidgetEditor";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { getWidgetDefinitions } from "../services/widgetDefinitionsService";
import { WidgetDefinition } from "../models/WidgetDefinition";
import { useRef } from "react";
import { v4 as uuidv4 } from 'uuid';

export default function BuilderPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [availableWidgets, setAvailableWidgets] = useState<WidgetDefinition[]>([]);
  const [activePropertiesTab, setActivePropertiesTab] = useState(0);
  const dragging = useRef(false);

  const appInstanceId = "238AD08C-3F96-4F94-993B-20546C0C6F11";

  useEffect(() => {
    getPages(appInstanceId).then(setPages);
    getWidgetDefinitions().then(setAvailableWidgets);
  }, []);

  const handleSelectPage = async (id: string) => {
    setSelectedPageId(id);
    const data = await getWidgetsByPageId(id);
    setWidgets(data);
    setSelectedWidgetId(null);
    setActivePropertiesTab(0); // Switch to Properties tab
  };

  const addWidget = async (type: string) => {
    if (!selectedPageId) return;

    try {
      const def = availableWidgets.find(d => d.widgetType === type);
      const defaultConfig = def?.defaultConfig ? JSON.parse(def.defaultConfig) : {};

      const tempWidget: WidgetInstance = {
        id: crypto.randomUUID(),
        pageId: selectedPageId,
        widgetType: type,
        label: def?.displayName || type,
        config: defaultConfig,
        isVisible: true,
        isPageTitle: false,
        orderIndex: widgets.length,
        createdAt: new Date().toISOString(),
      };

      await saveWidget(tempWidget);
      const updated = await getWidgetsByPageId(selectedPageId);
      setWidgets(updated);
      // Find the new widget by orderIndex and type
      const newWidget = updated.find(
        w => w.orderIndex === widgets.length && w.widgetType === type
      );
      if (newWidget) {
        setSelectedWidgetId(newWidget.id);
      } else {
        setSelectedWidgetId(updated[updated.length - 1]?.id || null);
      }
      setActivePropertiesTab(0); // Switch to Properties tab
    } catch (err) {
      console.error("Failed to add widget:", err);
    }
  };

  const updateConfig = (key: string, value: any) => {
    setWidgets((prev) =>
      prev.map((w) =>
        w.id === selectedWidgetId
          ? { ...w, config: { ...w.config, [key]: value } }
          : w
      )
    );
  };

  const saveCurrentWidget = async () => {
    if (!selectedWidgetId) return;
    const widget = widgets.find((w) => w.id === selectedWidgetId);
    if (widget) {
      setSaving(true);
      await saveWidget(widget);
      setSaving(false);
    }
  };

  const handleDeleteWidget = async (id: string) => {
    if (selectedWidgetId === id) setSelectedWidgetId(null);

    try {
      await deleteWidget(id);
      const updated = await getWidgetsByPageId(selectedPageId!);
      setWidgets(updated);
    } catch (err) {
      console.error("Failed to delete widget:", err);
    }
  };

  const handleReorderWidgets = async (reordered: WidgetInstance[]) => {
    setWidgets(reordered);
    for (const widget of reordered) {
      try {
        await saveWidget(widget);
      } catch (error) {
        console.error("Failed to save widget order:", error);
      }
    }
  };

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId);
  const currentPage = pages.find((p) => p.id === selectedPageId);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Topbar availableWidgets={availableWidgets} onAddWidget={addWidget} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar
          pages={pages}
          selectedPageId={selectedPageId}
          onSelectPage={handleSelectPage}
          onAddWidget={addWidget}
        />
        {/* Main content and right sidebar */}
        <div style={{ flex: 1, display: "flex", minWidth: 0 }}>
          {/* Main content column */}
          <div
            style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}
            onClick={e => {
              if (e.target === e.currentTarget) {
                setSelectedWidgetId(null);
                setActivePropertiesTab(0);
              }
            }}
          >
            <div className="info-bar">Editing page: <b>{currentPage ? currentPage.name : "(no page selected)"}</b></div>
            <WidgetCanvas
              widgets={widgets}
              selectedWidgetId={selectedWidgetId}
              onSelectWidget={id => {
                setSelectedWidgetId(id);
                setActivePropertiesTab(0);
              }}
              onDeleteWidget={handleDeleteWidget}
              onReorder={handleReorderWidgets}
              pageName={currentPage ? currentPage.name : ""}
            />
          </div>
          <WidgetEditor
            widget={selectedWidget || null}
            onChange={updateConfig}
            onSave={saveCurrentWidget}
            saving={saving}
            onAddWidget={addWidget}
            availableWidgets={availableWidgets}
            pages={pages}
            onSelectPage={handleSelectPage}
            selectedPageId={selectedPageId}
            selectedPage={currentPage}
            activeIndex={activePropertiesTab}
            setActiveIndex={setActivePropertiesTab}
          />
        </div>
      </div>
    </div>
  );
}
