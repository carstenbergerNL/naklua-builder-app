import { Page } from "../models/Page";

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
  onAddWidget,
}: Props) {
  return (
    <div
      style={{
        width: "260px",
        backgroundColor: "#f9f9f9",
        borderRight: "1px solid #ddd",
        padding: "1rem",
        fontSize: "0.85rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <div>
        <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "#444" }}>
          Pages
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {pages.map((page) => (
            <div
              key={page.id}
              onClick={() => onSelectPage(page.id)}
              style={{
                cursor: "pointer",
                padding: "6px 10px",
                borderRadius: "4px",
                backgroundColor: selectedPageId === page.id ? "#e0f0ff" : "transparent",
                color: selectedPageId === page.id ? "#1976d2" : "#333",
                fontWeight: selectedPageId === page.id ? "bold" : "normal",
                transition: "background 0.2s",
              }}
            >
              {page.title}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: "0.9rem", marginBottom: "0.5rem", color: "#444" }}>
          Add Widget
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div
            onClick={() => onAddWidget("Heading")}
            style={{
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "4px",
              backgroundColor: "#f0f0f0",
              color: "#222",
              transition: "background 0.2s",
            }}
          >
            + Heading
          </div>
          <div
            onClick={() => onAddWidget("Paragraph")}
            style={{
              cursor: "pointer",
              padding: "6px 10px",
              borderRadius: "4px",
              backgroundColor: "#f0f0f0",
              color: "#222",
              transition: "background 0.2s",
            }}
          >
            + Paragraph
          </div>
        </div>
      </div>
    </div>
  );
}
