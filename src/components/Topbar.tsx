import { Menubar } from "primereact/menubar";
import { WidgetDefinition } from "../models/WidgetDefinition";

interface TopbarProps {
  availableWidgets: WidgetDefinition[];
  onAddWidget: (type: string) => void;
}

export default function Topbar({ availableWidgets = [], onAddWidget }: TopbarProps) {
  const items = [
    {
      label: "Pages",
      icon: "pi pi-folder",
      // No 'New Page' item here
    },
    {
      label: "Widgets",
      icon: "pi pi-folder",
      items: [
        { label: "New Widget", icon: "pi pi-plus" },
        ...availableWidgets.map(w => ({
          label: w.displayName,
          icon: "pi pi-plus",
          command: () => onAddWidget(w.widgetType)
        }))
      ],
    },
    {
      label: "Preview",
      icon: "pi pi-eye",
    },
    {
      label: "Deploy",
      icon: "pi pi-upload",
    },
  ];

  const start = <span className="text-xl font-bold px-3">Naklua Builder 1.0</span>;

  return (
    <div className="app-topbar">
      <Menubar
        model={items}
        start={start}
      />
    </div>
  );
}
