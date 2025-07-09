import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import { getPages } from "../services/pageService";
import {
  deleteWidget,
  getWidgetsByPageId,
  saveWidget,
} from "../services/widgetService";
import { Page } from "../models/Page";
import { WidgetInstance } from "../models/WidgetInstance";
import WidgetItem from "../components/WidgetItem";
import WidgetEditor from "../components/WidgetEditor";
import { v4 as uuidv4 } from "uuid";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import Topbar from "../components/layout/Topbar";

export default function BuilderPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  const appInstanceId = "238AD08C-3F96-4F94-993B-20546C0C6F11";

  const sensors = useSensors(useSensor(PointerSensor));

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
      id: uuidv4(),
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
    if (selectedWidgetId === id) setSelectedWidgetId(null);
    setWidgets((prev) => prev.filter((w) => w.id !== id));
    try {
      await deleteWidget(id);
    } catch (err) {
      console.error("Failed to delete widget:", err);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = widgets.findIndex((w) => w.id === over.id);
      const newOrder = arrayMove(widgets, oldIndex, newIndex);

      const reordered = newOrder.map((w, i) => ({ ...w, orderIndex: i }));
      setWidgets(reordered);
      reordered.forEach(saveWidget);
    }
  };

  const selectedWidget = widgets.find((w) => w.id === selectedWidgetId);

  return (
    <>
      <Topbar />
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        <div
          style={{
            width: "260px",
            background: "#f4f4f4",
            padding: "1rem",
            borderRight: "1px solid #ccc",
          }}
        >
          <h3>Pages</h3>
          {pages.map((page) => (
            <div key={page.id}>
              <Button
                label={page.title}
                onClick={() => handleSelectPage(page.id)}
                className={`p-button-text p-mb-2 ${
                  selectedPageId === page.id ? "p-button-info" : ""
                }`}
              />
            </div>
          ))}

          <h4 className="p-mt-4">Add Widget</h4>
          <Button
            label="Heading"
            className="p-mb-2 p-button-sm"
            onClick={() => addWidget("Heading")}
            disabled={!selectedPageId}
          />
          <Button
            label="Paragraph"
            className="p-mb-2 p-button-sm"
            onClick={() => addWidget("Paragraph")}
            disabled={!selectedPageId}
          />
        </div>

        <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
          <Panel header="Canvas Area">
            {selectedPageId ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={widgets.map((w) => w.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {widgets.map((widget, index) => (
                    <WidgetItem
                      key={widget.id}
                      widget={widget}
                      index={index}
                      selectedWidgetId={selectedWidgetId}
                      onSelect={() => setSelectedWidgetId(widget.id)}
                      onDelete={() => handleDeleteWidget(widget.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <p>Select a page to start editing</p>
            )}
          </Panel>
        </div>

        <div
          style={{
            width: "400px",
            padding: "1rem",
            borderLeft: "1px solid #ccc",
          }}
        >
          <h4>Widget Config</h4>
          {!selectedWidget && <p>Select a widget to edit</p>}
          {selectedWidget && (
            <WidgetEditor
              widget={selectedWidget}
              onChange={updateConfig}
              onSave={saveCurrentWidget}
              saving={saving}
            />
          )}
        </div>
      </div>
    </>
  );
}
