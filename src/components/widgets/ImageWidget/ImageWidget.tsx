import { useRef } from "react";

interface Props {
  config: any;
  onConfigChange?: (key: string, value: any) => void;
}

export default function ImageWidget({ config }: Props) {
  return (
    <img
      src={config.src}
      alt={config.alt || ""}
      style={config.style}
      width={config.width}
      height={config.height}
      className={config.className || "image-widget"}
    />
  );
}
