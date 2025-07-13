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
import { getDomainModelsByApp } from "../services/domainModelService";
import { DomainModel } from "../models/DomainModel";
import React from "react";
import { TabView, TabPanel } from 'primereact/tabview';
import { getDomainEntitiesByModel } from '../services/domainEntityService';
import { DomainEntity } from '../models/DomainEntity';

export default function BuilderPage() {
  const [pages, setPages] = useState<Page[]>([]);
  const [domainModels, setDomainModels] = useState<DomainModel[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedDomainModelId, setSelectedDomainModelId] = useState<string | null>(null);
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
    getDomainModelsByApp(appInstanceId).then(setDomainModels);
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
    setSelectedDomainModelId(null);
    const data = await getWidgetsByPageId(id);
    setWidgets(data);
    setSelectedWidgetId(null);
    setActivePropertiesTab(0); // Switch to Properties tab
  };

  const handleSelectDomainModel = (id: string) => {
    setSelectedDomainModelId(id);
    setSelectedPageId(null);
    setWidgets([]);
    setSelectedWidgetId(null);
    setActivePropertiesTab(0);
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
      // Re-fetch widgets from backend to ensure sync
      const updated = await getWidgetsByPageId(selectedPageId);
      setWidgets(updated);

      // Find the new widget by type and orderIndex (should be unique)
      const newWidget = updated.find(w => w.widgetType === type && w.orderIndex === insertAt);
      setSelectedWidgetId(newWidget ? newWidget.id : tempWidget.id);
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

  React.useEffect(() => {
    function handleUpdateDomainModel(e: any) {
      setDomainModels((prev: DomainModel[]) => prev.map((dm: DomainModel) =>
        dm.id === e.detail.id ? { ...dm, name: e.detail.name, description: e.detail.description } : dm
      ));
    }
    window.addEventListener('updateDomainModel', handleUpdateDomainModel);
    return () => window.removeEventListener('updateDomainModel', handleUpdateDomainModel);
  }, []);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Topbar availableWidgets={availableWidgets} onAddWidget={addWidget} />
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Sidebar
          pages={pages}
          domainModels={domainModels}
          selectedPageId={selectedPageId}
          onSelectPage={handleSelectPage}
          onSelectDomainModel={handleSelectDomainModel}
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
            {selectedDomainModelId ? (
              <DomainModelDetails
                domainModel={domainModels.find(dm => dm.id === selectedDomainModelId) || null}
              />
            ) : (
              <>
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
              </>
            )}
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

// DomainModelDetails component
function DomainModelDetails({ domainModel }: { domainModel: DomainModel | null }) {
  const [editName, setEditName] = React.useState(domainModel?.name || "");
  const [editDescription, setEditDescription] = React.useState(domainModel?.description || "");
  const [editing, setEditing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);
  const [entities, setEntities] = React.useState<DomainEntity[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setEditName(domainModel?.name || "");
    setEditDescription(domainModel?.description || "");
    setEditing(false);
    if (domainModel) {
      setLoading(true);
      getDomainEntitiesByModel(domainModel.id).then(setEntities).finally(() => setLoading(false));
    } else {
      setEntities([]);
    }
  }, [domainModel]);

  if (!domainModel) return <div style={{ padding: 32, color: '#888' }}>No Domain Model selected</div>;

  // Save handler: update domainModels state in parent
  const handleSave = () => {
    if (domainModel.name !== editName || domainModel.description !== editDescription) {
      // Custom event to parent (BuilderPage) to update domainModels state
      const event = new CustomEvent('updateDomainModel', {
        detail: {
          id: domainModel.id,
          name: editName,
          description: editDescription,
        },
      });
      window.dispatchEvent(event);
    }
    setEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%' }}>
      <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div className="info-bar" style={{ marginBottom: 0 }}>
          Domain Model: <b>{domainModel.name}</b>
        </div>
        <div style={{ flex: 1, padding: '2rem 2.5rem', overflow: 'auto' }}>
          <h2 style={{ marginBottom: 16 }}>Entities</h2>
          {loading ? (
            <div style={{ color: '#888' }}>Loading entities...</div>
          ) : entities.length === 0 ? (
            <div style={{ color: '#888' }}>No entities found for this domain model.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              {entities.map(entity => (
                <div key={entity.id} style={{
                  background: '#eaf6fb',
                  border: '1.5px solid #b5d6e6',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  padding: '1.25rem 1.5rem',
                  minWidth: 240,
                  maxWidth: 320,
                  flex: '1 1 260px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#1b6ca8', marginBottom: 4 }}>{entity.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="app-widget-editor" style={{ minWidth: 320, maxWidth: 400, width: 400, padding: 0 }}>
        <TabView activeIndex={activeTab} onTabChange={e => setActiveTab(e.index)}>
          <TabPanel header="Properties">
            <div style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>Domain Model Details</div>
              <div><b>Name:</b> {editing ? (
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', marginBottom: 8 }}
                />
              ) : (
                <span style={{ marginLeft: 8 }}>{domainModel.name}</span>
              )}</div>
              <div><b>Description:</b> {editing ? (
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  style={{ width: '100%', marginBottom: 8 }}
                  rows={3}
                />
              ) : (
                <span style={{ marginLeft: 8 }}>{domainModel.description}</span>
              )}</div>
              <div><b>Created At:</b> {new Date(domainModel.createdAt).toLocaleString()}</div>
              <div><b>Creator ID:</b> {domainModel.creatorId}</div>
              {editing ? (
                <div style={{ marginTop: 16 }}>
                  <button className="button-primary" style={{ marginRight: 8 }} onClick={handleSave}>Save</button>
                  <button style={{ marginRight: 8 }} onClick={() => setEditing(false)}>Cancel</button>
                </div>
              ) : (
                <div style={{ marginTop: 16 }}>
                  <button className="button-primary" onClick={() => setEditing(true)}>Edit</button>
                </div>
              )}
            </div>
          </TabPanel>
          <TabPanel header="Toolbox">
            <div style={{ padding: '1.5rem' }}>
              <i>Toolbox for this Domain Model will be shown here.</i>
            </div>
          </TabPanel>
        </TabView>
      </div>
    </div>
  );
}
