import { Menubar } from "primereact/menubar";
import { WidgetDefinition } from "../models/WidgetDefinition";

interface TopbarProps {
  availableWidgets: WidgetDefinition[];
  onAddWidget: (type: string) => void;
}

export default function Topbar({ availableWidgets = [], onAddWidget }: TopbarProps) {
  const start = <span className="text-xl font-bold px-3">Naklua Builder 1.0</span>;

  return (
    <div className="app-topbar">
      {start}
    </div>
  );
}
