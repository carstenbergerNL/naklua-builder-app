import { useState, useRef, useEffect, useCallback } from "react";
import { createEditor, Descendant, BaseEditor } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";

interface Props {
  config: any;
  onConfigChange?: (key: string, value: any) => void;
}

function initialValueFromText(text: string): Descendant[] {
  return [
    {
      type: "paragraph",
      children: [{ text: text || "..." }],
    } as Descendant,
  ];
}

function textFromValue(value: Descendant[]): string {
  // Find the first element with children and join its children's text
  const para = value.find((n) => typeof n === "object" && "children" in n && Array.isArray((n as any).children));
  return para ? (para as any).children.map((c: any) => c.text).join("") : "";
}

export default function ParagraphWidget({ config, onConfigChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [editor] = useState(() => withReact(createEditor() as BaseEditor & ReactEditor));
  const [value, setValue] = useState<Descendant[]>(initialValueFromText(config.text));
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue(initialValueFromText(config.text));
  }, [config.text]);

  const handleDoubleClick = () => {
    if (onConfigChange) {
      setEditing(true);
      console.log('Double click: editing mode enabled');
    }
  };

  const handleBlur = () => {
    setEditing(false);
    const newText = textFromValue(value);
    if (onConfigChange && newText !== config.text) {
      onConfigChange("text", newText);
    }
  };

  const handleKeyDown = useCallback(
    (e: any) => {
      if (e.key === "Escape") {
        setEditing(false);
        setValue(initialValueFromText(config.text));
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (editorRef.current) {
          (editorRef.current as HTMLElement).blur();
        }
      }
    },
    [config.text]
  );

  if (editing) {
    return (
      <div ref={editorRef} tabIndex={-1} onBlur={handleBlur} style={{ outline: "none" }}>
        <Slate editor={editor} initialValue={value} onChange={setValue}>
          <Editable
            style={{
              fontSize: "inherit",
              width: "100%",
              border: "1px solid #2563eb",
              borderRadius: 4,
              padding: "0.1em 0.3em",
              minHeight: 32,
              background: "#fffbe6",
              color: "#222",
              boxSizing: "border-box",
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type your paragraph..."
            autoFocus
          />
        </Slate>
      </div>
    );
  }

  return (
    <p onDoubleClick={handleDoubleClick} style={{ cursor: onConfigChange ? "pointer" : undefined }}>
      {config.text || "..."}
    </p>
  );
}