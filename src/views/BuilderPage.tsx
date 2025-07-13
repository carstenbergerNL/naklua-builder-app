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
import { getDomainAttributesByEntity } from '../services/domainAttributeService';
import { DomainAttribute } from '../models/DomainAttribute';
import { Dialog } from 'primereact/dialog';
import { updateDomainAttribute } from '../services/domainAttributeService';
import { createDomainAttribute } from '../services/domainAttributeService';
import { deleteDomainAttribute } from '../services/domainAttributeService';

const appInstanceId = "D0D27157-418C-47AE-A8AB-EF6DD0AD0955";
const user = { id: 'E02ECABE-BF6E-44FE-9512-5C3A18A62793', name: 'Test User' };

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
  const [entityAttributes, setEntityAttributes] = React.useState<Record<string, DomainAttribute[]>>({});
  const [selectedAttribute, setSelectedAttribute] = React.useState<DomainAttribute | null>(null);
  const [selectedEntity, setSelectedEntity] = React.useState<DomainEntity | null>(null);
  const [showAddAttrDialog, setShowAddAttrDialog] = React.useState(false);
  const [addAttrEntityId, setAddAttrEntityId] = React.useState<string | null>(null);
  const [newAttr, setNewAttr] = React.useState<Partial<DomainAttribute>>({ name: '', dataType: '', length: 0, isRequired: false, isPrimaryKey: false, defaultValue: '' });
  const [entityDialogTab, setEntityDialogTab] = React.useState(0);
  const [entityDialogData, setEntityDialogData] = React.useState<DomainEntity | null>(null);
  const [entityDialogSysMembers, setEntityDialogSysMembers] = React.useState({ createdDate: true, changedDate: false, owner: true, changedBy: false });
  const [entityDialogPersistable, setEntityDialogPersistable] = React.useState(true);
  const [showAttrEditDialog, setShowAttrEditDialog] = React.useState(false);
  const [editAttrIdx, setEditAttrIdx] = React.useState<number | null>(null);
  const [selectedAttrId, setSelectedAttrId] = React.useState<string | null>(null);
  const [showDeleteAttrConfirm, setShowDeleteAttrConfirm] = React.useState(false);
  const [tableNameError, setTableNameError] = React.useState<string | null>(null);
  const [generatingSql, setGeneratingSql] = React.useState(false);
  const [sqlGenMessage, setSqlGenMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setEditName(domainModel?.name || "");
    setEditDescription(domainModel?.description || "");
    setEditing(false);
    if (domainModel) {
      setLoading(true);
      getDomainEntitiesByModel(domainModel.id).then(async (entities) => {
        setEntities(entities);
        // Fetch attributes for each entity
        const attrMap: Record<string, DomainAttribute[]> = {};
        await Promise.all(
          entities.map(async (entity) => {
            try {
              const attrs = await getDomainAttributesByEntity(entity.id);
              attrMap[entity.id] = attrs;
            } catch (e) {
              attrMap[entity.id] = [];
            }
          })
        );
        setEntityAttributes(attrMap);
      }).finally(() => setLoading(false));
    } else {
      setEntities([]);
      setEntityAttributes({});
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

  const rowStyle = {
    paddingLeft: 0,
    color: '#1a2a3a',
    fontWeight: 500,
    cursor: 'pointer',
    borderRadius: 4,
    padding: selectedAttrId === null ? '1px 4px' : undefined,
    transition: 'background 0.15s',
    fontSize: '0.91rem',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%' }}>
      <div style={{ flex: 1, background: '#fff', display: 'flex', flexDirection: 'column' }}>
        <div className="info-bar" style={{ marginBottom: 0 }}>
          Domain Model: <b>{domainModel.name}</b>
        </div>
        <div style={{ flex: 1, padding: '2rem 2.5rem', overflow: 'auto' }} onClick={e => { if (e.target === e.currentTarget) setSelectedAttribute(null); }}>
          <h2 style={{ marginBottom: 16 }}>Entities</h2>
          {loading ? (
            <div style={{ color: '#888' }}>Loading entities...</div>
          ) : entities.length === 0 ? (
            <div style={{ color: '#888' }}>No entities found for this domain model.</div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              {entities.map(entity => (
                <div
                  key={entity.id}
                  style={{
                    background: '#b5d6f6',
                    border: '2px solid #4a90e2',
                    borderRadius: 10,
                    boxShadow: '0 2px 8px rgba(74,144,226,0.10)',
                    minWidth: 220,
                    maxWidth: 260,
                    flex: '1 1 220px',
                    display: 'flex',
                    flexDirection: 'column',
                    marginBottom: 10,
                    padding: 0,
                    overflow: 'hidden',
                    fontSize: '0.93rem',
                    cursor: 'pointer',
                  }}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedEntity(entity);
                    setSelectedAttribute(null);
                    setActiveTab(0);
                  }}
                  onDoubleClick={e => {
                    e.stopPropagation();
                    setAddAttrEntityId(entity.id);
                    setEntityDialogData(entity);
                    setEntityDialogSysMembers({ createdDate: true, changedDate: false, owner: true, changedBy: false });
                    setEntityDialogPersistable(true);
                    setEntityDialogTab(0);
                    setShowAddAttrDialog(true);
                    setSelectedAttrId(null);
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#4a90e2',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.98rem',
                    padding: '0.45rem 0.7rem',
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', marginRight: 6 }}>
                      <svg width="15" height="15" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginRight: 2}}><ellipse cx="11" cy="5.5" rx="8" ry="3.5" fill="#eaf6fb" stroke="#fff" strokeWidth="1.2"/><path d="M3 5.5V16.5C3 17.8807 6.58172 19 11 19C15.4183 19 19 17.8807 19 16.5V5.5" stroke="#fff" strokeWidth="1.2"/><ellipse cx="11" cy="16.5" rx="8" ry="2.5" fill="#eaf6fb" stroke="#fff" strokeWidth="1.2"/></svg>
                    </span>
                    <span>{entity.name}</span>
                  </div>
                  {/* Divider */}
                  <div style={{ height: 1, background: '#7fb3e6', width: '100%' }} />
                  {/* Attributes list */}
                  <div style={{ padding: '0.5rem 0.7rem 0.5rem 0.7rem', color: '#1a2a3a', fontSize: '0.91rem', fontWeight: 500 }}>
                    {entityAttributes[entity.id] && entityAttributes[entity.id].length > 0 ? (
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {entityAttributes[entity.id].map(attr => (
                          <li
                            key={attr.id}
                            onClick={() => setSelectedAttrId(attr.id)}
                            style={{ ...rowStyle, background: selectedAttrId === attr.id ? '#eaf6fb' : undefined }}
                          >
                            {attr.name} <span style={{ color: '#2d4a6a', fontWeight: 400 }}>({attr.dataType})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span style={{ color: '#3a4a5a', fontSize: '0.89rem' }}>(No attributes)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 16 }}>
          <button
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5em 1.2em', fontWeight: 500, cursor: 'pointer' }}
            disabled={generatingSql}
            onClick={async () => {
              if (!domainModel?.id) return;
              setGeneratingSql(true);
              setSqlGenMessage(null);
              try {
                const res = await fetch(`/sql-generator/execute/${domainModel.id}`, { method: 'POST' });
                if (res.ok) {
                  setSqlGenMessage('Tables generated successfully!');
                } else {
                  setSqlGenMessage('Failed to generate tables.');
                }
              } catch (e) {
                setSqlGenMessage('Error generating tables.');
              } finally {
                setGeneratingSql(false);
              }
            }}
          >{generatingSql ? 'Generating...' : 'Generate Tables'}</button>
          {sqlGenMessage && <div style={{ color: sqlGenMessage.includes('success') ? 'green' : 'red', marginLeft: 16 }}>{sqlGenMessage}</div>}
        </div>
      </div>
      <div className="app-widget-editor" style={{ minWidth: 320, maxWidth: 400, width: 400, padding: 0 }}>
        <TabView activeIndex={activeTab} onTabChange={e => setActiveTab(e.index)}>
          <TabPanel header="Properties">
            <div style={{ padding: '1.5rem 1.5rem 0 1.5rem' }}>
              {selectedAttribute ? (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 16 }}>Attribute Properties</div>
                  <div style={{ fontSize: '0.93rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Name</label>
                      <input value={selectedAttribute.name} onChange={e => {
                        const updated = { ...selectedAttribute, name: e.target.value };
                        setSelectedAttribute(updated);
                        setEntityAttributes(prev => {
                          const map = { ...prev };
                          map[updated.entityId] = (map[updated.entityId] || []).map(attr =>
                            attr.id === updated.id ? updated : attr
                          );
                          return map;
                        });
                      }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Data Type</label>
                      <input value={selectedAttribute.dataType} onChange={e => {
                        const updated = { ...selectedAttribute, dataType: e.target.value };
                        setSelectedAttribute(updated);
                        setEntityAttributes(prev => {
                          const map = { ...prev };
                          map[updated.entityId] = (map[updated.entityId] || []).map(attr =>
                            attr.id === updated.id ? updated : attr
                          );
                          return map;
                        });
                      }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Length</label>
                      <input type="number" value={selectedAttribute.length} onChange={e => {
                        const updated = { ...selectedAttribute, length: Number(e.target.value) };
                        setSelectedAttribute(updated);
                        setEntityAttributes(prev => {
                          const map = { ...prev };
                          map[updated.entityId] = (map[updated.entityId] || []).map(attr =>
                            attr.id === updated.id ? updated : attr
                          );
                          return map;
                        });
                      }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" checked={selectedAttribute.isRequired} onChange={e => {
                        const updated = { ...selectedAttribute, isRequired: e.target.checked };
                        setSelectedAttribute(updated);
                        setEntityAttributes(prev => {
                          const map = { ...prev };
                          map[updated.entityId] = (map[updated.entityId] || []).map(attr =>
                            attr.id === updated.id ? updated : attr
                          );
                          return map;
                        });
                      }} style={{ marginRight: 8 }} />
                      <label style={{ fontSize: '0.85rem', marginBottom: 0 }}>Required</label>
                    </div>
                    <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" checked={selectedAttribute.isPrimaryKey} onChange={e => {
                        const updated = { ...selectedAttribute, isPrimaryKey: e.target.checked };
                        setSelectedAttribute(updated);
                        setEntityAttributes(prev => {
                          const map = { ...prev };
                          map[updated.entityId] = (map[updated.entityId] || []).map(attr =>
                            attr.id === updated.id ? updated : attr
                          );
                          return map;
                        });
                      }} style={{ marginRight: 8 }} />
                      <label style={{ fontSize: '0.85rem', marginBottom: 0 }}>Primary Key</label>
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Default Value</label>
                      <input value={selectedAttribute.defaultValue} onChange={e => {
                        const updated = { ...selectedAttribute, defaultValue: e.target.value };
                        setSelectedAttribute(updated);
                        setEntityAttributes(prev => {
                          const map = { ...prev };
                          map[updated.entityId] = (map[updated.entityId] || []).map(attr =>
                            attr.id === updated.id ? updated : attr
                          );
                          return map;
                        });
                      }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Created At</label>
                      <input value={selectedAttribute.createdAt} disabled style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: '#f4f4f4' }} />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Creator ID</label>
                      <input value={selectedAttribute.creatorId} disabled style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: '#f4f4f4' }} />
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <button onClick={() => setSelectedAttribute(null)}>Back to Domain Model</button>
                    </div>
                  </div>
                </>
              ) : selectedEntity ? (
                <>
                  <div style={{ fontWeight: 600, marginBottom: 16 }}>Entity Properties</div>
                  <div style={{ fontSize: '0.93rem' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Name</label>
                      <input value={selectedEntity.name} onChange={e => {
                        const updated = { ...selectedEntity, name: e.target.value };
                        setSelectedEntity(updated);
                        setEntities(prev => prev.map(ent => ent.id === updated.id ? updated : ent));
                      }} onBlur={() => {
                        setEntities(prev => prev.map(ent => ent.id === selectedEntity.id ? selectedEntity : ent));
                      }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Table Name</label>
                      <input value={selectedEntity.tableName} onChange={e => {
                        const value = e.target.value;
                        setSelectedEntity(updated => updated ? { ...updated, tableName: value } : updated);
                        // Validation: starts with capital, no spaces, no special chars
                        if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
                          setTableNameError('Table name must start with a capital letter and contain only letters and numbers (no spaces or special characters).');
                        } else {
                          setTableNameError(null);
                        }
                      }} onBlur={() => {
                        setEntities(prev => prev.map(ent => ent.id === selectedEntity.id ? selectedEntity : ent));
                      }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                      {tableNameError && <div style={{ color: 'red', fontSize: '0.85rem', marginTop: 2 }}>{tableNameError}</div>}
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Description</label>
                      <input value={selectedEntity.description} onChange={e => {
                        const updated = { ...selectedEntity, description: e.target.value };
                        setSelectedEntity(updated);
                        setEntities(prev => prev.map(ent => ent.id === updated.id ? updated : ent));
                      }} onBlur={() => {
                        setEntities(prev => prev.map(ent => ent.id === selectedEntity.id ? selectedEntity : ent));
                      }} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Created At</label>
                      <input value={selectedEntity.createdAt} disabled style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: '#f4f4f4' }} />
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Creator ID</label>
                      <input value={selectedEntity.creatorId} disabled style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', background: '#f4f4f4' }} />
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <button onClick={() => setSelectedEntity(null)}>Back to Domain Model</button>
                    </div>
                  </div>
                </>
              ) : (
                <>
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
                </>
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
      {/* Popup dialog for adding attribute */}
      <Dialog header="Add Attribute" visible={showAddAttrDialog} style={{ width: 400 }} onHide={() => setShowAddAttrDialog(false)}>
        <div style={{ fontSize: '0.93rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Name</label>
            <input value={newAttr.name} onChange={e => setNewAttr(attr => ({ ...attr, name: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Data Type</label>
            <input value={newAttr.dataType} onChange={e => setNewAttr(attr => ({ ...attr, dataType: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Length</label>
            <input type="number" value={newAttr.length} onChange={e => setNewAttr(attr => ({ ...attr, length: Number(e.target.value) }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" checked={!!newAttr.isRequired} onChange={e => setNewAttr(attr => ({ ...attr, isRequired: e.target.checked }))} style={{ marginRight: 8 }} />
            <label style={{ fontSize: '0.85rem', marginBottom: 0 }}>Required</label>
          </div>
          <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" checked={!!newAttr.isPrimaryKey} onChange={e => setNewAttr(attr => ({ ...attr, isPrimaryKey: e.target.checked }))} style={{ marginRight: 8 }} />
            <label style={{ fontSize: '0.85rem', marginBottom: 0 }}>Primary Key</label>
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Default Value</label>
            <input value={newAttr.defaultValue} onChange={e => setNewAttr(attr => ({ ...attr, defaultValue: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <button className="button-primary" style={{ marginRight: 8 }} onClick={() => {
              if (!addAttrEntityId || !newAttr.name || !newAttr.dataType) return;
              const attr: DomainAttribute = {
                id: crypto.randomUUID(),
                entityId: addAttrEntityId,
                name: newAttr.name!,
                dataType: newAttr.dataType!,
                length: newAttr.length || 0,
                isRequired: !!newAttr.isRequired,
                isPrimaryKey: !!newAttr.isPrimaryKey,
                defaultValue: newAttr.defaultValue || '',
                creatorId: user.id,
                createdAt: new Date().toISOString(),
              };
              setEntityAttributes(prev => {
                const map = { ...prev };
                map[addAttrEntityId] = [...(map[addAttrEntityId] || []), attr];
                return map;
              });
              setShowAddAttrDialog(false);
            }}>Save</button>
            <button onClick={() => setShowAddAttrDialog(false)}>Cancel</button>
          </div>
        </div>
      </Dialog>
      {/* Entity Dialog */}
      <Dialog header={`Properties of Entity '${entityDialogData?.name || ''}'`} visible={showAddAttrDialog} style={{ width: 600 }} onHide={() => setShowAddAttrDialog(false)}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr',
          alignItems: 'center',
          rowGap: 14,
          columnGap: 16,
          fontSize: '0.93rem',
          padding: '1rem 0.5rem',
          maxWidth: 500,
        }}>
          <label style={{ fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Name</label>
          <input value={entityDialogData?.name || ''} onChange={e => setEntityDialogData(d => d ? { ...d, name: e.target.value } : d)} style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc' }} />
          <label style={{ fontWeight: 500, fontSize: '0.85rem', textAlign: 'right' }}>Table Name</label>
          <input value={entityDialogData?.tableName || ''} onChange={e => {
            const value = e.target.value;
            setEntityDialogData(d => d ? { ...d, tableName: value } : d);
            // Validation: starts with capital, no spaces, no special chars
            if (!/^[A-Z][A-Za-z0-9]*$/.test(value)) {
              setTableNameError('Table name must start with a capital letter and contain only letters and numbers (no spaces or special characters).');
            } else {
              setTableNameError(null);
            }
          }} onBlur={() => {
            if (!entityDialogData) return;
            setEntities(prev => prev.map(ent => ent.id === entityDialogData.id ? entityDialogData : ent));
          }} style={{ width: '100%', padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc' }} />
          <label style={{ fontWeight: 500, fontSize: '0.85rem', textAlign: 'right', alignSelf: 'start', marginTop: 4 }}>Description</label>
          <textarea value={entityDialogData?.description || ''} onChange={e => setEntityDialogData(d => d ? { ...d, description: e.target.value } : d)} style={{ width: '100%', minHeight: 48, padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }} />
        </div>
        <TabView activeIndex={entityDialogTab} onTabChange={e => setEntityDialogTab(e.index)}>
          <TabPanel header="Attributes">
            <div style={{ padding: '1rem 0.5rem' }}>
              <div style={{ marginBottom: 8 }}>
                <button className="button-primary" style={{ marginRight: 8 }} onClick={() => { setEditAttrIdx(null); setShowAttrEditDialog(true); }}>New</button>
                <button style={{ marginRight: 8 }} onClick={() => { setEditAttrIdx((entityAttributes[addAttrEntityId || ''] || []).findIndex(a => a.id === selectedAttrId)); setShowAttrEditDialog(true); }} disabled={!selectedAttrId}>Edit</button>
                <button onClick={() => setShowDeleteAttrConfirm(true)} disabled={!selectedAttrId}>Delete</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.93rem' }}>
                <thead>
                  <tr style={{ background: '#f4f6fa' }}>
                    <th style={{ border: '1px solid #e0e4ea', padding: '4px 8px', fontWeight: 600 }}>Name</th>
                    <th style={{ border: '1px solid #e0e4ea', padding: '4px 8px', fontWeight: 600 }}>Type</th>
                    <th style={{ border: '1px solid #e0e4ea', padding: '4px 8px', fontWeight: 600 }}>Default value</th>
                  </tr>
                </thead>
                <tbody>
                  {(entityAttributes[addAttrEntityId || ''] || []).map(attr => (
                    <tr key={attr.id}
                      onClick={() => setSelectedAttrId(attr.id)}
                      onDoubleClick={() => {
                        setSelectedAttrId(attr.id);
                        const idx = (entityAttributes[addAttrEntityId || ''] || []).findIndex(a => a.id === attr.id);
                        setEditAttrIdx(idx);
                        setNewAttr(attr);
                        setShowAttrEditDialog(true);
                      }}
                      style={{ borderBottom: '1px solid #e0e4ea', background: selectedAttrId === attr.id ? '#eaf6fb' : undefined, cursor: 'pointer' }}>
                      <td style={{ padding: '4px 8px' }}>{attr.name}</td>
                      <td style={{ padding: '4px 8px' }}>{attr.dataType}</td>
                      <td style={{ padding: '4px 8px' }}>{attr.defaultValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPanel>
        </TabView>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <button className="button-primary" onClick={() => {
            if (tableNameError) return;
            if (entityDialogData) {
              setEntities(prev => prev.map(ent => ent.id === entityDialogData.id ? { ...ent, ...entityDialogData } : ent));
            }
            setShowAddAttrDialog(false);
            setSelectedAttrId(null);
          }}>OK</button>
          <button onClick={() => setShowAddAttrDialog(false)}>Cancel</button>
        </div>
      </Dialog>
      {/* Attribute New/Edit sub-dialog */}
      {showAttrEditDialog && (
        <Dialog header={editAttrIdx !== null ? 'Edit Attribute' : 'New Attribute'} visible={true} style={{ width: 400, zIndex: 1200 }} onHide={() => setShowAttrEditDialog(false)}>
          <div style={{ fontSize: '0.93rem' }}>
            {/* Same fields as before, prefilled if editing */}
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Name</label>
              <input value={newAttr.name} onChange={e => setNewAttr(attr => ({ ...attr, name: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Data Type</label>
              <input value={newAttr.dataType} onChange={e => setNewAttr(attr => ({ ...attr, dataType: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Length</label>
              <input type="number" value={newAttr.length} onChange={e => setNewAttr(attr => ({ ...attr, length: Number(e.target.value) }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" checked={!!newAttr.isRequired} onChange={e => setNewAttr(attr => ({ ...attr, isRequired: e.target.checked }))} style={{ marginRight: 8 }} />
              <label style={{ fontSize: '0.85rem', marginBottom: 0 }}>Required</label>
            </div>
            <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
              <input type="checkbox" checked={!!newAttr.isPrimaryKey} onChange={e => setNewAttr(attr => ({ ...attr, isPrimaryKey: e.target.checked }))} style={{ marginRight: 8 }} />
              <label style={{ fontSize: '0.85rem', marginBottom: 0 }}>Primary Key</label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Default Value</label>
              <input value={newAttr.defaultValue} onChange={e => setNewAttr(attr => ({ ...attr, defaultValue: e.target.value }))} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <button className="button-primary" style={{ marginRight: 8 }} onClick={async () => {
                if (!addAttrEntityId || !newAttr.name || !newAttr.dataType) return;
                if (editAttrIdx !== null) {
                  // Edit existing: call API
                  const attrList = entityAttributes[addAttrEntityId] || [];
                  const oldAttr = attrList[editAttrIdx];
                  const dto = {
                    id: oldAttr.id,
                    entityId: addAttrEntityId,
                    name: newAttr.name,
                    dataType: newAttr.dataType,
                    length: newAttr.length || 0,
                    isRequired: !!newAttr.isRequired,
                    isPrimaryKey: !!newAttr.isPrimaryKey,
                    defaultValue: newAttr.defaultValue || '',
                    creatorId: oldAttr.creatorId,
                    createdAt: oldAttr.createdAt,
                  };
                  try {
                    await updateDomainAttribute(dto);
                  } catch (e) {
                    // Optionally show error
                  }
                } else {
                  // Add new: call API
                  const dto = {
                    entityId: addAttrEntityId,
                    name: newAttr.name,
                    dataType: newAttr.dataType,
                    length: newAttr.length || 0,
                    isRequired: !!newAttr.isRequired,
                    isPrimaryKey: !!newAttr.isPrimaryKey,
                    defaultValue: newAttr.defaultValue || '',
                    creatorId: user.id,
                  };
                  try {
                    await createDomainAttribute(dto);
                  } catch (e) {
                    // Optionally show error
                  }
                }
                setEntityAttributes(prev => {
                  const map = { ...prev };
                  if (editAttrIdx !== null) {
                    // Edit existing
                    map[addAttrEntityId] = (map[addAttrEntityId] || []).map((a, i) => i === editAttrIdx ? { ...a, ...newAttr, id: a.id } : a);
                  } else {
                    // Add new
                    const attr: DomainAttribute = {
                      id: crypto.randomUUID(),
                      entityId: addAttrEntityId,
                      name: newAttr.name!,
                      dataType: newAttr.dataType!,
                      length: newAttr.length || 0,
                      isRequired: !!newAttr.isRequired,
                      isPrimaryKey: !!newAttr.isPrimaryKey,
                      defaultValue: newAttr.defaultValue || '',
                      creatorId: user.id,
                      createdAt: new Date().toISOString(),
                    };
                    map[addAttrEntityId] = [...(map[addAttrEntityId] || []), attr];
                  }
                  return map;
                });
                setShowAttrEditDialog(false);
                setSelectedAttrId(null);
              }}>Save</button>
              <button onClick={() => setShowAttrEditDialog(false)}>Cancel</button>
            </div>
          </div>
        </Dialog>
      )}
      {showDeleteAttrConfirm && (
        <>
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.18)',
            zIndex: 2099,
          }} />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: 8,
            boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
            zIndex: 2100,
            padding: '1.2rem 1.5rem',
            minWidth: 260,
          }}>
            <div style={{ marginBottom: 14 }}>Delete this attribute?</div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                style={{ padding: '0.3em 1em', borderRadius: 4, border: 'none', background: '#e0e7ff', color: '#222', cursor: 'pointer' }}
                onClick={() => setShowDeleteAttrConfirm(false)}
              >No</button>
              <button
                style={{ padding: '0.3em 1em', borderRadius: 4, border: 'none', background: '#f44336', color: '#fff', cursor: 'pointer' }}
                onClick={async () => {
                  if (!addAttrEntityId || !selectedAttrId) return;
                  try {
                    await deleteDomainAttribute(selectedAttrId);
                  } catch (e) {
                    // Optionally show error
                  }
                  setEntityAttributes(prev => {
                    const map = { ...prev };
                    map[addAttrEntityId] = (map[addAttrEntityId] || []).filter(a => a.id !== selectedAttrId);
                    return map;
                  });
                  setSelectedAttrId(null);
                  setShowDeleteAttrConfirm(false);
                }}
              >Yes</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
