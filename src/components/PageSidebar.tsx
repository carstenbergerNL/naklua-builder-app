import { Tree } from "primereact/tree";
import { Divider } from "primereact/divider";
import { Page } from "../models/Page";
import { Panel } from "primereact/panel";

interface Props {
  pages: Page[];
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
  onAddWidget: (type: string) => void;
}

export default function PageSidebar({
  pages,
  selectedPageId,
  onSelectPage,
}: Props) {
  const treeNodes = [
    {
      key: "pages",
      label: "Pages",
      children: pages.map((page) => ({
        key: page.id,
        label: page.name,
        selectable: true,
        className: selectedPageId === page.id ? "p-highlight" : "",
      })),
    },
  ];

  const handleSelect = (e: any) => {
    const selectedKey = e.value;
    if (selectedKey && selectedKey !== "pages") {
      onSelectPage(selectedKey);
    }
  };

  return (
    <div
      style={{
        width: 260,
        height: "100%",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Tree
        value={treeNodes}
        selectionMode="single"
        selectionKeys={selectedPageId}
        onSelectionChange={handleSelect}
        className="p-tree-sm custom-tree"
      />
    </div>
  );
}
