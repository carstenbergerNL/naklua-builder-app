import { JSX, useState, useRef, useEffect } from "react";

interface Props {
  config: any;
  onConfigChange?: (key: string, value: any) => void;
}

export default function HeadingWidget({ config, onConfigChange }: Props) {
  const Tag = (config.size || "h2") as keyof JSX.IntrinsicElements;
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(config.text || "Untitled Heading");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    setValue(config.text || "Untitled Heading");
  }, [config.text]);

  const handleDoubleClick = () => {
    if (onConfigChange) setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    if (onConfigChange && value !== config.text) {
      onConfigChange("text", value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setEditing(false);
      setValue(config.text || "Untitled Heading");
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        style={{
          fontSize: "inherit",
          fontWeight: "inherit",
          width: "100%",
          border: "1px solid #2563eb",
          borderRadius: 4,
          padding: "0.1em 0.3em",
        }}
      />
    );
  }

  return (
    <Tag onDoubleClick={handleDoubleClick} style={{ cursor: onConfigChange ? "pointer" : undefined }}>
      {config.text || "Untitled Heading"}
    </Tag>
  );
}
