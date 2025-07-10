export default function DividerWidget({ config }: { config: any }) {
  return <hr style={{ borderStyle: config.style || "solid" }} />;
}
