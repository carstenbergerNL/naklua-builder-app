import React from "react";
import { Page } from "../models/Page";
import { MdInsertDriveFile } from "react-icons/md";
import { useState } from "react";

interface TreeNode extends Page {
  children: TreeNode[];
}

interface Props {
  pages: Page[];
  domainModels: import("../models/DomainModel").DomainModel[];
  selectedPageId: string | null;
  onSelectPage: (id: string) => void;
  onSelectDomainModel: (id: string) => void;
  onAddWidget: (type: string) => void;
}

export default function Sidebar({
  pages,
  domainModels,
  selectedPageId,
  onSelectPage,
  onSelectDomainModel,
}: Props) {
  // Helper to build a tree from flat pages
  function buildTree(pages: Page[]): TreeNode[] {
    const idToNode: { [id: string]: TreeNode } = {};
    const roots: TreeNode[] = [];
    pages.forEach((page: Page) => {
      idToNode[page.id] = { ...page, children: [] };
    });
    pages.forEach((page: Page) => {
      if (page.parentId && idToNode[page.parentId]) {
        idToNode[page.parentId].children.push(idToNode[page.id]);
      } else {
        roots.push(idToNode[page.id]);
      }
    });
    return roots;
  }

  // Recursive render
  function renderTree(nodes: TreeNode[], depth = 0): React.ReactNode {
    return nodes.map((node: TreeNode) => (
      <>
        <li
          key={node.id}
          onClick={() => onSelectPage(node.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "0.45rem 0.75rem",
            borderRadius: 7,
            marginBottom: 2,
            cursor: "pointer",
            background: selectedPageId === node.id ? "#e0e7ff" : undefined,
            color: selectedPageId === node.id ? "#2563eb" : undefined,
            fontWeight: selectedPageId === node.id ? 600 : 400,
            transition: "background 0.15s, color 0.15s",
            paddingLeft: 16 + depth * 16,
          }}
        >
          <span style={{ fontSize: 18, opacity: 0.8 }}>📄</span>
          <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {node.name}
          </span>
        </li>
        {node.children && node.children.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {renderTree(node.children, depth + 1)}
          </ul>
        )}
      </>
    ));
  }

  const tree = buildTree(pages);

  return (
    <div className="app-sidebar" style={{ padding: "1rem 0.5rem" }}>
      <div className="toolbox-category-title" style={{ marginBottom: 12, paddingLeft: 8 }}>
        Domain Models
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {domainModels.map((model) => (
          <li
            key={model.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0.45rem 0.75rem",
              borderRadius: 7,
              marginBottom: 2,
              cursor: "pointer",
              background: "#f3f4f6",
              color: "#111827",
              fontWeight: 500,
              transition: "background 0.15s, color 0.15s",
            }}
            title={model.description}
            onClick={() => onSelectDomainModel(model.id)}
          >
            <span style={{ fontSize: 18, opacity: 0.8 }}>🗂️</span>
            <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {model.name}
            </span>
          </li>
        ))}
      </ul>
      <div className="toolbox-category-title" style={{ marginBottom: 12, marginTop: 24, paddingLeft: 8 }}>
        Pages
      </div>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {renderTree(tree)}
      </ul>
    </div>
  );
} 