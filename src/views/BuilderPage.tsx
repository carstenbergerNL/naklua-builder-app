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

    const tempWidget: WidgetInstance = {
      id: crypto.randomUUID(),
      pageId: selectedPageId,
      widgetType: type,
      label: "",
      config:
        type === "Heading"
          ? { text: "New Heading", size: "h2" }
          : { text: "New paragraph content..." },
      isVisible: true,
      isPageTitle: false,
      orderIndex: widgets.length,
      createdAt: new Date().toISOString(),
    };

    await saveWidget(tempWidget);
    const updated = await getWidgetsByPageId(selectedPageId);
    setWidgets(updated);
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

    console.log("handleDeleteWidget:", id);

    if (selectedWidgetId === id) setSelectedWidgetId(null);

    try {
      await deleteWidget(id); // <- DELETE API call
      const updated = await getWidgetsByPageId(selectedPageId!); // refresh after deletion
      setWidgets(updated);
    } catch (err) {
      console.error("Failed to delete widget:", err);
    }
  };

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId);

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

        <WidgetCanvas
          widgets={widgets}
          selectedWidgetId={selectedWidgetId}
          onSelectWidget={setSelectedWidgetId}
          onDeleteWidget={handleDeleteWidget}
        />

        <WidgetEditor
          widget={selectedWidget || null}
          onChange={updateConfig}
          onSave={saveCurrentWidget}
          saving={saving}
        />
      </div>
    </div>
  );
}
