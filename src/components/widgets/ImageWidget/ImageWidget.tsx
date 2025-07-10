export default function ImageWidget({ config }: { config: any }) {
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
