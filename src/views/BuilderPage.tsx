import { useEffect, useState, useRef } from "react";
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
import { v4 as uuidv4 } from 'uuid';
import { DndContext, closestCenter, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import WidgetRenderer from "../components/WidgetRenderer";

export default function BuilderPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [widgets, setWidgets] = useState<WidgetInstance[]>([]);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [availableWidgets, setAvailableWidgets] = useState<WidgetDefinition[]>([]);
  const [activePropertiesTab, setActivePropertiesTab] = useState(0);
  const [activeDragWidgetType, setActiveDragWidgetType] = useState<string | null>(null);
  const dragging = useRef(false);
  const [activeDragFromToolbox, setActiveDragFromToolbox] = useState(false);

  const appInstanceId = "238AD08C-3F96-4F94-993B-20546C0C6F11";

  useEffect(() => {
    getPages(appInstanceId).then(setPages);
    getWidgetDefinitions().then(setAvailableWidgets);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleSelectPage = async (id: string) => {
    setSelectedPageId(id);
    const data = await getWidgetsByPageId(id);
    setWidgets(data);
    setSelectedWidgetId(null);
    setActivePropertiesTab(0); // Switch to Properties tab
  };

  const addWidget = async (type: string, parentId?: string | null, orderIndex?: number) => {
    if (!selectedPageId) return;

    try {
      const def = availableWidgets.find(d => d.widgetType === type);
      const defaultConfig = def?.defaultConfig ? JSON.parse(def.defaultConfig) : {};

      // Default to end if orderIndex is not provided
      const insertAt = orderIndex !== undefined ? orderIndex : widgets.length;

      const tempWidget: WidgetInstance = {
        id: crypto.randomUUID(),
        pageId: selectedPageId,
        widgetType: type,
        label: def?.displayName || type,
        config: defaultConfig,
        isVisible: true,
        isPageTitle: false,
        orderIndex: insertAt,
        createdAt: new Date().toISOString(),
        parentId: parentId ?? undefined,
      };

      // Insert the new widget at the correct position
      const newWidgets = [
        ...widgets.slice(0, insertAt),
        tempWidget,
        ...widgets.slice(insertAt)
      ].map((w, i) => ({ ...w, orderIndex: i }));

      // Save all widgets in new order
      for (const w of newWidgets) {
        await saveWidget(w);
      }
      setWidgets(newWidgets);

      setSelectedWidgetId(tempWidget.id);
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

  // DnD handler moved here
  const handleDragStart = (event: any) => {
    console.log('DnD handleDragStart', event);
    if (event.active.data?.current?.fromToolbox) {
      setActiveDragWidgetType(event.active.data.current.widgetType);
      setActiveDragFromToolbox(true);
    } else {
      setActiveDragFromToolbox(false);
    }
    document.body.classList.add('dnd-dragging');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragWidgetType(null);
    setActiveDragFromToolbox(false);
    document.body.classList.remove('dnd-dragging');
    console.log('DnD handleDragEnd', {
      active: event.active,
      over: event.over,
      activeData: event.active.data?.current,
      overData: event.over?.data?.current
    });
    const { active, over } = event;
    // Handle toolbox-to-dropzone (insert at specific position)
    if (
      active.data?.current?.fromToolbox === true &&
      over?.data?.current?.isDropZone
    ) {
      const orderIndex = parseInt(over.id.toString().replace('dropzone-', ''), 10);
      addWidget(active.data.current.widgetType, null, orderIndex);
      return;
    }
    // Handle toolbox-to-layout drop (optional, for nested layouts)
    if (
      active.data?.current?.fromToolbox === true &&
      over?.data?.current?.isLayout
    ) {
      addWidget(active.data.current.widgetType, String(over.id));
      return;
    }
    // Handle toolbox-to-canvas drop (root level, fallback)
    if (
      active.data?.current?.fromToolbox === true &&
      over?.data?.current?.isCanvas
    ) {
      addWidget(active.data.current.widgetType, null);
      return;
    }
    // Handle widget reordering via dropzone
    if (
      !active.data?.current?.fromToolbox &&
      over?.id?.toString().startsWith('dropzone-')
    ) {
      const oldIndex = widgets.findIndex((w) => w.id === active.id);
      const newIndex = parseInt(over.id.toString().replace('dropzone-', ''), 10);
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const updated = arrayMove(widgets, oldIndex, newIndex).map(
          (w: WidgetInstance, i: number) => ({ ...w, orderIndex: i })
        );
        handleReorderWidgets(updated);
      }
      return;
    }
    // Handle widget reordering (fallback, e.g. drop on widget itself)
    if (!over || active.id === over.id) return;

    const oldIndex = widgets.findIndex((w) => w.id === active.id);
    const newIndex = widgets.findIndex((w) => w.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const updated = arrayMove(widgets, oldIndex, newIndex).map(
        (w: WidgetInstance, i: number) => ({ ...w, orderIndex: i })
      );
      handleReorderWidgets(updated);
    }
  };

  const handleDragCancel = () => {
    setActiveDragWidgetType(null);
    setActiveDragFromToolbox(false);
    document.body.classList.remove('dnd-dragging');
    console.log('DnD handleDragCancel');
  };

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
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
                onAddWidget={addWidget}
                activeDragFromToolbox={activeDragFromToolbox}
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
          <DragOverlay key={activeDragWidgetType}>
            {activeDragWidgetType && !activeDragFromToolbox ? (
              <WidgetRenderer widget={{ widgetType: activeDragWidgetType, config: {}, isVisible: true, id: 'preview', pageId: '', orderIndex: 0, isPageTitle: false, createdAt: '' }} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
