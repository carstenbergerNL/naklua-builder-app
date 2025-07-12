import { Page } from "../models/Page";
import { MdInsertDriveFile } from "react-icons/md";

interface Props {
  pages: Page[];
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
  onAddWidget: (type: string) => void;
}

export default function Sidebar({
  pages,
  selectedPageId,
  onSelectPage,
}: Props) {
  return (
    <div className="app-sidebar" style={{ padding: "1rem 0.5rem" }}>
      <div className="toolbox-category-title" style={{ marginBottom: 12, paddingLeft: 8 }}>
        Pages
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {pages.map((page) => (
          <li
            key={page.id}
            onClick={() => onSelectPage(page.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.45rem 0.75rem",
              borderRadius: 7,
              marginBottom: 2,
              cursor: "pointer",
              background: selectedPageId === page.id ? "#e0e7ff" : undefined,
              color: selectedPageId === page.id ? "#2563eb" : undefined,
              fontWeight: selectedPageId === page.id ? 600 : 400,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            <span style={{ fontSize: 18, opacity: 0.8 }}>📄</span>
            <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {page.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
} 