import { JSX } from "react";

export default function HeadingWidget({ config }: { config: any }) {
  const Tag = (config.size || "h2") as keyof JSX.IntrinsicElements;
  return <Tag>{config.text || "Untitled Heading"}</Tag>;
}
