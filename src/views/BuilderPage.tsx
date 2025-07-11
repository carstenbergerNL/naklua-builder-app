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
import PageSidebar from "../components/PageSidebar";
import Topbar from "../components/Topbar";
import { getWidgetDefinitionByType } from "../services/widgetDefinitionsService";

export default function BuilderPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

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

  const addWidget = async (type: string) => {
    if (!selectedPageId) return;

    try {
      const def = await getWidgetDefinitionByType(type);
      const defaultConfig = def.defaultConfig ? JSON.parse(def.defaultConfig) : {};

      const tempWidget: WidgetInstance = {
        id: crypto.randomUUID(),
        pageId: selectedPageId,
        widgetType: type,
        label: def.displayName || type,
        config: defaultConfig,
        isVisible: true,
        isPageTitle: false,
        orderIndex: widgets.length,
        createdAt: new Date().toISOString(),
      };

      await saveWidget(tempWidget);
      const updated = await getWidgetsByPageId(selectedPageId);
      setWidgets(updated);
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
      <Topbar />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <PageSidebar
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
              // Only trigger if clicking the background, not a widget
              if (e.target === e.currentTarget) {
                setSelectedWidgetId(null);
              }
            }}
          >
            <div className="info-bar">Editing page: <b>{currentPage ? currentPage.name : "(no page selected)"}</b></div>
            <WidgetCanvas
              widgets={widgets}
              selectedWidgetId={selectedWidgetId}
              onSelectWidget={setSelectedWidgetId}
              onDeleteWidget={handleDeleteWidget}
              onReorder={handleReorderWidgets}
              pageName={currentPage ? currentPage.name : ""}
            />
          </div>
          {/* Right sidebar */}
          <WidgetEditor
            widget={selectedWidget || null}
            onChange={updateConfig}
            onSave={saveCurrentWidget}
            saving={saving}
            onAddWidget={addWidget}
            pages={pages}
            onSelectPage={handleSelectPage}
            selectedPageId={selectedPageId}
            selectedPage={currentPage}
          />
        </div>
      </div>
    </div>
  );
}
