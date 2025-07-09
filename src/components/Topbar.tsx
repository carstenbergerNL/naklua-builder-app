import { Menubar } from "primereact/menubar";

export default function Topbar() {
  const items = [
    {
      label: "File",
      icon: "pi pi-folder",
      items: [
        { label: "New Page", icon: "pi pi-plus" },
        { label: "Save All", icon: "pi pi-save" },
      ],
    },
    {
      label: "Edit",
      icon: "pi pi-pencil",
      items: [
        { label: "Undo", icon: "pi pi-undo" },
        { label: "Redo", icon: "pi pi-redo" },
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
    <Menubar
      model={items}
      start={start}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: "1px solid #ccc",
        borderRadius: 0,
      }}
    />
  );
}
