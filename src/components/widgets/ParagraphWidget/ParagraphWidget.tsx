export default function ParagraphWidget({ config }: { config: any }) {
  return <p>{config.text || "..."}</p>;
}